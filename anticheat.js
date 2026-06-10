/* ============================================================================
   AntiTamperCheats  —  client-side integrity / tamper guard for PokéIdle
   Loaded FIRST (before data.js) so protection is in place on site load.

   What it does:
     • Signs the save file and verifies it on load (catches save-file edits).
     • Periodically checks for tampered runtime functions, known cheat tools,
       and impossible currency values.
     • On detection: stores a signed ban record and shows a full-screen ban
       screen with "Request Unban" (downloads an encrypted blob) and
       "Upload Key" (applies a signed unban issued by the dev tool).

   NOTE: a fully client-side game can never be 100% tamper-proof. This is a
   strong deterrent for casual cheating + save editing, not DRM. The ONE thing
   that is cryptographically enforced is the unban: only the holder of the
   ECDSA private key (your Unban Tool extension) can lift a ban — players
   cannot forge one.
   ============================================================================ */
(function () {
  'use strict';

  // ── Config ────────────────────────────────────────────────────────────────
  var BRAND       = 'Aegis Anticheat';
  var SAVE_KEY    = 'pkm_idle_saves';              // the live multi-slot save (pkm_idle_save_v2 is legacy)
  var BAN_KEY     = 'pkm_atc_ban';
  var ID_KEY      = 'pkm_atc_id';
  var ALLOW_KEY   = 'pkm_atc_allow';                // signed admin allowlist (mon exemptions)
  var SALT        = 'atc::v1::9f3a-Kx7';           // mixed into the save hash

  // Public key (verify unban tokens) + AES key (encrypt request blobs).
  // The matching PRIVATE key lives ONLY in your Unban Tool — never here.
  var PUBLIC_JWK  = {"kty":"EC","crv":"P-256","x":"nHmeoz2T-1nR9WbXZwdC6NXKR9MICFB-NGuvxLh6DXw","y":"B0UUCukJR3aId0WLQtfprhtDJM4kTqlIGv7erkyt9MQ"};
  var AES_HEX     = 'cf08a961d5e44ef565923d6d0afc21946be157dd42a9d876f0b2aeb0cc0a488d';

  var _set = Storage.prototype.setItem;
  var _get = Storage.prototype.getItem;
  var _rem = Storage.prototype.removeItem;
  var enabled = true;     // guard master switch (kept on)
  var banned  = false;
  var lastGems = null;    // previous-scan gem total, for the sudden-jump check
  var lastItems = null;   // previous-scan inventory snapshot, for the item-jump check
  var lastSlot = '__init__';  // active save slot last seen; a change = a (re)load → re-seed baselines
  var approvedSet = {};       // admin-approved mons (uid|id → true), from a signed allowlist
  var approvedList = [];      // same, as [{u,id}] — echoed into appeals so approvals carry forward
  var allowReady = false;     // true once the signed allowlist has been verified/loaded

  // ── Tiny sync hash (cyrb53) — fast, good enough to detect save edits ───────
  function h53(str, seed) {
    str = '' + str; seed = seed || 0;
    var h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (var i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507); h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507); h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  }
  function sig(str) { return h53(str, 0) + '.' + h53(SALT + str + SALT, 7); }

  // ── Crypto helpers (Web Crypto) — only used in the unban flow ──────────────
  function enc(s) { return new TextEncoder().encode(s); }
  function hexToBytes(hex) { var a = new Uint8Array(hex.length / 2); for (var i = 0; i < a.length; i++) a[i] = parseInt(hex.substr(i * 2, 2), 16); return a; }
  function b64(bytes) { var s = ''; for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]); return btoa(s); }
  function b64d(str) { var bin = atob(str), a = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return a; }
  var _aesKey = null, _pubKey = null;
  function aesKey() { return _aesKey ? Promise.resolve(_aesKey) : crypto.subtle.importKey('raw', hexToBytes(AES_HEX), { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']).then(function (k) { _aesKey = k; return k; }); }
  function pubKey() { return _pubKey ? Promise.resolve(_pubKey) : crypto.subtle.importKey('jwk', PUBLIC_JWK, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']).then(function (k) { _pubKey = k; return k; }); }
  function atcEncrypt(str) {
    return aesKey().then(function (k) {
      var iv = crypto.getRandomValues(new Uint8Array(12));
      return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, k, enc(str)).then(function (ct) {
        ct = new Uint8Array(ct); var out = new Uint8Array(iv.length + ct.length); out.set(iv, 0); out.set(ct, iv.length); return b64(out);
      });
    });
  }
  function atcVerify(payloadStr, sigB64) {
    return pubKey().then(function (k) { return crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, k, b64d(sigB64), enc(payloadStr)); }).catch(function () { return false; });
  }

  // ── Identity / ban record ──────────────────────────────────────────────────
  function getPid() {
    var id = _get.call(localStorage, ID_KEY);
    if (!id) { id = 'P' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); _set.call(localStorage, ID_KEY, id); }
    return id;
  }
  function writeBan(rec) { var d = JSON.stringify(rec); _set.call(localStorage, BAN_KEY, JSON.stringify({ __atc: 1, d: d, s: sig(d) })); }
  function clearBan() { _rem.call(localStorage, BAN_KEY); banned = false; }
  function readBan() {
    var raw = _get.call(localStorage, BAN_KEY);
    if (!raw) return null;
    try {
      var o = JSON.parse(raw);
      if (o && o.__atc === 1 && typeof o.d === 'string') {
        if (sig(o.d) === o.s) return JSON.parse(o.d);
        return { reason: 'Ban record was tampered with', ts: Date.now(), banId: 'TMP-' + getPid().slice(1, 6), until: null, p: getPid() };
      }
    } catch (e) {}
    return { reason: 'Ban record was tampered with', ts: Date.now(), banId: 'TMP-' + getPid().slice(1, 6), until: null, p: getPid() };
  }

  // ── Admin allowlist (signed exemptions for false-positive mons) ────────────
  // The Unban Tool can mark specific mons legit. That decision rides in the SAME
  // ECDSA-signed envelope as an unban key, so the game re-verifies it on every
  // boot — a plain save edit can't fake an exemption (no private key = no sig).
  function monApproved(p) {
    if (!p) return false;
    // Achievement-reward Pokémon are legit SSS by design — exempt from the IV-spoof /
    // flawless / mass-IV checks. (Lugia 249, Ho-Oh 250, Rayquaza 384, Arceus 493, Haxorus 612,
    // Kyurem 646, Magearna 801, Marshadow 802, Zacian 888, Zamazenta 889.)
    if (p._achievementMon && [249,250,384,493,612,646,801,802,888,889].indexOf(p.id) !== -1) return true;
    return !!approvedSet[p.uid + '|' + p.id];
  }
  function loadAllow() {
    approvedSet = {}; approvedList = [];
    var raw = _get.call(localStorage, ALLOW_KEY);
    if (!raw) { allowReady = true; return Promise.resolve(); }
    var env; try { env = JSON.parse(raw); } catch (e) { allowReady = true; return Promise.resolve(); }
    if (!env || !env.p || !env.s) { allowReady = true; return Promise.resolve(); }
    return atcVerify(env.p, env.s).then(function (ok) {
      if (ok) {
        try {
          var tok = JSON.parse(env.p);
          if (tok && tok.pid === getPid() && Array.isArray(tok.allow)) {
            tok.allow.forEach(function (e) {
              if (e && e.u != null && e.id != null) { approvedSet[e.u + '|' + e.id] = true; approvedList.push({ u: e.u, id: e.id }); }
            });
          }
        } catch (e) {}
      }
      allowReady = true;
    }).catch(function () { allowReady = true; });
  }

  function ban(reason) {
    if (!enabled || banned) return;
    var rec = { reason: reason, ts: Date.now(), banId: ('B' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)).toUpperCase(), until: null, p: getPid() };
    writeBan(rec);
    banned = true;
    showBanScreen(rec);
  }

  // ── localStorage wrap: transparently sign / verify the save ────────────────
  Storage.prototype.setItem = function (k, v) {
    if (k === SAVE_KEY && typeof v === 'string') {
      try { v = JSON.stringify({ __atc: 1, d: v, s: sig(v) }); } catch (e) {}
    }
    return _set.call(this, k, v);
  };
  Storage.prototype.getItem = function (k) {
    var raw = _get.call(this, k);
    if (k === SAVE_KEY && raw) {
      try {
        var o = JSON.parse(raw);
        if (o && o.__atc === 1 && typeof o.d === 'string') {
          if (sig(o.d) === o.s || !enabled) return o.d;   // valid (or dev bypass) → hand over the save
          ban('Save file integrity check failed');         // edited save
          return null;
        }
        return raw;   // legacy/raw save (pre-guard) → accept; re-signed on next save
      } catch (e) { return raw; }
    }
    return raw;
  };

  // ── Detection scan ──────────────────────────────────────────────────────────
  function legitSSS(p) { return !!(p._legend || p._isDeoxys || p.id === 386 || p._isHeroGreninja || p.id === 658); }

  // Strip whatever earned the ban so an unbanned save won't immediately re-trip:
  //   • gems / currency ban  → wipe gems    • gold ban → wipe gold
  //   • illegal-mon / IV ban → remove spoofed mons, clamp IVs, reset mass-perfect IVs
  // Operates on the whole multi-slot save array.
  function sanitizeSave(saveStr, reason) {
    if (!saveStr) return saveStr;
    reason = ('' + (reason || '')).toLowerCase();
    var wipeGems = reason.indexOf('gem') >= 0 || reason.indexOf('currency') >= 0;
    var wipeGold = reason.indexOf('gold') >= 0 || reason.indexOf('currency') >= 0;
    var fixFlawless = reason.indexOf('flawless') >= 0;                  // "Too many flawless (SS)"
    var fixIV    = reason.indexOf('iv') >= 0 || reason.indexOf('manipulation') >= 0 || fixFlawless;
    var fixMons  = reason.indexOf('illegal pok') >= 0 || reason.indexOf('spoof') >= 0 || reason.indexOf('iv') >= 0 || reason.indexOf('manipulation') >= 0;
    function cleanSlot(o) {
      if (!o || typeof o !== 'object') return o;
      if (wipeGems && typeof o.gems === 'number') o.gems = 0;
      if (wipeGold && typeof o.gold === 'number') o.gold = 0;
      if (Array.isArray(o.box)) {
        o.box = o.box.filter(function (p) {
          if (!p) return false;
          if (fixMons) {
            if (p._naturalSSS && !legitSSS(p) && !monApproved(p)) return false;
            if (p._legend && p.id !== 890 && p.id !== 892 && !monApproved(p)) return false;
            if (typeof p.level === 'number' && p.level > 295) return false;
            if (typeof p.id === 'number' && (p.id < 1 || p.id > 1100)) return false;
          }
          if (p.ivs) {
            for (var k in p.ivs) { if (typeof p.ivs[k] === 'number') { if (p.ivs[k] > 31) p.ivs[k] = 31; if (p.ivs[k] < 0) p.ivs[k] = 0; } }
            if (fixIV && !legitSSS(p) && !monApproved(p)) {
              var allP = true, c = 0; for (var k2 in p.ivs) { c++; if (p.ivs[k2] !== 31) allP = false; }
              if (allP && c >= 6) { for (var k3 in p.ivs) p.ivs[k3] = 10; }   // wipe cheated perfect IVs
            }
          }
          return true;
        });
        // "Too many flawless (SS)" ban: non-legit perfect mons above are already reset to 10.
        // If a slot still holds too many all-31 mons (e.g. legit-species copies), de-perfect the
        // surplus so the flawless count drops back under the detection threshold and the ban clears.
        if (fixFlawless) {
          var kept = 0;
          o.box.forEach(function (p) {
            if (!p || !p.ivs || monApproved(p)) return;   // approved mons never count toward the cap
            var ap = true, c = 0; for (var kf in p.ivs) { c++; if (p.ivs[kf] !== 31) ap = false; }
            if (ap && c >= 6) { kept++; if (kept > 9) { for (var kr in p.ivs) p.ivs[kr] = 10; } }
          });
        }
        if (Array.isArray(o.teamUids)) { var bu = {}; o.box.forEach(function (p) { bu[p.uid] = true; }); o.teamUids = o.teamUids.filter(function (u) { return bu[u]; }); }
      }
      return o;
    }
    try {
      var data = JSON.parse(saveStr);
      if (Array.isArray(data)) data = data.map(cleanSlot);   // multi-slot array
      else data = cleanSlot(data);
      return JSON.stringify(data);
    } catch (e) { return saveStr; }
  }

  function isNative(fn) { try { return (Function.prototype.toString.call(fn)).indexOf('[native code]') !== -1; } catch (e) { return false; } }
  var CHEAT_GLOBALS = ['__ARF__', '__arf_origRandom', '__arf_origDateNow', '__arf_origGetAttack', '__arf_freeMarket', '__arf_walletStash', '__arf_rngVal', '__arf_timeScale', '__arf_origGetAttack'];
  function scan() {
    if (banned) return;
    // Tool-presence detection (patched runtime fns + known cheat fingerprints).
    // Always runs — there is no bypass that disables it.
    if (!isNative(Math.random)) return ban('Tampered runtime function (Math.random)');
    if (!isNative(Date.now))    return ban('Tampered runtime function (Date.now)');
    for (var i = 0; i < CHEAT_GLOBALS.length; i++) { if (window[CHEAT_GLOBALS[i]]) return ban('Cheat tool detected'); }
    if (window.debugGuaranteeLegendPull === true) return ban('Cheat tool detected');
    // Real violations below.
    try {
      var gs = (typeof gameState !== 'undefined' ? gameState : null) || window.gameState;
      if (gs) {
        // A save (re)load or slot switch repopulates gems/items all at once — that
        // is NOT a "jump". Detect a slot change and skip the jump checks that cycle
        // (baselines below still update, so the next scan compares correctly). The
        // absolute caps + illegal-mon checks stay unconditional.
        var slot = (typeof activeSlotIdx !== 'undefined') ? activeSlotIdx : window.activeSlotIdx;
        var loaded = (slot !== lastSlot); lastSlot = slot;

        var dg = Object.getOwnPropertyDescriptor(gs, 'gems');
        var dgo = Object.getOwnPropertyDescriptor(gs, 'gold');
        if ((dg && dg.get) || (dgo && dgo.get)) return ban('Currency tampering (intercepted balance)');
        if (typeof gs.gold === 'number' && gs.gold > 1e12) return ban('Impossible value (gold)');   // 1 trillion (gold is easy to stack)
        if (typeof gs.gems === 'number') {
          if (gs.gems > 5e5) return ban('Impossible value (gems)');                                  // 500k hard cap
          // sudden jump: >5000 gems between scans is illegitimate UNLESS a redeem code or
          // trade just ran (graced) or a save was just (re)loaded (loaded).
          if (!loaded && lastGems !== null) {
            var gemJump = gs.gems - lastGems;
            if (gemJump > 5000 && Date.now() >= (window.__atc_gemGrace || 0)) return ban('Suspicious gem increase (+' + gemJump + ' gems)');
          }
          lastGems = gs.gems;
        }

        // 4) illegal Pokémon — catches trade-spoof / IV-spoof injected mons
        var mons = (gs.box || []), perfectIllegit = 0, ssCount = 0;
        for (var j = 0; j < mons.length; j++) {
          var p = mons[j]; if (!p) continue;
          // Absolute, never-legit checks — apply to EVERY mon, even admin-approved ones.
          if (p.ivs) { for (var key in p.ivs) { var iv = p.ivs[key]; if (typeof iv === 'number' && (iv > 31 || iv < 0)) return ban('Illegal Pokémon (IV out of range)'); } }
          if (typeof p.level === 'number' && p.level > 295) return ban('Illegal Pokémon (impossible level)');
          if (typeof p.id === 'number' && (p.id < 1 || p.id > 1100)) return ban('Illegal Pokémon (invalid species)');
          // "Looks-spoofed" / flawless-count checks — these are the ones that can
          // false-positive on legit mons, so an admin-approved mon is skipped here.
          // (Gated on allowReady so nothing fires during the brief allowlist-verify window.)
          if (allowReady && !monApproved(p)) {
            // Natural-SSS only legitimately exists on Deoxys (386), Hero Greninja (658)
            // or limited legendaries. The trade spoof stamps it on arbitrary species.
            if (p._naturalSSS && !legitSSS(p)) return ban('Illegal Pokémon (spoofed SSS stats)');
            // _legend only legitimately on Eternatus (890) / Urshifu (892)
            if (p._legend && p.id !== 890 && p.id !== 892) return ban('Illegal Pokémon (spoofed legendary)');
            // count flawless (all-SS = all-31) mons — total and the illegitimate ones
            if (p.ivs) {
              var allP = true, cnt = 0; for (var k2 in p.ivs) { cnt++; if (p.ivs[k2] !== 31) allP = false; }
              if (allP && cnt >= 6) { ssCount++; if (!legitSSS(p)) perfectIllegit++; }
            }
          }
        }
        if (allowReady && perfectIllegit >= 6) return ban('Mass IV manipulation (perfect IVs)');
        if (allowReady && ssCount >= 10) return ban('Too many flawless (SS) Pokémon');

        // illegal items — a single item jumping by a lot between scans is a forced
        // add (the item exploit). Legit sources are small (+1 gacha/boss/spawn) or
        // wrapped (trade / item-gacha pulls), so they're graced and don't trip this.
        var inv = gs.inventory;
        if (inv && typeof inv === 'object') {
          if (!loaded && lastItems !== null && Date.now() >= (window.__atc_itemGrace || 0)) {
            for (var ik in inv) {
              var jump = (inv[ik] || 0) - (lastItems[ik] || 0);
              if (jump > 25) return ban('Suspicious item gain (+' + jump + ' ' + ik + ')');
            }
          }
          var snap = {}; for (var ik2 in inv) snap[ik2] = inv[ik2]; lastItems = snap;
        }
      }
    } catch (e) {}
  }

  // ── Request unban (download encrypted blob) ────────────────────────────────
  function download(text, name) {
    var blob = new Blob([text], { type: 'application/octet-stream' });
    var url = URL.createObjectURL(blob); var a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1000);
  }
  function randName() { return String(Math.floor(Math.random() * 9e12) + 1e12) + '.dat'; }
  function requestUnban(rec, btn) {
    var saveRaw = _get.call(localStorage, SAVE_KEY), saveInner = saveRaw;
    try { var o = JSON.parse(saveRaw); if (o && o.d) saveInner = o.d; } catch (e) {}
    var payload = JSON.stringify({ v: 1, brand: BRAND, pid: getPid(), banId: rec.banId, reason: rec.reason, ts: rec.ts, save: saveInner || null, allow: approvedList });
    if (btn) { btn.disabled = true; btn.textContent = 'Preparing…'; }
    atcEncrypt(payload).then(function (blob) {
      download(blob, randName());
      if (btn) { btn.disabled = false; btn.textContent = 'Request downloaded — send it to the developer'; }
    }).catch(function () { if (btn) { btn.disabled = false; btn.textContent = 'Request unban'; } alert('Could not build the request file.'); });
  }

  // ── Apply uploaded unban key ───────────────────────────────────────────────
  function applyKey(file, rec, statusEl) {
    file.text().then(function (text) {
      var obj;
      try { obj = JSON.parse(atob(text.trim())); } catch (e) { statusEl.textContent = 'Not a valid key file.'; return; }
      if (!obj || !obj.p || !obj.s) { statusEl.textContent = 'Not a valid key file.'; return; }
      statusEl.textContent = 'Verifying…';
      atcVerify(obj.p, obj.s).then(function (ok) {
        if (!ok) { statusEl.textContent = 'Invalid or forged key (signature check failed).'; return; }
        var tok; try { tok = JSON.parse(obj.p); } catch (e) { statusEl.textContent = 'Corrupt key payload.'; return; }
        if (tok.pid && tok.pid !== getPid()) { statusEl.textContent = 'This key was issued to a different player.'; return; }
        if (tok.banId && rec && tok.banId !== rec.banId) { statusEl.textContent = 'This key is for a different ban.'; return; }

        // Finish the unban once any allowlist update has been persisted + reloaded.
        function finish() {
          // Decide which save to keep, then strip whatever caused the ban.
          var saveToUse = (tok.save && typeof tok.save === 'string') ? tok.save : _get.call(localStorage, SAVE_KEY);
          try { var o0 = JSON.parse(saveToUse); if (o0 && o0.__atc === 1 && typeof o0.d === 'string') saveToUse = o0.d; } catch (e) {}
          if (saveToUse) {
            var cleaned = sanitizeSave(saveToUse, rec ? rec.reason : '');
            // Optional admin currency override (e.g. grant a fair balance instead of wiping to 0).
            if (typeof tok.setGems === 'number' || typeof tok.setGold === 'number') {
              try {
                var d = JSON.parse(cleaned); var slots = Array.isArray(d) ? d : [d];
                slots.forEach(function (s) {
                  if (s && typeof s === 'object') {
                    if (typeof tok.setGems === 'number') s.gems = tok.setGems;
                    if (typeof tok.setGold === 'number') s.gold = tok.setGold;
                  }
                });
                cleaned = JSON.stringify(Array.isArray(d) ? slots : slots[0]);
              } catch (e) {}
            }
            try { localStorage.setItem(SAVE_KEY, cleaned); } catch (e) {}
          }
          if (tok.action === 'reduce' && tok.until) { rec.until = tok.until; writeBan(rec); statusEl.textContent = 'Ban reduced — reloading…'; }
          else { clearBan(); statusEl.textContent = 'Ban lifted — reloading…'; }
          setTimeout(function () { location.reload(); }, 1200);
        }

        // If the key carries an allowlist, persist the SAME signed envelope (so the
        // game can re-verify it on future boots) and reload it before sanitizing,
        // so approved mons are spared. If it doesn't, leave existing approvals alone.
        if (tok.allow !== undefined) {
          try { _set.call(localStorage, ALLOW_KEY, JSON.stringify({ p: obj.p, s: obj.s })); } catch (e) {}
          loadAllow().then(finish);
        } else {
          finish();
        }
      });
    });
  }

  // ── Ban screen ──────────────────────────────────────────────────────────────
  function fmtUntil(until) {
    if (!until) return 'PERMANENT';
    var ms = until - Date.now(); if (ms <= 0) return 'expired';
    var h = Math.floor(ms / 3.6e6), d = Math.floor(h / 24);
    return d > 0 ? (d + 'd ' + (h % 24) + 'h remaining') : (h + 'h ' + Math.floor((ms % 3.6e6) / 6e4) + 'm remaining');
  }
  function showBanScreen(rec) {
    banned = true;
    try { if (window.battlePaused !== undefined) window.battlePaused = true; } catch (e) {}
    var host = document.body || document.documentElement;
    var prev = document.getElementById('atc-ban'); if (prev) prev.remove();
    var perma = !rec.until || rec.until <= Date.now();
    var statusTxt = perma ? 'Permanent' : fmtUntil(rec.until);
    var statusCol = perma ? '#ff6b6b' : '#f0b429';
    var ov = document.createElement('div');
    ov.id = 'atc-ban';
    ov.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#0a0b0e;background-image:radial-gradient(circle at 50% 26%,rgba(216,58,74,.11),transparent 60%);display:flex;align-items:center;justify-content:center;overflow:auto;padding:24px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased';
    ov.innerHTML =
      '<style>' +
        '#atc-ban .arow{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.05)}' +
        '#atc-ban .arow:last-child{border-bottom:0}' +
        '#atc-ban .ak{color:#6b7280;font-size:12px;flex-shrink:0}' +
        '#atc-ban .av{color:#dfe3ea;font-size:12px;font-weight:500;text-align:right;word-break:break-word}' +
        '#atc-ban button{font-family:inherit;cursor:pointer;transition:background .15s,border-color .15s,transform .1s}' +
        '#atc-ban button:active{transform:translateY(1px)}' +
        '#atc-ban .btn-primary:hover{background:#23262d}' +
        '#atc-ban .btn-ghost:hover{background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.22)}' +
        '@keyframes atcbpulse{0%,100%{opacity:.85}50%{opacity:1}}' +
      '</style>' +
      '<div style="max-width:430px;width:100%">' +
        '<div style="background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:32px 28px;box-shadow:0 24px 70px rgba(0,0,0,.55)">' +
          '<div style="display:flex;flex-direction:column;align-items:center;text-align:center">' +
            '<div style="animation:atcbpulse 2.2s ease-in-out infinite;filter:drop-shadow(0 4px 14px rgba(216,58,74,.4))">' +
              '<svg width="52" height="52" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="atcbsg" x1="0" y1="0" x2="48" y2="48"><stop stop-color="#ff7a85"/><stop offset="1" stop-color="#d8384a"/></linearGradient></defs>' +
              '<path d="M24 4 L40 9.5 V22 C40 32.5 33 40 24 43.5 C15 40 8 32.5 8 22 V9.5 Z" stroke="url(#atcbsg)" stroke-width="2.4" stroke-linejoin="round"/>' +
              '<path d="M18.7 18.7 L29.3 29.3 M29.3 18.7 L18.7 29.3" stroke="#ffdde0" stroke-width="2.6" stroke-linecap="round"/></svg>' +
            '</div>' +
            '<div style="margin-top:16px;font-size:10px;font-weight:700;letter-spacing:3px;color:#6b7280">' + esc(BRAND.toUpperCase()) + '</div>' +
            '<div style="margin-top:8px;font-size:21px;font-weight:600;letter-spacing:.2px;color:#f4f6fa">' + (perma ? 'Account banned' : 'Account suspended') + '</div>' +
            '<div style="margin-top:7px;font-size:13px;line-height:1.5;color:#878d97;max-width:330px">' + (perma ? 'This save was flagged for a security violation and can no longer be played.' : 'This save was flagged for a security violation and is temporarily restricted.') + '</div>' +
          '</div>' +
          '<div style="margin-top:22px;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:4px 14px">' +
            '<div class="arow"><span class="ak">Reason</span><span class="av">' + esc(rec.reason) + '</span></div>' +
            '<div class="arow"><span class="ak">Reference ID</span><span class="av" style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#aab1bd">' + esc(rec.banId) + '</span></div>' +
            '<div class="arow"><span class="ak">Issued</span><span class="av">' + esc(new Date(rec.ts).toLocaleString()) + '</span></div>' +
            '<div class="arow"><span class="ak">Status</span><span class="av" style="color:' + statusCol + ';font-weight:600">' + esc(statusTxt) + '</span></div>' +
          '</div>' +
          '<div id="atc-key-status" style="font-size:12px;color:#f0b429;min-height:16px;margin:16px 2px 0;text-align:center"></div>' +
          '<div style="display:flex;flex-direction:column;gap:9px;margin-top:14px">' +
            '<button id="atc-req" class="btn-primary" style="padding:12px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:#1a1d23;color:#eef0f3;font-weight:600;font-size:13px">Request unban</button>' +
            '<button id="atc-up" class="btn-ghost" style="padding:12px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:transparent;color:#aab1bd;font-weight:600;font-size:13px">I have an unban key</button>' +
            '<input id="atc-file" type="file" accept=".key,.json,.dat,application/json,text/plain" style="display:none">' +
          '</div>' +
          '<div style="margin-top:16px;font-size:11px;line-height:1.5;color:#5b616b;text-align:center">Request an unban, send the downloaded file to the developer, then return here and submit the key they provide.</div>' +
        '</div>' +
        '<div style="margin-top:14px;display:flex;align-items:center;justify-content:center;gap:6px;font-size:10px;color:#4a5059">' +
          '<svg width="11" height="11" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 4 L40 9.5 V22 C40 32.5 33 40 24 43.5 C15 40 8 32.5 8 22 V9.5 Z" stroke="#4a5059" stroke-width="3" stroke-linejoin="round"/></svg>' +
          '<span style="letter-spacing:.3px">Protected by ' + esc(BRAND) + '</span>' +
        '</div>' +
      '</div>';
    host.appendChild(ov);
    document.getElementById('atc-req').onclick = function () { requestUnban(rec, this); };
    document.getElementById('atc-up').onclick = function () { document.getElementById('atc-file').click(); };
    document.getElementById('atc-file').onchange = function (e) { if (e.target.files && e.target.files[0]) applyKey(e.target.files[0], rec, document.getElementById('atc-key-status')); };
  }
  function esc(s) { return ('' + s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }

  // ── "powered by" badge ──────────────────────────────────────────────────────
  function badge() {
    if (document.getElementById('atc-badge')) return;
    var b = document.createElement('div');
    b.id = 'atc-badge';
    b.textContent = '🛡 Protected by ' + BRAND;
    b.style.cssText = 'position:fixed;right:8px;bottom:8px;z-index:2147483000;font:600 10px Inter,system-ui,sans-serif;color:#9aa1b0;background:rgba(10,12,16,.7);border:1px solid rgba(167,139,250,.25);border-radius:6px;padding:4px 8px;pointer-events:none;user-select:none;letter-spacing:.3px';
    (document.body || document.documentElement).appendChild(b);
  }

  // ── init splash (shows briefly on every load) ───────────────────────────────
  function splash() {
    try {
      if (document.getElementById('atc-splash')) return;
      var s = document.createElement('div');
      s.id = 'atc-splash';
      var nm = BRAND.split(' ')[0];
      var tg = (BRAND.split(' ').slice(1).join(' ') || 'Anticheat').toUpperCase();
      s.style.cssText = 'position:fixed;inset:0;z-index:2147483600;background:#0a0b0e;background-image:radial-gradient(circle at 50% 32%,rgba(79,158,255,.07),transparent 60%);display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:1;transition:opacity .45s ease;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased';
      s.innerHTML =
        '<style>@keyframes agslide{0%{transform:translateX(-120%)}100%{transform:translateX(340%)}}@keyframes agpulse{0%,100%{opacity:.8}50%{opacity:1}}</style>' +
        '<div style="animation:agpulse 1.8s ease-in-out infinite;filter:drop-shadow(0 4px 14px rgba(79,158,255,.35))">' +
          '<svg width="52" height="52" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="agg" x1="0" y1="0" x2="48" y2="48"><stop stop-color="#6aa6ff"/><stop offset="1" stop-color="#3d7bff"/></linearGradient></defs>' +
          '<path d="M24 4 L40 9.5 V22 C40 32.5 33 40 24 43.5 C15 40 8 32.5 8 22 V9.5 Z" stroke="url(#agg)" stroke-width="2.4" stroke-linejoin="round"/>' +
          '<path d="M17.5 24 L22 28.5 L31 18" stroke="#dbe6ff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</div>' +
        '<div style="margin-top:16px;font-size:21px;font-weight:600;letter-spacing:.5px;color:#f4f6fa">' + nm + '</div>' +
        '<div style="margin-top:4px;font-size:10px;font-weight:600;letter-spacing:3.5px;color:#6f7886">' + tg + '</div>' +
        '<div style="margin-top:22px;width:172px;height:3px;border-radius:99px;background:rgba(255,255,255,.07);overflow:hidden;position:relative">' +
          '<div style="position:absolute;top:0;left:0;height:100%;width:42%;border-radius:99px;background:linear-gradient(90deg,transparent,#4f9eff,transparent);animation:agslide 1.05s ease-in-out infinite"></div>' +
        '</div>' +
        '<div style="margin-top:12px;font-size:11px;letter-spacing:.3px;color:#5b6470">Verifying integrity</div>';
      (document.body || document.documentElement).appendChild(s);
      setTimeout(function () { s.style.opacity = '0'; setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 460); }, 1400);
    } catch (e) {}
  }

  // ── Boot ────────────────────────────────────────────────────────────────────
  function boot() {
    badge();

    // Legit bulk gem/item grants open a short grace window; (re)loading a save
    // resets the jump baselines — together these prevent false jump bans.
    function wrapGrace(name, gem, item) {
      var fn = window[name];
      if (typeof fn === 'function' && !fn.__atcWrapped) {
        window[name] = function () {
          var t = Date.now() + 8000;
          if (gem)  window.__atc_gemGrace = t;
          if (item) window.__atc_itemGrace = t;
          return fn.apply(this, arguments);
        };
        window[name].__atcWrapped = true;
      }
    }
    wrapGrace('doRedeem', true, true);                    // codes can grant gems or items
    wrapGrace('acceptOnlineTrade', true, true);           // trades can grant gems or items
    wrapGrace('showItemGachaResultMulti', false, true);   // multi item-gacha pull
    wrapGrace('showItemGachaResult', false, true);        // single item-gacha pull
    if (typeof window.loadGame === 'function' && !window.loadGame.__atcWrapped) {
      var _ld = window.loadGame;
      window.loadGame = function () { lastGems = null; lastItems = null; return _ld.apply(this, arguments); };
      window.loadGame.__atcWrapped = true;
    }

    var rec = readBan();
    if (rec) {
      if (rec.until && Date.now() > rec.until) { clearBan(); }   // timed ban expired
      else { showBanScreen(rec); return; }
    }
    loadAllow().then(scan);   // verify the signed allowlist, then run a mon-aware scan
    scan();                    // immediate checks (patched fns / fingerprints / currency)
    setInterval(scan, 4000);

    // Fast tool-presence poll — catches an injected cheat near-instantly,
    // instead of waiting up to 4s for the periodic scan.
    setInterval(function () {
      if (banned) return;
      for (var i = 0; i < CHEAT_GLOBALS.length; i++) { if (window[CHEAT_GLOBALS[i]]) return ban('Cheat tool detected'); }
      if (window.debugGuaranteeLegendPull === true) return ban('Cheat tool detected');
      if (document.getElementById('__arf__')) return ban('Cheat tool detected');
    }, 300);
  }

  splash();
  console.log('%c\uD83D\uDEE1 ' + BRAND + ' active', 'color:#a78bfa;font-weight:700', '— integrity & tamper protection loaded.');
  window.Aegis = window.AntiTamperCheats = { version: '1.2', brand: BRAND, report: function (r) { ban(r || 'Manual flag'); } };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
