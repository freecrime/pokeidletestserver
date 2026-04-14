// ============================================================
// MODALS
// ============================================================

function showGachaResult(pk) {
  const cosmic = isCosmic(pk);
  document.getElementById('modal-title').textContent = cosmic ? '🌌 COSMIC SHINY POKÉMON!' : pk.isShiny ? '✨ SHINY POKÉMON!' : 'New Pokémon!';
  if(cosmic) document.getElementById('modal-title').style.cssText = 'font-family:"Press Start 2P",monospace;font-size:10px;background:linear-gradient(90deg,#00ffff,#bf00ff,#ff00aa,#00ffff);background-size:300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:16px;animation:shimmer 1.5s linear infinite';
  else document.getElementById('modal-title').style.cssText = '';

  document.getElementById('modal-content').innerHTML = `
    <div class="gacha-result ${cosmic ? 'is-cosmic' : pk.isShiny ? 'is-shiny' : ''}">
      <img src="${getSpriteUrl(pk.id, pk.isShiny, pk.uid)}" width="120" height="120" onerror="this.src='${getBattleSprite(pk.id,pk.isShiny)}'">
      ${cosmic ? `<div class="cosmic-text" style="font-size:12px">🌌 COSMIC SHINY 🌌</div>` : pk.isShiny ? '<div class="shiny-text">⭐ SHINY ⭐</div>' : ''}
      ${cosmic ? `<div style="font-size:12px;color:#4fc3f7">${countSS(pk)} PERFECT IVs!</div>` : ''}
      <div style="font-family:'Press Start 2P';font-size:10px;color:var(--gold)">${pk.name}</div>
      <div style="font-size:15px;color:var(--text2)">Lv.${pk.level}</div>
      <div style="display:flex;gap:6px">
        ${pk.types.map(t=>`<span class="type-badge" style="background:${TYPE_COLORS[t]}">${t}</span>`).join('')}
      </div>
      ${pk.stats ? renderMiniStats(pk) : ''}
      <div style="display:flex;gap:8px;margin-top:12px">
        <button class="btn gold" onclick="addToTeam(${pk.uid});closeModal()">Add to Team</button>
        <button class="btn" onclick="closeModal()">Keep in Box</button>
      </div>
    </div>
  `;
  openModal();
}

function showGachaResultMulti(pulls) {
  const hasShiny = pulls.some(p=>p.isShiny);
  const hasCosmic = pulls.some(p=>isCosmic(p));
  document.getElementById('modal-title').textContent = hasCosmic ? '🌌 COSMIC FOUND!' : hasShiny ? '✨ MULTI PULL RESULTS!' : 'Pull Results!';
  const grid = pulls.map(pk => {
    const cosmic = isCosmic(pk);
    return `<div class="poke-card ${cosmic ? 'cosmic-card' : pk.isShiny ? 'shiny-card' : ''}" style="cursor:default">
      ${cosmic ? '<div style="position:absolute;top:3px;right:4px">🌌</div>' : pk.isShiny ? '<div style="position:absolute;top:3px;right:4px">★</div>' : ''}
      <img src="${getSpriteUrl(pk.id, pk.isShiny, pk.uid)}" width="56" height="56" onerror="this.src='${getBattleSprite(pk.id,pk.isShiny)}'">
      <span class="cname">${pk.name}</span>
      <span class="clevel">Lv.${pk.level}</span>
      ${cosmic ? '<div class="cosmic-text" style="font-size:8px">COSMIC</div>' : pk.isShiny ? '<div class="shiny-text" style="font-size:9px">SHINY</div>' : ''}
    </div>`;
  }).join('');
  document.getElementById('modal-content').innerHTML = `<div class="poke-box">${grid}</div><button class="btn" onclick="closeModal()" style="width:100%;margin-top:12px">Close</button>`;
  openModal();
}

function showPokemonModal(pk) {
  const maxHp = getMaxHp(pk);
  const equippedItem = getItemByEquipId(gameState.equippedItems[pk.uid]);
  const evo = EVOLUTIONS[pk.id];
  const inTeam = gameState.team.includes(pk);
  const cosmic = isCosmic(pk);
  const mega = isMegaRayquaza(pk);
  const primalG   = typeof isPrimalGroudon !== 'undefined' && isPrimalGroudon(pk);
  const primalK   = typeof isPrimalKyogre  !== 'undefined' && isPrimalKyogre(pk);
  const deoxysAtk = pk.id === 386 && pk._deoxysForm === 'attack'  && typeof isDeoxysTransformed !== 'undefined' && isDeoxysTransformed(pk);
  const deoxysDef = pk.id === 386 && pk._deoxysForm === 'defense' && typeof isDeoxysTransformed !== 'undefined' && isDeoxysTransformed(pk);
  const deoxysSpd = pk.id === 386 && pk._deoxysForm === 'speed'   && typeof isDeoxysTransformed !== 'undefined' && isDeoxysTransformed(pk);

  if(mega) {
    document.getElementById('modal-title').textContent = '☄️ MEGA RAYQUAZA';
    document.getElementById('modal-title').style.cssText = 'font-family:"Press Start 2P",monospace;font-size:10px;background:linear-gradient(90deg,#ff0000,#ff8c00,#ffd700,#00e676,#00b0ff,#e040fb,#ff0000);background-size:300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:16px;animation:shimmer 0.8s linear infinite';
  } else if(isEnvyUnbound(pk)) {
    document.getElementById('modal-title').textContent = '🌑 ENVY UNBOUND';
    document.getElementById('modal-title').style.cssText = 'font-family:"Press Start 2P",monospace;font-size:10px;color:#00e676;margin-bottom:16px';
  } else if(isCrownedRoyalZacian(pk)) {
    document.getElementById('modal-title').textContent = '👑 ROYAL CROWNED ZACIAN';
    document.getElementById('modal-title').style.cssText = 'font-family:"Press Start 2P",monospace;font-size:10px;background:linear-gradient(90deg,#81d4fa,#ffd700,#fff9c4,#ffd700,#81d4fa);background-size:300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:16px;animation:shimmer 1s linear infinite';
  } else if(isCrownedZacian(pk)) {
    document.getElementById('modal-title').textContent = '👑 CROWNED ZACIAN';
    document.getElementById('modal-title').style.cssText = 'font-family:"Press Start 2P",monospace;font-size:10px;background:linear-gradient(90deg,#81d4fa,#ffd700,#81d4fa);background-size:300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:16px;animation:shimmer 1s linear infinite';
  } else if(isCrownedRoyalZamazenta(pk)) {
    document.getElementById('modal-title').textContent = '👑 ROYAL CROWNED ZAMAZENTA';
    document.getElementById('modal-title').style.cssText = 'font-family:"Press Start 2P",monospace;font-size:10px;background:linear-gradient(90deg,#ef9a9a,#ffd700,#fff9c4,#ffd700,#ef9a9a);background-size:300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:16px;animation:shimmer 1s linear infinite';
  } else if(isCrownedZamazenta(pk)) {
    document.getElementById('modal-title').textContent = '👑 CROWNED ZAMAZENTA';
    document.getElementById('modal-title').style.cssText = 'font-family:"Press Start 2P",monospace;font-size:10px;background:linear-gradient(90deg,#ef9a9a,#ffd700,#ef9a9a);background-size:300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:16px;animation:shimmer 1s linear infinite';
  } else if(pk._isEnvy) {
    if(isEnvyUnbound(pk)) {
      document.getElementById('modal-title').textContent = '🌑 ENVY UNBOUND';
      document.getElementById('modal-title').style.cssText = 'font-family:"Press Start 2P",monospace;font-size:10px;color:#00e676;margin-bottom:16px';
    } else {
      document.getElementById('modal-title').innerHTML = '<span class="void-text">💜 ENVY</span>';
      document.getElementById('modal-title').style.cssText = 'margin-bottom:16px';
    }
  } else {
    document.getElementById('modal-title').textContent = (cosmic ? '🌌 ' : pk.isShiny ? '★ ' : '') + pk.name.toUpperCase();
    document.getElementById('modal-title').style.cssText = cosmic ? 'font-family:"Press Start 2P",monospace;font-size:10px;background:linear-gradient(90deg,#00ffff,#bf00ff,#ff00aa,#00ffff);background-size:300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:16px;animation:shimmer 1.5s linear infinite' : '';
  }

  document.getElementById('modal-content').innerHTML = `
    <div style="display:flex;gap:16px;align-items:center;margin-bottom:12px">
      <div style="position:relative">
        <img src="${getSpriteUrl(pk.id, pk.isShiny, pk.uid)}" width="100" height="100" class="${getModalSpriteClass(pk)}" onerror="this.src='${getBattleSprite(pk.id,pk.isShiny)}'" style="${mega ? 'filter:drop-shadow(0 0 18px rgba(255,100,0,0.9)) drop-shadow(0 0 6px #ffd700)' : primalG ? 'filter:drop-shadow(0 0 16px rgba(255,112,67,0.9)) drop-shadow(0 0 6px #ff7043)' : primalK ? 'filter:drop-shadow(0 0 16px rgba(41,182,246,0.9)) drop-shadow(0 0 6px #29b6f6)' : deoxysAtk ? 'filter:drop-shadow(0 0 16px rgba(239,83,80,0.9))' : deoxysDef ? 'filter:drop-shadow(0 0 16px rgba(102,187,106,0.9))' : deoxysSpd ? 'filter:drop-shadow(0 0 16px rgba(255,215,0,0.9))' : ''}">
        ${mega ? '<div style="position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);font-size:10px;white-space:nowrap;background:linear-gradient(90deg,#ff0000,#ff8c00,#ffd700,#00e676,#00b0ff,#e040fb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-family:\'Press Start 2P\',monospace;animation:shimmer 0.8s linear infinite">MEGA</div>' : primalG ? '<div style="position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);font-size:9px;white-space:nowrap;color:#ff7043;text-shadow:0 0 6px #ff7043;font-family:\'Press Start 2P\',monospace;animation:mega-glow 2s ease-in-out infinite">🌋 PRIMAL</div>' : primalK ? '<div style="position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);font-size:9px;white-space:nowrap;color:#29b6f6;text-shadow:0 0 6px #29b6f6;font-family:\'Press Start 2P\',monospace;animation:mega-glow 2s ease-in-out infinite">🌊 PRIMAL</div>' : deoxysAtk ? '<div style="position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);font-size:8px;white-space:nowrap;color:#ef5350;text-shadow:0 0 6px #ef5350;font-family:\'Press Start 2P\',monospace;animation:mega-glow 1.5s ease-in-out infinite">⚔️ GALACTIC</div>' : deoxysDef ? '<div style="position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);font-size:8px;white-space:nowrap;color:#66bb6a;text-shadow:0 0 6px #66bb6a;font-family:\'Press Start 2P\',monospace;animation:mega-glow 1.5s ease-in-out infinite">🛡️ GALACTIC</div>' : deoxysSpd ? '<div style="position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);font-size:8px;white-space:nowrap;color:#ffd700;text-shadow:0 0 6px #ffd700;font-family:\'Press Start 2P\',monospace;animation:mega-glow 1.5s ease-in-out infinite">⚡ GALACTIC</div>' : ''}
      </div>
      <div>
        ${mega ? '<div style="background:linear-gradient(90deg,#ff0000,#ff8c00,#ffd700,#00e676,#00b0ff,#e040fb);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:13px;font-family:\'Press Start 2P\',monospace;animation:shimmer 0.8s linear infinite;margin-bottom:4px">☄️ MEGA EVOLVED</div>' : primalG ? '<div style="color:#ff7043;text-shadow:0 0 8px rgba(255,112,67,0.8);font-size:11px;font-family:\'Press Start 2P\',monospace;animation:mega-glow 2s ease-in-out infinite;margin-bottom:4px">🌋 PRIMAL GROUDON</div>' : primalK ? '<div style="color:#29b6f6;text-shadow:0 0 8px rgba(41,182,246,0.8);font-size:11px;font-family:\'Press Start 2P\',monospace;animation:mega-glow 2s ease-in-out infinite;margin-bottom:4px">🌊 PRIMAL KYOGRE</div>' : deoxysAtk ? '<div style="color:#ef5350;text-shadow:0 0 8px rgba(239,83,80,0.8);font-size:11px;font-family:\'Press Start 2P\',monospace;animation:mega-glow 1.5s ease-in-out infinite;margin-bottom:4px">⚔️ DEOXYS ATTACK</div>' : deoxysDef ? '<div style="color:#66bb6a;text-shadow:0 0 8px rgba(102,187,106,0.8);font-size:11px;font-family:\'Press Start 2P\',monospace;animation:mega-glow 1.5s ease-in-out infinite;margin-bottom:4px">🛡️ DEOXYS DEFENSE</div>' : deoxysSpd ? '<div style="color:#ffd700;text-shadow:0 0 8px rgba(255,215,0,0.8);font-size:11px;font-family:\'Press Start 2P\',monospace;animation:mega-glow 1.5s ease-in-out infinite;margin-bottom:4px">⚡ DEOXYS SPEED</div>' : cosmic ? '<div class="cosmic-text" style="font-size:11px">🌌 COSMIC SHINY 🌌</div>' : pk.isShiny ? '<div class="shiny-text">✨ SHINY ✨</div>' : ''}
        ${cosmic && !mega ? `<div style="font-size:13px;color:#4fc3f7;margin-bottom:4px">${countSS(pk)}/6 Perfect IVs</div>` : ''}
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">${pk.types.map(t=>`<span class="type-badge" style="background:${TYPE_COLORS[t]}">${t}</span>`).join('')}</div>
        <div style="font-size:15px;color:var(--text2)">Level ${pk.level} / 250</div>
        <div style="font-size:15px;color:var(--text2)">HP: ${Math.max(0,pk.currentHp)} / ${maxHp}</div>
        <div style="font-size:14px;color:var(--text2)">EXP: ${pk.exp} / ${pk.expToNext}</div>
        <div style="font-size:13px;color:var(--text2)">OT: <span style="color:var(--gold)">${pk.ot || 'Unknown'}</span></div>
        ${evo ? `<div style="font-size:13px;color:var(--accent);margin-top:4px;display:flex;align-items:center;gap:8px">→ Evolves into ${evo.name} at Lv.${evo.level}${pk.level >= evo.level && !pk._noEvolve ? ` <button class="btn" style="font-size:11px;padding:2px 8px;border-color:#ab47bc;color:#ab47bc" onclick="forceEvolve(${pk.uid});closeModal()">✨ Evolve!</button>` : ''}</div>` : ''}
        ${equippedItem ? `<div style="margin-top:4px">Held: ${getItemIcon(equippedItem,18)} ${equippedItem.name}</div>` : ''}
      </div>
    </div>
    ${pk.stats ? renderMiniStats(pk) : ''}
    <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
      ${!inTeam ? `<button class="btn gold" onclick="addToTeam(${pk.uid});closeModal()">Add to Team</button>` : `<button class="btn" style="border-color:#ef5350;color:#ef5350" onclick="removeFromTeamByUid(${pk.uid});closeModal()">Remove</button>`}
      <button class="btn" onclick="openEquipModal(${pk.uid})">Equip Item</button>
      ${equippedItem ? `<button class="btn" onclick="unequipItem(${pk.uid});closeModal()">Unequip</button>` : ''}
      <button class="btn" style="border-color:#00c853;color:#69f0ae" onclick="openTradeForPokemon(${pk.uid});closeModal()">🔄 Trade</button>
      <button class="btn" style="border-color:#ef5350;color:#ef5350" onclick="confirmRelease(${pk.uid})">Release 🕊️</button>
    </div>
  `;
  openModal();
}

function rollHighStats(uid) {
  const cost = 6000;
  if(gameState.gems < cost) { toast(`Need ${cost} 💎 to Roll High Stats!`, 2500); return; }
  const pk = gameState.box.find(p=>p.uid===uid);
  if(!pk) return;
  const avg = Math.round(Object.values(pk.ivs||{}).reduce((a,b)=>a+b,0)/6);
  const grade = getStatGrade(avg);
  if(!confirm(`Reroll ${pk.name}'s stats from the HIGH pool?\n\nCurrent overall: ${grade.label}\nCost: 6,000 💎\nGuaranteed: 2× SS (31) + all others min A (24+)\n\nThis cannot be undone!`)) return;
  gameState.gems -= cost;
  updateResourceUI();
  const stats = ['hp','attack','defense','special-attack','special-defense','speed'];
  // All stats get minimum A (24-31 range)
  stats.forEach(s => { pk.ivs[s] = Math.floor(Math.random() * 8) + 24; }); // 24–31
  // Guarantee exactly 2 SS (31) stats on random slots
  const shuffled = [...stats].sort(() => Math.random() - 0.5);
  pk.ivs[shuffled[0]] = 31;
  pk.ivs[shuffled[1]] = 31;
  if(pk.statsLoaded) pk.currentHp = Math.min(pk.currentHp, getMaxHp(pk));
  saveGame();
  toast(`🎲 ${pk.name}'s stats rerolled! 2 SS guaranteed!`, 3000);
  showPokemonInfoCard(pk);
}

function showPokemonInfoCard(pk) {
  const maxHp = getMaxHp(pk);
  const equippedItem = getItemByEquipId(gameState.equippedItems[pk.uid]);
  const evo = EVOLUTIONS[pk.id];
  const cosmic = isCosmic(pk);

  if(isEnvyUnbound(pk)) {
    document.getElementById('modal-title').textContent = '🌑 ENVY UNBOUND — Stats';
    document.getElementById('modal-title').style.cssText = 'font-family:"Press Start 2P",monospace;font-size:9px;color:#00e676;margin-bottom:16px';
  } else if(pk._isEnvy) {
    if(isEnvyUnbound(pk)) {
      document.getElementById('modal-title').textContent = '🌑 ENVY UNBOUND — Stats';
      document.getElementById('modal-title').style.cssText = 'font-family:"Press Start 2P",monospace;font-size:9px;color:#00e676;margin-bottom:16px';
    } else {
      document.getElementById('modal-title').innerHTML = '<span class="void-text">💜 ENVY — Stats</span>';
      document.getElementById('modal-title').style.cssText = 'margin-bottom:16px';
    }
  } else {
    document.getElementById('modal-title').textContent = `📊 ${cosmic ? '🌌 ' : pk.isShiny ? '★ ' : ''}${pk.name.toUpperCase()} — Stats`;
    document.getElementById('modal-title').style.cssText = '';
  }
  document.getElementById('modal-content').innerHTML = `
    <div style="display:flex;gap:16px;align-items:center;margin-bottom:12px">
      <img src="${getSpriteUrl(pk.id, pk.isShiny, pk.uid)}" width="96" height="96" class="${getModalSpriteClass(pk)}"" onerror="this.src='${getBattleSprite(pk.id,pk.isShiny,pk.uid)}'">
      <div>
        ${cosmic ? '<div class="cosmic-text" style="font-size:10px">🌌 COSMIC SHINY</div>' : pk.isShiny ? '<div class="shiny-text">✨ SHINY ✨</div>' : ''}
        ${cosmic ? `<div style="font-size:12px;color:#4fc3f7">${countSS(pk)}/6 perfect IVs</div>` : ''}
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">${pk.types.map(t=>`<span class="type-badge" style="background:${TYPE_COLORS[t]}">${t}</span>`).join('')}</div>
        <div style="font-size:16px;color:var(--gold)">Lv. ${pk.level}</div>
        <div style="font-size:14px;color:var(--text2)">HP: ${Math.max(0,pk.currentHp)} / ${maxHp}</div>
        ${evo ? `<div style="font-size:13px;color:var(--accent);display:flex;align-items:center;gap:8px">→ ${evo.name} @ Lv.${evo.level}${pk.level >= evo.level && !pk._noEvolve ? ` <button class="btn" style="font-size:11px;padding:2px 8px;border-color:#ab47bc;color:#ab47bc" onclick="forceEvolve(${pk.uid});closeModal()">✨ Evolve!</button>` : ''}</div>` : ''}
        ${equippedItem ? `<div style="margin-top:4px">${getItemIcon(equippedItem,18)} <span style="color:var(--gold)">${equippedItem.name}</span></div>` : ''}
      </div>
    </div>
    ${pk.stats ? renderMiniStats(pk) : '<div style="color:var(--text2);font-size:13px">Stats not yet loaded</div>'}
    ${renderAttackModeSelector(pk)}
    <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
      ${gameState.team.includes(pk) ? `<button class="btn" style="flex:1;border-color:#ef5350;color:#ef5350" onclick="removeFromTeamByUid(${pk.uid});closeModal()">Remove</button>` : `<button class="btn gold" style="flex:1" onclick="addToTeam(${pk.uid});closeModal()">Add to Team</button>`}
      <button class="btn" style="flex:1;border-color:#ab47bc;color:#ab47bc" onclick="rollHighStats(${pk.uid})">🎲 Roll High Stats<br><span style="font-size:12px;color:var(--gold)">6,000 💎</span></button>
      ${(pk.id === 718 && pk._zygardeForm === '10' && (gameState.inventory['zygarde_cell']||0) >= 50) ? `<button class="btn" style="flex:1;border-color:#69f0ae;color:#69f0ae" onclick="confirmZygardeTransform('${pk.uid}','50')">🌿 Transform 50%<br><span style="font-size:12px;color:#a5d6a7">50 🟢 Cells</span></button>` : ''}
      ${(pk.id === 718 && pk._zygardeForm === '50' && (gameState.inventory['zygarde_cell']||0) >= 100) ? `<button class="btn" style="flex:1;border-color:#00e676;color:#00e676" onclick="confirmZygardeTransform('${pk.uid}','perfected')">✨ Perfected<br><span style="font-size:12px;color:#69f0ae">100 🟢 Cells</span></button>` : ''}
      <button class="btn gold" onclick="closeModal()" style="flex:1">Close</button>
    </div>
  `;
  openModal();
}

function renderAttackModeSelector(pk) {
  const attacks = getPokemonAttacks(pk);
  if(!attacks) return '';
  const mode = pk._attackMode || 'physical';
  const physAtk = attacks.physical;
  const specAtk = attacks.special;
  return `<div style="background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:10px 12px;margin-top:8px;margin-bottom:4px">
    <div style="font-family:'Press Start 2P';font-size:7px;color:var(--text2);margin-bottom:8px">⚔️ ATTACK MODE</div>
    <div style="display:flex;gap:6px">
      <button onclick="setAttackMode(${pk.uid},'physical')" style="flex:1;padding:7px 4px;border-radius:7px;cursor:pointer;font-family:'VT323',monospace;font-size:15px;transition:all 0.15s;${mode==='physical' ? 'background:rgba(255,158,64,0.25);border:2px solid #ff9e40;color:#ff9e40' : 'background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.15);color:var(--text2)'}">
        ⚡ ${physAtk.name}<br><span style="font-size:11px;color:${mode==='physical'?'#ffcc80':'#888'}">Physical · uses ATK</span>
      </button>
      <button onclick="setAttackMode(${pk.uid},'special')" style="flex:1;padding:7px 4px;border-radius:7px;cursor:pointer;font-family:'VT323',monospace;font-size:15px;transition:all 0.15s;${mode==='special' ? 'background:rgba(171,71,188,0.25);border:2px solid #ab47bc;color:#ce93d8' : 'background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.15);color:var(--text2)'}">
        ✨ ${specAtk.name}<br><span style="font-size:11px;color:${mode==='special'?'#ce93d8':'#888'}">Special · uses SpA</span>
      </button>
    </div>
  </div>`;
}

// Map Pokémon types to fitting moves
const TYPE_ATTACKS = {
  normal:   {physical:{name:'Body Slam'},   special:{name:'Hyper Voice'}},
  fire:     {physical:{name:'Fire Punch'},   special:{name:'Flamethrower'}},
  water:    {physical:{name:'Waterfall'},    special:{name:'Surf'}},
  grass:    {physical:{name:'Leaf Blade'},   special:{name:'Energy Ball'}},
  electric: {physical:{name:'Wild Charge'},  special:{name:'Thunderbolt'}},
  ice:      {physical:{name:'Ice Punch'},     special:{name:'Ice Beam'}},
  fighting: {physical:{name:'Close Combat'},  special:{name:'Aura Sphere'}},
  poison:   {physical:{name:'Poison Jab'},    special:{name:'Sludge Bomb'}},
  ground:   {physical:{name:'Earthquake'},    special:{name:'Earth Power'}},
  flying:   {physical:{name:'Brave Bird'},    special:{name:'Air Slash'}},
  psychic:  {physical:{name:'Zen Headbutt'},  special:{name:'Psychic'}},
  bug:      {physical:{name:'X-Scissor'},     special:{name:'Bug Buzz'}},
  rock:     {physical:{name:'Rock Slide'},    special:{name:'Power Gem'}},
  ghost:    {physical:{name:'Shadow Claw'},   special:{name:'Shadow Ball'}},
  dragon:   {physical:{name:'Dragon Claw'},   special:{name:'Draco Meteor'}},
  dark:     {physical:{name:'Crunch'},        special:{name:'Dark Pulse'}},
  steel:    {physical:{name:'Iron Head'},     special:{name:'Flash Cannon'}},
  fairy:    {physical:{name:'Play Rough'},    special:{name:'Moonblast'}},
};

function getPokemonAttacks(pk) {
  if(!pk || !pk.types || pk.types.length === 0) return null;
  const primaryType = pk.types[0];
  return TYPE_ATTACKS[primaryType] || TYPE_ATTACKS['normal'];
}

function setAttackMode(uid, mode) {
  const pk = gameState.box.find(p => p.uid === uid);
  if(!pk) return;
  pk._attackMode = mode;
  saveGame();
  showPokemonInfoCard(pk);
}

// ============================================================
// BREEDING SYSTEM
// ============================================================

const MAX_BREEDING_SLOTS = 3;
const BREEDING_BASE_MS = 3600 * 1000; // 1 hour
const BREEDING_LONG_MS = 12 * 3600 * 1000; // 12 hours (S overall or higher)

function isDitto(pk) {
  return pk && pk.id === 132;
}

function canBreed(pkA, pkB) {
  if(!pkA || !pkB) return false;
  if(pkA.uid === pkB.uid) return false;
  // Same species
  if(pkA.id === pkB.id) return true;
  // One is Ditto
  if(isDitto(pkA) || isDitto(pkB)) return true;
  return false;
}

function breedingOverallGrade(pk) {
  if(!pk.ivs) return 'F';
  const avg = Math.round(Object.values(pk.ivs).reduce((a,b)=>a+b,0)/6);
  return getStatGrade(avg).label;
}

function breedingDuration(childIVs) {
  const avg = Math.round(Object.values(childIVs).reduce((a,b)=>a+b,0)/6);
  const g = getStatGrade(avg);
  // S, SS or special labels => 12h; otherwise 1h
  const longGrades = ['S','SS','SSS'];
  return longGrades.includes(g.label) ? BREEDING_LONG_MS : BREEDING_BASE_MS;
}

function generateBreedingIVs(pkA, pkB) {
  // Real breeding logic:
  // - 3 randomly chosen stats are inherited from one of the two parents
  // - The other 3 are fully random (0-31), totally independent of parents
  // - Each inherited stat has a ±0-4 mutation roll: can go UP (lucky!) or DOWN (unlucky)
  // - This means a child can be better OR worse than both parents
  const stats = ['hp','attack','defense','special-attack','special-defense','speed'];
  const ivsA = pkA.ivs || generateIVs();
  const ivsB = pkB.ivs || generateIVs();
  const child = {};

  // Pick 3 random stats to inherit
  const shuffled = [...stats].sort(() => Math.random() - 0.5);
  const inheritedStats = new Set(shuffled.slice(0, 3));

  stats.forEach(s => {
    if(inheritedStats.has(s)) {
      // Inherit from a random parent
      const base = Math.random() < 0.5 ? (ivsA[s] ?? 15) : (ivsB[s] ?? 15);
      // Mutation: -4 to +4, weighted slightly toward 0
      const mutation = Math.floor(Math.random() * 9) - 4; // -4 to +4
      child[s] = Math.max(0, Math.min(31, base + mutation));
    } else {
      // Completely random — could be great or terrible
      child[s] = Math.floor(Math.random() * 32);
    }
  });

  return child;
}

function startBreeding(uidA, uidB) {
  if((gameState.breedingSlots||[]).length >= MAX_BREEDING_SLOTS) {
    toast('🥚 All breeding slots are occupied!', 2500); return;
  }
  const pkA = gameState.box.find(p=>p.uid===uidA);
  const pkB = gameState.box.find(p=>p.uid===uidB);
  if(!pkA || !pkB) return;
  if(!canBreed(pkA, pkB)) { toast('❌ These two cannot breed!', 2500); return; }

  // Determine child species (not Ditto)
  const parent = isDitto(pkA) ? pkB : pkA;
  const childIVs = generateBreedingIVs(pkA, pkB);
  const isShiny = Math.random() < 1/100;
  const dur = breedingDuration(childIVs);

  const slot = {
    id: Date.now(),
    parentAUid: uidA, parentBUid: uidB,
    parentAName: pkA.name, parentBName: pkB.name,
    childId: parent.id, childName: parent.name, childTypes: parent.types,
    childIVs, isShiny,
    startedAt: Date.now(),
    duration: dur,
    done: false,
  };
  if(!gameState.breedingSlots) gameState.breedingSlots = [];
  gameState.breedingSlots.push(slot);
  saveGame();
  toast(`🥚 ${pkA.name} & ${pkB.name} started breeding! (${dur >= BREEDING_LONG_MS ? '12h' : '1h'})`, 3000);
  renderEggUI();
}

function claimEgg(slotId) {
  const idx = (gameState.breedingSlots||[]).findIndex(s=>s.id===slotId);
  if(idx === -1) return;
  const slot = gameState.breedingSlots[idx];
  if(!slot.done && Date.now() < slot.startedAt + slot.duration) {
    toast('🥚 The egg is not ready yet!', 2000); return;
  }
  // Create the baby pokemon
  const parent = gameState.box.find(p=>p.id===slot.childId && !isDitto(p));
  const childLevel = 1;
  const child = newPokemonEntry(slot.childId, slot.childName, slot.childTypes, childLevel, slot.isShiny);
  child.ivs = slot.childIVs;
  child._attackMode = 'physical';
  child.ot = gameState.trainerName;
  // Load stats asynchronously
  fetchPokemonStats(slot.childId).then(stats => {
    child.stats = stats; child.statsLoaded = true;
    child.currentHp = getMaxHp(child);
    saveGame();
  });
  gameState.box.push(child);
  gameState.breedingSlots.splice(idx, 1);
  saveGame();
  const avg = Math.round(Object.values(slot.childIVs).reduce((a,b)=>a+b,0)/6);
  const grade = getStatGrade(avg);
  toast(`${slot.isShiny?'✨ SHINY ':''} 🐣 ${slot.childName} hatched! (${grade.label} overall)`, 4000);
  renderEggUI();
}

function debugFastHatch() {
  const slots = gameState.breedingSlots || [];
  if(slots.length === 0) { toast('🥚 No active breeding slots!', 2000); return; }
  slots.forEach(s => { s.startedAt = Date.now() - s.duration - 1; });
  saveGame();
  toast(`⚡ All ${slots.length} egg(s) are now ready to claim!`, 3000);
  renderEggUI();
}

function renderEggUI() {
  const el = document.getElementById('egg-ui');
  if(!el) return;

  const slots = gameState.breedingSlots || [];
  const now = Date.now();

  let html = `<div style="font-family:'Press Start 2P';font-size:8px;color:#f8bbd0;margin-bottom:10px">🥚 BREEDING CENTER</div>`;
  html += `<div style="font-size:13px;color:var(--text2);margin-bottom:10px;line-height:1.7">Breed same-species pairs or use Ditto.<br>Better IVs = longer hatch time.</div>`;

  // Active slots
  if(slots.length > 0) {
    html += `<div style="font-family:'Press Start 2P';font-size:7px;color:var(--text2);margin-bottom:6px">ACTIVE (${slots.length}/${MAX_BREEDING_SLOTS})</div>`;
    slots.forEach(slot => {
      const elapsed = now - slot.startedAt;
      const pct = Math.min(100, Math.round((elapsed / slot.duration) * 100));
      const ready = elapsed >= slot.duration;
      const remaining = Math.max(0, slot.duration - elapsed);
      const remStr = ready ? '✅ READY!' : formatBreedTime(remaining);
      const avg = Math.round(Object.values(slot.childIVs).reduce((a,b)=>a+b,0)/6);
      const grade = getStatGrade(avg);
      const shinyTag = slot.isShiny ? `<span class="shiny-text" style="font-size:11px">★ SHINY!</span>` : '';
      html += `<div style="background:rgba(248,187,208,0.07);border:1px solid rgba(248,187,208,${ready?'0.6':'0.2'});border-radius:10px;padding:10px 12px;margin-bottom:8px${ready?';box-shadow:0 0 14px rgba(248,187,208,0.3)':''}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
          <div style="font-size:15px;color:#f8bbd0">${slot.parentAName} ♥ ${slot.parentBName}</div>
          <div style="font-size:12px;color:var(--text2)">→ 🥚 ${slot.childName}</div>
        </div>
        ${shinyTag}
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
          <div style="flex:1;height:7px;background:rgba(255,255,255,0.08);border-radius:4px;overflow:hidden">
            <div style="height:100%;border-radius:4px;background:${ready?'#f48fb1':'linear-gradient(90deg,#f8bbd0,#f48fb1)'};width:${pct}%;transition:width 1s linear"></div>
          </div>
          <div style="font-size:13px;color:${ready?'#f48fb1':'var(--text2)'};min-width:80px;text-align:right">${remStr}</div>
        </div>
        <div style="font-size:12px;color:var(--text2);margin-bottom:7px">Egg IV grade: <span style="color:${grade.color};font-family:'Press Start 2P',monospace;font-size:7px">${grade.label}</span></div>
        ${ready ? `<button onclick="claimEgg(${slot.id})" style="width:100%;background:rgba(244,143,177,0.2);border:1px solid #f48fb1;color:#f48fb1;padding:6px;border-radius:6px;cursor:pointer;font-family:'VT323',monospace;font-size:16px">🐣 Claim Egg!</button>` : `<div style="font-size:11px;color:#888;text-align:center;padding:2px 0">🔒 Breeding in progress — cannot be cancelled</div>`}
      </div>`;
    });
  } else {
    html += `<div style="text-align:center;color:var(--text2);font-size:14px;padding:18px 0;border:1px dashed rgba(248,187,208,0.2);border-radius:8px;margin-bottom:10px">No active breeding.<br>Pick two Pokémon below!</div>`;
  }

  if(slots.length < MAX_BREEDING_SLOTS) {
    html += `<div style="font-family:'Press Start 2P';font-size:7px;color:var(--text2);margin-top:10px;margin-bottom:6px">START NEW BREEDING</div>`;
    html += renderBreedingPicker();
  }

  el.innerHTML = html;

  // Refresh timer
  clearTimeout(window._eggUiTimer);
  if(slots.length > 0) {
    window._eggUiTimer = setTimeout(() => {
      if(document.getElementById('tab-egg') && document.getElementById('tab-egg').classList.contains('active')) {
        renderEggUI();
      }
    }, 5000);
  }
}

function renderBreedingPicker() {
  // Show all box pokemon the player can pick; let them choose slot A and B
  const state = window._breedPickState || { a: null, b: null };
  window._breedPickState = state;

  const pkA = state.a !== null ? gameState.box.find(p=>p.uid===state.a) : null;
  const pkB = state.b !== null ? gameState.box.find(p=>p.uid===state.b) : null;
  const compatible = pkA && pkB && canBreed(pkA, pkB);

  let html = `<div style="display:flex;gap:8px;margin-bottom:10px">`;
  // Slot A
  html += `<div style="flex:1;background:rgba(0,0,0,0.2);border:1px solid ${pkA?'rgba(248,187,208,0.5)':'rgba(255,255,255,0.1)'};border-radius:8px;padding:8px;text-align:center;cursor:pointer;min-height:64px" onclick="openBreedPickOverlay('a')">
    ${pkA ? `<img src="${getSpriteUrl(pkA.id,pkA.isShiny,pkA.uid)}" width="48" height="48"><div style="font-size:13px;color:#f8bbd0">${pkA.isShiny?'★ ':''}${pkA.name}</div>` : `<div style="font-size:22px;margin-top:8px">➕</div><div style="font-size:12px;color:var(--text2)">Parent A</div>`}
  </div>`;
  html += `<div style="display:flex;align-items:center;font-size:20px;color:#f8bbd0">♥</div>`;
  // Slot B
  html += `<div style="flex:1;background:rgba(0,0,0,0.2);border:1px solid ${pkB?'rgba(248,187,208,0.5)':'rgba(255,255,255,0.1)'};border-radius:8px;padding:8px;text-align:center;cursor:pointer;min-height:64px" onclick="openBreedPickOverlay('b')">
    ${pkB ? `<img src="${getSpriteUrl(pkB.id,pkB.isShiny,pkB.uid)}" width="48" height="48"><div style="font-size:13px;color:#f8bbd0">${pkB.isShiny?'★ ':''}${pkB.name}</div>` : `<div style="font-size:22px;margin-top:8px">➕</div><div style="font-size:12px;color:var(--text2)">Parent B</div>`}
  </div>`;
  html += `</div>`;

  if(pkA && pkB) {
    if(compatible) {
      html += `<div style="font-size:13px;color:#69f0ae;margin-bottom:7px;text-align:center">✅ Compatible! Ready to breed.</div>`;
      html += `<button onclick="startBreeding(${pkA.uid},${pkB.uid})" style="width:100%;background:rgba(248,187,208,0.15);border:1px solid #f48fb1;color:#f48fb1;padding:9px;border-radius:8px;cursor:pointer;font-family:'VT323',monospace;font-size:18px;letter-spacing:1px">🥚 Start Breeding!</button>`;
    } else {
      html += `<div style="font-size:13px;color:#ef5350;margin-bottom:7px;text-align:center">❌ Incompatible! Same species or use Ditto.</div>`;
    }
  }

  return html;
}

function openBreedPickOverlay(slot) {
  // Render a picker modal
  const other = slot === 'a' ? window._breedPickState.b : window._breedPickState.a;
  const candidates = gameState.box.filter(p => {
    // Can always pick any pokemon; compatibility shown live
    return true;
  });
  document.getElementById('modal-title').textContent = `🥚 Pick ${slot === 'a' ? 'Parent A' : 'Parent B'}`;
  document.getElementById('modal-title').style.cssText = '';
  const grid = candidates.map(pk => {
    const otherPk = other !== null ? gameState.box.find(p=>p.uid===other) : null;
    const compat = otherPk ? canBreed(pk, otherPk) : true;
    return `<div onclick="selectBreedParent('${slot}',${pk.uid})" style="cursor:pointer;text-align:center;padding:7px;border-radius:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(${compat?'248,187,208':'255,255,255'},0.${compat?'25':'08'});opacity:${compat?'1':'0.45'}">
      <img src="${getSpriteUrl(pk.id,pk.isShiny,pk.uid)}" width="48" height="48">
      <div style="font-size:12px;color:${pk.isShiny?'#ffd700':'var(--text)'}">${pk.isShiny?'★ ':''}${pk.name}</div>
      <div style="font-size:11px;color:var(--text2)">Lv.${pk.level}</div>
      ${isDitto(pk) ? '<div style="font-size:10px;color:#f48fb1">Ditto ★</div>' : ''}
    </div>`;
  }).join('');
  document.getElementById('modal-content').innerHTML = `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;max-height:380px;overflow-y:auto">${grid}</div>`;
  openModal();
}

function selectBreedParent(slot, uid) {
  window._breedPickState = window._breedPickState || { a: null, b: null };
  window._breedPickState[slot] = uid;
  closeModal();
  renderEggUI();
}

function formatBreedTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if(h > 0) return `${h}h ${m}m`;
  if(m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function renderMiniStats(pk) {
  if(!pk.stats) return '';
  const statNames = {hp:'HP',attack:'ATK',defense:'DEF','special-attack':'SpA','special-defense':'SpD',speed:'SPD'};
  const statColors = {hp:'#ef5350',attack:'#ff9e40',defense:'#4fc3f7','special-attack':'#ab47bc','special-defense':'#66bb6a',speed:'#ffd700'};
  const maxBase = 255;
  const ivs = pk.ivs || {};
  const totalIV = Object.values(ivs).reduce((a,b)=>a+b,0);
  const maxIV = 31 * 6;
  const overallPct = Math.round((totalIV / maxIV) * 100);
  const overallGrade = getStatGrade(Math.round((totalIV/6)));
  const cosmic = isCosmic(pk);
  const isMega = isMegaRayquaza(pk);
  const isOrigin = isOriginGiratina(pk);
  const isFused = isDNAFused(pk);
  const isCrowned = isCrownedZacian(pk) || isCrownedZamazenta(pk);
  const isRoyalCrowned = isCrownedRoyalZacian(pk) || isCrownedRoyalZamazenta(pk);
  const isOuterMega = isOuterWorldMegaRayquaza(pk);
  const isUnbound = isEnvyUnbound(pk);
  const isMegaStarter = isMegaSceptile(pk) || isMegaSwampert(pk) || isMegaBlaziken(pk);
  const isMegaNew = isMegaGengar(pk) || isMegaAggron(pk) || isMegaGarchomp(pk);
  const isAnyMega = isMegaStarter || isMegaNew;
  const isPrimalG   = typeof isPrimalGroudon   !== 'undefined' && isPrimalGroudon(pk);
  const isPrimalK   = typeof isPrimalKyogre    !== 'undefined' && isPrimalKyogre(pk);
  const isDeoxysAtk = pk.id === 386 && pk._deoxysForm === 'attack'  && typeof isDeoxysTransformed !== 'undefined' && isDeoxysTransformed(pk);
  const isDeoxysSpd = pk.id === 386 && pk._deoxysForm === 'speed'   && typeof isDeoxysTransformed !== 'undefined' && isDeoxysTransformed(pk);
  const isDeoxysDef = pk.id === 386 && pk._deoxysForm === 'defense' && typeof isDeoxysTransformed !== 'undefined' && isDeoxysTransformed(pk);
  const isAnyDeoxysForm = isDeoxysAtk || isDeoxysSpd || isDeoxysDef;
  const isSpecialForm = isMega || isOuterMega || isUnbound || isOrigin || isFused || pk._naturalSSS || isCrowned || isRoyalCrowned || pk._sssUsed || pk._isEnvy || isAnyMega || isPerfectedZygarde(pk) || isPrimalG || isPrimalK || isAnyDeoxysForm;

  const hasSSStat = isSpecialForm && Object.values(ivs).some(iv => iv >= 31);
  const displayGrade = isUnbound ? {label:'UNBOUND', color:'#00e676', isSS:true, isSSS:true}
    : isRoyalCrowned ? {label:'ROYAL', color:'#ffd700', isSS:true, isSSS:true}
    : isOuterMega ? {label:'OUTER', color:'#00e5ff', isSS:true, isSSS:true}
    : isDeoxysAtk ? {label:'GALACTIC', color:'#ef5350', isSS:true, isSSS:true}
    : isDeoxysSpd ? {label:'GALACTIC', color:'#ffd700', isSS:true, isSSS:true}
    : isDeoxysDef ? {label:'GALACTIC', color:'#66bb6a', isSS:true, isSSS:true}
    : isPrimalG   ? {label:'PRIMAL',   color:'#ff7043', isSS:true, isSSS:true}
    : isPrimalK   ? {label:'PRIMAL',   color:'#29b6f6', isSS:true, isSSS:true}
    : hasSSStat ? {label:'SSS', color:'#ff69b4', isSS:true, isSSS:true} : overallGrade;
  const formLabel = isMega ? ' <span style="color:#ff8c00">MEGA</span>'
    : isOuterMega ? ' <span style="color:#00e5ff;text-shadow:0 0 6px #00e5ff">OUTER MEGA</span>'
    : isUnbound ? ' <span style="color:#00e676;text-shadow:0 0 8px rgba(0,230,118,0.7);animation:mega-glow 2s ease-in-out infinite">UNBOUND</span>'
    : isOrigin ? ' <span style="color:#ce93d8">ORIGIN</span>'
    : isFused ? ' <span style="color:#00e5ff">FUSED</span>'
    : isRoyalCrowned ? ' <span style="color:#ffd700;text-shadow:0 0 6px #ffd700;animation:mega-glow 2s ease-in-out infinite">ROYAL</span>'
    : isCrowned ? ' <span style="color:#ffd700">CROWNED</span>'
    : isAnyMega ? ' <span style="color:#00e676;text-shadow:0 0 6px #00e676">MEGA</span>'
    : isPerfectedZygarde(pk) ? ' <span style="color:#69f0ae">PERFECTED</span>'
    : isPrimalG   ? ' <span style="color:#ff7043;text-shadow:0 0 6px rgba(255,112,67,0.8);animation:mega-glow 2s ease-in-out infinite">🌋 PRIMAL</span>'
    : isPrimalK   ? ' <span style="color:#29b6f6;text-shadow:0 0 6px rgba(41,182,246,0.8);animation:mega-glow 2s ease-in-out infinite">🌊 PRIMAL</span>'
    : isDeoxysAtk ? ' <span style="color:#ef5350;text-shadow:0 0 6px rgba(239,83,80,0.8);animation:mega-glow 2s ease-in-out infinite">⚔️ GALACTIC</span>'
    : isDeoxysDef ? ' <span style="color:#66bb6a;text-shadow:0 0 6px rgba(102,187,106,0.8);animation:mega-glow 2s ease-in-out infinite">🛡️ GALACTIC</span>'
    : isDeoxysSpd ? ' <span style="color:#ffd700;text-shadow:0 0 6px rgba(255,215,0,0.8);animation:mega-glow 2s ease-in-out infinite">⚡ GALACTIC</span>'
    : '';
  const borderColor = isMega ? 'rgba(255,100,0,0.6)'
    : isOuterMega ? 'rgba(0,229,255,0.7)'
    : isUnbound ? 'rgba(0,200,100,0.4)'
    : isOrigin ? 'rgba(156,39,176,0.6)'
    : isFused ? 'rgba(0,229,255,0.6)'
    : isRoyalCrowned ? 'rgba(255,215,0,0.8)'
    : isCrowned ? 'rgba(255,215,0,0.6)'
    : isAnyMega ? 'rgba(0,230,118,0.5)'
    : isPerfectedZygarde(pk) ? 'rgba(105,240,174,0.5)'
    : isPrimalG   ? 'rgba(255,112,67,0.7)'
    : isPrimalK   ? 'rgba(41,182,246,0.7)'
    : isDeoxysAtk ? 'rgba(239,83,80,0.7)'
    : isDeoxysDef ? 'rgba(102,187,106,0.7)'
    : isDeoxysSpd ? 'rgba(255,215,0,0.7)'
    : cosmic ? 'rgba(0,255,255,0.3)' : 'rgba(255,255,255,0.1)';
  const glow = isMega ? ';box-shadow:0 0 16px rgba(255,50,0,0.3)'
    : isOuterMega ? ';box-shadow:0 0 20px rgba(0,229,255,0.5),0 0 40px rgba(0,150,200,0.2)'
    : isUnbound ? ';box-shadow:0 0 16px rgba(0,200,100,0.5),0 0 32px rgba(0,150,70,0.2)'
    : isOrigin ? ';box-shadow:0 0 16px rgba(156,39,176,0.4)'
    : isFused ? ';box-shadow:0 0 16px rgba(0,229,255,0.3)'
    : isRoyalCrowned ? ';box-shadow:0 0 20px rgba(255,215,0,0.5),0 0 40px rgba(255,180,0,0.2)'
    : isCrowned ? ';box-shadow:0 0 16px rgba(255,215,0,0.35)'
    : isAnyMega ? ';box-shadow:0 0 16px rgba(0,230,118,0.25),0 0 32px rgba(0,200,80,0.15)'
    : isPerfectedZygarde(pk) ? ';box-shadow:0 0 16px rgba(105,240,174,0.35)'
    : isPrimalG   ? ';box-shadow:0 0 20px rgba(255,112,67,0.5),0 0 40px rgba(200,60,20,0.2)'
    : isPrimalK   ? ';box-shadow:0 0 20px rgba(41,182,246,0.5),0 0 40px rgba(0,120,200,0.2)'
    : isDeoxysAtk ? ';box-shadow:0 0 20px rgba(239,83,80,0.5),0 0 40px rgba(180,30,30,0.2)'
    : isDeoxysDef ? ';box-shadow:0 0 20px rgba(102,187,106,0.5),0 0 40px rgba(50,130,50,0.2)'
    : isDeoxysSpd ? ';box-shadow:0 0 20px rgba(255,215,0,0.5),0 0 40px rgba(200,160,0,0.2)'
    : '';

  let html = `<div style="background:rgba(0,0,0,0.3);border:1px solid ${borderColor};border-radius:8px;padding:10px 12px;margin-bottom:6px${glow}">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
        <div style="font-family:'Press Start 2P';font-size:7px;color:var(--text2)">STATS & IVs${formLabel}</div>
        ${pk._isEnvy && !isUnbound ? `<div style="font-family:'Press Start 2P';font-size:5px;background:linear-gradient(90deg,#1a0030,#ab47bc,#ce93d8,#6a0080,#1a0030);background-size:300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:void-shimmer 3s linear infinite;border:1px solid rgba(171,71,188,0.5);border-radius:4px;padding:2px 6px;letter-spacing:0.5px;flex-shrink:0">💜 VOID</div>` : ''}
        ${pk._sssUsed ? `<div style="font-family:'Press Start 2P';font-size:5px;color:#ffd700;background:rgba(255,215,0,0.13);border:1px solid rgba(255,215,0,0.45);border-radius:4px;padding:2px 5px;letter-spacing:0.5px">⭐ CANDY BOOSTED</div>` : ''}
        ${isPerfectedZygarde(pk) ? `<div style="font-family:'Press Start 2P';font-size:5px;color:#69f0ae;background:rgba(105,240,174,0.12);border:1px solid rgba(105,240,174,0.5);border-radius:4px;padding:2px 5px;letter-spacing:0.5px;animation:shimmer 1.5s linear infinite">🌿 EVOLVED</div>` : ''}
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <span style="font-size:12px;color:var(--text2)">Overall:</span>
        ${hasSSStat
          ? `<span class="ss-rainbow" style="font-size:9px;animation:shimmer 0.8s linear infinite">SSS</span>`
          : displayGrade.isSS
            ? `<span class="ss-rainbow" style="font-size:9px">${displayGrade.label}</span>`
            : `<span style="font-family:'Press Start 2P';font-size:9px;color:${displayGrade.color}">${displayGrade.label}</span>`}
        <span style="font-size:11px;color:var(--text2)">(${overallPct}%)</span>
      </div>
    </div>`;

  pk.stats.forEach(s => {
    const name = statNames[s.stat.name] || s.stat.name;
    const iv = ivs[s.stat.name] ?? 15;
    const baseGrade = getStatGrade(iv);
    // SSS Candy: only the chosen stat becomes SSS; for mega/origin all SS stats do
    const isSSSCandyStat = pk._sssUsed && pk._sssStat === s.stat.name;
    const becomeSSS = (isSpecialForm && !pk._sssUsed && baseGrade.isSS) || (pk._sssUsed && baseGrade.isSS && (isCrownedZacian(pk)||isCrownedZamazenta(pk)||isCrownedRoyalZacian(pk)||isCrownedRoyalZamazenta(pk)||pk._naturalSSS||isMega||isOuterMega||isUnbound||isOrigin||isFused||isAnyMega)) || isSSSCandyStat;
    const becomeMEGA = isAnyMega && pk._sssUsed && pk._sssStat === s.stat.name;
    // ROYAL tier: royal_sword → physical attack only, royal_shield → hp stat (if already SSS)
    const becomeROYAL = (isCrownedRoyalZacian(pk) && s.stat.name === 'attack' && baseGrade.isSS)
      || (isCrownedRoyalZamazenta(pk) && s.stat.name === 'hp' && baseGrade.isSS);
    // OUTER tier: outer_world_meteor on Rayquaza → speed stat (if already SSS)
    const becomeOUTER = isOuterMega && !isUnbound && s.stat.name === 'speed' && baseGrade.isSS;
    // UNBOUND tier: Envy Unbound → all SSS stats become UNBOUND
    const becomeUNBOUND = isUnbound && baseGrade.isSS;
    // GALACTIC tier: Deoxys forms → the special stat becomes GALACTIC
    const becomeGALACTIC_ATK = isDeoxysAtk && s.stat.name === 'attack'   && baseGrade.isSS;
    const becomeGALACTIC_DEF = isDeoxysDef && s.stat.name === 'hp'        && baseGrade.isSS;
    const becomeGALACTIC_SPD = isDeoxysSpd && s.stat.name === 'speed'     && baseGrade.isSS;
    const becomeGALACTIC = becomeGALACTIC_ATK || becomeGALACTIC_DEF || becomeGALACTIC_SPD;
    const galacticColor = becomeGALACTIC_ATK ? '#ef5350' : becomeGALACTIC_DEF ? '#66bb6a' : '#ffd700';
    // PRIMAL tier: Primal Groudon/Kyogre boosted stat
    const becomePRIMAL_G = isPrimalG && s.stat.name === 'attack'         && baseGrade.isSS;
    const becomePRIMAL_K = isPrimalK && s.stat.name === 'hp' && baseGrade.isSS;
    const becomePRIMAL = becomePRIMAL_G || becomePRIMAL_K;
    const primalColor = becomePRIMAL_G ? '#ff7043' : '#29b6f6';
    const grade = becomeUNBOUND ? {label:'UNBOUND',  color:'#00e676', isSS:true, isSSS:true}
      : becomeROYAL    ? {label:'ROYAL',   color:'#ffd700', isSS:true, isSSS:true}
      : becomeOUTER    ? {label:'OUTER',   color:'#00e5ff', isSS:true, isSSS:true}
      : becomeGALACTIC ? {label:'GALACTIC',color:galacticColor, isSS:true, isSSS:true}
      : becomePRIMAL   ? {label:'PRIMAL',  color:primalColor,  isSS:true, isSSS:true}
      : becomeMEGA     ? {label:'MEGA',    color:'#00e676', isSS:true, isSSS:true}
      : becomeSSS      ? {label:'SSS',     color:'#ff69b4', isSS:true, isSSS:true} : baseGrade;
    const isSSBar = becomeSSS || becomeMEGA || becomeROYAL || becomeOUTER || becomeUNBOUND || becomeGALACTIC || becomePRIMAL;
    const effective = Math.floor(((s.base_stat * 2 + iv) * pk.level / 100) + (s.stat.name==='hp' ? pk.level+10 : 5));
    const pct = Math.min(100, (s.base_stat / maxBase) * 100);
    const ivPct = isSSBar ? 100 : Math.round((iv / 31) * 100);
    const rainbowBar = 'linear-gradient(90deg,#ff0000,#ff8c00,#ffd700,#00e676,#00b0ff,#e040fb,#ff0000)';
    const barColor = isSSBar ? rainbowBar : (statColors[s.stat.name] || 'var(--accent)');
    const barBg = isSSBar ? 'rgba(255,140,0,0.15)' : 'rgba(255,255,255,0.08)';
    const valColor = isUnbound ? '#00e676' : isOuterMega ? '#00e5ff' : isRoyalCrowned ? '#ffd700' : isMega ? '#ff8c00' : isOrigin ? '#ce93d8' : isFused ? '#00e5ff' : isCrowned ? '#ffd700' : isAnyMega ? '#00e676' : isPrimalG ? '#ff7043' : isPrimalK ? '#29b6f6' : isDeoxysAtk ? '#ef5350' : isDeoxysDef ? '#66bb6a' : isDeoxysSpd ? '#ffd700' : 'var(--gold)';
    const mult = isUnbound ? '×2' : pk._isEnvy ? '×1.2' : isSpecialForm ? '×2' : '';
    html += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
      <div style="width:32px;font-size:12px;color:var(--text2);flex-shrink:0">${name}</div>
      <div style="flex:1;height:8px;background:${barBg};border-radius:4px;overflow:hidden;position:relative">
        <div style="height:100%;border-radius:4px;background:${barColor};background-size:${isSSBar?'300% 100%':'100%'};width:${pct}%;opacity:0.4${isSSBar?';animation:shimmer 1.5s linear infinite':''}"></div>
        <div style="position:absolute;top:0;left:0;height:100%;border-radius:4px;background:${barColor};background-size:${isSSBar?'300% 100%':'100%'};width:${ivPct}%;opacity:0.95${isSSBar?';animation:shimmer 1.5s linear infinite':''}"></div>
      </div>
      <div style="width:36px;text-align:right;font-size:14px;color:${valColor};flex-shrink:0">${effective}${mult}</div>
      <div style="width:22px;text-align:center;font-family:'Press Start 2P';font-size:7px;flex-shrink:0;line-height:1.6;padding-top:2px">
        ${grade.label === 'UNBOUND' ? `<span style="font-family:'Press Start 2P',monospace;font-size:5px;color:#00e676;display:inline-block;line-height:1.4;padding-top:2px;animation:mega-glow 2s ease-in-out infinite;text-shadow:0 0 8px #00e676">UNBND</span>`
          : grade.label === 'ROYAL' ? `<span style="font-family:'Press Start 2P',monospace;font-size:5px;color:#ffd700;display:inline-block;line-height:1.4;padding-top:2px;animation:mega-glow 2s ease-in-out infinite;text-shadow:0 0 8px #ffd700">ROYAL</span>`
          : grade.label === 'OUTER' ? `<span style="font-family:'Press Start 2P',monospace;font-size:5px;color:#00e5ff;display:inline-block;line-height:1.4;padding-top:2px;animation:mega-glow 2s ease-in-out infinite;text-shadow:0 0 8px #00e5ff">OUTER</span>`
          : grade.label === 'GALACTIC' ? `<span style="font-family:'Press Start 2P',monospace;font-size:5px;color:${grade.color};display:inline-block;line-height:1.4;padding-top:2px;animation:mega-glow 1.2s ease-in-out infinite;text-shadow:0 0 8px ${grade.color}">GALAC</span>`
          : grade.label === 'PRIMAL' ? `<span style="font-family:'Press Start 2P',monospace;font-size:5px;color:${grade.color};display:inline-block;line-height:1.4;padding-top:2px;animation:mega-glow 1.5s ease-in-out infinite;text-shadow:0 0 8px ${grade.color}">PRML</span>`
          : grade.label === 'MEGA' ? `<span style="font-family:'Press Start 2P',monospace;font-size:6px;color:#00e676;display:inline-block;line-height:1.4;padding-top:2px;animation:mega-glow 2s ease-in-out infinite;text-shadow:0 0 6px #00e676">MEGA</span>`
          : grade.isSSS ? `<span class="ss-rainbow" style="display:inline-block;line-height:1.4;padding-top:2px;animation:shimmer 0.8s linear infinite">SSS</span>`
          : grade.isSS ? `<span class="${cosmic ? 'cosmic-text' : 'ss-rainbow'}" style="display:inline-block;line-height:1.4;padding-top:2px">${grade.label}</span>`
          : `<span style="color:${grade.color};display:inline-block;line-height:1.4">${grade.label}</span>`}
      </div>
    </div>`;
  });
  html += '</div>';
  return html;
}

function showItemModal(item) {
  if(item.effect === 'sss_candy') { showSSSCandyModal(); return; }
  if(item.effect === 'rare_candy' || item.effect === 'max_candy') {
    const isMax = item.effect === 'max_candy';
    const capLevel = isMax ? 250 : 175;
    const count = gameState.inventory[item.id] || 0;
    document.getElementById('modal-title').textContent = isMax ? `🍭 Max Candy — Pick Pokémon` : `🍬 Rare Candy — Pick Pokémon`;
    document.getElementById('modal-content').innerHTML = `
      <div style="font-size:14px;color:var(--text2);margin-bottom:4px">${item.desc}</div>
      ${!isMax ? `<div style="font-size:13px;color:#ff9e40;margin-bottom:6px">⚠️ Only works up to <b style="color:#ffd700">Lv.175</b>! Use Max Candy 🍭 for higher levels.</div>` : `<div style="font-size:13px;color:#69f0ae;margin-bottom:6px">✅ Works on any Pokémon up to Lv.250!</div>`}
      <div style="font-size:14px;margin-bottom:8px">In Bag: <span style="color:var(--gold)">×${count}</span></div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.3);border-radius:8px;padding:8px 12px">
        <div style="font-size:13px;color:var(--text2)">Amount:</div>
        <button onclick="adjustCandyAmt(-1,'${item.id}')" style="background:rgba(255,255,255,0.08);border:1px solid var(--border);color:var(--text);width:28px;height:28px;border-radius:6px;cursor:pointer;font-size:18px">-</button>
        <span id="candy-amount" style="font-family:'Press Start 2P';font-size:11px;color:var(--gold);min-width:30px;text-align:center">1</span>
        <button onclick="adjustCandyAmt(1,'${item.id}')" style="background:rgba(255,255,255,0.08);border:1px solid var(--border);color:var(--text);width:28px;height:28px;border-radius:6px;cursor:pointer;font-size:18px">+</button>
        <button onclick="adjustCandyAmt(10,'${item.id}')" style="background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.4);color:var(--gold);padding:3px 8px;border-radius:6px;cursor:pointer;font-size:14px">+10</button>
        <button onclick="setCandyAmtMax('${item.id}')" style="background:rgba(255,165,0,0.1);border:1px solid rgba(255,165,0,0.4);color:#ff9e40;padding:3px 8px;border-radius:6px;cursor:pointer;font-size:14px">MAX</button>
      </div>
      <div style="font-family:'Press Start 2P';font-size:7px;color:var(--text2);margin-bottom:8px">GIVE TO ${isMax ? '' : '(Lv.≤175 only)'}:</div>
      <div class="poke-box">
        ${gameState.box.map(p=>{
          const blocked = !isMax && p.level >= 175;
          return `<div class="poke-card${blocked?' ':''}${p.isShiny&&!blocked?' shiny-card':''}" onclick="${blocked?'toast(\'Rare Candy only works up to Lv.175! Use Max Candy.\')':'useRareCandyMulti('+p.uid+',\''+item.id+'\')'}" style="cursor:pointer;${blocked?'opacity:0.4;':''}">
            <img src="${getSpriteUrl(p.id, p.isShiny, p.uid)}" width="52" height="52">
            <span class="cname">${p.name}</span>
            <span class="clevel">Lv.${p.level}${blocked?' 🚫':''}</span>
          </div>`;
        }).join('')}
      </div>
    `;
    openModal();
    return;
  }

  document.getElementById('modal-title').textContent = `${item.emoji} ${item.name}`;
  const count = gameState.inventory[item.id] || 0;
  document.getElementById('modal-content').innerHTML = `
    <div style="font-size:15px;color:var(--text2);margin-bottom:12px">${item.desc}</div>
    <div style="font-size:14px;margin-bottom:12px">In Bag: ×${count}</div>
    <div style="font-family:'Press Start 2P';font-size:8px;color:var(--text2);margin-bottom:8px">EQUIP TO:</div>
    <div class="poke-box">
      ${gameState.box.map(p=>{
        const eq = gameState.equippedItems[p.uid];
        const eqItem = getItemByEquipId(eq);
        return `<div class="poke-card" onclick="equipItem('${item.id}',${p.uid});closeModal()" style="cursor:pointer">
          <img src="${getSpriteUrl(p.id, p.isShiny, p.uid)}" width="52" height="52">
          <span class="cname">${p.name}</span>
          <span class="clevel">Lv.${p.level}</span>
          ${eq ? `<div style="font-size:13px">${getItemIcon(eqItem,18)}</div>` : ''}
        </div>`;
      }).join('')}
    </div>
  `;
  openModal();
}

function showMegaStoneInstanceModal(instanceId) {
  const data = gameState.megaStoneInstances && gameState.megaStoneInstances[instanceId];
  if(!data || (gameState.inventory[instanceId]||0) === 0) return;
  const STONE_INFO = {
    sceptilite:  {emoji:'💚',name:'Sceptilite',  pokeName:'Sceptile',  pokeId:254, megaSprite:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sceptilite.png'},
    swampertite: {emoji:'💙',name:'Swampertite', pokeName:'Swampert',  pokeId:260, megaSprite:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/swampertite.png'},
    blazikenite: {emoji:'🔥',name:'Blazikenite', pokeName:'Blaziken',  pokeId:257, megaSprite:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/blazikenite.png'},
    gengarite:   {emoji:'👻',name:'Gengarite',   pokeName:'Gengar',    pokeId:94,  megaSprite:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/gengarite.png'},
    aggronite:   {emoji:'🪨',name:'Aggronite',   pokeName:'Aggron',    pokeId:306, megaSprite:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/aggronite.png'},
    garchompite: {emoji:'🦈',name:'Garchompite', pokeName:'Garchomp',  pokeId:445, megaSprite:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/garchompite.png'},
  };
  const STAT_LABELS = {'attack':'Attack','special-attack':'Sp. Attack','defense':'Defense','special-defense':'Sp. Defense','speed':'Speed'};
  const info = STONE_INFO[data.base];
  if(!info) return;
  const bonusLabel = `+${Math.round(data.pct*100)}% ${STAT_LABELS[data.stat]||data.stat}`;
  document.getElementById('modal-title').textContent = `${info.emoji} ${info.name}`;
  document.getElementById('modal-content').innerHTML = `
    <div style="text-align:center;margin-bottom:12px">
      <img src="${info.megaSprite}" style="width:80px;height:80px;image-rendering:pixelated;margin-bottom:4px">
      <div style="font-size:14px;color:var(--text2);margin-bottom:8px">Triggers Mega Evolution on ${info.pokeName}.</div>
      <div style="background:rgba(0,230,118,0.12);border:1px solid #00e676;border-radius:8px;padding:8px 14px;margin-bottom:10px;display:inline-block">
        <div style="font-family:'Press Start 2P';font-size:7px;color:#00e676;margin-bottom:2px">BONUS STAT ROLL</div>
        <div style="font-size:18px;color:#69f0ae">${bonusLabel}</div>
      </div>
    </div>
    <div style="font-family:'Press Start 2P';font-size:8px;color:var(--text2);margin-bottom:8px">EQUIP TO:</div>
    <div class="poke-box">
      ${gameState.box.filter(p=>p.id===info.pokeId).map(p=>{
        const eq = gameState.equippedItems[p.uid];
        const eqItem = getItemByEquipId(eq);
        return `<div class="poke-card" onclick="equipItem('${instanceId}',${p.uid});closeModal()" style="cursor:pointer">
          <img src="${getSpriteUrl(p.id, p.isShiny, p.uid)}" width="52" height="52">
          <span class="cname">${p.name}</span>
          <span class="clevel">Lv.${p.level}</span>
          ${eq ? `<div style="font-size:13px">${getItemIcon(eqItem,18)}</div>` : ''}
        </div>`;
      }).join('') || `<div style="color:var(--text2);font-size:14px;padding:10px">No ${info.pokeName} in your box!</div>`}
    </div>
    <button class="btn" style="border-color:#ef5350;color:#ef5350;width:100%;margin-top:10px" onclick="trashMegaStoneInstance('${instanceId}')">🗑️ Discard Stone</button>
  `;
  openModal();
}

function trashMegaStoneInstance(instanceId) {
  if(!gameState.megaStoneInstances || !gameState.megaStoneInstances[instanceId]) return;
  const data = gameState.megaStoneInstances[instanceId];
  const STONE_INFO = { sceptilite:{name:'Sceptilite',emoji:'💚',megaSprite:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sceptilite.png'}, swampertite:{name:'Swampertite',emoji:'💙',megaSprite:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/swampertite.png'}, blazikenite:{name:'Blazikenite',emoji:'🔥',megaSprite:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/blazikenite.png'}, gengarite:{name:'Gengarite',emoji:'👻',megaSprite:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/gengarite.png'}, aggronite:{name:'Aggronite',emoji:'🪨',megaSprite:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/aggronite.png'}, garchompite:{name:'Garchompite',emoji:'🦈',megaSprite:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/garchompite.png'} };
  const info = STONE_INFO[data.base] || {name:'Mega Stone',emoji:'💎'};
  const STAT_LABELS = {'attack':'Atk','special-attack':'Sp.Atk','defense':'Def','special-defense':'Sp.Def','speed':'Speed'};
  const bonusLabel = `+${Math.round(data.pct*100)}% ${STAT_LABELS[data.stat]||data.stat}`;
  document.getElementById('modal-title').textContent = `🗑️ ${info.name}`;
  document.getElementById('modal-content').innerHTML = `
    <div style="text-align:center;padding:10px">
      <img src="${info.megaSprite||''}" style="width:64px;height:64px;image-rendering:pixelated;margin-bottom:6px;${!info.megaSprite?'display:none':''}">
      <div style="color:#69f0ae;font-size:16px;margin-bottom:6px">${bonusLabel}</div>
      <div style="color:var(--text2);font-size:13px;margin-bottom:6px">Triggers Mega Evolution with a stat bonus.</div>
      <div style="color:#ef9a9a;font-size:13px;margin-bottom:16px">⚠️ Cannot be traded. This cannot be undone!</div>
      <div style="display:flex;gap:8px;justify-content:center">
        <button class="btn" style="border-color:#ef5350;color:#ef5350" onclick="doTrashMegaStoneInstance('${instanceId}')">🗑️ Trash</button>
        <button class="btn gold" onclick="closeModal()">Cancel</button>
      </div>
    </div>
  `;
  openModal();
}

function doTrashMegaStoneInstance(instanceId) {
  if(!gameState.megaStoneInstances || !gameState.megaStoneInstances[instanceId]) { closeModal(); return; }
  const data = gameState.megaStoneInstances[instanceId];
  const STONE_INFO = { sceptilite:{name:'Sceptilite'}, swampertite:{name:'Swampertite'}, blazikenite:{name:'Blazikenite'}, gengarite:{name:'Gengarite'}, aggronite:{name:'Aggronite'}, garchompite:{name:'Garchompite'} };
  const name = STONE_INFO[data.base]?.name || 'Mega Stone';
  // Unequip from any pokemon currently holding it
  gameState.box.forEach(p => { if(gameState.equippedItems[p.uid] === instanceId) delete gameState.equippedItems[p.uid]; });
  delete gameState.inventory[instanceId];
  delete gameState.megaStoneInstances[instanceId];
  closeModal();
  toast(`🗑️ Discarded ${name}`, 2000);
  renderAll();
  saveGame();
}

function getPullTargetLevel() {
  const allLevels = gameState.box.map(p => p.level).filter(l => l <= 250);
  if(allLevels.length === 0) return 5;
  return Math.min(220, Math.max(1, Math.max(...allLevels) - 5));
}

function pullToLevel(uid) {
  if(gameState.gems < 100) { toast('Need 100 💎 Gems!'); return; }
  const pk = gameState.box.find(p => p.uid === uid);
  if(!pk) return;
  const targetLevel = getPullTargetLevel();
  if(pk.level >= targetLevel) { toast(`${pk.name} is already at target level!`); return; }
  document.getElementById('modal-title').textContent = '⬆️ Pull to Level';
  document.getElementById('modal-content').innerHTML = `
    <div style="text-align:center;padding:8px">
      <div style="display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:16px">
        <img src="${getSpriteUrl(pk.id, pk.isShiny, pk.uid)}" width="80" height="80" onerror="this.src='${getBattleSprite(pk.id,pk.isShiny)}'">
        <div style="text-align:left">
          <div style="font-family:'Press Start 2P';font-size:8px;color:var(--gold)">${pk.name}</div>
          <div style="font-size:15px;color:var(--text2);margin-top:4px">Lv.${pk.level} → <span style="color:var(--accent)">Lv.${targetLevel}</span></div>
          <div style="font-size:13px;color:var(--text2);margin-top:2px">Max pull level: 220</div>
        </div>
      </div>
      <div style="font-size:15px;color:var(--gold);margin-bottom:14px">Cost: 100 💎</div>
      <div style="display:flex;gap:10px">
        <button class="btn" style="flex:1;border-color:var(--accent);color:var(--accent)" onclick="confirmPullToLevel(${uid})">⬆️ Confirm!</button>
        <button class="btn" style="flex:1" onclick="closeModal()">Cancel</button>
      </div>
    </div>
  `;
  openModal();
}

function confirmPullToLevel(uid) {
  if(gameState.gems < 100) { toast('Not enough Gems!'); closeModal(); return; }
  const pk = gameState.box.find(p => p.uid === uid);
  if(!pk) { closeModal(); return; }
  const targetLevel = getPullTargetLevel();
  if(pk.level >= targetLevel) { closeModal(); return; }
  gameState.gems -= 100;
  const oldLevel = pk.level;
  pk.level = targetLevel;
  pk.expToNext = calcExpToNext(pk.level);
  pk.exp = 0;
  if(pk.stats) pk.currentHp = getMaxHp(pk);
  addLog(`⬆️ ${pk.name} pulled Lv.${oldLevel} → Lv.${targetLevel}!`, 'log-evolve');
  toast(`⬆️ ${pk.name} pulled to Lv.${targetLevel}!`, 3000);
  checkEvolution(pk);
  updateResourceUI();
  renderAll();
  closeModal();
}

let _candyAmount = 1;
let _candyItemId = 'rare_candy';

function adjustCandyAmt(delta, itemId) {
  if(itemId) _candyItemId = itemId;
  const count = gameState.inventory[_candyItemId] || 0;
  _candyAmount = Math.max(1, Math.min(count, _candyAmount + delta));
  const el = document.getElementById('candy-amount');
  if(el) el.textContent = _candyAmount;
}

function setCandyAmtMax(itemId) {
  if(itemId) _candyItemId = itemId;
  _candyAmount = Math.max(1, gameState.inventory[_candyItemId] || 0);
  const el = document.getElementById('candy-amount');
  if(el) el.textContent = _candyAmount;
}

function useRareCandyMulti(uid, itemId) {
  const id = itemId || _candyItemId || 'rare_candy';
  const isMax = id === 'max_candy';
  const capLevel = isMax ? 250 : 175;
  const available = gameState.inventory[id] || 0;
  if(available <= 0) { toast(`No ${isMax ? 'Max Candy' : 'Rare Candy'} left!`); return; }
  const pk = gameState.box.find(p=>p.uid===uid);
  if(!pk) return;
  if(pk.level >= 250) { toast(`${pk.name} is already at max level!`); return; }
  if(!isMax && pk.level >= 175) {
    toast(`🚫 Rare Candy only works up to Lv.175! Use Max Candy 🍭 instead.`, 3500);
    return;
  }
  const maxUsable = Math.min(capLevel, 250) - pk.level;
  const amount = Math.min(_candyAmount, available, maxUsable);
  if(amount <= 0) { toast(`${pk.name} is already at the cap for this candy!`); return; }
  gameState.inventory[id] -= amount;
  const oldLevel = pk.level;
  pk.level = Math.min(capLevel, pk.level + amount);
  pk.expToNext = calcExpToNext(pk.level);
  pk.exp = 0;
  if(pk.stats) pk.currentHp = getMaxHp(pk);
  const emoji = isMax ? '🍭' : '🍬';
  addLog(`${emoji} ×${amount} ${isMax?'Max':'Rare'} Candy! ${pk.name} Lv.${oldLevel} → Lv.${pk.level}!`, 'log-evolve');
  toast(`${emoji} ${pk.name} → Lv.${pk.level}! (×${amount} candy)`, 3000);
  checkEvolution(pk);
  _candyAmount = 1;
  closeModal();
  renderAll();
}

function openEquipModal(uid) {
  document.getElementById('modal-title').textContent = 'Equip Item';
  const allItems = ITEMS.concat(EPIC_ITEMS.filter(i=>i.effect !== 'rare_candy'));
  const availableItems = allItems.filter(i=>(gameState.inventory[i.id]||0)>0);
  if(availableItems.length===0) { document.getElementById('modal-content').innerHTML = '<div style="color:var(--text2)">No items in bag!</div>'; return; }
  document.getElementById('modal-content').innerHTML = `
    <div class="item-grid" style="grid-template-columns:repeat(3,1fr)">
      ${availableItems.map(item=>{
        // Items that open their own modal — don't closeModal() after clicking
        const selfModal = ['mysterious_meteorite','dna_splicer'].includes(item.id);
        const onclick = selfModal
          ? `equipItem('${item.id}',${uid})`
          : `equipItem('${item.id}',${uid});closeModal()`;
        return `<div class="item-cell" onclick="${onclick}" title="${item.name}: ${item.desc}" style="width:80px;height:80px;overflow:hidden;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px">
        <div style="font-size:28px;line-height:1;flex-shrink:0">${item.spriteUrl ? `<img src='${item.spriteUrl}' style='width:28px;height:28px;image-rendering:pixelated;vertical-align:middle'>` : item.emoji}</div>
        <span class="item-count" style="position:static;font-size:10px">×${gameState.inventory[item.id]}</span>
        <div style="font-size:10px;margin-top:1px;color:var(--text2);text-align:center;width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 2px">${item.name.substring(0,9)}</div>
      </div>`;
      }).join('')}
    </div>
  `;
}

function equipItem(itemId, uid) {
  if(!(gameState.inventory[itemId]>0)) { toast('No more of that item!'); return; }
  const pokemon = gameState.box.find(p=>p.uid===uid) || gameState.team.find(p=>p&&p.uid===uid);

  // Resolve mega stone instance IDs to their base item ID for all checks below
  const baseItemId = getMegaStoneBaseId(itemId) || itemId;

  // Block equipping a form-changing item onto a pokemon that's in any preset
  // (regular items are fine — presets auto-update below)
  if(FORM_ITEMS.has(baseItemId)) {
    const lockedBy = isInAnyPreset(uid);
    if(lockedBy) {
      toast(`🔒 Remove this Pokémon from preset "${lockedBy}" first!`, 3500);
      return;
    }
  }

  // Meteorite: only Rayquaza can hold it
  if(baseItemId === 'meteorite') {
    if(!pokemon || pokemon.id !== 384) {
      toast('☄️ Meteorite can only be held by Rayquaza!', 3000);
      return;
    }
    if(pokemon._noMega) {
      toast('☄️ Envy refuses the Meteorite — no Mega for this one!', 3000);
      return;
    }
  }

  // Hero's Sword: only Zacian can hold it
  if(baseItemId === 'heros_sword') {
    if(!pokemon || pokemon.id !== 888) {
      toast("⚔️ Hero's Sword can only be held by Zacian!", 3000);
      return;
    }
  }

  // Hero's Shield: only Zamazenta can hold it
  if(baseItemId === 'heros_shield') {
    if(!pokemon || pokemon.id !== 889) {
      toast("🛡️ Hero's Shield can only be held by Zamazenta!", 3000);
      return;
    }
  }

  // Red Orb: only Groudon can hold it
  if(baseItemId === 'red_orb') {
    if(!pokemon || pokemon.id !== 383) {
      toast('🔴 Red Orb can only be held by Groudon!', 3000);
      return;
    }
  }

  // Blue Orb: only Kyogre can hold it
  if(baseItemId === 'blue_orb') {
    if(!pokemon || pokemon.id !== 382) {
      toast('🔵 Blue Orb can only be held by Kyogre!', 3000);
      return;
    }
  }

  // Mysterious Meteorite: only Deoxys can hold it — opens form picker
  if(baseItemId === 'mysterious_meteorite') {
    if(!pokemon || pokemon.id !== 386) {
      toast('☄️ Mysterious Meteorite can only be held by Deoxys!', 3000);
      return;
    }
    // Show form selection dialog
    showDeoxysFormPicker(uid, itemId);
    return;
  }

  // Sceptilite: only Sceptile; check boss team limit
  if(baseItemId === 'sceptilite') {
    if(!pokemon || pokemon.id !== 254) {
      toast('💚 Sceptilite can only be held by Sceptile!', 3000);
      return;
    }
    const onTeam = gameState.team.find(p => p.uid === uid);
    if(onTeam && countBossOnTeam() >= MAX_BOSS_ON_TEAM) {
      toast(`⚠️ Max ${MAX_BOSS_ON_TEAM} Boss/Legendary Pokémon per team! Remove one first.`, 3500);
      return;
    }
    if(onTeam && countMegaStartersOnTeam() >= 1) {
      toast('⚠️ Only 1 Mega Starter allowed per team!', 3000);
      return;
    }
  }

  // Swampertite: only Swampert; check boss team limit
  if(baseItemId === 'swampertite') {
    if(!pokemon || pokemon.id !== 260) {
      toast('💙 Swampertite can only be held by Swampert!', 3000);
      return;
    }
    const onTeam = gameState.team.find(p => p.uid === uid);
    if(onTeam && countBossOnTeam() >= MAX_BOSS_ON_TEAM) {
      toast(`⚠️ Max ${MAX_BOSS_ON_TEAM} Boss/Legendary Pokémon per team! Remove one first.`, 3500);
      return;
    }
    if(onTeam && countMegaStartersOnTeam() >= 1) {
      toast('⚠️ Only 1 Mega Starter allowed per team!', 3000);
      return;
    }
  }

  // Blazikenite: only Blaziken; check boss team limit
  if(baseItemId === 'blazikenite') {
    if(!pokemon || pokemon.id !== 257) {
      toast('🔥 Blazikenite can only be held by Blaziken!', 3000);
      return;
    }
    const onTeam = gameState.team.find(p => p.uid === uid);
    if(onTeam && countBossOnTeam() >= MAX_BOSS_ON_TEAM) {
      toast(`⚠️ Max ${MAX_BOSS_ON_TEAM} Boss/Legendary Pokémon per team! Remove one first.`, 3500);
      return;
    }
    if(onTeam && countMegaStartersOnTeam() >= 1) {
      toast('⚠️ Only 1 Mega Starter allowed per team!', 3000);
      return;
    }
  }

  // Gengarite: only Gengar; check boss team limit
  if(baseItemId === 'gengarite') {
    if(!pokemon || pokemon.id !== 94) {
      toast('👻 Gengarite can only be held by Gengar!', 3000);
      return;
    }
    const onTeam = gameState.team.find(p => p.uid === uid);
    if(onTeam && countBossOnTeam() >= MAX_BOSS_ON_TEAM) {
      toast(`⚠️ Max ${MAX_BOSS_ON_TEAM} Boss/Legendary Pokémon per team! Remove one first.`, 3500);
      return;
    }
    if(onTeam && countMegaStartersOnTeam() >= 1) {
      toast('⚠️ Only 1 Mega Pokémon per team!', 3000);
      return;
    }
  }

  // Aggronite: only Aggron; check boss team limit
  if(baseItemId === 'aggronite') {
    if(!pokemon || pokemon.id !== 306) {
      toast('🪨 Aggronite can only be held by Aggron!', 3000);
      return;
    }
    const onTeam = gameState.team.find(p => p.uid === uid);
    if(onTeam && countBossOnTeam() >= MAX_BOSS_ON_TEAM) {
      toast(`⚠️ Max ${MAX_BOSS_ON_TEAM} Boss/Legendary Pokémon per team! Remove one first.`, 3500);
      return;
    }
    if(onTeam && countMegaStartersOnTeam() >= 1) {
      toast('⚠️ Only 1 Mega Pokémon per team!', 3000);
      return;
    }
  }

  // Garchompite: only Garchomp; check boss team limit
  if(baseItemId === 'garchompite') {
    if(!pokemon || pokemon.id !== 445) {
      toast('🦈 Garchompite can only be held by Garchomp!', 3000);
      return;
    }
    const onTeam = gameState.team.find(p => p.uid === uid);
    if(onTeam && countBossOnTeam() >= MAX_BOSS_ON_TEAM) {
      toast(`⚠️ Max ${MAX_BOSS_ON_TEAM} Boss/Legendary Pokémon per team! Remove one first.`, 3500);
      return;
    }
    if(onTeam && countMegaStartersOnTeam() >= 1) {
      toast('⚠️ Only 1 Mega Pokémon per team!', 3000);
      return;
    }
  }

  // DNA Splicer: only Kyurem can hold it, and needs Zekrom or Reshiram on team
  if(itemId === 'dna_splicer') {
    if(!pokemon || pokemon.id !== 646) {
      toast('🧬 DNA Splicer can only be held by Kyurem!', 3000);
      return;
    }
    const onTeam = gameState.team.find(p=>p.uid===uid);
    if(!onTeam) {
      toast('🧬 Kyurem must be on your team to fuse!', 3000);
      return;
    }
    // Find available (unfused) Zekrom/Reshiram on team
    const zekroms = gameState.team.filter(p=>p.id===644 && p.uid!==uid && !isDNAFused(p) && !p._isFusedInto);
    const reshirams = gameState.team.filter(p=>p.id===643 && p.uid!==uid && !isDNAFused(p) && !p._isFusedInto);
    if(!zekroms.length && !reshirams.length) {
      toast('🧬 You need an unfused Zekrom or Reshiram on your team to fuse!', 4000);
      return;
    }
    // Filter out fusion types that already exist on the team
    // e.g. if Black Kyurem (fused with Zekrom=644) is already on team, don't offer Zekrom as partner
    const allPartners = [...zekroms, ...reshirams];
    const blackKyuremOnTeam = gameState.team.some(p => p.id === 646 && p._fusedWith === 644 && p.uid !== uid);
    const whiteKyuremOnTeam = gameState.team.some(p => p.id === 646 && p._fusedWith === 643 && p.uid !== uid);
    const validPartners = allPartners.filter(p => {
      if(p.id === 644 && blackKyuremOnTeam) return false; // would create duplicate Black Kyurem
      if(p.id === 643 && whiteKyuremOnTeam) return false; // would create duplicate White Kyurem
      return true;
    });
    if(validPartners.length === 0) {
      const blocked = [];
      if(blackKyuremOnTeam) blocked.push('Black Kyurem');
      if(whiteKyuremOnTeam) blocked.push('White Kyurem');
      toast(`⚠️ Only 1 ${blocked.join(' and 1 ')} allowed per team!`, 3500);
      return;
    }
    const allPartnersFinal = validPartners;
    if(allPartnersFinal.length === 1) {
      performDNAFusion(uid, itemId, allPartnersFinal[0].uid);
      return;
    }
    // Multiple choices — show picker
    document.getElementById('modal-title').textContent = '🧬 Choose Fusion Partner';
    document.getElementById('modal-content').innerHTML = `
      <div style="text-align:center;padding:12px">
        <div style="font-size:15px;color:var(--text2);margin-bottom:16px">Which Pokémon should Kyurem fuse with?</div>
        <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
          ${allPartnersFinal.map(p => {
            const isZek = p.id === 644;
            const color = isZek ? '#42a5f5' : '#ef5350';
            const hoverColor = isZek ? '#1565c0' : '#b71c1c';
            const label = isZek ? 'ZEKROM' : 'RESHIRAM';
            const fuseName = isZek ? '⚡ Black Kyurem' : '🔥 White Kyurem';
            return `<div style="text-align:center;cursor:pointer;border:2px solid #212121;border-radius:10px;padding:12px;background:rgba(0,0,0,0.5);transition:all 0.2s" onmouseover="this.style.borderColor='${hoverColor}'" onmouseout="this.style.borderColor='#212121'" onclick="performDNAFusion(${uid},'dna_splicer',${p.uid});closeModal()">
              <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png" width="80" height="80" style="image-rendering:pixelated">
              <div style="font-family:'Press Start 2P';font-size:7px;color:${color};margin-top:6px">${label}${p.isShiny?' ★':''}</div>
              <div style="font-size:12px;color:var(--text2)">${fuseName}</div>
            </div>`;
          }).join('')}
        </div>
        <button class="btn" style="width:100%;margin-top:12px" onclick="closeModal()">Cancel</button>
      </div>
    `;
    openModal();
    return;
  }

  const old = gameState.equippedItems[uid];
  // If fused Kyurem gets a different item equipped, defuse first — but block if preset-locked
  if(old === 'dna_splicer' && itemId !== 'dna_splicer') {
    const lockedBy = isFormLockedByPreset(uid);
    if(lockedBy) {
      toast(`🔒 Remove this Pokémon from preset "${lockedBy}" first!`, 3500);
      return;
    }
    const kyurem = gameState.box.find(p=>p.uid===uid);
    if(kyurem && kyurem._fusedWith) {
      const partner = gameState.box.find(p=>p.uid===kyurem._fusedUid);
      if(partner) {
        partner._isFusedInto = null;
        if(gameState.team.length < 6) {
          gameState.team.push(partner);
          addLog(`🧬 Defused! ${partner.name} returned to the team!`, 'log-heal');
        } else {
          addLog(`🧬 Defused! ${partner.name} returned to the PC (team was full)!`, 'log-heal');
        }
      }
      kyurem.name = 'Kyurem';
      kyurem._fusedWith = null;
      kyurem._fusedUid = null;
      if(kyurem.statsLoaded) kyurem.currentHp = getMaxHp(kyurem);
    }
  }
  // Block swapping away any form-changing item if pokemon is preset-locked
  if(old && FORM_ITEMS.has(old) && old !== itemId) {
    const lockedBy = isFormLockedByPreset(uid);
    if(lockedBy) {
      toast(`🔒 Remove this Pokémon from preset "${lockedBy}" first!`, 3500);
      return;
    }
  }
  if(old) gameState.inventory[old] = (gameState.inventory[old]||0) + 1;
  gameState.equippedItems[uid] = itemId;
  gameState.inventory[itemId]--;
  // Attach pre-rolled stone bonus from instance (new stones) or clear it (old base-id stones)
  if(['sceptilite','swampertite','blazikenite'].includes(baseItemId)) {
    const instanceData = gameState.megaStoneInstances && gameState.megaStoneInstances[itemId];
    pokemon._megaStoneBonus = instanceData ? { stat: instanceData.stat, pct: instanceData.pct } : null;
  }
  const item = ITEMS.concat(EPIC_ITEMS).find(i=>i.id===baseItemId);
  if(baseItemId === 'meteorite' && pokemon?.id === 384) {
    toast(`☄️ ${pokemon.name} has Mega Evolved into MEGA RAYQUAZA! 🌈`, 4000);
  } else if(baseItemId === 'sceptilite' && pokemon?.id === 254) {
    toast(`💚 ${pokemon.name} has Mega Evolved into MEGA SCEPTILE! 🌿`, 4000);
  } else if(baseItemId === 'swampertite' && pokemon?.id === 260) {
    toast(`💙 ${pokemon.name} has Mega Evolved into MEGA SWAMPERT! 💧`, 4000);
  } else if(baseItemId === 'blazikenite' && pokemon?.id === 257) {
    toast(`🔥 ${pokemon.name} has Mega Evolved into MEGA BLAZIKEN! 🦅`, 4000);
  } else if(baseItemId === 'heros_sword' && pokemon?.id === 888) {
    toast(`⚔️ Zacian has transformed into CROWNED ZACIAN! 👑`, 4000);
  } else if(baseItemId === 'heros_shield' && pokemon?.id === 889) {
    toast(`🛡️ Zamazenta has transformed into CROWNED ZAMAZENTA! 👑`, 4000);
  } else if(baseItemId === 'red_orb' && pokemon?.id === 383) {
    toast(`🔴🌋 Groudon has undergone PRIMAL REVERSION! Primal Groudon!`, 4000);
  } else if(baseItemId === 'blue_orb' && pokemon?.id === 382) {
    toast(`🔵🌊 Kyogre has undergone PRIMAL REVERSION! Primal Kyogre!`, 4000);
  } else {
    toast(`${item?.spriteUrl ? '🔮' : (item?.emoji||'✨')} ${item?.name||itemId} equipped to ${pokemon?.name||'Pokémon'}!`);
  }
  // Auto-update any presets that contain this pokemon so they reflect the new item
  updatePresetsForPokemon(uid, itemId);
  renderAll();
}

function showDeoxysFormPicker(uid, itemId) {
  const pokemon = gameState.box.find(p => p.uid === uid) || gameState.team.find(p => p && p.uid === uid);
  if(!pokemon) return;
  const isShiny = pokemon.isShiny;
  const forms = [
    {
      key: 'attack',
      label: 'Attack Form',
      emoji: '⚔️',
      color: '#ef5350',
      borderColor: '#c62828',
      desc: 'GALACTIC Attack boost · Physical powerhouse',
      sprite: isShiny ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10001.png' : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10001.png',
    },
    {
      key: 'defense',
      label: 'Defense Form',
      emoji: '🛡️',
      color: '#66bb6a',
      borderColor: '#2e7d32',
      desc: 'GALACTIC HP boost · Fortress of endurance',
      sprite: isShiny ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10002.png' : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10002.png',
    },
    {
      key: 'speed',
      label: 'Speed Form',
      emoji: '⚡',
      color: '#ffd700',
      borderColor: '#f9a825',
      desc: 'GALACTIC Speed boost · Fastest in the cosmos',
      sprite: isShiny ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10003.png' : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10003.png',
    },
  ];
  document.getElementById('modal-title').textContent = '🌌 DEOXYS — Choose Form';
  document.getElementById('modal-content').innerHTML = `
    <div style="text-align:center;padding:8px">
      <div style="font-size:13px;color:var(--text2);margin-bottom:14px">The Mysterious Meteorite resonates with Deoxys.<br>Choose which form to awaken — all forms grant <span style="color:#ce93d8">SSS stats</span> with a <span style="color:#ffd700">GALACTIC boost</span> to the matching stat.</div>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        ${forms.map(f => `
          <div onclick="confirmDeoxysForm(${uid},'${itemId}','${f.key}')" style="cursor:pointer;text-align:center;border:2px solid #333;border-radius:10px;padding:10px;background:rgba(0,0,0,0.4);width:100px;transition:all 0.15s" onmouseover="this.style.borderColor='${f.borderColor}';this.style.background='rgba(30,0,60,0.7)'" onmouseout="this.style.borderColor='#333';this.style.background='rgba(0,0,0,0.4)'">
            <img src="${f.sprite}" width="72" height="72" style="image-rendering:pixelated">
            <div style="font-family:'Press Start 2P';font-size:6px;color:${f.color};margin-top:5px">${f.emoji} ${f.label}</div>
            <div style="font-size:10px;color:var(--text2);margin-top:3px">${f.desc}</div>
          </div>
        `).join('')}
      </div>
      <button class="btn" style="width:100%;margin-top:14px" onclick="closeModal()">Cancel</button>
    </div>
  `;
  openModal();
}

function confirmDeoxysForm(uid, itemId, formKey) {
  const numUid = Number(uid);
  const pokemon = gameState.box.find(p => p.uid === numUid) || gameState.team.find(p => p && p.uid === numUid);
  if(!pokemon) { closeModal(); return; }
  // Swap item: return old item to inventory, equip new one
  const oldItem = gameState.equippedItems[numUid];
  if(oldItem && oldItem !== itemId) gameState.inventory[oldItem] = (gameState.inventory[oldItem] || 0) + 1;
  if(!oldItem || oldItem !== itemId) {
    if((gameState.inventory[itemId]||0) > 0) gameState.inventory[itemId]--;
  }
  gameState.equippedItems[numUid] = itemId;
  pokemon._deoxysForm = formKey;
  if(pokemon.statsLoaded) pokemon.currentHp = getMaxHp(pokemon);
  const formLabels = { attack: '⚔️ Attack Form', defense: '🛡️ Defense Form', speed: '⚡ Speed Form' };
  const formColors = { attack: 'GALACTIC Attack', defense: 'GALACTIC HP', speed: 'GALACTIC Speed' };
  toast(`🌌 Deoxys transformed into ${formLabels[formKey]}! ${formColors[formKey]} activated!`, 4000);
  updatePresetsForPokemon(numUid, itemId);
  renderAll();
  closeModal();
  saveGame();
}

function performDNAFusion(kyuremUid, itemId, fuseWithUid) {
  const kyurem = gameState.box.find(p=>p.uid===kyuremUid);
  if(!kyurem) return;
  // fuseWithUid can be a uid (number) — find the exact partner
  const fusePokemon = gameState.team.find(p=>p.uid===fuseWithUid);
  if(!fusePokemon) { toast('Partner Pokémon not found on team!', 2500); return; }
  const fuseWithId = fusePokemon.id;

  // Equip the splicer
  const old = gameState.equippedItems[kyuremUid];
  if(old) gameState.inventory[old] = (gameState.inventory[old]||0) + 1;
  gameState.equippedItems[kyuremUid] = itemId;
  gameState.inventory[itemId] = Math.max(0, (gameState.inventory[itemId]||0) - 1);

  // Mark fusion — store which pokemon was absorbed (by id so we can reconstruct)
  kyurem._fusedWith = fuseWithId;
  kyurem._fusedUid = fusePokemon.uid;
  // Remove fused partner from team (and put it "inside" Kyurem - not in box to avoid confusion)
  const teamIdx = gameState.team.indexOf(fusePokemon);
  if(teamIdx >= 0) gameState.team.splice(teamIdx, 1);
  // Keep the pokemon in box but mark it as fused so user can see it but can't use it
  fusePokemon._isFusedInto = kyuremUid;

  // Update Kyurem's name and set SSS on all SS stats
  const fuseName = fuseWithId === 644 ? 'Black Kyurem' : 'White Kyurem';
  kyurem.name = fuseName;
  // Boost all SS (iv=31) stats to SSS representation: set ivs beyond 31 (we use 32 as SSS marker)
  if(kyurem.ivs) {
    Object.keys(kyurem.ivs).forEach(stat => {
      if(kyurem.ivs[stat] >= 31) kyurem.ivs[stat] = 31; // keep at 31 (SS), getEffectiveStat applies 2x
    });
  }
  if(kyurem.statsLoaded) kyurem.currentHp = getMaxHp(kyurem);

  const emoji = fuseWithId === 644 ? '⚡' : '🔥';
  addLog(`🧬 ${emoji} ${fuseName} has been born! The fusion is complete!`, 'log-cosmic');
  toast(`🧬 ${emoji} ${fuseName}! SSS Power unleashed!`, 5000);
  if(gameState.currentFighterIdx >= gameState.team.length) gameState.currentFighterIdx = 0;
  renderAll();
}

function unequipItem(uid) {
  const old = gameState.equippedItems[uid];
  if(!old) return;
  const baseOld = getMegaStoneBaseId(old) || old;

  // Block unequipping form-changing items if this pokemon is saved in a preset
  if(FORM_ITEMS.has(baseOld)) {
    const lockedBy = isFormLockedByPreset(uid);
    if(lockedBy) {
      toast(`🔒 Remove this Pokémon from preset "${lockedBy}" first!`, 3500);
      return;
    }
  }
  // Handle DNA Splicer defusion
  if(old === 'dna_splicer') {
    const kyurem = gameState.box.find(p=>p.uid===uid);
    if(kyurem) {
      if(kyurem._fusedWith) {
        // Find the absorbed partner in the box
        const partner = gameState.box.find(p=>p.uid===kyurem._fusedUid);
        if(partner) {
          partner._isFusedInto = null;
          // Try to add back to team if space, otherwise leave in box
          if(gameState.team.length < 6) {
            gameState.team.push(partner);
            addLog(`🧬 Defused! ${partner.name} returned to the team!`, 'log-heal');
          } else {
            addLog(`🧬 Defused! ${partner.name} returned to the PC (team was full)!`, 'log-heal');
            toast(`📦 ${partner.name} went to the PC — team was full!`, 3500);
          }
        }
      }
      // Always reset Kyurem's name and fusion state when DNA Splicer is removed
      kyurem.name = 'Kyurem';
      kyurem._fusedWith = null;
      kyurem._fusedUid = null;
      if(kyurem.statsLoaded) kyurem.currentHp = getMaxHp(kyurem);
    }
  }

  gameState.inventory[old] = (gameState.inventory[old]||0) + 1;
  delete gameState.equippedItems[uid];
  // Clear mega stone bonus from pokemon
  const pk = gameState.box.find(p=>p.uid===uid);
  if(pk && ['sceptilite','swampertite','blazikenite','gengarite','aggronite','garchompite'].includes(baseOld)) pk._megaStoneBonus = null;
  // Reset Deoxys form when Mysterious Meteorite is removed
  if(baseOld === 'mysterious_meteorite' && pk && pk.id === 386) {
    pk._deoxysForm = null;
    if(pk.statsLoaded) pk.currentHp = getMaxHp(pk);
    toast('🌌 Deoxys reverted to Normal Form!', 3000);
  } else if(baseOld === 'red_orb' && pk && pk.id === 383) {
    toast('🔴 Groudon returned to its dormant form.', 2500);
  } else if(baseOld === 'blue_orb' && pk && pk.id === 382) {
    toast('🔵 Kyogre returned to its dormant form.', 2500);
  } else {
    toast('Item unequipped!');
  }
  // Auto-update any presets that contain this pokemon (item cleared)
  updatePresetsForPokemon(uid, null);
  renderAll();
}

function showItemGachaResult(item) {
  document.getElementById('modal-title').textContent = '🎁 Item Get!';
  document.getElementById('modal-content').innerHTML = `
    <div style="text-align:center;padding:20px">
      <div style="font-size:60px;margin-bottom:12px">${item.emoji}</div>
      <div style="font-family:'Press Start 2P';font-size:10px;color:var(--gold);margin-bottom:8px">${item.name}</div>
      <div style="color:var(--text2);font-size:15px;margin-bottom:16px">${item.desc}</div>
      <button class="btn" onclick="closeModal()" style="width:100%">Nice!</button>
    </div>
  `;
  openModal();
}

function isBossOrLegendary(pk) {
  // Legendary IDs or any pokemon caught from a boss fight (has high base level 270)
  if(LEGENDARY_IDS.has(pk.id)) return true;
  // Custom boss pokemon from codes
  if(pk._isBossCode) return true;
  // Hero Greninja in SSS form (naturalSSS flag)
  if(pk._naturalSSS) return true;
  // Mega evolved starters count as bosses
  if(isMegaSceptile(pk) || isMegaSwampert(pk) || isMegaBlaziken(pk)) return true;
  if(isMegaGengar(pk) || isMegaAggron(pk) || isMegaGarchomp(pk)) return true;
  return false;
}

const MAX_BOSS_ON_TEAM = 3;

function countBossOnTeam() {
  return gameState.team.filter(p => isBossOrLegendary(p)).length;
}

function countMegaStartersOnTeam() {
  return gameState.team.filter(p => isMegaSceptile(p) || isMegaSwampert(p) || isMegaBlaziken(p) || isMegaGengar(p) || isMegaAggron(p) || isMegaGarchomp(p)).length;
}

function addToTeam(uid) {
  if(gameState.team.length >= 6) { toast('Team is full! (max 6)'); return; }
  const pk = gameState.box.find(p=>p.uid===uid);
  if(!pk) return;
  if(gameState.team.includes(pk)) { toast('Already on team!'); return; }

  // Boss/Legendary cap: max 3 per team
  if(isBossOrLegendary(pk) && countBossOnTeam() >= MAX_BOSS_ON_TEAM) {
    toast(`⚠️ Max ${MAX_BOSS_ON_TEAM} Boss/Legendary Pokémon per team!`, 3000);
    return;
  }
  // Mega starter cap: max 1 per team
  if((isMegaSceptile(pk) || isMegaSwampert(pk) || isMegaBlaziken(pk) || isMegaGengar(pk) || isMegaAggron(pk) || isMegaGarchomp(pk)) && countMegaStartersOnTeam() >= 1) {
    toast('⚠️ Only 1 Mega Pokémon per team!', 3000);
    return;
  }
  // Block duplicate species on team (with special Kyurem/Zekrom/Reshiram fusion rules)
  const FUSION_IDS = [646, 644, 643];
  if(!FUSION_IDS.includes(pk.id)) {
    const duplicate = gameState.team.find(p => p.id === pk.id);
    if(duplicate) { toast(`⚠️ ${pk.name} is already on your team!`, 2500); return; }
  }

  // Kyurem fusion limits
  if(pk.id === 646) {
    const kyuremsOnTeam = gameState.team.filter(p => p.id === 646);
    const isAddingBlack = pk._fusedWith === 644;
    const isAddingWhite = pk._fusedWith === 643;
    const isAddingFused = isAddingBlack || isAddingWhite;

    if(isAddingBlack && kyuremsOnTeam.some(p => p._fusedWith === 644)) {
      toast('⚠️ Only 1 Black Kyurem per team!', 3000); return;
    }
    if(isAddingWhite && kyuremsOnTeam.some(p => p._fusedWith === 643)) {
      toast('⚠️ Only 1 White Kyurem per team!', 3000); return;
    }
    if(!isAddingFused) {
      const fusedOnTeam = kyuremsOnTeam.filter(p => !!p._fusedWith);
      const unfusedOnTeam = kyuremsOnTeam.filter(p => !p._fusedWith);
      if(unfusedOnTeam.length >= 1) {
        toast('⚠️ Only 1 unfused Kyurem per team!', 3000); return;
      }
      if(fusedOnTeam.length === 0 && kyuremsOnTeam.length >= 1) {
        toast('⚠️ A second Kyurem is only allowed if one is already fused (Black/White)!', 3500); return;
      }
    }
  }

  // Zekrom/Reshiram: block duplicates normally
  if(pk.id === 644 || pk.id === 643) {
    const duplicate = gameState.team.find(p => p.id === pk.id);
    if(duplicate) { toast(`⚠️ ${pk.name} is already on your team!`, 2500); return; }
  }
  // Block second Mega Rayquaza on team
  if(isMegaRayquaza(pk) && hasMegaOnTeam(uid)) {
    toast('⚠️ Only 1 Mega Rayquaza per team!', 3000);
    return;
  }
  gameState.team.push(pk);
  activePresetIdx = null; // team diverged from any preset
  toast(`${pk.name} added to team!`);
  renderAll();
}

function removeFromTeam(idx) {
  if(gameState.team.length <= 1) { toast('Need at least one Pokémon!'); return; }
  const pk = gameState.team.splice(idx, 1)[0];
  if(gameState.currentFighterIdx >= gameState.team.length) gameState.currentFighterIdx = 0;
  activePresetIdx = null; // team diverged from any preset
  toast(`${pk.name} returned to box.`);
  renderAll();
}

function removeFromTeamByUid(uid) {
  const idx = gameState.team.findIndex(p=>p.uid===uid);
  if(idx>=0) removeFromTeam(idx);
}

function showAddToTeamPicker() {
  // Show box pokemon not already on team, sorted by level desc
  const available = gameState.box.filter(p => !gameState.team.includes(p) && !p._isFusedInto)
    .sort((a,b) => b.level - a.level);

  document.getElementById('modal-title').textContent = '➕ Add Pokémon to Team';
  document.getElementById('modal-title').style.cssText = '';

  if(available.length === 0) {
    document.getElementById('modal-content').innerHTML = `
      <div style="text-align:center;padding:20px;color:var(--text2)">All your Pokémon are already on the team!</div>
      <button class="btn gold" onclick="closeModal()" style="width:100%;margin-top:8px">Close</button>
    `;
    openModal();
    return;
  }

  const rows = available.map(p => {
    const cosmic = isCosmic(p);
    const equippedItem = getItemByEquipId(gameState.equippedItems[p.uid]);
    const nameHtml = isEnvyUnbound(p)
      ? `<span style="color:#00e676;font-size:9px">ENVY UNBOUND</span>`
      : p._isEnvy
      ? `<span class="void-text" style="font-size:9px">ENVY</span>`
      : `<span style="color:${cosmic?'#00ffff':p.isShiny?'#ff69b4':'var(--gold)'}">${p.name}</span>`;
    // Overall grade badge
    const ivs = p.ivs || {};
    const avg = Math.round(Object.values(ivs).reduce((a,b)=>a+b,0)/6);
    const g = getStatGrade(avg);
    const isMega = isMegaRayquaza(p); const isOrigin = isOriginGiratina(p);
    const isFused = isDNAFused(p); const isCrowned = isCrownedZacian(p)||isCrownedZamazenta(p);
    const isMegaStarter2 = isMegaSceptile(p)||isMegaSwampert(p)||isMegaBlaziken(p);
    const isSpecial = isMega||isOrigin||isFused||p._naturalSSS||isCrowned||p._sssUsed||p._isEnvy||isMegaStarter2||isPerfectedZygarde(p);
    const hasSSStat = isSpecial && Object.values(ivs).some(iv=>iv>=31);
    const gradeBadge = hasSSStat
      ? `<span class="ss-rainbow" style="font-family:'Press Start 2P',monospace;font-size:6px;animation:shimmer 0.8s linear infinite">SSS</span>`
      : g.isSS
        ? `<span class="ss-rainbow" style="font-family:'Press Start 2P',monospace;font-size:6px">${g.label}</span>`
        : `<span style="font-family:'Press Start 2P',monospace;font-size:6px;color:${g.color}">${g.label}</span>`;
    return `<div onclick="addToTeam(${p.uid});closeModal();renderAll();" style="display:flex;align-items:center;gap:10px;padding:6px 8px;border-radius:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);cursor:pointer;margin-bottom:4px;transition:background 0.15s" onmouseover="this.style.background='rgba(79,195,247,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.04)'">
      <img src="${getSpriteUrl(p.id, p.isShiny, p.uid)}" width="40" height="40" style="image-rendering:pixelated;flex-shrink:0">
      <div style="flex:1;min-width:0">
        <div style="font-size:13px">${cosmic?'🌌 ':''}${p.isShiny&&!cosmic?'★ ':''}${nameHtml} ${equippedItem?getItemIcon(equippedItem,16):''}</div>
        <div style="font-size:12px;color:var(--text2)">Lv.${p.level} · ${p.types.map(t=>`<span class="type-badge" style="background:${TYPE_COLORS[t]};font-size:9px">${t}</span>`).join(' ')}</div>
      </div>
      <div style="flex-shrink:0">${gradeBadge}</div>
    </div>`;
  }).join('');

  document.getElementById('modal-content').innerHTML = `
    <div style="font-size:12px;color:var(--text2);margin-bottom:8px">${available.length} Pokémon available · tap to add</div>
    <div style="max-height:380px;overflow-y:auto">${rows}</div>
    <button class="btn gold" onclick="closeModal()" style="width:100%;margin-top:10px">Cancel</button>
  `;
  openModal();
}

function openModal() { document.getElementById('modal-overlay').classList.add('active'); }

function closeModal(event) {
  if(event && event.target !== document.getElementById('modal-overlay') && event.target !== document.getElementById('modal-close')) return;
  document.getElementById('modal-overlay').classList.remove('active');
  document.getElementById('modal-title').style.cssText = '';
}

// ============================================================
// TABS
// ============================================================

function switchTab(name) {
  const tabs = ['team','box','gacha','items','road','egg'];
  document.querySelectorAll('.tab-btn').forEach((b,i)=>{ b.classList.toggle('active', tabs[i]===name); });
  document.querySelectorAll('.tab-content').forEach(c=>{ c.classList.toggle('active', c.id==='tab-'+name); });
  if(name==='box') renderPokemonBox();
  if(name==='items') renderItems();
  if(name==='road') renderRoadUI();
  if(name==='egg') renderEggUI();
}

function toggleAuto() {
  battlePaused = !battlePaused;
  document.getElementById('auto-btn').textContent = battlePaused ? '▶ RESUME' : '⏸ PAUSE';
}

function toast(msg, duration=2500) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(()=>el.classList.remove('show'), duration);
}

// ============================================================
// RELEASE POKEMON
// ============================================================

function confirmRelease(uid) {
  const pk = gameState.box.find(p=>p.uid===uid);
  if(!pk) return;
  if(pk._isFusedInto) { toast("🧬 Can't release a Pokémon that is fused! Defuse it first.", 3000); return; }
  if(gameState.box.length <= 1) { toast("Can't release your last Pokémon!"); return; }
  document.getElementById('modal-title').textContent = `Release ${pk.name}?`;
  document.getElementById('modal-content').innerHTML = `
    <div style="text-align:center;padding:12px 0">
      <img src="${getSpriteUrl(pk.id, pk.isShiny, pk.uid)}" width="100" height="100" class="${getModalSpriteClass(pk)}"" onerror="this.src='${getBattleSprite(pk.id,pk.isShiny)}'">
      <div style="margin:12px 0;font-size:16px;color:var(--text2)">
        ${isCosmic(pk) ? '<span class="cosmic-text">🌌 COSMIC </span>' : pk.isShiny ? '<span class="shiny-text">★ SHINY </span>' : ''}${pk.name} (Lv.${pk.level}) will be released forever.
      </div>
      <div style="display:flex;gap:10px;justify-content:center;margin-top:14px">
        <button class="btn" style="border-color:#ef5350;color:#ef5350;flex:1" onclick="releasePokemon(${uid})">Yes, release 🕊️</button>
        <button class="btn gold" style="flex:1" onclick="closeModal()">Keep ❤️</button>
      </div>
    </div>
  `;
}

function releasePokemon(uid) {
  const idx = gameState.box.findIndex(p=>p.uid===uid);
  if(idx === -1) return;
  if(gameState.box.length <= 1) { toast("Can't release your last Pokémon!"); return; }
  const pk = gameState.box[idx];
  if(pk._isFusedInto) { toast("🧬 Can't release a fused Pokémon! Defuse first.", 3000); closeModal(); return; }
  const teamIdx = gameState.team.indexOf(pk);
  if(teamIdx >= 0) {
    if(gameState.team.length <= 1 && gameState.box.length <= 1) return;
    gameState.team.splice(teamIdx, 1);
    if(gameState.currentFighterIdx >= gameState.team.length) gameState.currentFighterIdx = Math.max(0, gameState.team.length-1);
  }
  const equippedId = gameState.equippedItems[uid];
  if(equippedId) { gameState.inventory[equippedId] = (gameState.inventory[equippedId]||0)+1; delete gameState.equippedItems[uid]; }
  gameState.box.splice(idx, 1);
  toast(`🕊️ ${pk.name} was released!`, 3000);
  closeModal();
  renderAll();
}

// ============================================================
// QUICK RELEASE
// ============================================================

let quickReleaseSelected = new Set();

function openQuickRelease() {
  quickReleaseSelected = new Set();
  renderQuickReleaseModal();
  openModal();
}

function renderQuickReleaseModal() {
  document.getElementById('modal-title').textContent = '🕊️ Quick Release';
  const locked = gameState.lockedPokemon || [];
  const releasable = gameState.box.filter(p => !gameState.team.includes(p) && !p._isFusedInto);
  const selCount = quickReleaseSelected.size;
  const canRelease = selCount > 0 && (gameState.box.length - selCount) >= 1;

  document.getElementById('modal-content').innerHTML = `
    <div style="font-size:13px;color:var(--text2);margin-bottom:8px">Click to select · 🔒 to protect from bulk-select. <span style="color:#ef5350">Selected: ${selCount}</span></div>
    <div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">
      <button class="btn" style="font-size:12px;padding:3px 8px" onclick="quickSelectAll(false)">Select All</button>
      <button class="btn" style="font-size:12px;padding:3px 8px" onclick="quickSelectAll(true)">Deselect All</button>
      <button class="btn" style="font-size:12px;padding:3px 8px" onclick="quickSelectBelow()">Select Lv&lt;50</button>
      <button class="btn" style="font-size:12px;padding:3px 8px;border-color:#66bb6a;color:#66bb6a" onclick="quickSelectBelowGrade('A')">Below A</button>
      <button class="btn" style="font-size:12px;padding:3px 8px;border-color:#ffd700;color:#ffd700" onclick="quickSelectBelowGrade('S')">Below S</button>
    </div>
    <div class="poke-box" style="max-height:320px;overflow-y:auto">
      ${releasable.map(p => {
        const sel = quickReleaseSelected.has(p.uid);
        const isLocked = locked.includes(p.uid);
        return `<div class="poke-card${p.isShiny?' shiny-card':''}" onclick="toggleQuickSelect(${p.uid})" style="cursor:pointer;${sel?'border-color:#ef5350;background:rgba(239,83,80,0.2)':''}${isLocked?'opacity:0.65;':''}">
          ${sel ? '<div style="position:absolute;top:3px;left:3px;font-size:16px">✓</div>' : ''}
          ${p.isShiny ? '<div style="position:absolute;top:3px;right:20px;font-size:14px">★</div>' : ''}
          <button onclick="event.stopPropagation();toggleLockPokemon(${p.uid})" style="position:absolute;top:2px;right:2px;background:none;border:none;cursor:pointer;font-size:13px;line-height:1;padding:1px" title="${isLocked?'Unlock':'Lock'}">${isLocked?'🔒':'🔓'}</button>
          <img src="${getSpriteUrl(p.id, p.isShiny, p.uid)}" onerror="this.src='${getBattleSprite(p.id, p.isShiny, p.uid)}'">
          <span class="cname">${p.name}</span>
          <span class="clevel">Lv.${p.level}</span>
        </div>`;
      }).join('')}
    </div>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button class="btn" style="flex:1;border-color:#ef5350;color:#ef5350" onclick="confirmQuickRelease()" ${canRelease?'':'disabled'}>Release ${selCount > 0 ? `×${selCount}` : ''} 🕊️</button>
      <button class="btn gold" style="flex:1" onclick="closeModal()">Cancel</button>
    </div>
  `;
}

function toggleLockPokemon(uid) {
  if(!gameState.lockedPokemon) gameState.lockedPokemon = [];
  const idx = gameState.lockedPokemon.indexOf(uid);
  if(idx >= 0) gameState.lockedPokemon.splice(idx, 1);
  else gameState.lockedPokemon.push(uid);
  saveGame();
  renderPokemonBox();
  renderQuickReleaseModal();
}

function toggleQuickSelect(uid) {
  if((gameState.lockedPokemon||[]).includes(uid)) return; // can't select locked
  if(quickReleaseSelected.has(uid)) quickReleaseSelected.delete(uid);
  else quickReleaseSelected.add(uid);
  renderQuickReleaseModal();
}

function quickSelectAll(deselect) {
  if(deselect) { quickReleaseSelected.clear(); }
  else {
    const locked = gameState.lockedPokemon || [];
    const releasable = gameState.box.filter(p => !gameState.team.includes(p) && !locked.includes(p.uid) && !p._isFusedInto);
    releasable.slice(0, Math.max(0, releasable.length - 1)).forEach(p => quickReleaseSelected.add(p.uid));
  }
  renderQuickReleaseModal();
}

function quickSelectBelow(threshold=50) {
  const locked = gameState.lockedPokemon || [];
  quickReleaseSelected.clear();
  const releasable = gameState.box.filter(p => !gameState.team.includes(p) && p.level < threshold && !locked.includes(p.uid) && !p._isFusedInto);
  const keepCount = gameState.box.length - releasable.length;
  if(keepCount < 1) releasable.slice(1).forEach(p => quickReleaseSelected.add(p.uid));
  else releasable.forEach(p => quickReleaseSelected.add(p.uid));
  renderQuickReleaseModal();
}

function quickSelectBelowGrade(minGrade) {
  const locked = gameState.lockedPokemon || [];
  // Grade order: F=0, D=1, C=2, B=3, A=4, S=5, SS=6
  // "Below A" (minGrade='A', minIdx=4): select F,D,C,B only
  // "Below S" (minGrade='S', minIdx=5): select F,D,C,B,A only — never S or SS
  const gradeOrder = ['F','D','C','B','A','S','SS'];
  const minIdx = gradeOrder.indexOf(minGrade);
  quickReleaseSelected.clear();
  const releasable = gameState.box.filter(p => !gameState.team.includes(p) && !locked.includes(p.uid) && !p._isFusedInto);
  releasable.forEach(p => {
    if(!p.ivs) return;
    const ivVals = Object.values(p.ivs);
    const avg = Math.round(ivVals.reduce((a,b)=>a+b,0) / ivVals.length);
    const hasAnyPerfect = ivVals.some(v => v >= 31);
    const avgGrade = getStatGrade(avg);
    const effectiveGrade = hasAnyPerfect ? 'SS' : avgGrade.label;
    const gIdx = gradeOrder.indexOf(effectiveGrade);
    if(gIdx < minIdx) quickReleaseSelected.add(p.uid);
  });
  // keep at least 1
  if(gameState.box.length - quickReleaseSelected.size < 1) {
    const uids = [...quickReleaseSelected];
    quickReleaseSelected.delete(uids[0]);
  }
  renderQuickReleaseModal();
}

function showGachaPool(type) {
  const pools = { pokemon: GACHA_POOL, epic: EPIC_GACHA_POOL, shiny: EPIC_GACHA_POOL };
  const titles = { pokemon: '🎲 Pokémon Gacha Pool', epic: '⚡ Epic Gacha Pool', shiny: '✨ Shiny Gacha Pool' };
  const pool = pools[type];
  const totalW = pool.reduce((s,p)=>s+p.w,0);
  const sorted = [...pool].sort((a,b)=>b.w-a.w);
  document.getElementById('modal-title').textContent = titles[type];
  document.getElementById('modal-content').innerHTML = `
    <div style="font-size:12px;color:var(--text2);margin-bottom:10px;text-align:center">${pool.length} possible Pokémon · sorted by chance</div>
    <div style="max-height:400px;overflow-y:auto;display:flex;flex-direction:column;gap:4px">
      ${sorted.map(p => {
        const pct = ((p.w/totalW)*100).toFixed(1);
        const isLegendary = p.w <= 1.5;
        const isRare = p.w <= 5 && !isLegendary;
        const color = isLegendary ? '#ffd700' : isRare ? '#ce93d8' : 'var(--text2)';
        return `<div style="display:flex;align-items:center;gap:8px;padding:4px 6px;border-radius:6px;background:rgba(255,255,255,0.03)">
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png" width="32" height="32" style="image-rendering:pixelated">
          <span style="flex:1;font-size:14px;color:${color}">${p.name}</span>
          <span style="font-size:12px;color:var(--text2)">${p.types.map(t=>`<span class="type-badge" style="background:${TYPE_COLORS[t]};font-size:9px">${t}</span>`).join(' ')}</span>
          <span style="font-size:13px;color:${color};min-width:38px;text-align:right">${pct}%</span>
        </div>`;
      }).join('')}
    </div>
    <button class="btn gold" onclick="closeModal()" style="width:100%;margin-top:12px">Close</button>
  `;
  openModal();
}

function confirmQuickRelease() {
  if(quickReleaseSelected.size === 0) return;
  // Safety: silently remove any fused-away pokemon that somehow got selected
  quickReleaseSelected.forEach(uid => { const p = gameState.box.find(q=>q.uid===uid); if(p && p._isFusedInto) quickReleaseSelected.delete(uid); });
  if(quickReleaseSelected.size === 0) return;
  if(gameState.box.length - quickReleaseSelected.size < 1) { toast("Can't release your last Pokémon!"); return; }
  const names = [];
  quickReleaseSelected.forEach(uid => {
    const idx = gameState.box.findIndex(p=>p.uid===uid);
    if(idx === -1) return;
    const pk = gameState.box[idx];
    names.push(pk.name);
    const eqId = gameState.equippedItems[uid];
    if(eqId) { gameState.inventory[eqId]=(gameState.inventory[eqId]||0)+1; delete gameState.equippedItems[uid]; }
    const tIdx = gameState.team.indexOf(pk);
    if(tIdx >= 0) { gameState.team.splice(tIdx,1); if(gameState.currentFighterIdx>=gameState.team.length) gameState.currentFighterIdx=Math.max(0,gameState.team.length-1); }
  });
  gameState.box = gameState.box.filter(p => !quickReleaseSelected.has(p.uid));
  quickReleaseSelected.clear();
  toast(`🕊️ Released ${names.length} Pokémon!`, 3000);
  closeModal();
  renderAll();
}

// ============================================================
// SAVE / LOAD
// ============================================================

const SAVE_KEY = 'pkm_idle_save_v2';

// ============================================================
// PRESET TEAMS
// ============================================================

// ============================================================
// PRESET TEAMS SYSTEM
// To disable entirely: set PRESETS_ENABLED = false
// That will hide the button and no-op all preset functions.
// ============================================================
const PRESETS_ENABLED = true;

function initPresetSystem() {
  if(!PRESETS_ENABLED) {
    // Hide the overlay and button via CSS variable
    document.documentElement.style.setProperty('--preset-btn-display', 'none');
    const overlay = document.getElementById('preset-overlay');
    if(overlay) overlay.style.display = 'none';
  }
}

const PRESET_STORAGE_KEY = 'pkm_idle_preset_teams';
const MAX_PRESETS = 3;
let activePresetIdx = null; // which preset is currently loaded

function openPresetOverlay() {
  if(!PRESETS_ENABLED) return;
  renderPresetCards();
  document.getElementById('preset-overlay').style.display = 'flex';
}

function closePresetOverlay() {
  if(!PRESETS_ENABLED) return;
  document.getElementById('preset-overlay').style.display = 'none';
}

function getPresets() {
  if(!PRESETS_ENABLED) return [];
  try { return JSON.parse(localStorage.getItem(PRESET_STORAGE_KEY) || '[]'); }
  catch(e) { return []; }
}

function setPresets(presets) {
  if(!PRESETS_ENABLED) return;
  localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets));
}

function renderPresetCards() {
  if(!PRESETS_ENABLED) return;
  const container = document.getElementById('preset-cards-container');
  if(!container) return;
  const presets = getPresets();
  let html = '';
  for(let i = 0; i < MAX_PRESETS; i++) {
    const preset = presets[i];
    const isActive = activePresetIdx === i;
    if(preset) {
      const members = (preset.teamUids || []).map(uid => gameState.box.find(p=>p.uid===uid)).filter(Boolean);
      let spritesHtml = '';
      for(let s = 0; s < 6; s++) {
        const m = members[s];
        if(m) {
          const spriteUrl = getPresetSpriteUrl(m);
          spritesHtml += `<img src="${spriteUrl}" title="${m.name}" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'">`;
        } else {
          spritesHtml += `<div class="empty-preset-slot"></div>`;
        }
      }
      html += `<div class="preset-card${isActive ? ' preset-active' : ''}">
        <div class="preset-card-top">
          <span class="preset-label">P${i+1}</span>
          <span class="preset-name-display" onclick="renamePreset(${i})" title="Click to rename">${preset.name || ('Preset ' + (i+1))}</span>
          ${isActive ? '<span style="font-size:10px;color:var(--accent);font-family:\'VT323\',monospace;flex-shrink:0">● ACTIVE</span>' : ''}
        </div>
        <div class="preset-card-mid"><div class="preset-sprites">${spritesHtml}</div></div>
        <div class="preset-card-bot">
          <button class="preset-btn load-btn" onclick="loadPreset(${i})">▶ Load</button>
          <button class="preset-btn" onclick="overwritePreset(${i})">💾 Overwrite</button>
          <button class="preset-btn del-btn" onclick="deletePreset(${i})">🗑 Delete</button>
        </div>
      </div>`;
    } else {
      html += `<div class="preset-card">
        <div class="preset-card-top">
          <span class="preset-label">P${i+1}</span>
          <span class="preset-name-display empty-preset">— empty —</span>
        </div>
        <div class="preset-card-mid"><div class="preset-sprites">${'<div class="empty-preset-slot"></div>'.repeat(6)}</div></div>
        <div class="preset-card-bot">
          <button class="preset-btn" onclick="savePreset(${i})">💾 Save current team</button>
        </div>
      </div>`;
    }
  }
  container.innerHTML = html;
}

function getPresetSpriteUrl(p) {
  if(p._customSprite) return p._customSprite;
  return getSpriteUrl(p.id, p.isShiny, p.uid);
}

const FORM_ITEMS = new Set(['dna_splicer','meteorite','outer_world_meteor','origin_orb','heros_sword','heros_shield','royal_sword','royal_shield','sceptilite','swampertite','blazikenite','gengarite','aggronite','garchompite','red_orb','blue_orb','mysterious_meteorite']);

// Returns the name of the preset that locks this pokemon's current form, or null if none.
// Locks if: pokemon is in a preset with a form item saved, OR pokemon is in any preset
// and someone is trying to equip a form-changing item onto it (checked at call site).
function isFormLockedByPreset(uid) {
  const presets = getPresets();
  const uidNum = Number(uid);
  for(const preset of presets) {
    if(!preset) continue;
    const inTeam = (preset.teamUids || []).some(u => Number(u) === uidNum);
    if(!inTeam) continue;
    const items = preset.equippedItems || {};
    const itemInPreset = items[uid] || items[String(uid)];
    if(itemInPreset && FORM_ITEMS.has(itemInPreset)) return preset.name || 'a preset';
  }
  return null;
}

// Returns preset name if this pokemon is saved in any preset (regardless of item), else null.
function isInAnyPreset(uid) {
  const presets = getPresets();
  const uidNum = Number(uid);
  for(const preset of presets) {
    if(!preset) continue;
    if((preset.teamUids || []).some(u => Number(u) === uidNum)) return preset.name || 'a preset';
  }
  return null;
}

// When a regular item is equipped/unequipped, presets are NOT auto-updated.
// Presets are snapshots — they only change when explicitly saved or overwritten.
function updatePresetsForPokemon(_uid, _newItemId) { /* intentionally empty */ }

function buildPresetData(name) {
  const teamItems = {};
  const fusionData = {}; // kyurem uid -> { _fusedWith, _fusedUid, name }
  gameState.team.forEach(p => {
    if(gameState.equippedItems[p.uid]) teamItems[p.uid] = gameState.equippedItems[p.uid];
    if(p.id === 646 && p._fusedWith) {
      fusionData[p.uid] = { _fusedWith: p._fusedWith, _fusedUid: p._fusedUid, name: p.name };
    }
  });
  return {
    name,
    teamUids: gameState.team.map(p=>p.uid),
    equippedItems: teamItems,
    fusionData,
    savedAt: Date.now()
  };
}

function savePreset(idx) {
  if(!PRESETS_ENABLED) return;
  if(gameState.team.length === 0) { toast('❌ No team to save!', 2000); return; }
  const name = prompt(`Name this preset:`, `Preset ${idx+1}`);
  if(name === null) return;
  const presets = getPresets();
  while(presets.length <= idx) presets.push(null);
  presets[idx] = buildPresetData(name.trim() || `Preset ${idx+1}`);
  setPresets(presets);
  activePresetIdx = idx;
  renderPresetCards();
  toast(`✅ Team saved as "${presets[idx].name}"!`, 2000);
}

function overwritePreset(idx) {
  if(!PRESETS_ENABLED) return;
  if(gameState.team.length === 0) { toast('❌ No team to save!', 2000); return; }
  const presets = getPresets();
  const existing = presets[idx];
  const name = existing ? existing.name : `Preset ${idx+1}`;
  if(!confirm(`Overwrite "${name}" with your current team?`)) return;
  presets[idx] = buildPresetData(name);
  setPresets(presets);
  activePresetIdx = idx;
  renderPresetCards();
  toast(`✅ "${name}" updated!`, 2000);
}

function loadPreset(idx) {
  if(!PRESETS_ENABLED) return;
  const presets = getPresets();
  const preset = presets[idx];
  if(!preset) { toast('❌ No preset saved here!', 2000); return; }

  const newTeam = (preset.teamUids || []).map(uid => gameState.box.find(p=>p.uid===uid)).filter(Boolean);
  // Filter out any pokemon that are currently fused into another (they can't be on a team)
  const fusedAway = newTeam.filter(p => p._isFusedInto);
  const activeNewTeam = newTeam.filter(p => !p._isFusedInto);
  if(activeNewTeam.length === 0) { toast('❌ None of the saved Pokémon are available (fused/missing)!', 2500); return; }
  const missing = (preset.teamUids || []).length - activeNewTeam.length;

  // Build preset item map with numeric keys
  const presetItems = {};
  Object.entries(preset.equippedItems || {}).forEach(([uid, item]) => { presetItems[Number(uid)] = item; });

  const newTeamUids = new Set(activeNewTeam.map(p => p.uid));

  // ── STEP 1: Return items from ALL current team members to inventory ────────
  // We'll re-apply the correct items in step 3. Handle fusion defuse for departing Kyurem.
  gameState.team.forEach(p => {
    const currentItem = gameState.equippedItems[p.uid];
    if(!currentItem) return;

    const stayingOnTeam = newTeamUids.has(p.uid);
    const presetItemForThis = presetItems[p.uid];

    // If same pokemon, same item → nothing to do, skip entirely
    if(stayingOnTeam && presetItemForThis === currentItem) return;

    // Handle DNA Splicer defusion for any fused Kyurem losing its splicer
    if(currentItem === 'dna_splicer' && p._fusedWith) {
      // Only defuse if this pokemon is leaving OR the preset wants a different item
      if(!stayingOnTeam || presetItemForThis !== 'dna_splicer') {
        const partner = gameState.box.find(q => q.uid === p._fusedUid);
        if(partner) partner._isFusedInto = null;
        p.name = 'Kyurem';
        p._fusedWith = null;
        p._fusedUid = null;
        if(p.statsLoaded) p.currentHp = getMaxHp(p);
      }
    }

    gameState.inventory[currentItem] = (gameState.inventory[currentItem] || 0) + 1;
    delete gameState.equippedItems[p.uid];
  });

  // ── STEP 2: Set the new team ───────────────────────────────────────────────
  gameState.team = activeNewTeam;
  gameState.currentFighterIdx = 0;

  // ── STEP 3: Apply preset items to ALL pokemon on the new team ─────────────
  activeNewTeam.forEach(p => {
    const itemToEquip = presetItems[p.uid];

    // If already correctly equipped (same pokemon, same item — skipped step 1), nothing to do
    if(gameState.equippedItems[p.uid] === itemToEquip) return;

    if(!itemToEquip) return;

    if((gameState.inventory[itemToEquip] || 0) > 0) gameState.inventory[itemToEquip]--;
    gameState.equippedItems[p.uid] = itemToEquip;

    // Re-assert fusion state for Kyurem with DNA Splicer
    if(itemToEquip === 'dna_splicer' && p.id === 646) {
      const fd = (preset.fusionData || {})[p.uid] || (preset.fusionData || {})[String(p.uid)];
      const fusedWith = (fd && fd._fusedWith) || p._fusedWith;
      const fusedUid  = (fd && fd._fusedUid != null) ? Number(fd._fusedUid) : p._fusedUid;
      if(fusedWith && fusedUid != null) {
        p._fusedWith = fusedWith;
        p._fusedUid  = fusedUid;
        p.name = fusedWith === 644 ? 'Black Kyurem' : 'White Kyurem';
        const partner = gameState.box.find(q => q.uid === fusedUid);
        if(partner) partner._isFusedInto = p.uid;
        if(p.statsLoaded) p.currentHp = getMaxHp(p);
      }
    }
  });

  // ── STEP 4: Heal team to full (items affect max HP) ───────────────────────
  activeNewTeam.forEach(p => { if(p.statsLoaded) p.currentHp = getMaxHp(p); });

  activePresetIdx = idx;
  renderAll();
  saveGame();
  closePresetOverlay();

  let msg = `✅ Loaded "${preset.name}"!`;
  if(fusedAway.length > 0) msg += ` (${fusedAway.map(p=>p.name).join(', ')} skipped — currently fused)`;
  else if(missing > 0) msg += ` (${missing} Pokémon missing)`;
  toast(msg, 3000);
}

function deletePreset(idx) {
  if(!PRESETS_ENABLED) return;
  const presets = getPresets();
  if(!presets[idx]) return;
  const name = presets[idx].name || `Preset ${idx+1}`;
  if(!confirm(`Delete "${name}"?`)) return;
  presets[idx] = null;
  setPresets(presets);
  if(activePresetIdx === idx) activePresetIdx = null;
  renderPresetCards();
  toast(`🗑️ "${name}" deleted.`, 1800);
}

function renamePreset(idx) {
  if(!PRESETS_ENABLED) return;
  const presets = getPresets();
  if(!presets[idx]) return;
  const newName = prompt('Rename preset:', presets[idx].name || `Preset ${idx+1}`);
  if(newName === null) return;
  presets[idx].name = newName.trim() || presets[idx].name;
  setPresets(presets);
  renderPresetCards();
}

function saveGame() {
  // Only save if we have an active named slot
  if(activeSlotIdx === null) return;
  try {
    const saves = getAllSaves();
    const existingName = saves[activeSlotIdx] ? saves[activeSlotIdx].name : ('Save ' + (activeSlotIdx + 1));
    saves[activeSlotIdx] = buildSaveData(existingName);
    setAllSaves(saves);
  } catch(e) { console.warn('Save failed:', e); }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if(!raw) return false;
    const save = JSON.parse(raw);
    gameState.gold = save.gold || 500;
    gameState.gems = save.gems || 15;
    gameState.wins = save.wins || 0;
    gameState.wave = save.wave || 1;
    gameState.inventory = save.inventory || {};
    gameState.equippedItems = save.equippedItems || {};
    gameState.dailyClaimed = save.dailyClaimed || false;
    gameState.lastDaily = save.lastDaily || 0;
    gameState.road = save.road || {active:false,floor:0,winsOnFloor:0,winsNeeded:20,mode:null,farmRegionIdx:0};
    if(!gameState.road.mode) gameState.road.mode = gameState.road.active ? 'floor' : null;
    pUid = save.pUid || 0;
    gameState.trainerName = save.trainerName || 'Trainer';
    gameState.lockedPokemon = save.lockedPokemon || [];
    gameState.megaStoneInstances = save.megaStoneInstances || {};
    gameState.box = (save.box || []).map(p => ({ ...p, statsLoaded: !!p.stats, ivs: p.ivs || generateIVs(), ot: p.ot || save.trainerName || 'Trainer' }));
    // Normalize: all player pokemon above 250 get capped to 250
    gameState.box.forEach(p => { if(p.level > 250) { p.level = 250; p.expToNext = calcExpToNext(250); p.exp = 0; } });
    gameState.team = (save.teamUids || []).map(uid => gameState.box.find(p=>p.uid===uid)).filter(Boolean);
    gameState.currentFighterIdx = Math.min(save.currentFighterIdx||0, Math.max(0,gameState.team.length-1));
    // Post-load: repair fusion state integrity
    // Fused partners must NOT be on the team
    gameState.box.forEach(function(p) {
      if(p._isFusedInto) {
        var ti = gameState.team.indexOf(p);
        if(ti >= 0) gameState.team.splice(ti, 1);
      }
    });
    // If fused Kyurem lost its DNA Splicer somehow, defuse cleanly
    gameState.box.forEach(function(p) {
      if(p._fusedWith && p.id === 646) {
        if(gameState.equippedItems[p.uid] !== 'dna_splicer') {
          var partner = gameState.box.find(function(q){ return q.uid === p._fusedUid; });
          if(partner) partner._isFusedInto = null;
          p.name = 'Kyurem'; p._fusedWith = null; p._fusedUid = null;
        }
      }
    });
    // Boss/Legendary team cap: keep first 3, move rest to box (stay in box, not on team)
    let bossCount = 0;
    const teamToKeep = [];
    const teamToBox = [];
    gameState.team.forEach(function(p) {
      if(isBossOrLegendary(p)) {
        if(bossCount < MAX_BOSS_ON_TEAM) { bossCount++; teamToKeep.push(p); }
        else { teamToBox.push(p); }
      } else {
        teamToKeep.push(p);
      }
    });
    if(teamToBox.length > 0) {
      gameState.team = teamToKeep;
      console.warn('Moved ' + teamToBox.length + ' Boss/Legendary to box (team cap).');
    }
    return gameState.box.length > 0;
  } catch(e) { console.warn('Load failed:', e); return false; }
}

setInterval(saveGame, 30000);
function forceSave() {
  const saves = getAllSaves();
  let slotsHtml = '';
  for (let i = 0; i < MAX_SAVES; i++) {
    const s = saves[i];
    const isActive = activeSlotIdx === i;
    if (s) {
      const date = new Date(s.savedAt);
      const dateStr = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      slotsHtml += `
        <div style="
          display:flex;align-items:center;gap:6px;margin-bottom:6px;
          background:${isActive ? 'rgba(102,187,106,0.12)' : 'rgba(255,255,255,0.03)'};
          border:1px solid ${isActive ? '#66bb6a' : 'var(--border)'};
          border-radius:8px;padding:7px 10px;
        ">
          <div style="flex:1;min-width:0;overflow:hidden">
            <div style="font-family:'VT323',monospace;font-size:15px;color:${isActive ? '#66bb6a' : 'var(--text)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
              💾 Slot ${i+1}: <strong>${s.name}</strong>${isActive ? ' <span style="color:#66bb6a;font-size:12px">▶ ACTIVE</span>' : ''}
            </div>
            <div style="font-size:11px;color:var(--text2)">OT: ${s.trainerName || 'Trainer'} · ${dateStr}</div>
          </div>
          <div style="display:flex;gap:4px;flex-shrink:0">
            <button onclick="forceSaveToSlot(${i})" title="Save here" style="background:rgba(102,187,106,0.15);border:1px solid #66bb6a;color:#66bb6a;padding:4px 8px;border-radius:6px;cursor:pointer;font-family:'VT323',monospace;font-size:14px">💾</button>
            <button onclick="forceSaveRename(${i})" title="Rename" style="background:rgba(255,213,79,0.12);border:1px solid #ffd54f;color:#ffd54f;padding:4px 8px;border-radius:6px;cursor:pointer;font-family:'VT323',monospace;font-size:14px">✏️</button>
            <button onclick="forceSaveDelete(${i})" title="Delete" style="background:rgba(239,83,80,0.1);border:1px solid #ef5350;color:#ef5350;padding:4px 8px;border-radius:6px;cursor:pointer;font-family:'VT323',monospace;font-size:14px">🗑</button>
          </div>
        </div>`;
    } else {
      slotsHtml += `
        <div style="
          display:flex;align-items:center;gap:6px;margin-bottom:6px;
          background:rgba(255,255,255,0.02);border:1px dashed #444;
          border-radius:8px;padding:7px 10px;
        ">
          <div style="flex:1;font-family:'VT323',monospace;font-size:15px;color:#666">➕ Slot ${i+1}: <em>Empty</em></div>
          <button onclick="forceSaveToSlot(${i})" style="background:rgba(102,187,106,0.1);border:1px solid #66bb6a;color:#66bb6a;padding:4px 10px;border-radius:6px;cursor:pointer;font-family:'VT323',monospace;font-size:14px">💾 Save here</button>
        </div>`;
    }
  }
  document.getElementById('modal-title').textContent = '💾 Save Manager';
  document.getElementById('modal-title').style.cssText = '';
  document.getElementById('modal-content').innerHTML = `
    <div style="margin-bottom:10px;font-size:13px;color:var(--text2)">Save, rename, or delete your save slots:</div>
    ${slotsHtml}
    <button class="btn" onclick="closeModal()" style="width:100%;margin-top:4px">Close</button>
  `;
  openModal();
}

function forceSaveToSlot(slotIdx) {
  const saves = getAllSaves();
  const existing = saves[slotIdx];
  if (existing && activeSlotIdx !== null && activeSlotIdx !== slotIdx) {
    const activeName = saves[activeSlotIdx] ? saves[activeSlotIdx].name : `Slot ${activeSlotIdx+1}`;
    if (!confirm(`⚠️ You are currently playing "${activeName}" (Slot ${activeSlotIdx+1}).\n\nOverwrite "${existing.name}" (Slot ${slotIdx+1}) instead?\n\nThis cannot be undone!`)) return;
  }
  let slotName;
  if (existing) {
    slotName = existing.name;
  } else {
    const entered = prompt('Name this save slot:', `Save ${slotIdx+1}`);
    if (entered === null) return;
    slotName = entered.trim() || `Save ${slotIdx+1}`;
    const ot = prompt('Trainer name (OT):', gameState.trainerName || 'Trainer');
    if (ot === null) return;
    gameState.trainerName = ot.trim().substring(0, 12) || gameState.trainerName;
  }
  saves[slotIdx] = buildSaveData(slotName);
  setAllSaves(saves);
  activeSlotIdx = slotIdx;
  closeModal();
  toast(`💾 Saved to: ${slotName}`, 2500);
}

function forceSaveRename(slotIdx) {
  const saves = getAllSaves();
  const s = saves[slotIdx];
  if (!s) return;
  const newFileName = prompt('Rename save file:', s.name);
  if (newFileName === null) return;
  const newOT = prompt('Rename trainer (OT):', s.trainerName || 'Trainer');
  if (newOT === null) return;
  s.name = newFileName.trim() || s.name;
  s.trainerName = newOT.trim().substring(0, 12) || s.trainerName;
  // Also update live gameState OT if this is the active slot
  if (activeSlotIdx === slotIdx) {
    gameState.trainerName = s.trainerName;
  }
  saves[slotIdx] = s;
  setAllSaves(saves);
  toast(`✏️ Renamed to: ${s.name} (OT: ${s.trainerName})`, 2500);
  forceSave(); // re-render the modal
}

function forceSaveDelete(slotIdx) {
  const saves = getAllSaves();
  const s = saves[slotIdx];
  if (!s) return;
  if (!confirm(`🗑 Delete "${s.name}" (Slot ${slotIdx+1})?\n\nThis cannot be undone!`)) return;
  saves[slotIdx] = undefined;
  setAllSaves(saves.map(x => x));
  if (activeSlotIdx === slotIdx) activeSlotIdx = null;
  toast('🗑 Save deleted.', 2000);
  forceSave(); // re-render the modal
}

function confirmWipeData() {
  document.getElementById('modal-title').textContent = '⚠️ Reset All Data?';
  document.getElementById('modal-content').innerHTML = `
    <div style="text-align:center;padding:10px">
      <div style="font-size:40px;margin-bottom:10px">⚠️</div>
      <div style="color:var(--text2);margin-bottom:16px">This will delete ALL progress. Cannot be undone!</div>
      <div style="display:flex;gap:10px;justify-content:center">
        <button class="btn" style="border-color:#ef5350;color:#ef5350" onclick="wipeData()">Yes, reset everything</button>
        <button class="btn gold" onclick="closeModal()">Cancel</button>
      </div>
    </div>
  `;
  openModal();
}

function wipeData() { localStorage.removeItem(SAVE_KEY); closeModal(); location.reload(); }

// ============================================================
// TRASH ITEM
// ============================================================

function trashItem(itemId) {
  const item = ITEMS.concat(EPIC_ITEMS).find(i=>i.id===itemId);
  if(!item) return;
  const count = gameState.inventory[itemId] || 0;
  if(count <= 0) return;
  document.getElementById('modal-title').textContent = `🗑️ ${item.name}`;
  document.getElementById('modal-content').innerHTML = `
    <div style="text-align:center;padding:10px">
      <div style="font-size:50px;margin-bottom:10px">${item.emoji}</div>
      <div style="color:var(--text2);margin-bottom:8px">${item.desc}</div>
      <div style="margin-bottom:14px">You have ×${count}.</div>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
        ${!(['rare_candy','max_candy','sss_candy'].includes(itemId)) ? `<button class="btn" style="border-color:#00c853;color:#69f0ae" onclick="closeModal();openTradeForItem('${itemId}')">🔄 Trade</button>` : ''}
        <button class="btn" style="border-color:#ef5350;color:#ef5350" onclick="doTrashItem('${itemId}',1)">🗑️ Trash ×1</button>
        ${count>1?`<button class="btn" style="border-color:#ef5350;color:#ef5350" onclick="doTrashItem('${itemId}',${count})">🗑️ Trash all ×${count}</button>`:''}
        <button class="btn gold" onclick="closeModal()">Cancel</button>
      </div>
    </div>
  `;
  openModal();
}

function doTrashItem(itemId, amount) {
  const item = ITEMS.find(i=>i.id===itemId);
  gameState.inventory[itemId] = Math.max(0, (gameState.inventory[itemId]||0) - amount);
  toast(`🗑️ Trashed ×${amount} ${item?.name}`);
  closeModal();
  renderItems();
}

// ============================================================
// DIAMOND ROAD
// ============================================================

const ROAD_FLOORS = [
  {name:'Stardust Path',   minFloor:0, scaleMult:1.0, winsNeeded:40,  bonusGems:5,   goldBonus:200,  minLevel:15,  fixedEnemyLevel:20},
  {name:'Nebula Trail',    minFloor:1, scaleMult:1.3, winsNeeded:60,  bonusGems:10,  goldBonus:400,  minLevel:30,  fixedEnemyLevel:40},
  {name:'Cosmic Corridor', minFloor:2, scaleMult:1.7, winsNeeded:80,  bonusGems:18,  goldBonus:800,  minLevel:60,  fixedEnemyLevel:75,  gemsPerFive:1},
  {name:'Void Passage',    minFloor:3, scaleMult:2.2, winsNeeded:100, bonusGems:28,  goldBonus:1500, minLevel:100, fixedEnemyLevel:120, gemsPerFive:1},
  {name:'Astral Summit',   minFloor:4, scaleMult:3.0, winsNeeded:150, bonusGems:50,  goldBonus:3000, minLevel:150, fixedEnemyLevel:180, gemsPerThree:1},
  {name:'Celestial Apex',  minFloor:5, scaleMult:4.5, winsNeeded:200, bonusGems:100, goldBonus:8000, minLevel:200, fixedEnemyLevel:250, gemsPerThree:1},
];

function getAvgTeamLevel() {
  if(gameState.team.length === 0) return 5;
  return Math.floor(gameState.team.reduce((s,p)=>s+p.level,0)/gameState.team.length);
}

function renderRoadUI() {
  const el = document.getElementById('road-ui');
  const avgLvl = getAvgTeamLevel();
  const road = gameState.road;

  let html = `<div class="road-header">💎 DIAMOND ROAD 💎</div>
    <div style="font-size:13px;color:var(--text2);text-align:center;margin-bottom:4px">Your avg level: <span style="color:var(--gold)">Lv.${avgLvl}</span></div>
    <div style="font-size:12px;color:var(--accent);text-align:center;margin-bottom:10px">Enemies scale to <span style="color:var(--gold)">Lv.${Math.min(270, avgLvl + 10)}</span> (avg +10)</div>`;

  if(road.active && road.mode === 'floor') {
    const floor = ROAD_FLOORS[road.floor];
    const pct = Math.floor((road.winsOnFloor / floor.winsNeeded)*100);
    const gemMult = isGemBoostActive() ? GEM_BOOST_EVENT.multiplier : 1;
    const gemLabel = gemMult > 1 ? `💎×${gemMult}` : '💎';
    const nextGemIn = floor.gemsPerThree ? `${gemLabel} every 3 wins` : floor.gemsPerFive ? `${gemLabel} every 5 wins` : `${gemLabel} every 10 wins`;
    html += `
      <div class="road-floor-card active-floor">
        <div class="road-floor-title">▶ ${floor.name}</div>
        <div class="road-floor-lvl">Enemy Lv.~${Math.min(270, avgLvl + 10)} · ${nextGemIn}</div>
        <div class="road-floor-reward">${floor.bonusGems * (isGemBoostActive() ? GEM_BOOST_EVENT.multiplier : 1)} 💎 on clear${isGemBoostActive() ? ' [' + GEM_BOOST_EVENT.multiplier + '×]' : ''} · +${floor.goldBonus}💰/win</div>
        <div class="road-progress-bar"><div class="road-progress-fill" style="width:${pct}%"></div></div>
        <div style="font-size:13px;color:var(--text2);margin-top:3px">${road.winsOnFloor}/${floor.winsNeeded} wins</div>
      </div>
      <button class="btn" style="width:100%;border-color:#ef5350;color:#ef5350;margin-bottom:12px" onclick="exitRoad()">🚪 Exit Road</button>`;
  } else if(road.active && road.mode === 'farm') {
    const reg = REGIONS[road.farmRegionIdx || 0];
    html += `
      <div class="road-floor-card active-floor" style="border-color:#66bb6a">
        <div class="road-floor-title" style="color:#66bb6a">🌾 FARMING: ${reg.name}</div>
        <div class="road-floor-reward" style="color:#a5d6a7">EXP &amp; Gold grind</div>
      </div>
      <button class="btn" style="width:100%;border-color:#ef5350;color:#ef5350;margin-bottom:12px" onclick="exitRoad()">🚪 Stop Farming</button>`;
  } else {
    html += `<div style="font-family:'Press Start 2P';font-size:7px;color:var(--text2);margin-bottom:6px;text-align:center">DIAMOND ROAD FLOORS</div>`;
    ROAD_FLOORS.forEach((floor, idx) => {
      const gemMult = isGemBoostActive() ? GEM_BOOST_EVENT.multiplier : 1;
      const rateBase = floor.gemsPerThree ? `${gemMult}/3 wins` : floor.gemsPerFive ? `${gemMult}/5 wins` : `${gemMult}/10 wins`;
      const rate = `💎 ${rateBase}${gemMult > 1 ? ' [' + gemMult + '×]' : ''}`;
      const locked = avgLvl < floor.minLevel;
      html += `<div class="road-floor-card ${locked ? '' : ''}" ${locked ? '' : `onclick="enterRoad(${idx})"`} style="${locked ? 'opacity:0.5;cursor:not-allowed' : ''}">
        <div class="road-floor-title">${locked ? '🔒 ' : ''}${floor.name}</div>
        <div class="road-floor-lvl">${floor.winsNeeded} wins to clear${locked ? ` · Need avg Lv.${floor.minLevel}` : ''}</div>
        <div class="road-floor-reward">${rate} · ${floor.bonusGems * (isGemBoostActive() ? GEM_BOOST_EVENT.multiplier : 1)}💎 on clear${isGemBoostActive() ? ' [' + GEM_BOOST_EVENT.multiplier + '×]' : ''} · +${floor.goldBonus}💰/win</div>
      </div>`;
    });

    const unlockedRegions = REGIONS.filter(r => gameState.wave >= r.minWave);
    if(unlockedRegions.length > 0) {
      html += `<div style="font-family:'Press Start 2P';font-size:7px;color:#66bb6a;margin:12px 0 6px;text-align:center">🌾 FARM ROUTES</div>`;
      unlockedRegions.forEach((reg) => {
        const regIdx = REGIONS.indexOf(reg);
        html += `<div class="road-floor-card" onclick="enterFarmRoute(${regIdx})" style="border-color:#2e7d32">
          <div class="road-floor-title" style="color:#66bb6a">🌾 ${reg.name}</div>
          <div class="road-floor-lvl">Scales with your team · Gold &amp; EXP</div>
        </div>`;
      });
    }

    html += `
      <div style="font-family:'Press Start 2P';font-size:6px;color:#ffd700;margin:12px 0 4px;text-align:center">🏔️ VICTORY ROAD</div>
      <div class="victory-road-card" onclick="startVictoryRoad()">
        <div class="vr-title">⛰️ VICTORY ROAD — Lv.265</div>
        <div class="vr-subtitle">Garchomp · Excadrill · Hydreigon · Volcarona · more</div>
        <div class="vr-reward">~30% capture · Shiny 1/50 · Infinite fights</div>
        <button class="btn" style="border-color:#ffd700;color:#ffd700;width:100%;margin-top:8px">⚔️ CHALLENGE (80💎)</button>
      </div>
      <div class="victory-road-card" onclick="startMegaClash()" style="border-color:#00e676;background:linear-gradient(135deg,rgba(0,40,20,0.85),rgba(0,15,8,0.6));box-shadow:0 0 18px rgba(0,230,118,0.15)">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
          <div class="vr-title" style="color:#00e676;margin:0">⚡ MEGA CLASH — Lv.270</div>
          <div style="font-family:'Press Start 2P';font-size:5px;color:#00e676;background:rgba(0,230,118,0.15);border:1px solid rgba(0,230,118,0.5);border-radius:3px;padding:2px 5px">NEW</div>
        </div>
        <div class="vr-subtitle" style="color:#a5d6a7">Mega Sceptile · Mega Swampert · Mega Blaziken<br>Mega Gengar · Mega Aggron · Mega Garchomp</div>
        <div class="vr-reward" style="color:#69f0ae">~30% capture · 1% Mega Stone drop (random) · 125💎</div>
        <button class="btn" style="border-color:#00e676;color:#00e676;width:100%;margin-top:8px">⚡ CHALLENGE (125💎)</button>
      </div>
      <div class="road-floor-card" style="border-color:#ff6d00;background:linear-gradient(135deg,rgba(80,20,0,0.6),rgba(30,5,0,0.4))">
        <div class="road-floor-title" style="color:#ff9e40">🐉 TITAN RAYQUAZA Lv.270</div>
        <div class="road-floor-reward" style="color:#ffd700">Capture it! · Shiny 1/25 · 1% ☄️ Meteorite · Cost: 💎150</div>
        <button class="btn" style="border-color:#ff6d00;color:#ff9e40;width:100%;margin-top:8px" onclick="startEventBoss()">⚔️ CHALLENGE THE TITAN</button>
      </div>
      <div class="road-floor-card" style="border-color:#9c27b0;background:linear-gradient(135deg,rgba(50,0,80,0.8),rgba(20,0,40,0.6))">
        <div class="road-floor-title" style="color:#ce93d8">👻 GIRATINA Lv.270</div>
        <div class="road-floor-reward" style="color:#ba68c8">The Renegade Pokémon · Shiny 1/20 · 1% 🔮 Origin Orb · Cost: 💎250</div>
        <button class="btn" style="border-color:#9c27b0;color:#ce93d8;width:100%;margin-top:8px" onclick="startGiratinaBoss()">⚔️ ENTER THE DISTORTION WORLD</button>
      </div>
      <div class="road-floor-card" style="border-color:#4dd0e1;background:linear-gradient(135deg,rgba(0,40,60,0.9),rgba(0,15,30,0.7))">
        <div class="road-floor-title" style="color:#80deea">🐲 KYUREM Lv.270</div>
        <div class="road-floor-reward" style="color:#80deea">The Boundary Pokémon · Shiny 1/20 · 1% 🧬 DNA Splicer · Cost: 💎350</div>
        <button class="btn" style="border-color:#4dd0e1;color:#80deea;width:100%;margin-top:8px" onclick="startKyuremBoss()">⚔️ FACE THE BOUNDARY</button>
      </div>
      <div class="road-floor-card" style="border-color:#69f0ae;background:linear-gradient(135deg,rgba(0,40,20,0.9),rgba(0,15,8,0.7))">
        <div class="road-floor-title" style="color:#b9f6ca">🐍 ZYGARDE Lv.270</div>
        <div class="road-floor-reward" style="color:#69f0ae">The Order Pokémon · Catch it! · Reward: 1–5 🟢 Zygarde Cells · Cost: 💎400</div>
        <div style="font-size:12px;color:#aaa;margin-top:3px">Collect cells to evolve: <span style="color:#69f0ae">10→10% · 50→50% · 100→Perfected (SSS)</span></div>
        <button class="btn" style="border-color:#69f0ae;color:#b9f6ca;width:100%;margin-top:8px" onclick="startZygardeBoss()">⚔️ CHALLENGE THE ORDER</button>
      </div>`;
    // Sword & Shield boss card — permanent
    if(isSwordShieldEventActive()) {
      html += `<div class="road-floor-card" style="border-color:#e8c542;background:linear-gradient(135deg,rgba(60,45,0,0.9),rgba(25,15,0,0.8))">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:4px">
          <div class="road-floor-title" style="color:#ffd700;margin-bottom:0">🌋🌊 ANCIENT TITANS Lv.270</div>
          <div style="font-family:'Press Start 2P';font-size:5px;color:#ffd700;white-space:nowrap;padding-top:2px;flex-shrink:0">🌋 PERMANENT</div>
        </div>
        <div class="road-floor-reward" style="color:#e8c542">50/50: Groudon or Kyogre · Shiny 1/20 · 1% 🔴 Red Orb (Groudon) / 🔵 Blue Orb (Kyogre) → PRIMAL form · SSS stats! · Cost: 💎400</div>
        <div style="font-size:12px;color:#aaa;margin-top:3px">Equip Red Orb on Groudon → <span style="color:#ef9a9a">Primal Groudon!</span> · Equip Blue Orb on Kyogre → <span style="color:#81d4fa">Primal Kyogre!</span></div>
        <button class="btn" style="border-color:#e8c542;color:#ffd700;width:100%;margin-top:8px" onclick="startGroudonKyogreBoss()">⚔️ CHALLENGE THE TITANS (400💎)</button>
      </div>`;
    }
        // Event boss card (only if an event is active)
    const activeEv = getActiveEventBoss();
    if(activeEv) {
      const evEnd = new Date(activeEv.endDate).getTime();
      const evNow = Date.now();
      const evMs = Math.max(0, evEnd - evNow);
      const evDays = Math.floor(evMs / 86400000);
      const evHrs  = Math.floor((evMs % 86400000) / 3600000);
      const evMins = Math.floor((evMs % 3600000) / 60000);
      const timerStr = evMs <= 0 ? 'ENDED' : (evDays > 0 ? `${evDays}d ${evHrs}h ${evMins}m` : `${evHrs}h ${evMins}m`);
      html += `<div class="road-floor-card" style="border-color:${activeEv.borderColor};background:linear-gradient(135deg,rgba(0,20,40,0.9),rgba(0,8,18,0.7))">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:4px">
          <div class="road-floor-title" style="color:${activeEv.color};margin-bottom:0">⭐ ${activeEv.name} Lv.${activeEv.level}</div>
          <div style="font-family:'Press Start 2P';font-size:5px;background:linear-gradient(90deg,#ffd700,#ff9e40);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 1.5s linear infinite;background-size:200%;white-space:nowrap;padding-top:2px;flex-shrink:0">⭐ LIMITED</div>
        </div>
        <div class="road-floor-reward" style="color:${activeEv.badgeColor}">${activeEv.badgeText} · Shiny 1/30 · Can roll SSS naturally!</div>
        <div style="font-size:12px;color:#ff9e40;margin-top:3px">⏱ Ends in: <span style="color:#ffd700">${timerStr}</span> &nbsp;·&nbsp; Cost: ${activeEv.costLabel}</div>
        <button class="btn" style="border-color:${activeEv.borderColor};color:${activeEv.color};width:100%;margin-top:8px" onclick="startEventBossChallenge()">⚔️ CHALLENGE THE EVENT BOSS</button>
      </div>`;
    }
  }

  el.innerHTML = html;
}

function enterRoad(floorIdx) {
  const avgLvl = getAvgTeamLevel();
  const floor = ROAD_FLOORS[floorIdx];
  if(avgLvl < floor.minLevel) { toast(`Need avg Lv.${floor.minLevel}!`, 3000); return; }
  gameState.road.active = true;
  gameState.road.mode = 'floor';
  gameState.road.floor = floorIdx;
  gameState.road.winsOnFloor = 0;
  gameState.road.winsNeeded = floor.winsNeeded;
  document.getElementById('arena').classList.add('road-mode');
  addLog(`💎 Entered ${floor.name}!`, 'log-evolve');
  toast(`💎 Diamond Road: ${floor.name}!`, 3000);
  spawnRoadEnemy();
  updateRoadProgressHUD();
  renderRoadUI();
  switchTab('team');
}

function enterFarmRoute(regionIdx) {
  const reg = REGIONS[regionIdx];
  if(gameState.wave < reg.minWave) { toast(`Haven't reached ${reg.name} yet!`, 3000); return; }
  gameState.road.active = true;
  gameState.road.mode = 'farm';
  gameState.road.farmRegionIdx = regionIdx;
  document.getElementById('arena').classList.add('road-mode');
  addLog(`🌾 Farming ${reg.name}!`, 'log-heal');
  toast(`🌾 Farming ${reg.name}!`, 2500);
  spawnFarmEnemy();
  renderRoadUI();
  switchTab('team');
}

async function spawnFarmEnemy() {
  if(bossStarting || bossBattleActive || giratinaBattleActive || kyuremBattleActive || zygardeBattleActive || swordShieldBattleActive || eventBossBattleActive) return;
  if(!gameState.road.active || gameState.road.mode !== 'farm') return;
  const regIdx = gameState.road.farmRegionIdx || 0;
  const reg = REGIONS[regIdx];
  const avgLvl = getAvgTeamLevel();
  const targetLvl = Math.max(1, avgLvl - 3);
  const lvl = Math.max(1, targetLvl + Math.floor((Math.random()-0.5)*4));
  const pool = reg.pool;
  const chosen = pool[Math.floor(Math.random()*pool.length)];
  const isShiny = Math.random() < 1/512;
  const enemy = newPokemonEntry(chosen.id, chosen.name, chosen.types, lvl, isShiny, true);
  enemy.stats = await fetchPokemonStats(chosen.id);
  enemy.statsLoaded = true;
  enemy.currentHp = getMaxHp(enemy);
  currentEnemy = enemy;
  const flash = document.getElementById('encounter-flash');
  flash.style.transition = 'opacity 0.05s';
  flash.style.opacity = '0.5';
  setTimeout(()=>{ flash.style.transition = 'opacity 1.2s'; flash.style.opacity = '0'; }, 120);
  updateEnemyUI();
  if(isShiny) addLog(`✨ Farm SHINY ${chosen.name}! (Lv.${lvl})`, 'log-shiny');
  else addLog(`🌾 ${chosen.name} (Lv.${lvl}) appeared!`);
}

function exitRoad() {
  gameState.road.active = false;
  gameState.road.mode = null;
  document.getElementById('arena').classList.remove('road-mode');
  addLog('Returned to normal battles.', 'log-heal');
  toast('Returned to normal battles.');
  currentEnemy = null;
  updateRoadProgressHUD();
  setTimeout(spawnEnemy, 800);
  renderRoadUI();
  switchTab('team');
}

function updateRoadProgressHUD() {
  const hud = document.getElementById('road-battle-hud');
  if (!hud) return;
  const road = gameState.road;
  if (!road.active || road.mode !== 'floor') { hud.classList.remove('visible'); return; }
  const floor = ROAD_FLOORS[road.floor];
  if (!floor) { hud.classList.remove('visible'); return; }
  const cur = road.winsOnFloor;
  const max = floor.winsNeeded;
  const pct = Math.min(100, Math.round((cur / max) * 100));
  let nextGemAt;
  if (floor.gemsPerThree) nextGemAt = Math.ceil((cur + 1) / 3) * 3;
  else if (floor.gemsPerFive) nextGemAt = Math.ceil((cur + 1) / 5) * 5;
  else nextGemAt = Math.ceil((cur + 1) / 10) * 10;
  const winsToGem = Math.min(nextGemAt, max) - cur;
  let rewardText;
  if (cur >= max) {
    const _bm = isGemBoostActive() ? GEM_BOOST_EVENT.multiplier : 1;
    const _bt = _bm > 1 ? ' [' + _bm + '×]' : '';
    const _gemIcon = _bm > 1 ? '💎×' + _bm : '💎';
    rewardText = '✅ CLEARED! +' + (floor.bonusGems * _bm) + ' 💎' + _bt;
  } else if (winsToGem <= 0) {
    const _bm = isGemBoostActive() ? GEM_BOOST_EVENT.multiplier : 1;
    const _bt = _bm > 1 ? ' [' + _bm + '×]' : '';
    const _gemIcon = _bm > 1 ? '💎×' + _bm : '💎';
    rewardText = _gemIcon + ' next win! · +' + (floor.bonusGems * _bm) + '💎 on clear' + _bt;
  } else {
    const _bm = isGemBoostActive() ? GEM_BOOST_EVENT.multiplier : 1;
    const _bt = _bm > 1 ? ' [' + _bm + '×]' : '';
    const _gemIcon = _bm > 1 ? '💎×' + _bm : '💎';
    rewardText = _gemIcon + ' in ' + winsToGem + ' win' + (winsToGem === 1 ? '' : 's') + ' · +' + (floor.bonusGems * _bm) + '💎 on clear' + _bt;
  }
  document.getElementById('road-hud-title').textContent = '💎 ' + floor.name;
  document.getElementById('road-hud-cur').textContent = cur;
  document.getElementById('road-hud-max').textContent = max;
  document.getElementById('road-hud-fill').style.width = pct + '%';
  document.getElementById('road-hud-reward').textContent = rewardText;
  hud.classList.add('visible');
}

async function spawnRoadEnemy() {
  if(bossStarting || bossBattleActive || giratinaBattleActive || kyuremBattleActive || zygardeBattleActive || swordShieldBattleActive || eventBossBattleActive) return;
  if(!gameState.road.active) return;
  const avgLvl = getAvgTeamLevel();
  const isBossSpawn = Math.random() < 0.05;

  if(isBossSpawn) {
    const DIAMOND_BOSSES = [
      {id:384,name:'Rayquaza',types:['dragon','flying']},
      {id:249,name:'Lugia',types:['psychic','flying']},
      {id:250,name:'Ho-Oh',types:['fire','flying']},
      {id:382,name:'Kyogre',types:['water']},
      {id:383,name:'Groudon',types:['ground']},
    ];
    const bossTemplate = DIAMOND_BOSSES[Math.floor(Math.random()*DIAMOND_BOSSES.length)];
    const bossStats = await fetchPokemonStats(bossTemplate.id);
    const boss = newPokemonEntry(bossTemplate.id, bossTemplate.name, bossTemplate.types, 270, false, true);
    boss.stats = bossStats;
    boss.statsLoaded = true;
    boss.currentHp = getMaxHp(boss);
    boss._roadBoss = true;
    currentEnemy = boss;
    const flash = document.getElementById('encounter-flash');
    flash.style.transition = 'opacity 0.05s';
    flash.style.opacity = '1';
    setTimeout(()=>{ flash.style.transition = 'opacity 1.2s'; flash.style.opacity = '0'; }, 120);
    updateEnemyUI();
    addLog(`🐉 DIAMOND BOSS: ${bossTemplate.name} Lv.270!`, 'log-evolve');
    toast(`⚠️ BOSS SPAWN: ${bossTemplate.name} Lv.270!`, 3000);
    return;
  }

  const targetLvl = Math.min(270, avgLvl + 10);
  const lvl = Math.max(1, targetLvl + Math.floor((Math.random()-0.5)*6));
  const pool = GACHA_POOL;
  const chosen = pool[Math.floor(Math.random()*pool.length)];
  const isShiny = Math.random() < 1/512;
  const enemy = newPokemonEntry(chosen.id, chosen.name, chosen.types, lvl, isShiny, true);
  enemy.stats = await fetchPokemonStats(chosen.id);
  enemy.statsLoaded = true;
  enemy.currentHp = getMaxHp(enemy);
  currentEnemy = enemy;
  const flash = document.getElementById('encounter-flash');
  flash.style.transition = 'opacity 0.05s';
  flash.style.opacity = '0.8';
  setTimeout(()=>{ flash.style.transition = 'opacity 1.2s'; flash.style.opacity = '0'; }, 120);
  updateEnemyUI();
  if(isShiny) addLog(`✨ Road SHINY ${chosen.name}! (Lv.${lvl})`, 'log-shiny');
  else addLog(`💎 Road: ${chosen.name} (Lv.${lvl}) appeared!`);
}

// ============================================================
// DEBUG STAT MANIPULATOR
// ============================================================

function loadDebugStatRows(pokemon) {
  const rowsContainer = document.getElementById('dbg-stat-rows');
  const infoEl = document.getElementById('dbg-stat-info');
  
  if (!pokemon || !pokemon.ivs) {
    rowsContainer.innerHTML = '<div style="color:#8888bb;text-align:center">No Pokémon selected or IVs not loaded</div>';
    infoEl.textContent = 'Select a Pokémon first';
    return;
  }

  const statNames = {
    'hp': 'HP',
    'attack': 'Attack',
    'defense': 'Defense',
    'special-attack': 'Sp.Atk',
    'special-defense': 'Sp.Def',
    'speed': 'Speed'
  };

  infoEl.innerHTML = `Editing IVs for <span style="color:${pokemon.isShiny ? '#ff69b4' : '#ffd700'}">${pokemon.name}</span> (Lv.${pokemon.level})`;

  let html = '';
  for (const [statKey, statLabel] of Object.entries(statNames)) {
    const currentIV = pokemon.ivs[statKey] || 0;
    const grade = getStatGrade(currentIV);
    const gradeColor = grade.isSS ? '#ff69b4' : grade.color;
    
    html += `
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="width:70px;font-size:14px;color:var(--text2)">${statLabel}</div>
        <div style="flex:1;display:flex;align-items:center;gap:4px;">
          <input type="range" id="iv-${statKey}" min="0" max="31" value="${currentIV}" 
                 style="flex:1;height:6px;background:rgba(255,255,255,0.1);border-radius:3px;
                        accent-color:${gradeColor}" 
                 oninput="document.getElementById('iv-val-${statKey}').textContent = this.value">
          <span id="iv-val-${statKey}" style="min-width:40px;text-align:center;color:${gradeColor};font-weight:bold">${currentIV}</span>
          <span style="font-family:'Press Start 2P';font-size:7px;min-width:22px;color:${gradeColor}">${grade.label}</span>
        </div>
      </div>
    `;
  }

  // Add total IV and average display
  const totalIV = Object.values(pokemon.ivs).reduce((a, b) => a + b, 0);
  const avgIV = Math.round(totalIV / 6);
  const avgGrade = getStatGrade(avgIV);
  
  html += `
    <div style="margin-top:12px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.1)">
      <div style="display:flex;justify-content:space-between;font-size:14px">
        <span style="color:var(--text2)">Total IV:</span>
        <span style="color:${avgGrade.isSS ? '#ff69b4' : avgGrade.color}">${totalIV}/186 (${Math.round(totalIV/186*100)}%)</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:14px;margin-top:4px">
        <span style="color:var(--text2)">Average:</span>
        <span style="color:${avgGrade.isSS ? '#ff69b4' : avgGrade.color}">${avgIV} (Grade ${avgGrade.label})</span>
      </div>
    </div>
  `;

  rowsContainer.innerHTML = html;
}

function debugSetAllIVs(value) {
  const fighter = getCurrentFighter();
  if (!fighter || !fighter.ivs) return;
  
  for (const key in fighter.ivs) {
    fighter.ivs[key] = value;
  }
  
  // Update HP based on new IVs
  if (fighter.statsLoaded) {
    fighter.currentHp = getMaxHp(fighter);
  }
  
  loadDebugStatRows(fighter);
  toast(`✨ All IVs set to ${value}!`, 2000);
}

function debugRandomizeIVs() {
  const fighter = getCurrentFighter();
  if (!fighter || !fighter.ivs) return;
  
  fighter.ivs = generateIVs();
  
  // Update HP based on new IVs
  if (fighter.statsLoaded) {
    fighter.currentHp = getMaxHp(fighter);
  }
  
  loadDebugStatRows(fighter);
  toast('🎲 IVs randomized!', 2000);
}

function debugApplyStats() {
  const fighter = getCurrentFighter();
  if (!fighter || !fighter.ivs) return;
  
  // Update all IVs from the range sliders
  const statKeys = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
  
  for (const key of statKeys) {
    const slider = document.getElementById(`iv-${key}`);
    if (slider) {
      fighter.ivs[key] = parseInt(slider.value, 10);
    }
  }
  
  // Update HP based on new IVs
  if (fighter.statsLoaded) {
    fighter.currentHp = getMaxHp(fighter);
  }
  
  // Check if this made the Pokemon Cosmic
  if (isCosmic(fighter)) {
    toast(`🌌 ${fighter.name} is now COSMIC!`, 3000);
    addLog(`🌌 ${fighter.name} radiates COSMIC energy!`, 'log-cosmic');
  }
  
  renderAll();
  loadDebugStatRows(fighter);
  toast('✅ IV changes applied!', 2000);
}

// ============================================================
// MULTI-SAVE SYSTEM
// ============================================================

const MULTI_SAVE_KEY = 'pkm_idle_saves';
const MAX_SAVES = 5;
let activeSlotIdx = null; // which slot the current game was loaded from / last saved to

function getAllSaves() {
  try { return JSON.parse(localStorage.getItem(MULTI_SAVE_KEY) || '[]'); }
  catch(e) { return []; }
}

function setAllSaves(saves) {
  localStorage.setItem(MULTI_SAVE_KEY, JSON.stringify(saves));
}

function buildSaveData(slotName) {
  return {
    name: slotName,
    savedAt: Date.now(),
    gold: gameState.gold, gems: gameState.gems, wins: gameState.wins, wave: gameState.wave,
    inventory: gameState.inventory, equippedItems: gameState.equippedItems,
    dailyClaimed: gameState.dailyClaimed, lastDaily: gameState.lastDaily,
    road: gameState.road, pUid, trainerName: gameState.trainerName,
    box: gameState.box.map(p=>({
      uid:p.uid, id:p.id, name:p.name, types:p.types, level:p.level,
      isShiny:p.isShiny, currentHp:p.currentHp, exp:p.exp, expToNext:p.expToNext,
      stats:p.stats, statsLoaded:p.statsLoaded, ivs:p.ivs, ot:p.ot,
      _fusedWith:p._fusedWith||null, _fusedUid:p._fusedUid||null, _isFusedInto:p._isFusedInto||null,
      _naturalSSS:p._naturalSSS||false, _noEvolve:p._noEvolve||false, _customSprite:p._customSprite||null,
      _sssUsed:p._sssUsed||false, _sssStat:p._sssStat||null, _noMega:p._noMega||false, _isBossCode:p._isBossCode||false, _isEnvy:p._isEnvy||false,
      _zygardeForm:p._zygardeForm||null, _isHeroGreninja:p._isHeroGreninja||false,
      _deoxysForm:p._deoxysForm||null, _isDeoxys:p._isDeoxys||false,
      _attackMode:p._attackMode||'physical'
    })),
    teamUids: gameState.team.map(p=>p.uid),
    currentFighterIdx: gameState.currentFighterIdx,
    lockedPokemon: gameState.lockedPokemon || [],
    megaStoneInstances: gameState.megaStoneInstances || {},
    breedingSlots: gameState.breedingSlots || [],
  };
}

function openSavesOverlay() {
  renderSaveSlots();
  document.getElementById('saves-overlay').classList.add('active');
}

function closeSavesOverlay() {
  document.getElementById('saves-overlay').classList.remove('active');
}

function renderSaveSlots() {
  const saves = getAllSaves();
  const list = document.getElementById('saves-list');
  let html = '';

  // Header with trainer name + new game button
  html += `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:6px">
    <div style="font-size:13px;color:var(--text2)">
      Trainer: <span style="color:var(--gold)">${gameState.trainerName}</span>
      <button onclick="changeTrainerName()" style="background:rgba(255,255,255,0.05);border:1px solid var(--border);color:var(--text2);padding:2px 8px;border-radius:4px;cursor:pointer;margin-left:6px;font-family:'VT323',monospace;font-size:14px">✏️ Rename</button>
    </div>
    <button onclick="startFreshGame()" style="background:linear-gradient(135deg,rgba(239,83,80,0.2),rgba(239,83,80,0.05));border:1px solid #ef5350;color:#ef5350;padding:5px 12px;border-radius:6px;cursor:pointer;font-family:'VT323',monospace;font-size:15px;letter-spacing:1px">🌱 NEW GAME</button>
  </div>`;

  for(let i = 0; i < MAX_SAVES; i++) {
    const s = saves[i];
    if(s) {
      const date = new Date(s.savedAt);
      const dateStr = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      const teamUids = s.teamUids || [];
      const teamPokemon = teamUids.map(uid => (s.box||[]).find(p=>p.uid===uid)).filter(Boolean);
      const teamImgs = teamPokemon.map(p => 
        `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.isShiny?'shiny/':''}${p.id}.png" title="${p.name} Lv.${p.level}${p.isShiny?' ★':''}">`
      ).join('');
      const isActiveSlot = (activeSlotIdx === i);
      html += `<div class="save-slot-card" style="${isActiveSlot ? 'border-color:#66bb6a;box-shadow:0 0 12px rgba(102,187,106,0.35);' : ''}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <div style="font-family:'Press Start 2P';font-size:8px;color:var(--gold)">${s.name}${isActiveSlot ? ' <span style="color:#66bb6a;font-size:7px">▶ ACTIVE</span>' : ''}</div>
            <div style="font-size:13px;color:var(--text2);margin-top:3px">OT: ${s.trainerName||'Trainer'} · Avg Lv.${s.box?Math.round(s.box.reduce((a,p)=>a+p.level,0)/Math.max(1,s.box.length)):1}</div>
            <div style="font-size:12px;color:var(--text2)">💰${formatNum(s.gold||0)} · 💎${s.gems||0} · 🏆${s.wins||0} · ${s.box?s.box.length:0} Pokémon</div>
            <div style="font-size:11px;color:#555">${dateStr}</div>
            <div class="save-mini-team">${teamImgs}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0">
            <button onclick="loadSaveSlot(${i})" style="background:rgba(79,195,247,0.15);border:1px solid var(--accent);color:var(--accent);padding:4px 10px;border-radius:6px;cursor:pointer;font-family:'VT323',monospace;font-size:15px">📂 Load</button>
            <button onclick="overwriteSaveSlot(${i})" style="background:rgba(102,187,106,0.15);border:1px solid var(--green);color:var(--green);padding:4px 10px;border-radius:6px;cursor:pointer;font-family:'VT323',monospace;font-size:15px">💾 Save</button>
            <button onclick="deleteSaveSlot(${i})" style="background:rgba(239,83,80,0.1);border:1px solid var(--red);color:var(--red);padding:4px 10px;border-radius:6px;cursor:pointer;font-family:'VT323',monospace;font-size:15px">🗑 Del</button>
          </div>
        </div>
      </div>`;
    } else {
      html += `<div class="save-slot-card empty">
        <div style="text-align:center;padding:6px 0 2px;font-size:13px;color:var(--text2);margin-bottom:8px">Empty Slot ${i+1}</div>
        <div style="display:flex;gap:6px;justify-content:center">
          <button onclick="createNewSave(${i})" style="background:rgba(102,187,106,0.12);border:1px solid var(--green);color:var(--green);padding:5px 12px;border-radius:6px;cursor:pointer;font-family:'VT323',monospace;font-size:15px;flex:1">💾 Save Current</button>
          <button onclick="saveAndStartFresh(${i})" style="background:rgba(239,83,80,0.1);border:1px solid #ef5350;color:#ef5350;padding:5px 12px;border-radius:6px;cursor:pointer;font-family:'VT323',monospace;font-size:15px;flex:1">🌱 New Game Here</button>
        </div>
      </div>`;
    }
  }
  list.innerHTML = html;
}

function createNewSave(slotIdx) {
  const name = prompt('Name this save:', `Save ${slotIdx+1}`);
  if(!name) return;
  const saves = getAllSaves();
  saves[slotIdx] = buildSaveData(name.trim() || `Save ${slotIdx+1}`);
  setAllSaves(saves);
  activeSlotIdx = slotIdx;
  toast(`💾 Saved to slot: ${saves[slotIdx].name}`, 2500);
  renderSaveSlots();
}

function overwriteSaveSlot(slotIdx) {
  const saves = getAllSaves();
  const existing = saves[slotIdx];
  // Warn if this is not the slot the current session was loaded from
  if(activeSlotIdx !== null && activeSlotIdx !== slotIdx) {
    const activeName = saves[activeSlotIdx] ? saves[activeSlotIdx].name : `Slot ${activeSlotIdx+1}`;
    const targetName = existing ? existing.name : `Slot ${slotIdx+1}`;
    if(!confirm(`⚠️ You are currently playing "${activeName}" (Slot ${activeSlotIdx+1}).

Are you sure you want to OVERWRITE "${targetName}" (Slot ${slotIdx+1}) instead?

This cannot be undone!`)) return;
  }
  saves[slotIdx] = buildSaveData(existing ? existing.name : `Save ${slotIdx+1}`);
  setAllSaves(saves);
  activeSlotIdx = slotIdx;
  toast(`💾 Slot ${slotIdx+1} saved!`, 2000);
  renderSaveSlots();
}

function loadSaveSlot(slotIdx) {
  const saves = getAllSaves();
  const s = saves[slotIdx];
  if(!s) return;
  if(!confirm(`Load "${s.name}"? Current progress may be lost if unsaved.`)) return;
  try {
    // Stop all active battles first
    if(battleTimer) { clearInterval(battleTimer); battleTimer = null; }
    bossBattleActive = false; vrBattleActive = false; mcBattleActive = false; giratinaBattleActive = false; kyuremBattleActive = false; zygardeBattleActive = false; swordShieldBattleActive = false; eventBossBattleActive = false; bossStarting = false;
    currentEnemy = null; bossEnemy = null; vrEnemy = null; giratinaEnemy = null; kyuremEnemy = null; zygardeEnemy = null; eventBossEnemy = null;
    battlePaused = false;
    playerAttackCooldown = 0; enemyAttackCooldown = 0;
    document.getElementById('arena').classList.remove('road-mode');
    document.getElementById('arena').style.background = '';

    // Load all state
    gameState.gold = s.gold || 500;
    gameState.gems = s.gems || 15;
    gameState.wins = s.wins || 0;
    gameState.wave = s.wave || 1;
    gameState.inventory = s.inventory || {};
    gameState.equippedItems = s.equippedItems || {};
    gameState.dailyClaimed = s.dailyClaimed || false;
    gameState.lastDaily = s.lastDaily || 0;
    gameState.road = s.road || {active:false,floor:0,winsOnFloor:0,winsNeeded:20,mode:null,farmRegionIdx:0};
    if(!gameState.road.mode) gameState.road.mode = gameState.road.active ? 'floor' : null;
    gameState.trainerName = s.trainerName || 'Trainer';
    pUid = s.pUid || 0;
    gameState.box = (s.box || []).map(p => ({ ...p, statsLoaded: !!p.stats, ivs: p.ivs || generateIVs(), ot: p.ot || s.trainerName || 'Trainer' }));
    // Normalize: all player pokemon above 250 get capped to 250
    gameState.box.forEach(p => { if(p.level > 250) { p.level = 250; p.expToNext = calcExpToNext(250); p.exp = 0; } });
    gameState.team = (s.teamUids || []).map(uid => gameState.box.find(p=>p.uid===uid)).filter(Boolean);
    gameState.currentFighterIdx = Math.min(s.currentFighterIdx||0, Math.max(0,gameState.team.length-1));
    gameState.lockedPokemon = s.lockedPokemon || [];
    gameState.megaStoneInstances = s.megaStoneInstances || {};

    // Restore road mode visuals
    if(gameState.road.active) document.getElementById('arena').classList.add('road-mode');

    closeSavesOverlay();
    renderAll();

    // Restart battle with correct state
    if(gameState.road.active) {
      if(gameState.road.mode === 'farm') spawnFarmEnemy();
      else spawnRoadEnemy();
    } else {
      spawnEnemy();
    }
    startBattle();

    activeSlotIdx = slotIdx;
    toast(`✅ Loaded: ${s.name} (Wave ${gameState.wave})`, 3000);
  } catch(e) { console.warn(e); toast('❌ Failed to load save!', 3000); }
}

function deleteSaveSlot(slotIdx) {
  if(!confirm('Delete this save slot?')) return;
  const saves = getAllSaves();
  saves[slotIdx] = undefined;
  setAllSaves(saves.map(s=>s));
  renderSaveSlots();
  toast('🗑 Save deleted.', 2000);
}

function changeTrainerName() {
  const name = prompt('Enter trainer name:', gameState.trainerName);
  if(!name || !name.trim()) return;
  gameState.trainerName = name.trim().substring(0, 12);
  toast(`✏️ Trainer name: ${gameState.trainerName}`, 2000);
  renderSaveSlots();
}

function startFreshGame() {
  if(!confirm('Start a brand new game? Your current unsaved progress will be lost!\n\nTip: Save first using one of the slots before starting fresh.')) return;
  closeSavesOverlay();
  _resetGameState('Trainer');
}

function saveAndStartFresh(slotIdx) {
  const name = prompt('Enter trainer name for new game:', `Trainer`);
  if(name === null) return; // cancelled
  if(!confirm('Start a new game in this slot? Your current unsaved progress will be lost!')) return;
  closeSavesOverlay();
  _resetGameState(name.trim().substring(0, 12) || 'Trainer', slotIdx);
}

function _resetGameState(trainerName, targetSlotIdx) {
  // Stop battle
  if(battleTimer) { clearInterval(battleTimer); battleTimer = null; }
  bossBattleActive = false; vrBattleActive = false; mcBattleActive = false; giratinaBattleActive = false; kyuremBattleActive = false; zygardeBattleActive = false; swordShieldBattleActive = false; eventBossBattleActive = false; bossStarting = false;
  currentEnemy = null; bossEnemy = null; vrEnemy = null; giratinaEnemy = null; kyuremEnemy = null; zygardeEnemy = null; eventBossEnemy = null;
  battlePaused = false; pUid = 0;
  playerAttackCooldown = 0; enemyAttackCooldown = 0;

  // Reset state (don't touch localStorage — keep existing saves intact)
  gameState.gold = 500; gameState.gems = 15; gameState.wins = 0; gameState.wave = 1;
  gameState.autoBattle = true; gameState.team = []; gameState.box = [];
  gameState.inventory = {}; gameState.equippedItems = {};
  gameState.currentFighterIdx = 0; gameState.dailyClaimed = false; gameState.lastDaily = 0;
  gameState.road = { active: false, floor: 0, winsOnFloor: 0, winsNeeded: 30, mode: null, farmRegionIdx: 0 };
  gameState.trainerName = trainerName;

  // Reset arena
  document.getElementById('arena').classList.remove('road-mode');
  document.getElementById('arena').style.background = '';

  // Hide game, show starter screen
  document.getElementById('game').style.display = 'none';
  document.getElementById('starter-screen').style.display = 'flex';

  // Remember which slot to save into once starter is picked
  if(typeof targetSlotIdx === 'number') {
    window._newGameTargetSlot = targetSlotIdx;
  } else {
    // startFreshGame (no slot picked) — find first empty slot
    const saves = getAllSaves();
    const emptyIdx = saves.findIndex(s => !s);
    window._newGameTargetSlot = emptyIdx >= 0 ? emptyIdx : null;
  }

  showStarterPicker();

  toast(`🌱 New game! Welcome, ${trainerName}! Choose your starter!`, 4000);
}

// ============================================================
// BULK MAX CANDY PULL
// ============================================================

function doBulkMaxCandyPull() {
  const cost = 5000000;
  if(gameState.gold < cost) {
    toast(`Need 5,000,000 💰 Gold! (have ${formatNum(gameState.gold)})`, 3000);
    return;
  }
  document.getElementById('modal-title').textContent = '🍭 Max Candy Bundle';
  document.getElementById('modal-content').innerHTML = `
    <div style="text-align:center;padding:8px">
      <div style="font-size:48px;margin-bottom:8px">🍭🍭🍭</div>
      <div style="font-family:'Press Start 2P';font-size:8px;color:#ffb300;margin-bottom:8px">× 10 MAX CANDY</div>
      <div style="font-size:14px;color:var(--text2);margin-bottom:14px">Add 10 Max Candies to your bag.<br><span style="color:#69f0ae;font-size:13px">Works on any Pokémon up to Lv.250!</span></div>
      <div style="font-size:15px;color:var(--gold);margin-bottom:16px">Cost: 💰 5,000,000 Gold</div>
      <div style="display:flex;gap:10px">
        <button class="btn" style="flex:1;border-color:#ffb300;color:#ffb300" onclick="confirmBulkMaxCandy()">🍭 Confirm!</button>
        <button class="btn" style="flex:1" onclick="closeModal()">Cancel</button>
      </div>
    </div>
  `;
  openModal();
}

function confirmBulkMaxCandy() {
  const cost = 5000000;
  if(gameState.gold < cost) { toast('Not enough Gold!'); closeModal(); return; }
  gameState.gold -= cost;
  gameState.inventory['max_candy'] = (gameState.inventory['max_candy'] || 0) + 10;
  updateResourceUI();
  renderAll();
  closeModal();
  toast('🍭 × 10 Max Candy added to your bag!', 3500);
  addLog('🍭 Bought × 10 Max Candy bundle!', 'log-evolve');
}

// ============================================================
// GOLD SHINY PULL
// ============================================================

async function doGoldShinyPull() {
  const cost = 10000000;
  if(gameState.gold < cost) {
    toast(`Need 10,000,000 💰 Gold! (have ${formatNum(gameState.gold)})`, 3000);
    return;
  }
  gameState.gold -= cost;
  updateResourceUI();
  const chosen = pickFromPool(EPIC_GACHA_POOL);
  const level = Math.min(175, Math.max(1, Math.floor(gameState.wave * 0.3 + 5)));
  const pk = newPokemonEntry(chosen.id, chosen.name, chosen.types, level, true, true);
  pk.stats = await fetchPokemonStats(chosen.id);
  pk.statsLoaded = true;
  pk.currentHp = getMaxHp(pk);
  gameState.box.push(pk);
  if(isCosmic(pk)) checkAndAnnounceCosmic(pk);
  else { addLog(`💰 Gold Shiny! ✨ ${pk.name} obtained!`, 'log-shiny'); toast(`💰✨ GOLD SHINY: ${pk.name}!`, 4000); }
  renderAll();
  showGachaResult(pk);
}
