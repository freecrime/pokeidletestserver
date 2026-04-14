// ============================================================
// STARTER SCREEN
// ============================================================

function initStarterScreen() {
  const saves = getAllSaves().filter(Boolean);

  // If there are any named saves, show the slot picker (ignore any legacy auto-save)
  if(saves.length > 0) {
    showSavePicker();
    return;
  }

  // No named saves — check for a legacy auto-save to migrate
  const autoRaw = localStorage.getItem(SAVE_KEY);
  if(autoRaw) {
    try {
      const auto = JSON.parse(autoRaw);
      if(auto.box && auto.box.length > 0) {
        // Find the first free slot (up to MAX_SAVES)
        const allSlots = getAllSaves();
        let freeSlot = -1;
        for(let i = 0; i < MAX_SAVES; i++) {
          if(!allSlots[i]) { freeSlot = i; break; }
        }
        if(freeSlot !== -1) {
          // Migrate: load the auto-save into gameState then write it to the free slot
          loadGame(); // populates gameState from SAVE_KEY
          const slotName = (auto.trainerName || 'Trainer') + "'s Game";
          const allSlots2 = getAllSaves();
          allSlots2[freeSlot] = buildSaveData(slotName);
          setAllSaves(allSlots2);
          activeSlotIdx = freeSlot;
          localStorage.removeItem(SAVE_KEY); // clean up legacy key
          // Start the game directly — no need to show the picker
          document.getElementById('starter-screen').style.display = 'none';
          const game = document.getElementById('game');
          game.style.display = 'flex';
          game.style.flexDirection = 'column';
          if(gameState.road.active) document.getElementById('arena').classList.add('road-mode');
          renderAll();
          if(gameState.road.active) {
            if(gameState.road.mode === 'farm') spawnFarmEnemy();
            else spawnRoadEnemy();
          } else spawnEnemy();
          startBattle();
          toast('💾 Auto-save migrated to: ' + slotName, 3000);
          return;
        }
      }
    } catch(e) { console.warn('Auto-save migration failed:', e); }
  }

  // No saves at all — go straight to starter picker
  showStarterPicker();
}

function showSavePicker() {
  const screen = document.getElementById('starter-screen');
  screen.style.display = 'flex';
  screen.style.flexDirection = 'column';
  screen.style.alignItems = 'center';
  screen.style.justifyContent = 'center';
  document.getElementById('save-picker').style.display = 'block';
  document.getElementById('starter-picker').style.display = 'none';

  const saves = getAllSaves();
  const list = document.getElementById('save-picker-list');
  let html = '';
  // Named save slots
  for(let i = 0; i < MAX_SAVES; i++) {
    const s = saves[i];
    if(!s) continue;
    const teamUids = s.teamUids || [];
    const teamPokemon = teamUids.map(uid => (s.box||[]).find(p=>p.uid===uid)).filter(Boolean);
    const teamImgs = teamPokemon.map(p =>
      `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.isShiny?'shiny/':''}${p.id}.png" title="${p.name} Lv.${p.level}" style="width:36px;height:36px;image-rendering:pixelated">`
    ).join('');
    const date = new Date(s.savedAt);
    const dateStr = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    html += `<div class="save-slot-card" style="cursor:pointer" onclick="loadSaveSlotFromPicker(${i})">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-family:'Press Start 2P';font-size:8px;color:var(--gold)">${s.name}</div>
          <div style="font-size:13px;color:var(--text2);margin-top:3px">OT: ${s.trainerName||'Trainer'} · Wave ${s.wave||1} · ${s.box?s.box.length:0} Pokémon</div>
          <div style="font-size:12px;color:var(--text2)">💰${formatNum(s.gold||0)} · 💎${s.gems||0} · 🏆${s.wins||0}</div>
          <div style="font-size:11px;color:#555;margin-bottom:4px">${dateStr}</div>
          <div class="save-mini-team" style="margin-top:2px">${teamImgs}</div>
        </div>
        <div style="font-family:'Press Start 2P';font-size:9px;color:var(--gold);padding:8px">▶ PLAY</div>
      </div>
    </div>`;
  }

  if(!html) {
    // No saves found at all — skip to starter
    showStarterPicker();
    return;
  }

  list.innerHTML = html;
}

// loadAutoSaveAndPlay removed — all saves now go through named slots

function loadSaveSlotFromPicker(slotIdx) {
  const saves = getAllSaves();
  const s = saves[slotIdx];
  if(!s) return;
  try {
    if(battleTimer) { clearInterval(battleTimer); battleTimer = null; }
    bossBattleActive = false; vrBattleActive = false; mcBattleActive = false; giratinaBattleActive = false; kyuremBattleActive = false; zygardeBattleActive = false; swordShieldBattleActive = false; eventBossBattleActive = false; bossStarting = false;
    currentEnemy = null; bossEnemy = null; vrEnemy = null; giratinaEnemy = null; kyuremEnemy = null; zygardeEnemy = null; eventBossEnemy = null;
    battlePaused = false;
    playerAttackCooldown = 0; enemyAttackCooldown = 0;

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
    gameState.box = (s.box || []).map(p => ({ ...p, statsLoaded: !!p.stats, ivs: p.ivs || generateIVs(), ot: p.ot || s.trainerName || 'Trainer', _attackMode: p._attackMode || 'physical' }));
    // Normalize: all player pokemon above 250 get capped to 250
    gameState.box.forEach(p => { if(p.level > 250) { p.level = 250; p.expToNext = calcExpToNext(250); p.exp = 0; } });
    gameState.team = (s.teamUids || []).map(uid => gameState.box.find(p=>p.uid===uid)).filter(Boolean);
    gameState.currentFighterIdx = Math.min(s.currentFighterIdx||0, Math.max(0,gameState.team.length-1));
    gameState.lockedPokemon = s.lockedPokemon || [];
    gameState.megaStoneInstances = s.megaStoneInstances || {};
    gameState.breedingSlots = s.breedingSlots || [];

    // Boss/Legendary team cap: keep first 3, move rest to box
    { let bc = 0; const keep = [], toBox = [];
      gameState.team.forEach(function(p){ if(isBossOrLegendary(p)){ if(bc<MAX_BOSS_ON_TEAM){bc++;keep.push(p);}else{toBox.push(p);}}else{keep.push(p);}});
      if(toBox.length>0){gameState.team=keep;} }

    document.getElementById('starter-screen').style.display = 'none';
    const game = document.getElementById('game');
    game.style.display = 'flex';
    game.style.flexDirection = 'column';
    if(gameState.road.active) document.getElementById('arena').classList.add('road-mode');
    renderAll();
    if(gameState.road.active) {
      if(gameState.road.mode === 'farm') spawnFarmEnemy();
      else spawnRoadEnemy();
    } else spawnEnemy();
    startBattle();
    activeSlotIdx = slotIdx;
    activeSlotIdx = slotIdx;
    toast(`✅ Loaded: ${s.name} (Wave ${gameState.wave})`, 3000);
  } catch(e) { console.warn(e); toast('❌ Failed to load!', 3000); }
}

function showStarterPicker() {
  const screen = document.getElementById('starter-screen');
  screen.style.display = 'flex';
  screen.style.flexDirection = 'column';
  screen.style.alignItems = 'center';
  screen.style.justifyContent = 'center';
  document.getElementById('save-picker').style.display = 'none';
  document.getElementById('starter-picker').style.display = 'block';

  const grid = document.getElementById('starter-grid');
  grid.innerHTML = '';
  STARTERS.forEach(s => {
    const card = document.createElement('div');
    card.className = 'starter-card';
    card.innerHTML = `
      <img src="${getSpriteUrl(s.id)}" alt="${s.name}" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${s.id}.png'">
      <div class="name">${s.name}</div>
      <div class="types">${s.types.map(t=>`<span class="type-badge" style="background:${TYPE_COLORS[t]}">${t}</span>`).join('')}</div>
    `;
    card.onclick = () => chooseStarter(s);
    grid.appendChild(card);
  });
}

async function chooseStarter(s) {
  const isShiny = Math.random() < 1/512;
  const pk = newPokemonEntry(s.id, s.name, s.types, 5, isShiny);
  pk.stats = await fetchPokemonStats(s.id);
  pk.statsLoaded = true;
  pk.currentHp = getMaxHp(pk);
  gameState.box.push(pk);
  gameState.team.push(pk);

  document.getElementById('starter-screen').style.display = 'none';
  const game = document.getElementById('game');
  game.style.display = 'flex';
  game.style.flexDirection = 'column';

  if(isShiny) toast(`🌟 SHINY ${s.name.toUpperCase()}! You lucky soul!`, 4000);
  else toast(`You chose ${s.name}!`);

  renderAll();
  spawnEnemy();
  startBattle();

  // Auto-save to the slot that was chosen when starting new game
  if(typeof window._newGameTargetSlot === 'number') {
    const slotIdx = window._newGameTargetSlot;
    window._newGameTargetSlot = null;
    const saves = getAllSaves();
    saves[slotIdx] = buildSaveData(gameState.trainerName + "'s Game");
    setAllSaves(saves);
    toast(`💾 Saved to slot ${slotIdx + 1}!`, 2500);
  }
}

// ============================================================
// BATTLE SYSTEM
// ============================================================

function getCurrentFighter() {
  for(let i=0; i<gameState.team.length; i++) {
    const idx = (gameState.currentFighterIdx + i) % gameState.team.length;
    if(gameState.team[idx] && gameState.team[idx].currentHp > 0) return gameState.team[idx];
  }
  return null;
}

function getActiveRegion() {
  let region = REGIONS[0];
  for(const r of REGIONS) { if(gameState.wave >= r.minWave) region = r; }
  return region;
}

async function spawnEnemy() {
  if(bossStarting || bossBattleActive || giratinaBattleActive || kyuremBattleActive || zygardeBattleActive || swordShieldBattleActive || eventBossBattleActive || vrBattleActive || mcBattleActive) return;
  const region = getActiveRegion();
  document.getElementById('region-label').textContent = region.name;
  document.getElementById('wave-label').textContent = `Wave ${gameState.wave}`;

  const pool = region.pool;
  const totalW = pool.reduce((s,p)=>s+p.w, 0);
  let r = Math.random() * totalW;
  let chosen = pool[0];
  for(const p of pool) { r -= p.w; if(r <= 0) { chosen = p; break; } }

  const baseLevel = Math.min(250, Math.max(1, Math.floor(gameState.wave * 0.8 + 2)));
  const level = Math.max(1, baseLevel + Math.floor((Math.random()-0.5)*4));
  const isShiny = Math.random() < 1/512;

  const enemy = newPokemonEntry(chosen.id, chosen.name, chosen.types, level, isShiny, true);
  enemy.stats = await fetchPokemonStats(chosen.id);
  enemy.statsLoaded = true;
  enemy.currentHp = getMaxHp(enemy);
  currentEnemy = enemy;

  for(const p of gameState.team) { if(p && p.statsLoaded) p.currentHp = getMaxHp(p); }

  const flash = document.getElementById('encounter-flash');
  flash.style.transition = 'opacity 0.05s';
  flash.style.opacity = '1';
  setTimeout(()=>{ flash.style.transition = 'opacity 1.2s'; flash.style.opacity = '0'; }, 120);

  updateEnemyUI();
  if(isShiny) { toast(`✨ Wild SHINY ${chosen.name} appeared!`, 3000); addLog(`✨ Wild SHINY ${chosen.name} appeared!`, 'log-shiny'); }
  else addLog(`A wild ${chosen.name} (Lv.${level}) appeared!`);
}

function startBattle() {
  if(battleTimer) clearInterval(battleTimer);
  battleTimer = setInterval(battleTick, 100);
}

let playerAttackCooldown = 0;
let enemyAttackCooldown = 0;
const BASE_ATTACK_MS = 2500;

function battleTick() {
  if(battlePaused || !currentEnemy) return;
  const player = getCurrentFighter();
  if(!player || !player.statsLoaded) return;

  const now = Date.now();
  if(!battleTick.lastRegen) battleTick.lastRegen = now;
  if(now - battleTick.lastRegen >= 1000) {
    battleTick.lastRegen = now;
    const regenItem = getItemByEquipId(gameState.equippedItems[player.uid]);
    if(regenItem?.effect === 'regen') {
      const heal = Math.max(1, Math.floor(getMaxHp(player) / 8));
      const prev = player.currentHp;
      player.currentHp = Math.min(getMaxHp(player), player.currentHp + heal);
      if(player.currentHp > prev) addLog(`${player.name} restored ${player.currentHp-prev} HP (Leftovers)!`, 'log-heal');
    }
  }

  const playerSpeed = getSpeed(player);
  const isDeoxysSpeed = player.id === 386 && player._deoxysForm === 'speed';
  const playerDelay = isDeoxysSpeed
    ? Math.max(450, BASE_ATTACK_MS - playerSpeed * 5) // Speed form: floor 450ms
    : Math.max(800, BASE_ATTACK_MS - playerSpeed * 5);
  if(!playerAttackCooldown) playerAttackCooldown = now + playerDelay;
  if(now >= playerAttackCooldown) { playerAttackCooldown = now + playerDelay; doPlayerAttack(player); }

  if(!currentEnemy) return; // enemy was killed mid-tick
  const enemySpeed = currentEnemy.statsLoaded ? getSpeed(currentEnemy) : 50;
  const enemyDelay = Math.max(900, BASE_ATTACK_MS - enemySpeed * 5);
  if(!enemyAttackCooldown) enemyAttackCooldown = now + enemyDelay + 300;
  if(now >= enemyAttackCooldown) { enemyAttackCooldown = now + enemyDelay; doEnemyAttack(player); }

  updatePlayerUI(player);
  updateEnemyUI();
  updateBottomBar();
}

function doPlayerAttack(player) {
  if(!currentEnemy || currentEnemy.currentHp <= 0) return;
  let dmg = Math.max(1, getAttack(player) + Math.floor((Math.random()-0.5)*10));

  const allItems = ITEMS.concat(EPIC_ITEMS);
  const item = getItemByEquipId(gameState.equippedItems[player.uid]);
  if(item?.effect === 'life_orb') {
    dmg = Math.floor(dmg * 1.4);
    const selfDmg = Math.floor(getMaxHp(player) * 0.08);
    player.currentHp = Math.max(1, player.currentHp - selfDmg);
  }
  if(item?.effect === 'shell_bell') {
    const heal = Math.floor(dmg / 4);
    player.currentHp = Math.min(getMaxHp(player), player.currentHp + heal);
  }

  currentEnemy.currentHp = Math.max(0, currentEnemy.currentHp - dmg);

  const enemyItem = getItemByEquipId(gameState.equippedItems[currentEnemy?.uid]);
  if(enemyItem?.effect === 'rocky_helmet') {
    const recoil = Math.floor(getMaxHp(player) / 4);
    player.currentHp = Math.max(0, player.currentHp - recoil);
  }

  animateAttack('player');
  const dmgColor = isCosmic(player) ? '#00ffff' : player.isShiny ? '#ffd700' : '#ff6b6b';
  showDmgNum(dmg, 'enemy-area', dmgColor);
  animateHurt('enemy-sprite');
  addLog(`${player.name} dealt ${dmg} damage!`, 'log-dmg');

  if(currentEnemy.currentHp <= 0) enemyDefeated(player);
}

function doEnemyAttack(player) {
  if(!currentEnemy || player.currentHp <= 0) return;
  let dmg = Math.max(1, getAttack(currentEnemy) + Math.floor((Math.random()-0.5)*10));
  if(currentEnemy._attackMult) dmg = Math.floor(dmg * currentEnemy._attackMult);

  const allItems = ITEMS.concat(EPIC_ITEMS);
  const item = getItemByEquipId(gameState.equippedItems[player.uid]);
  if(item?.effect === 'spdef_boost') dmg = Math.floor(dmg * 0.74);
  if(item?.effect === 'def_boost') dmg = Math.floor(dmg * 0.74);
  if(item?.effect === 'eviolite') dmg = Math.floor(dmg * 0.78);
  if(item?.effect === 'focus_sash' && player.currentHp >= getMaxHp(player) && dmg >= player.currentHp) {
    dmg = player.currentHp - 1;
    addLog(`💫 Focus Sash saved ${player.name}!`, 'log-heal');
  }

  player.currentHp = Math.max(0, player.currentHp - dmg);
  animateAttack('enemy');
  showDmgNum(dmg, 'player-area', '#ef5350');
  animateHurt('player-sprite');
  addLog(`${currentEnemy.name} dealt ${dmg} damage!`, 'log-dmg');

  if(player.currentHp <= 0) playerPokemonFainted(player);
}

function enemyDefeated(player) {
  if(bossBattleActive && currentEnemy?.isBoss) {
    if(vrBattleActive && currentEnemy?._isVR) handleVRDefeated(player);
    else if(mcBattleActive && currentEnemy?._isMC) handleMCDefeated(player);
    else if(currentEnemy?._isGiratina) handleGiratinaDefeated(player);
    else if(currentEnemy?._isKyurem) handleKyuremDefeated(player);
    else if(currentEnemy?._isSwordShield) handleSwordShieldDefeated(player);
    else if(currentEnemy?._isZygarde) handleZygardeDefeated(player);
    else if(currentEnemy?._isEventBoss) handleEventBossDefeated(player);
    else handleBossDefeated(player);
    return;
  }

  addLog(`${currentEnemy.name} was defeated!`, 'log-heal');
  // If the wild enemy was shiny, catch it automatically
  if(currentEnemy.isShiny) {
    const caught = currentEnemy;
    caught.level = Math.min(250, caught.level);
    caught.expToNext = calcExpToNext(caught.level);
    caught.currentHp = getMaxHp(caught);
    gameState.box.push(caught);
    toast(`✨ Wild Shiny ${caught.name} caught!`, 4000);
    addLog(`✨ Caught wild Shiny ${caught.name}!`, 'log-shiny');
  }
  const goldGain = Math.floor(currentEnemy.level * 3 + Math.random() * currentEnemy.level * 2 + 5);
  const gemGain = Math.random() < 0.15 ? 1 : 0;
  gameState.gold += goldGain;
  if(gemGain) { gameState.gems += gemGain; toast('💎 Found a Gem!'); }
  gameState.wins++;

  if(gameState.road.active) {
    if(gameState.road.mode === 'floor') {
      const floor = ROAD_FLOORS[gameState.road.floor];
      gameState.road.winsOnFloor++;
      updateRoadProgressHUD();
      let gemGainRoad = 0;
      const w = gameState.road.winsOnFloor;
      const gemMult = isGemBoostActive() ? GEM_BOOST_EVENT.multiplier : 1;
      if(floor.gemsPerThree && w % 3 === 0) gemGainRoad = gemMult;
      else if(floor.gemsPerFive && w % 5 === 0) gemGainRoad = gemMult;
      else if(w % 10 === 0) gemGainRoad = gemMult;
      const boostTag = gemMult > 1 ? ` [${gemMult}× BOOST!]` : '';
      if(gemGainRoad > 0) { gameState.gems += gemGainRoad; addLog(`💎 +${gemGainRoad} Gem${gemGainRoad>1?'s':''} from Diamond Road! (${w}/${floor.winsNeeded})${boostTag}`, 'log-evolve'); updateResourceUI(); }
      const roadGoldBonus = floor.goldBonus || 0;
      if(roadGoldBonus > 0) gameState.gold += roadGoldBonus;
      if(gameState.road.winsOnFloor >= floor.winsNeeded) {
        const clearGems = floor.bonusGems * gemMult;
        gameState.gems += clearGems;
        addLog(`🎉 ${floor.name} CLEARED! +${clearGems} bonus Gems!${boostTag}`, 'log-evolve');
        toast(`🎉 Floor cleared! +${clearGems} 💎 Gems!${gemMult > 1 ? ' (' + gemMult + '× BOOST!)' : ''}`, 4000);
        updateResourceUI();
        if(gameState.road.floor + 1 < ROAD_FLOORS.length) {
          gameState.road.floor++;
          gameState.road.winsOnFloor = 0;
          gameState.road.winsNeeded = ROAD_FLOORS[gameState.road.floor].winsNeeded;
          addLog(`⬆️ Advanced to ${ROAD_FLOORS[gameState.road.floor].name}!`, 'log-evolve');
        } else {
          addLog(`👑 You completed all Diamond Road floors!`, 'log-evolve');
          toast(`👑 ALL FLOORS CLEARED! Incredible!`, 5000);
          gameState.road.active = false;
          document.getElementById('arena').classList.remove('road-mode');
          setTimeout(updateRoadProgressHUD, 4000);
        }
      }
    } else if(gameState.road.mode === 'farm') {
      const farmGoldBonus = Math.floor(currentEnemy ? currentEnemy.level * 2 + 50 : 50);
      gameState.gold += farmGoldBonus;
      addLog(`🌾 +${farmGoldBonus} farm gold!`, 'log-heal');
      updateResourceUI();
    }
  } else {
    gameState.wave++;
  }

  let expGain = Math.floor(currentEnemy.level * 15 + Math.random() * 20 + 10);
  const item = getItemByEquipId(gameState.equippedItems[player.uid]);
  if(item?.effect === 'lucky_egg') expGain = Math.floor(expGain * 2.0);
  giveExp(player, expGain);
  addLog(`+${goldGain} gold, +${expGain} EXP`, 'log-exp');

  currentEnemy = null;
  playerAttackCooldown = 0;
  enemyAttackCooldown = 0;
  battleTick.lastRegen = 0;
  updateResourceUI();
  renderAll();

  const delay = gameState.road.active ? 800 : 1200;
  const nextSpawn = gameState.road.active
    ? (gameState.road.mode === 'farm' ? spawnFarmEnemy : spawnRoadEnemy)
    : spawnEnemy;
  setTimeout(nextSpawn, delay);
}

function playerPokemonFainted(player) {
  addLog(`${player.name} fainted!`, 'log-dmg');

  if(bossBattleActive && currentEnemy?.isBoss) {
    player.currentHp = 0;
    addLog(`${player.name} is down for the count!`, 'log-dmg');
    let nextIdx = -1;
    for(let i = 1; i <= gameState.team.length; i++) {
      const idx = (gameState.currentFighterIdx + i) % gameState.team.length;
      const p = gameState.team[idx];
      if(p && p !== player && p.currentHp > 0) { nextIdx = idx; break; }
    }
    if(nextIdx >= 0) {
      gameState.currentFighterIdx = nextIdx;
      const next = gameState.team[nextIdx];
      addLog(`Go, ${next.name}! Fight ${currentEnemy?.name || 'the Boss'}! 💪`, 'log-heal');
      updatePlayerUI(next);
      playerAttackCooldown = 0;
      enemyAttackCooldown = Date.now() + 800;
      renderBottomBar();
    } else {
      if(vrBattleActive) handleVRFailed();
      else if(mcBattleActive) handleMCFailed();
      else if(giratinaBattleActive) handleGiratinaFailed();
      else if(kyuremBattleActive) handleKyuremFailed();
      else if(zygardeBattleActive) handleZygardeFailed();
      else if(swordShieldBattleActive) handleSwordShieldFailed();
      else if(eventBossBattleActive) handleEventBossFailed();
      else handleBossFailed();
    }
    return;
  }

  const reviveHp = Math.max(1, Math.floor(getMaxHp(player) * 0.30));
  player.currentHp = reviveHp;
  addLog(`${player.name} is resting and will recover...`, 'log-heal');

  let nextIdx = -1;
  for(let i = 1; i <= gameState.team.length; i++) {
    const idx = (gameState.currentFighterIdx + i) % gameState.team.length;
    const p = gameState.team[idx];
    if(p && p !== player && p.currentHp > 0) { nextIdx = idx; break; }
  }

  if(nextIdx >= 0) {
    gameState.currentFighterIdx = nextIdx;
    addLog(`Go, ${gameState.team[nextIdx].name}! 💪`, 'log-heal');
    updatePlayerUI(gameState.team[nextIdx]);
    playerAttackCooldown = 0;
    enemyAttackCooldown = Date.now() + 800;
    renderBottomBar();
  } else {
    addLog(`All Pokémon fainted! Everyone is revived at 25% HP!`, 'log-heal');
    toast('All Pokémon fainted! Reviving...', 3000);
    gameState.team.forEach(p => { p.currentHp = Math.max(1, Math.floor(getMaxHp(p)*0.25)); });
    gameState.currentFighterIdx = 0;
    playerAttackCooldown = 0;
    enemyAttackCooldown = 0;
    renderBottomBar();
  }
}

function giveExp(pokemon, amount) {
  pokemon.exp += amount;
  const mainCap = maxLevelOf(pokemon);
  while(pokemon.exp >= pokemon.expToNext && pokemon.level < mainCap) {
    pokemon.exp -= pokemon.expToNext;
    pokemon.level++;
    pokemon.expToNext = calcExpToNext(pokemon.level);
    pokemon.currentHp = getMaxHp(pokemon);
    addLog(`${pokemon.name} grew to Lv.${pokemon.level}!`, 'log-exp');
    toast(`⬆️ ${pokemon.name} is now Lv.${pokemon.level}!`);
    checkEvolution(pokemon);
  }

  const expShareAmt = Math.floor(amount * 0.50);
  if(expShareAmt > 0) {
    gameState.box.forEach(p => {
      if(p === pokemon) return;
      const item = getItemByEquipId(gameState.equippedItems[p.uid]);
      if(item?.effect === 'exp_share') {
        p.exp += expShareAmt;
        while(p.exp >= p.expToNext && p.level < maxLevelOf(p)) {
          p.exp -= p.expToNext; p.level++; p.expToNext = calcExpToNext(p.level);
          p.currentHp = getMaxHp(p);
          addLog(`${p.name} (Exp.Share) grew to Lv.${p.level}!`, 'log-exp');
          checkEvolution(p);
        }
      }
    });
  }
}

async function checkEvolution(pokemon) {
  if(pokemon._noEvolve) return;
  const evo = EVOLUTIONS[pokemon.id];
  if(evo && pokemon.level >= evo.level) {
    const oldName = pokemon.name;
    pokemon.id = evo.id;
    pokemon.name = evo.name;
    pokemon.stats = await fetchPokemonStats(evo.id);
    const oldHp = pokemon.currentHp;
    const oldMax = getMaxHp(pokemon);
    pokemon.currentHp = Math.min(getMaxHp(pokemon), getMaxHp(pokemon) * oldHp / oldMax + 30);

    addLog(`✨ ${oldName} evolved into ${evo.name}!`, 'log-evolve');
    toast(`🎉 ${oldName} evolved into ${evo.name}!`, 4000);

    // Check if newly cosmic after evolution
    if(isCosmic(pokemon)) {
      addLog(`🌌 ${pokemon.name} radiates COSMIC energy!`, 'log-cosmic');
      toast(`🌌 COSMIC ${pokemon.name}!`, 3000);
    }

    const sprite = document.getElementById('player-sprite');
    if(sprite) sprite.classList.add('evolve-flash');
    setTimeout(()=>{ if(sprite) sprite.classList.remove('evolve-flash'); }, 1000);

    updatePlayerUI(pokemon);
    renderAll();
    setTimeout(()=>checkEvolution(pokemon), 500);
  }
}

async function forceEvolve(uid) {
  const pokemon = gameState.box.find(p => p.uid === uid);
  if(!pokemon || pokemon._noEvolve) return;
  const evo = EVOLUTIONS[pokemon.id];
  if(!evo || pokemon.level < evo.level) { toast('This Pokémon cannot evolve yet!', 2000); return; }
  const oldName = pokemon.name;
  pokemon.id = evo.id;
  pokemon.name = evo.name;
  pokemon.stats = await fetchPokemonStats(evo.id);
  const oldHp = pokemon.currentHp;
  const oldMax = getMaxHp(pokemon);
  pokemon.currentHp = Math.min(getMaxHp(pokemon), getMaxHp(pokemon) * oldHp / oldMax + 30);
  addLog(`✨ ${oldName} force-evolved into ${evo.name}!`, 'log-evolve');
  toast(`🎉 ${oldName} evolved into ${evo.name}!`, 4000);
  if(isCosmic(pokemon)) { addLog(`🌌 ${pokemon.name} radiates COSMIC energy!`, 'log-cosmic'); toast(`🌌 COSMIC ${pokemon.name}!`, 3000); }
  updatePlayerUI(pokemon);
  renderAll();
  // Chain evolve if possible
  setTimeout(()=>{
    const nextEvo = EVOLUTIONS[pokemon.id];
    if(nextEvo && pokemon.level >= nextEvo.level) forceEvolve(uid);
  }, 500);
}

function switchNextPokemon() {
  if(gameState.team.length === 0) return;
  gameState.currentFighterIdx = (gameState.currentFighterIdx + 1) % gameState.team.length;
  playerAttackCooldown = 0;
  toast(`Switched to ${gameState.team[gameState.currentFighterIdx].name}!`);
  renderAll();
}

// ============================================================
// UI UPDATE
// ============================================================

function getPokemonSpriteClass(pokemon) {
  if(isCosmic(pokemon) && isMegaRayquaza(pokemon)) return 'fighter-sprite mega-shiny-sprite';
  if(isCosmic(pokemon) && isOriginGiratina(pokemon)) return 'fighter-sprite cosmic-sprite';
  if(isCosmic(pokemon)) return 'fighter-sprite cosmic-sprite';
  if(isMegaRayquaza(pokemon) && pokemon.isShiny) return 'fighter-sprite mega-shiny-sprite';
  if(isOriginGiratina(pokemon) && pokemon.isShiny) return 'fighter-sprite shiny-sprite';
  if(isOriginGiratina(pokemon)) return 'fighter-sprite';
  if(isCrownedZacian(pokemon) && pokemon.isShiny) return 'fighter-sprite shiny-sprite';
  if(isCrownedZacian(pokemon)) return 'fighter-sprite';
  if(isCrownedZamazenta(pokemon) && pokemon.isShiny) return 'fighter-sprite shiny-sprite';
  if(isCrownedZamazenta(pokemon)) return 'fighter-sprite';
  if(isDNAFused(pokemon) && pokemon.isShiny) return 'fighter-sprite shiny-sprite';
  if(isDNAFused(pokemon)) return 'fighter-sprite';
  if(pokemon.isShiny) return 'fighter-sprite shiny-sprite';
  return 'fighter-sprite';
}

function getModalSpriteClass(pk) {
  if(isMegaRayquaza(pk) && pk.isShiny) return 'shiny-sprite';
  if(isOriginGiratina(pk) && pk.isShiny) return 'shiny-sprite';
  if(isDNAFused(pk) && pk.isShiny) return 'shiny-sprite';
  if(pk._noMega && pk.id === 384) return 'envy-sprite'; // Envy - purple Rayquaza, no giant size in modals
  if(isCosmic(pk)) return 'cosmic-sprite';
  if(pk.isShiny) return 'shiny-sprite';
  return '';
}

function updatePlayerUI(player) {
  if(!player) return;
  const cosmic = isCosmic(player);
  const prefix = cosmic ? '🌌 ' : player.isShiny ? '★ ' : '';
  const nameEl = document.getElementById('player-name');
  if(isEnvyUnbound(player)) {
    nameEl.innerHTML = `<span style="color:#00e676;text-shadow:0 0 8px rgba(0,230,118,0.7)">🌑 ENVY UNBOUND</span>`;
  } else if(player._isEnvy) {
    nameEl.innerHTML = `<span class="void-text">${player.name.toUpperCase()}</span>`;
  } else {
    nameEl.textContent = prefix + player.name.toUpperCase();
  }
  document.getElementById('player-level').textContent = `Lv.${player.level}`;
  const maxHp = getMaxHp(player);
  const hpPct = Math.max(0, Math.min(100, (player.currentHp / maxHp) * 100));
  const expPct = Math.min(100, (player.exp / player.expToNext) * 100);
  document.getElementById('player-hp-bar').style.width = hpPct + '%';
  document.getElementById('player-hp-bar').style.background = hpPct > 50 ? 'linear-gradient(90deg,#66bb6a,#43a047)' : hpPct > 25 ? 'linear-gradient(90deg,#ffa726,#fb8c00)' : 'linear-gradient(90deg,#ef5350,#e53935)';
  document.getElementById('player-hp-txt').textContent = `${Math.max(0,player.currentHp)}/${maxHp}`;
  document.getElementById('player-exp-bar').style.width = expPct + '%';

  const sprite = document.getElementById('player-sprite');
  sprite.src = getBattleSprite(player.id, player.isShiny, player.uid);
  sprite.className = getPokemonSpriteClass(player);
}

function updateEnemyUI() {
  if(!currentEnemy) return;
  const cosmic = isCosmic(currentEnemy);
  const prefix = cosmic ? '🌌 ' : currentEnemy.isShiny ? '★ ' : '';
  document.getElementById('enemy-name').textContent = prefix + currentEnemy.name.toUpperCase() + (currentEnemy.isBoss ? ' 🐉' : '');
  document.getElementById('enemy-level').textContent = `Lv.${currentEnemy.level}`;
  const maxHp = currentEnemy._bossHpMax || getMaxHp(currentEnemy);
  const hpPct = Math.max(0, Math.min(100, (currentEnemy.currentHp / maxHp) * 100));
  document.getElementById('enemy-hp-bar').style.width = hpPct + '%';
  document.getElementById('enemy-hp-bar').style.background = hpPct > 50 ? 'linear-gradient(90deg,#66bb6a,#43a047)' : hpPct > 25 ? 'linear-gradient(90deg,#ffa726,#fb8c00)' : 'linear-gradient(90deg,#ef5350,#e53935)';
  document.getElementById('enemy-hp-txt').textContent = `${formatNum(Math.max(0,currentEnemy.currentHp))}/${formatNum(maxHp)}`;

  const sprite = document.getElementById('enemy-sprite');
  if(currentEnemy._customSprite) {
    sprite.src = (currentEnemy.isShiny && currentEnemy._customSpriteShiny) ? currentEnemy._customSpriteShiny : currentEnemy._customSprite;
  } else {
    sprite.src = getBattleSprite(currentEnemy.id, currentEnemy.isShiny);
  }
  sprite.className = getPokemonSpriteClass(currentEnemy);
}

function updateResourceUI() {
  document.getElementById('res-gold').textContent = formatNum(gameState.gold);
  document.getElementById('res-gems').textContent = formatNum(gameState.gems);
  document.getElementById('res-wins').textContent = formatNum(gameState.wins);
}

function formatNum(n) {
  if(n >= 1000000) return (n/1000000).toFixed(1)+'M';
  if(n >= 1000) return (n/1000).toFixed(1)+'K';
  return n;
}

function renderAll() {
  updateResourceUI();
  const player = getCurrentFighter();
  if(player) updatePlayerUI(player);
  updateEnemyUI();
  renderTeamSlots();
  renderPokemonBox();
  renderBottomBar();
  renderItems();
  updateBottomBar();
}

function getSlotExtraClass(p) {
  if(isCosmic(p)) return ' cosmic-slot';
  if(p.isShiny) return ' shiny-slot';
  return '';
}

function renderTeamSlots() {
  const grid = document.getElementById('team-slots-grid');
  grid.innerHTML = '';
  // Update boss/legendary cap indicator
  const bossCapEl = document.getElementById('boss-cap-count');
  if(bossCapEl) bossCapEl.textContent = countBossOnTeam();
  for(let i=0; i<6; i++) {
    const p = gameState.team[i];
    const div = document.createElement('div');
    const extraClass = p ? getSlotExtraClass(p) : '';
    div.className = 'team-slot' + (p && i===gameState.currentFighterIdx ? ' active-fighter' : '') + extraClass;
    if(p) {
      const maxHp = getMaxHp(p);
      const hpPct = Math.max(0, Math.min(100, (p.currentHp / maxHp)*100));
      const cosmic = isCosmic(p);
      div.innerHTML = `
        ${cosmic ? '<span class="shiny-badge" style="font-size:12px">🌌</span>' : p.isShiny ? '<span class="shiny-badge">★</span>' : ''}
        <img src="${getSpriteUrl(p.id, p.isShiny, p.uid)}" onerror="this.src='${getBattleSprite(p.id, p.isShiny, p.uid)}'">
        <span class="slot-name">${cosmic ? '<span class="cosmic-text" style="font-size:5px">COSMIC</span> ' : ''}${isEnvyUnbound(p) ? '<span style="color:#00e676;font-size:7px;text-shadow:0 0 6px rgba(0,230,118,0.6)">UNBOUND</span>' : p._isEnvy ? '<span class="void-text" style="font-size:7px">ENVY</span>' : p.name}</span>
        <span class="slot-level">Lv.${p.level}</span>
        <div class="bar" style="margin-top:3px"><div class="bar-fill hp-fill" style="width:${hpPct}%;background:linear-gradient(90deg,#66bb6a,#43a047)"></div></div>
      `;
      div.onclick = () => showPokemonInfoCard(p);
      div.oncontextmenu = (e) => { e.preventDefault(); gameState.currentFighterIdx = i; playerAttackCooldown = 0; renderAll(); };
    } else {
      div.classList.add('empty-slot');
      div.innerHTML = '<span style="font-size:20px;color:var(--text2);opacity:0.5">+</span><span style="font-family:\'Press Start 2P\',monospace;font-size:5px;color:var(--text2);opacity:0.4;display:block;margin-top:3px">ADD</span>';
      div.onclick = () => showAddToTeamPicker();
    }
    grid.appendChild(div);
  }
  renderPresetCards();
}

function renderPokemonBox() {
  const grid = document.getElementById('poke-box-grid');
  grid.innerHTML = '';
  if(gameState.box.length === 0) {
    grid.innerHTML = '<div style="color:var(--text2);font-size:14px">No Pokémon yet. Use Gacha!</div>';
    return;
  }
  const sorted = getBoxSorted();
  sorted.forEach((p) => {
    const div = document.createElement('div');
    const cosmic = isCosmic(p);
    const isFusedAway = !!p._isFusedInto;
    div.className = 'poke-card' + (isMegaRayquaza(p) ? ' mega-card' : isOriginGiratina(p) ? ' origin-card' : isDNAFused(p) ? ' mega-card' : isCrownedZacian(p) || isCrownedZamazenta(p) ? ' origin-card' : cosmic ? ' cosmic-card' : p.isShiny ? ' shiny-card' : '');
    if(isFusedAway) { div.style.cssText += 'opacity:0.35;filter:grayscale(1);pointer-events:none;'; }
    const equippedItem = getItemByEquipId(gameState.equippedItems[p.uid]);
    const teamIdx = gameState.team.indexOf(p);
    const inParty = teamIdx >= 0;
    const targetLevel = getPullTargetLevel();
    const canPull = p.level < targetLevel;
    div.innerHTML = `
      ${cosmic ? '<div style="position:absolute;top:3px;right:4px;font-size:12px">🌌</div>' : p.isShiny ? '<div style="position:absolute;top:3px;right:4px;font-size:14px">★</div>' : ''}
      ${isFusedAway ? '<div style="position:absolute;top:3px;left:4px;font-size:9px;background:rgba(100,0,200,0.3);border:1px solid #ab47bc;border-radius:3px;padding:1px 3px;color:#ce93d8;font-family:VT323,monospace">FUSED</div>' : inParty ? `<div style="position:absolute;top:3px;left:4px;font-size:10px;background:rgba(79,195,247,0.25);border:1px solid var(--accent);border-radius:3px;padding:1px 3px;color:var(--accent);font-family:'Press Start 2P',monospace">P${teamIdx+1}</div>` : ''}
      ${(gameState.lockedPokemon||[]).includes(p.uid) ? `<button onclick="event.stopPropagation();toggleLockPokemon(${p.uid})" style="position:absolute;bottom:3px;right:3px;background:none;border:none;cursor:pointer;font-size:13px;line-height:1;padding:1px" title="Unlock">🔒</button>` : `<button onclick="event.stopPropagation();toggleLockPokemon(${p.uid})" style="position:absolute;bottom:3px;right:3px;background:none;border:none;cursor:pointer;font-size:12px;line-height:1;padding:1px;opacity:0.25" title="Lock">🔓</button>`}
      <img src="${getSpriteUrl(p.id, p.isShiny, p.uid)}" onerror="this.src='${getBattleSprite(p.id, p.isShiny, p.uid)}'">
      <span class="cname">${cosmic ? '<span style="background:linear-gradient(90deg,#00ffff,#bf00ff,#ff00aa,#00ffff);background-size:300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 1.5s linear infinite">COSMIC</span> ' : ''}${p.name}</span>
      <span class="clevel">Lv.${p.level}</span>
      ${p.ivs ? (() => { const avg = Math.round(Object.values(p.ivs).reduce((a,b)=>a+b,0)/6); const g = getStatGrade(avg); const isMega = isMegaRayquaza(p); const isOrigin = isOriginGiratina(p); const isFused = isDNAFused(p); const isCrownedForm = isCrownedZacian(p) || isCrownedZamazenta(p); const isMegaStart = isMegaSceptile(p)||isMegaSwampert(p)||isMegaBlaziken(p); const isMegaNew = isMegaGengar(p)||isMegaAggron(p)||isMegaGarchomp(p); const hasSSStat = (isMega||isOrigin||isFused||p._naturalSSS||isCrownedForm||p._sssUsed||p._isEnvy||isMegaStart||isMegaNew||isPerfectedZygarde(p)) && Object.values(p.ivs).some(iv=>iv>=31); if(hasSSStat) return `<span class="ss-rainbow" style="font-family:'Press Start 2P',monospace;font-size:6px;animation:shimmer 0.8s linear infinite">SSS</span>`; if(g.isSS) return `<span class="ss-rainbow" style="font-family:'Press Start 2P',monospace;font-size:6px">SS</span>`; return `<span style="font-family:'Press Start 2P',monospace;font-size:6px;color:${g.color}">${g.label}</span>`; })() : ''}
      ${equippedItem ? `<div style="line-height:1">${getItemIcon(equippedItem,22)}</div>` : ''}
      <div style="display:flex;gap:3px;justify-content:center;flex-wrap:wrap;margin-top:3px">
        ${p.types.map(t=>`<span class="type-badge" style="background:${TYPE_COLORS[t]};font-size:10px">${t}</span>`).join('')}
      </div>
      ${canPull ? `<button onclick="event.stopPropagation();pullToLevel(${p.uid})" style="margin-top:5px;width:100%;background:linear-gradient(135deg,rgba(79,195,247,0.2),rgba(79,195,247,0.05));border:1px solid rgba(79,195,247,0.5);color:var(--accent);border-radius:6px;cursor:pointer;font-family:'VT323',monospace;font-size:14px;padding:4px 4px;line-height:1.3">⬆ Lv.${targetLevel}<br><span style="color:var(--gold);font-size:12px">100💎</span></button>` : ''}
    `;
    div.onclick = () => showPokemonModal(p);
    div.oncontextmenu = (e) => { e.preventDefault(); showPokemonInfoCard(p); };
    grid.appendChild(div);
  });
}

function updateBottomBar() { renderBottomBar(); }

function renderBottomBar() {
  const bar = document.getElementById('bottom-slots');
  bar.innerHTML = '';
  for(let i=0; i<6; i++) {
    const p = gameState.team[i];
    const div = document.createElement('div');
    const cosmic = p && isCosmic(p);
    div.className = 'bottom-slot' + (i===gameState.currentFighterIdx ? ' active-slot' : '') + (cosmic ? ' cosmic-slot-b' : p?.isShiny ? ' shiny-slot-b' : '');
    if(p) {
      const maxHp = getMaxHp(p);
      const hpPct = Math.max(0, Math.min(100, (p.currentHp / maxHp)*100));
      div.innerHTML = `
        ${cosmic ? '<span class="b-shiny">🌌</span>' : p.isShiny ? '<span class="b-shiny">★</span>' : ''}
        <img src="${getBattleSprite(p.id, p.isShiny, p.uid)}">
        <span class="b-name">${p.name.substring(0,8)}</span>
        <div class="b-hp-bar"><div class="b-hp-fill" style="width:${hpPct}%;background:${hpPct>50?'var(--green)':hpPct>25?'orange':'red'}"></div></div>
      `;
      div.onclick = () => { gameState.currentFighterIdx = i; playerAttackCooldown=0; renderAll(); };
    } else {
      div.innerHTML = '<span style="color:var(--border);font-size:22px">+</span>';
      div.onclick = () => switchTab('box');
    }
    bar.appendChild(div);
  }
}

function renderItems() {
  const grid = document.getElementById('item-grid');
  grid.innerHTML = '';
  const allItems = ITEMS.concat(EPIC_ITEMS);
  const STONE_BASE_IDS = new Set(['sceptilite','swampertite','blazikenite','gengarite','aggronite','garchompite']);
  let hasAny = false;

  allItems.forEach(item => {
    const count = gameState.inventory[item.id] || 0;
    const isStoneBase = STONE_BASE_IDS.has(item.id);

    // For stone base IDs, only show if old (non-instanced) copies exist
    if(isStoneBase) {
      if(count > 0) {
        hasAny = true;
        const div = document.createElement('div');
        div.className = 'item-cell';
        div.title = `${item.name}: ${item.desc}`;
        div.style.border = '1px solid #4a6a4a';
        div.innerHTML = `${item.emoji}<span class="item-count">×${count}</span>`;
        div.onclick = () => showItemModal(item);
        div.oncontextmenu = (e) => { e.preventDefault(); trashItem(item.id); };
        grid.appendChild(div);
      }
      return;
    }

    if(count === 0) return;
    hasAny = true;
    const div = document.createElement('div');
    div.className = 'item-cell';
    div.title = `${item.name}: ${item.desc}`;
    const isEpic = EPIC_ITEMS.some(e=>e.id===item.id);
    if(isEpic) div.style.border = '1px solid #e040fb';
    div.innerHTML = `${item.emoji}<span class="item-count">×${count}</span>`;
    div.onclick = () => showItemModal(item);
    div.oncontextmenu = (e) => { e.preventDefault(); trashItem(item.id); };
    grid.appendChild(div);
  });

  // Render each unique stone instance separately
  if(gameState.megaStoneInstances) {
    const STONE_INFO = {
      sceptilite:  {name:'Sceptilite',  megaSprite:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sceptilite.png'},
      swampertite: {name:'Swampertite', megaSprite:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/swampertite.png'},
      blazikenite: {name:'Blazikenite', megaSprite:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/blazikenite.png'},
      gengarite:   {name:'Gengarite',   megaSprite:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/gengarite.png'},
      aggronite:   {name:'Aggronite',   megaSprite:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/aggronite.png'},
      garchompite: {name:'Garchompite', megaSprite:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/garchompite.png'},
    };
    const STAT_LABELS = {'attack':'Atk','special-attack':'Sp.Atk','defense':'Def','special-defense':'Sp.Def','speed':'Speed'};
    Object.entries(gameState.megaStoneInstances).forEach(([instanceId, data]) => {
      if((gameState.inventory[instanceId] || 0) === 0) return;
      hasAny = true;
      const info = STONE_INFO[data.base];
      if(!info) return;
      const bonusLabel = `+${Math.round(data.pct*100)}% ${STAT_LABELS[data.stat]||data.stat}`;
      const div = document.createElement('div');
      div.className = 'item-cell';
      div.style.border = '1px solid #00e676';
      div.style.position = 'relative';
      div.title = `${info.name}: Triggers Mega Evolution. Bonus: ${bonusLabel}`;
      div.innerHTML = `<img src="${info.megaSprite}" style="width:52px;height:52px;image-rendering:pixelated"><span style="position:absolute;bottom:2px;left:0;right:0;text-align:center;font-size:9px;color:#69f0ae;line-height:1.1">${bonusLabel}</span>`;
      div.onclick = () => showMegaStoneInstanceModal(instanceId);
      div.oncontextmenu = (e) => { e.preventDefault(); trashMegaStoneInstance(instanceId); };
      grid.appendChild(div);
    });
  }

  // Render Zygarde Cells
  const cellCount = gameState.inventory['zygarde_cell'] || 0;
  if(cellCount > 0) {
    hasAny = true;
    const cellDiv = document.createElement('div');
    cellDiv.className = 'item-cell';
    cellDiv.style.border = '1px solid #69f0ae';
    cellDiv.style.position = 'relative';
    cellDiv.title = `Zygarde Cell x${cellCount} — Collect to fuse Zygarde: 10 cells = 10%, 50 = 50%, 100 = Perfected`;
    cellDiv.innerHTML = `🟢<span class="item-count">x${cellCount}</span>`;
    cellDiv.onclick = () => showZygardeCellModal();
    grid.appendChild(cellDiv);
  }

  if(!hasAny) {
    grid.innerHTML = '<div style="color:var(--text2);font-size:13px;grid-column:1/-1">No items yet! Use Item Gacha.</div>';
  }
}

// ============================================================
// ANIMATIONS
// ============================================================

function animateAttack(who) {
  if(window._animationsDisabled) return;
  const sprite = document.getElementById(who==='player'?'player-sprite':'enemy-sprite');
  sprite.classList.remove('attack-anim');
  void sprite.offsetWidth;
  sprite.classList.add('attack-anim');
  setTimeout(()=>sprite.classList.remove('attack-anim'), 500);
}

function animateHurt(id) {
  if(window._animationsDisabled) return;
  const sprite = document.getElementById(id);
  const pokemon = id === 'player-sprite' ? getCurrentFighter() : currentEnemy;
  const cosmic = pokemon && isCosmic(pokemon);
  const isShiny = pokemon?.isShiny;

  sprite.style.animation = 'none';
  void sprite.offsetWidth;
  if(id === 'player-sprite') {
    sprite.style.animation = cosmic ? 'hurt-player-cosmic 0.45s ease-out' : isShiny ? 'hurt-player-shiny 0.45s ease-out' : 'hurt-player 0.45s ease-out';
  } else {
    sprite.style.animation = cosmic ? 'hurt-cosmic 0.45s ease-out' : isShiny ? 'hurt-shiny 0.45s ease-out' : 'hurt 0.45s ease-out';
  }
  setTimeout(()=>{ sprite.style.animation = ''; }, 500);
}

function showDmgNum(dmg, areaId, color) {
  const area = document.getElementById(areaId);
  if(!area) return;
  const div = document.createElement('div');
  div.className = 'dmg-num';
  div.textContent = '-' + dmg;
  div.style.color = color;
  const rect = area.getBoundingClientRect();
  const arenaRect = document.getElementById('arena').getBoundingClientRect();
  div.style.left = (rect.left - arenaRect.left + 30 + Math.random()*40) + 'px';
  div.style.top = (rect.top - arenaRect.top - 20 + Math.random()*20) + 'px';
  document.getElementById('arena').appendChild(div);
  setTimeout(()=>div.remove(), 1300);
}

// ============================================================
// BATTLE LOG
// ============================================================

function addLog(msg, cls='') {
  const log = document.getElementById('battle-log');
  const div = document.createElement('div');
  div.className = 'log-entry ' + cls;
  const time = new Date();
  div.textContent = `[${time.getHours().toString().padStart(2,'0')}:${time.getMinutes().toString().padStart(2,'0')}] ${msg}`;
  log.appendChild(div);
  while(log.children.length > 40) log.removeChild(log.firstChild);
  log.scrollTop = log.scrollHeight;
}

// ============================================================
// GACHA
// ============================================================

const GACHA_POOL = [
  // Common Gen 1
  {id:16,name:'Pidgey',types:['normal','flying'],w:20},{id:19,name:'Rattata',types:['normal'],w:20},
  {id:39,name:'Jigglypuff',types:['normal','fairy'],w:15},{id:52,name:'Meowth',types:['normal'],w:15},
  {id:54,name:'Psyduck',types:['water'],w:12},{id:60,name:'Poliwag',types:['water'],w:12},
  {id:56,name:'Mankey',types:['fighting'],w:12},{id:66,name:'Machop',types:['fighting'],w:12},
  {id:74,name:'Geodude',types:['rock','ground'],w:12},{id:88,name:'Grimer',types:['poison'],w:12},
  {id:92,name:'Gastly',types:['ghost','poison'],w:10},{id:100,name:'Voltorb',types:['electric'],w:10},
  {id:10,name:'Caterpie',types:['bug'],w:14},{id:13,name:'Weedle',types:['bug','poison'],w:14},
  {id:21,name:'Spearow',types:['normal','flying'],w:13},{id:23,name:'Ekans',types:['poison'],w:12},
  {id:27,name:'Sandshrew',types:['ground'],w:12},{id:41,name:'Zubat',types:['poison','flying'],w:12},
  {id:43,name:'Oddish',types:['grass','poison'],w:11},{id:46,name:'Paras',types:['bug','grass'],w:11},
  {id:48,name:'Venonat',types:['bug','poison'],w:11},{id:50,name:'Diglett',types:['ground'],w:11},
  {id:72,name:'Tentacool',types:['water','poison'],w:10},{id:84,name:'Doduo',types:['normal','flying'],w:10},
  {id:86,name:'Seel',types:['water'],w:10},{id:90,name:'Shellder',types:['water'],w:10},
  {id:96,name:'Drowzee',types:['psychic'],w:10},{id:98,name:'Krabby',types:['water'],w:10},
  {id:102,name:'Exeggcute',types:['grass','psychic'],w:10},{id:111,name:'Rhyhorn',types:['ground','rock'],w:10},
  {id:118,name:'Goldeen',types:['water'],w:10},{id:120,name:'Staryu',types:['water'],w:8},
  // Common Gen 2
  {id:152,name:'Chikorita',types:['grass'],w:10},{id:155,name:'Cyndaquil',types:['fire'],w:10},
  {id:158,name:'Totodile',types:['water'],w:10},{id:163,name:'Hoothoot',types:['normal','flying'],w:12},
  {id:165,name:'Ledyba',types:['bug','flying'],w:12},{id:167,name:'Spinarak',types:['bug','poison'],w:12},
  {id:177,name:'Natu',types:['psychic','flying'],w:10},{id:183,name:'Marill',types:['water','fairy'],w:10},
  {id:187,name:'Hoppip',types:['grass','flying'],w:10},{id:193,name:'Yanma',types:['bug','flying'],w:9},
  {id:161,name:'Sentret',types:['normal'],w:12},{id:170,name:'Chinchou',types:['water','electric'],w:10},
  {id:179,name:'Mareep',types:['electric'],w:10},{id:190,name:'Aipom',types:['normal'],w:9},
  {id:194,name:'Wooper',types:['water','ground'],w:10},{id:198,name:'Murkrow',types:['dark','flying'],w:9},
  {id:200,name:'Misdreavus',types:['ghost'],w:9},{id:204,name:'Pineco',types:['bug'],w:9},
  {id:209,name:'Snubbull',types:['fairy'],w:9},{id:215,name:'Sneasel',types:['dark','ice'],w:8},
  // Common Gen 3
  {id:252,name:'Treecko',types:['grass'],w:8},{id:255,name:'Torchic',types:['fire'],w:8},
  {id:258,name:'Mudkip',types:['water'],w:8},{id:261,name:'Poochyena',types:['dark'],w:10},
  {id:263,name:'Zigzagoon',types:['normal'],w:10},{id:270,name:'Lotad',types:['water','grass'],w:9},
  {id:278,name:'Wingull',types:['water','flying'],w:9},{id:293,name:'Whismur',types:['normal'],w:9},
  {id:273,name:'Seedot',types:['grass'],w:9},{id:276,name:'Taillow',types:['normal','flying'],w:9},
  {id:285,name:'Shroomish',types:['grass'],w:9},{id:287,name:'Slakoth',types:['normal'],w:9},
  {id:300,name:'Skitty',types:['normal'],w:9},{id:304,name:'Aron',types:['steel','rock'],w:8},
  {id:311,name:'Plusle',types:['electric'],w:8},{id:312,name:'Minun',types:['electric'],w:8},
  {id:316,name:'Gulpin',types:['poison'],w:8},{id:322,name:'Numel',types:['fire','ground'],w:8},
  {id:325,name:'Spoink',types:['psychic'],w:8},{id:339,name:'Barboach',types:['water','ground'],w:8},
  // Common Gen 4
  {id:387,name:'Turtwig',types:['grass'],w:8},{id:390,name:'Chimchar',types:['fire'],w:8},
  {id:393,name:'Piplup',types:['water'],w:8},{id:396,name:'Starly',types:['normal','flying'],w:10},
  {id:399,name:'Bidoof',types:['normal'],w:10},{id:403,name:'Shinx',types:['electric'],w:9},
  {id:406,name:'Budew',types:['grass','poison'],w:9},{id:408,name:'Cranidos',types:['rock'],w:8},
  {id:410,name:'Shieldon',types:['rock','steel'],w:8},{id:412,name:'Burmy',types:['bug'],w:8},
  {id:418,name:'Buizel',types:['water'],w:9},{id:420,name:'Cherubi',types:['grass'],w:8},
  {id:425,name:'Drifloon',types:['ghost','flying'],w:8},{id:427,name:'Buneary',types:['normal'],w:8},
  {id:431,name:'Glameow',types:['normal'],w:8},{id:433,name:'Chingling',types:['psychic'],w:8},
  {id:449,name:'Hippopotas',types:['ground'],w:7},{id:451,name:'Skorupi',types:['poison','bug'],w:7},
  {id:453,name:'Croagunk',types:['poison','fighting'],w:7},{id:456,name:'Finneon',types:['water'],w:7},
  // Common Gen 5
  {id:519,name:'Pidove',types:['normal','flying'],w:12},{id:498,name:'Tepig',types:['fire'],w:10},
  {id:495,name:'Snivy',types:['grass'],w:10},{id:501,name:'Oshawott',types:['water'],w:10},
  {id:504,name:'Patrat',types:['normal'],w:12},{id:506,name:'Lillipup',types:['normal'],w:12},
  {id:509,name:'Purrloin',types:['dark'],w:11},{id:524,name:'Roggenrola',types:['rock'],w:10},
  {id:527,name:'Woobat',types:['psychic','flying'],w:10},{id:529,name:'Drilbur',types:['ground'],w:10},
  {id:532,name:'Timburr',types:['fighting'],w:10},{id:535,name:'Tympole',types:['water'],w:10},
  {id:540,name:'Sewaddle',types:['bug','grass'],w:10},{id:543,name:'Venipede',types:['bug','poison'],w:10},
  {id:546,name:'Cottonee',types:['grass','fairy'],w:9},{id:551,name:'Sandile',types:['ground','dark'],w:9},
  {id:568,name:'Trubbish',types:['poison'],w:9},{id:577,name:'Solosis',types:['psychic'],w:8},
  {id:588,name:'Karrablast',types:['bug'],w:8},{id:592,name:'Frillish',types:['water','ghost'],w:8},
  {id:595,name:'Joltik',types:['bug','electric'],w:8},{id:607,name:'Litwick',types:['ghost','fire'],w:7},
  // Uncommon Gen 5
  {id:554,name:'Darumaka',types:['fire'],w:6},{id:559,name:'Scraggy',types:['dark','fighting'],w:6},
  {id:582,name:'Vanillite',types:['ice'],w:6},{id:602,name:'Tynamo',types:['electric'],w:5},
  {id:621,name:'Druddigon',types:['dragon'],w:5},{id:633,name:'Deino',types:['dark','dragon'],w:4},
  {id:610,name:'Axew',types:['dragon'],w:5},{id:570,name:'Zorua',types:['dark'],w:4},
  {id:616,name:'Shelmet',types:['bug'],w:7},{id:624,name:'Pawniard',types:['dark','steel'],w:5},
  {id:636,name:'Larvesta',types:['bug','fire'],w:3},
  // Uncommon
  {id:1,name:'Bulbasaur',types:['grass','poison'],w:8},{id:4,name:'Charmander',types:['fire'],w:8},
  {id:7,name:'Squirtle',types:['water'],w:8},{id:25,name:'Pikachu',types:['electric'],w:7},
  {id:35,name:'Clefairy',types:['normal','fairy'],w:7},{id:58,name:'Growlithe',types:['fire'],w:7},
  {id:79,name:'Slowpoke',types:['water','psychic'],w:6},{id:104,name:'Cubone',types:['ground'],w:6},
  {id:116,name:'Horsea',types:['water'],w:6},{id:147,name:'Dratini',types:['dragon'],w:5},
  {id:63,name:'Abra',types:['psychic'],w:4},{id:133,name:'Eevee',types:['normal'],w:4},
  {id:246,name:'Larvitar',types:['rock','ground'],w:4},{id:280,name:'Ralts',types:['psychic','fairy'],w:4},
  {id:333,name:'Swablu',types:['normal','flying'],w:4},{id:371,name:'Bagon',types:['dragon'],w:3},
  {id:443,name:'Gible',types:['dragon','ground'],w:3},{id:447,name:'Riolu',types:['fighting'],w:3},
  {id:349,name:'Feebas',types:['water'],w:2},{id:438,name:'Bonsly',types:['rock'],w:4},
  // Rare
  {id:123,name:'Scyther',types:['bug','flying'],w:3},{id:127,name:'Pinsir',types:['bug'],w:3},
  {id:130,name:'Gyarados',types:['water','flying'],w:2},{id:143,name:'Snorlax',types:['normal'],w:2},
  {id:94,name:'Gengar',types:['ghost','poison'],w:2},{id:106,name:'Hitmonlee',types:['fighting'],w:2},
  {id:107,name:'Hitmonchan',types:['fighting'],w:2},{id:113,name:'Chansey',types:['normal'],w:2},
  {id:131,name:'Lapras',types:['water','ice'],w:2},{id:149,name:'Dragonite',types:['dragon','flying'],w:1},
  {id:350,name:'Milotic',types:['water'],w:1.5},{id:359,name:'Absol',types:['dark'],w:2},
  // Legendaries
  {id:144,name:'Articuno',types:['ice','flying'],w:0.5},{id:145,name:'Zapdos',types:['electric','flying'],w:0.5},
  {id:146,name:'Moltres',types:['fire','flying'],w:0.5},{id:150,name:'Mewtwo',types:['psychic'],w:0.2},
  {id:151,name:'Mew',types:['psychic'],w:0.1},
];

function pickFromPool(pool) {
  const totalW = pool.reduce((s,p)=>s+p.w, 0);
  let r = Math.random() * totalW;
  for(const p of pool) { r -= p.w; if(r <= 0) return p; }
  return pool[0];
}

const EPIC_GACHA_POOL = [
  // Gen 1
  {id:1,name:'Bulbasaur',types:['grass','poison'],w:10},{id:4,name:'Charmander',types:['fire'],w:10},
  {id:7,name:'Squirtle',types:['water'],w:10},{id:25,name:'Pikachu',types:['electric'],w:9},
  {id:58,name:'Growlithe',types:['fire'],w:8},{id:147,name:'Dratini',types:['dragon'],w:7},
  {id:133,name:'Eevee',types:['normal'],w:8},{id:63,name:'Abra',types:['psychic'],w:7},
  {id:123,name:'Scyther',types:['bug','flying'],w:6},{id:130,name:'Gyarados',types:['water','flying'],w:5},
  {id:143,name:'Snorlax',types:['normal'],w:5},{id:149,name:'Dragonite',types:['dragon','flying'],w:4},
  {id:94,name:'Gengar',types:['ghost','poison'],w:5},{id:65,name:'Alakazam',types:['psychic'],w:4},
  {id:68,name:'Machamp',types:['fighting'],w:4},{id:131,name:'Lapras',types:['water','ice'],w:4},
  {id:113,name:'Chansey',types:['normal'],w:3},{id:115,name:'Kangaskhan',types:['normal'],w:4},
  {id:142,name:'Aerodactyl',types:['rock','flying'],w:3},{id:125,name:'Electabuzz',types:['electric'],w:5},
  {id:126,name:'Magmar',types:['fire'],w:5},{id:137,name:'Porygon',types:['normal'],w:3},
  // Gen 2
  {id:152,name:'Chikorita',types:['grass'],w:9},{id:155,name:'Cyndaquil',types:['fire'],w:9},
  {id:158,name:'Totodile',types:['water'],w:9},{id:246,name:'Larvitar',types:['rock','ground'],w:6},
  {id:248,name:'Tyranitar',types:['rock','dark'],w:3},{id:196,name:'Espeon',types:['psychic'],w:4},
  {id:197,name:'Umbreon',types:['dark'],w:4},{id:212,name:'Scizor',types:['bug','steel'],w:4},
  {id:229,name:'Houndoom',types:['dark','fire'],w:5},{id:245,name:'Suicune',types:['water'],w:2},
  {id:243,name:'Raikou',types:['electric'],w:2},{id:244,name:'Entei',types:['fire'],w:2},
  {id:237,name:'Hitmontop',types:['fighting'],w:4},{id:215,name:'Sneasel',types:['dark','ice'],w:5},
  {id:221,name:'Piloswine',types:['ice','ground'],w:4},{id:233,name:'Porygon2',types:['normal'],w:3},
  // Gen 3
  {id:252,name:'Treecko',types:['grass'],w:8},{id:255,name:'Torchic',types:['fire'],w:8},
  {id:258,name:'Mudkip',types:['water'],w:8},{id:280,name:'Ralts',types:['psychic','fairy'],w:6},
  {id:282,name:'Gardevoir',types:['psychic','fairy'],w:4},{id:333,name:'Swablu',types:['normal','flying'],w:5},
  {id:371,name:'Bagon',types:['dragon'],w:5},{id:373,name:'Salamence',types:['dragon','flying'],w:2},
  {id:374,name:'Beldum',types:['steel','psychic'],w:5},{id:376,name:'Metagross',types:['steel','psychic'],w:2},
  {id:304,name:'Aron',types:['steel','rock'],w:5},{id:306,name:'Aggron',types:['steel','rock'],w:2},
  {id:349,name:'Feebas',types:['water'],w:3},{id:350,name:'Milotic',types:['water'],w:2},
  {id:359,name:'Absol',types:['dark'],w:4},{id:354,name:'Banette',types:['ghost'],w:4},
  {id:380,name:'Latias',types:['dragon','psychic'],w:1},{id:381,name:'Latios',types:['dragon','psychic'],w:1},
  // Gen 4
  {id:387,name:'Turtwig',types:['grass'],w:8},{id:390,name:'Chimchar',types:['fire'],w:8},
  {id:393,name:'Piplup',types:['water'],w:8},{id:403,name:'Shinx',types:['electric'],w:7},
  {id:405,name:'Luxray',types:['electric'],w:4},{id:443,name:'Gible',types:['dragon','ground'],w:6},
  {id:445,name:'Garchomp',types:['dragon','ground'],w:2},{id:447,name:'Riolu',types:['fighting'],w:6},
  {id:448,name:'Lucario',types:['fighting','steel'],w:3},{id:479,name:'Rotom',types:['electric','ghost'],w:3},
  {id:461,name:'Weavile',types:['dark','ice'],w:3},{id:462,name:'Magnezone',types:['electric','steel'],w:3},
  {id:464,name:'Rhyperior',types:['ground','rock'],w:3},{id:468,name:'Togekiss',types:['normal','fairy'],w:3},
  {id:470,name:'Leafeon',types:['grass'],w:4},{id:471,name:'Glaceon',types:['ice'],w:4},
  {id:472,name:'Gliscor',types:['ground','flying'],w:3},{id:473,name:'Mamoswine',types:['ice','ground'],w:3},
  {id:475,name:'Gallade',types:['psychic','fighting'],w:3},{id:477,name:'Dusknoir',types:['ghost'],w:3},
  {id:478,name:'Froslass',types:['ice','ghost'],w:3},
  // Gen 5
  {id:495,name:'Snivy',types:['grass'],w:8},{id:498,name:'Tepig',types:['fire'],w:8},
  {id:501,name:'Oshawott',types:['water'],w:8},{id:570,name:'Zorua',types:['dark'],w:6},
  {id:571,name:'Zoroark',types:['dark'],w:3},{id:610,name:'Axew',types:['dragon'],w:5},
  {id:612,name:'Haxorus',types:['dragon'],w:2},{id:633,name:'Deino',types:['dark','dragon'],w:4},
  {id:635,name:'Hydreigon',types:['dark','dragon'],w:1.5},{id:559,name:'Scraggy',types:['dark','fighting'],w:5},
  {id:560,name:'Scrafty',types:['dark','fighting'],w:3},{id:529,name:'Drilbur',types:['ground'],w:5},
  {id:530,name:'Excadrill',types:['ground','steel'],w:3},{id:532,name:'Timburr',types:['fighting'],w:5},
  {id:534,name:'Conkeldurr',types:['fighting'],w:2},{id:607,name:'Litwick',types:['ghost','fire'],w:5},
  {id:609,name:'Chandelure',types:['ghost','fire'],w:2},{id:551,name:'Sandile',types:['ground','dark'],w:5},
  {id:553,name:'Krookodile',types:['ground','dark'],w:3},{id:577,name:'Solosis',types:['psychic'],w:5},
  {id:579,name:'Reuniclus',types:['psychic'],w:2},{id:624,name:'Pawniard',types:['dark','steel'],w:5},
  {id:625,name:'Bisharp',types:['dark','steel'],w:2},{id:636,name:'Larvesta',types:['bug','fire'],w:3},
  {id:637,name:'Volcarona',types:['bug','fire'],w:1},
  // Legendaries
  {id:144,name:'Articuno',types:['ice','flying'],w:3},{id:145,name:'Zapdos',types:['electric','flying'],w:3},
  {id:146,name:'Moltres',types:['fire','flying'],w:3},{id:150,name:'Mewtwo',types:['psychic'],w:1.5},
  {id:151,name:'Mew',types:['psychic'],w:1},{id:249,name:'Lugia',types:['psychic','flying'],w:1.5},
  {id:250,name:'Ho-Oh',types:['fire','flying'],w:1.5},{id:384,name:'Rayquaza',types:['dragon','flying'],w:0.5},
  {id:480,name:'Uxie',types:['psychic'],w:1},{id:481,name:'Mesprit',types:['psychic'],w:1},
  {id:482,name:'Azelf',types:['psychic'],w:1},{id:483,name:'Dialga',types:['steel','dragon'],w:0.8},
  {id:484,name:'Palkia',types:['water','dragon'],w:0.8},{id:485,name:'Heatran',types:['fire','steel'],w:0.8},
  {id:487,name:'Giratina',types:['ghost','dragon'],w:0.5},{id:488,name:'Cresselia',types:['psychic'],w:0.8},
  {id:491,name:'Darkrai',types:['dark'],w:0.5},{id:492,name:'Shaymin',types:['grass'],w:0.5},
];

function checkAndAnnounceCosmic(pk) {
  if(isCosmic(pk)) {
    addLog(`🌌 ${pk.name} is a COSMIC SHINY! (${countSS(pk)} SS IVs!)`, 'log-cosmic');
    toast(`🌌 COSMIC SHINY ${pk.name.toUpperCase()}! ${countSS(pk)} perfect IVs!`, 5000);
  }
}

async function doEpicGacha(count) {
  const cost = count === 1 ? 50 : 450;
  if(gameState.gems < cost) { toast('Not enough Gems! 💎'); return; }
  gameState.gems -= cost;
  updateResourceUI();

  const pulls = [];
  const itemDrops = [];
  for(let i=0; i<count; i++) {
    const chosen = pickFromPool(EPIC_GACHA_POOL);
    const isShiny = Math.random() < 1/64;
    const level = Math.min(175, Math.max(1, Math.floor(gameState.wave * 0.3 + 5)));
    const pk = newPokemonEntry(chosen.id, chosen.name, chosen.types, level, isShiny, true);
    pk.stats = await fetchPokemonStats(chosen.id);
    pk.statsLoaded = true;
    pk.currentHp = getMaxHp(pk);
    gameState.box.push(pk);
    pulls.push(pk);
    if(isCosmic(pk)) checkAndAnnounceCosmic(pk);
  }

  const pokePulls = pulls.filter(Boolean);
  if(count === 1 && pokePulls.length === 1) showGachaResult(pokePulls[0]);
  else if(count === 1 && pokePulls.length === 0) { /* item only */ renderAll(); }
  else showGachaResultMulti(pokePulls);
  renderAll();
}

// ============================================================
// EVENT BOSS - RAYQUAZA Lv.270
// ============================================================

let bossBattleActive = false;
let bossStarting = false; // prevents spawn overwrites during boss setup
let bossEnemy = null;

async function startEventBoss() {
  if(gameState.gems < 150) { toast('Need 150 💎 Gems to challenge the Boss!'); return; }
  if(gameState.team.length === 0) { toast('You need a team to fight the Boss!'); return; }
  battlePaused = true;
  document.getElementById('auto-btn').textContent = '▶ RESUME';
  document.getElementById('modal-title').textContent = '🐉 RAYQUAZA Lv.270';
  document.getElementById('modal-content').innerHTML = `
    <div style="text-align:center;padding:8px">
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/384.png" width="140" height="140" style="image-rendering:pixelated;filter:drop-shadow(0 0 20px rgba(100,255,100,0.6))">
      <div style="margin:10px 0;font-family:'Press Start 2P';font-size:8px;color:#ff9e40">THE SKY TITAN</div>
      <div style="font-size:14px;color:var(--text2);margin-bottom:12px">
        An ancient dragon slumbering above the clouds.<br>Only the strongest trainers can defeat it.<br><br>
        <span style="color:#ffd700">Drop: Rayquaza (1/25 shiny!)</span><br>
        <span style="color:#80deea">1% chance: ☄️ Meteorite drop!</span><br>
        <span style="color:#ffd700;font-size:12px">1% ☄️ Meteorite (5% chance: 🌌 Outer World variant!) → MEGA/OUTER MEGA form · SSS/OUTER stats!</span><br>
        <span style="color:var(--text2)">Cost: 150 💎</span>
      </div>
      <div style="display:flex;gap:8px;justify-content:center">
        <button class="btn" style="border-color:#ff6d00;color:#ff9e40" onclick="confirmStartBoss()">⚔️ Fight! (150💎)</button>
        <button class="btn gold" onclick="closeModal()">Back</button>
      </div>
    </div>
  `;
  openModal();
}

async function confirmStartBoss() {
  bossStarting = true;
  if(gameState.gems < 150) { toast('Not enough Gems!'); closeModal(); return; }
  gameState.gems -= 150;
  updateResourceUI();
  closeModal();
  battlePaused = true;
  playerAttackCooldown = 0;
  enemyAttackCooldown = 0;
  currentEnemy = null;
  const savedRoad = { ...gameState.road };
  gameState.road.active = false;
  document.getElementById('arena').classList.remove('road-mode');
  const rayquazaStats = await fetchPokemonStats(384);
  bossEnemy = newPokemonEntry(384, 'Rayquaza', ['dragon','flying'], 270, false, true);
  bossEnemy.stats = rayquazaStats;
  bossEnemy.statsLoaded = true;
  const baseHp = getMaxHp(bossEnemy);
  bossEnemy._bossHpMax = Math.floor(baseHp * 10);
  bossEnemy.currentHp = bossEnemy._bossHpMax;
  bossEnemy.isBoss = true;
  bossEnemy._savedRoad = savedRoad;
  bossEnemy._attackMult = 0.7;
  currentEnemy = bossEnemy;
  bossBattleActive = true;
  bossStarting = false;
  gameState.team.forEach(p => { if(p.statsLoaded) p.currentHp = getMaxHp(p); });
  document.getElementById('arena').style.background = 'radial-gradient(ellipse at 50% 0%, rgba(0,200,50,0.3) 0%, transparent 60%), linear-gradient(180deg, #000a00 0%, #001500 40%, #002000 100%)';
  addLog('🐉 RAYQUAZA descended from the sky!', 'log-evolve');
  toast('🐉 BOSS FIGHT: Rayquaza Lv.270! Full power!', 4000);
  battlePaused = false;
  updateEnemyUI();
}

function handleBossDefeated(player) {
  const savedRoad = bossEnemy?._savedRoad;
  bossBattleActive = false;
  currentEnemy = null;
  bossEnemy = null;
  document.getElementById('arena').style.background = '';
  if(savedRoad && savedRoad.active) { gameState.road = savedRoad; document.getElementById('arena').classList.add('road-mode'); }
  addLog('🎉 RAYQUAZA DEFEATED! You captured it!', 'log-evolve');
  toast('🏆 RAYQUAZA CAPTURED!', 5000);
  saveGame(); // auto-save on boss end
  // 1% chance to drop a Meteorite — 5% of that is an Outer World Meteor
  if(debugGuaranteeRareDrop || Math.random() < 0.01) {
    const isOuter = debugGuaranteeRareForm || Math.random() < 0.05;
    const dropId = isOuter ? 'outer_world_meteor' : 'meteorite';
    gameState.inventory[dropId] = (gameState.inventory[dropId] || 0) + 1;
    if(isOuter) {
      addLog('🌌 AN OUTER WORLD METEOR crashed down — a fragment from beyond the universe!', 'log-cosmic');
      toast('🌌 RARE DROP: Outer World Meteor!', 5000);
    } else {
      addLog('☄️ A METEORITE fell from the sky!', 'log-cosmic');
      toast('☄️ RARE DROP: Meteorite!', 5000);
    }
  }
  const isShiny = debugGuaranteeShinyDrop || Math.random() < 1/25;
  const rq = newPokemonEntry(384, 'Rayquaza', ['dragon','flying'], 270, isShiny);
  rq.ivs = generateHighIVs();
  fetchPokemonStats(384).then(stats => {
    rq.stats = stats;
    rq.statsLoaded = true;
    rq.currentHp = getMaxHp(rq);
    gameState.box.push(rq);
    checkAndAnnounceCosmic(rq);
    renderAll();
    showGachaResult(rq);
  });
  playerAttackCooldown = 0;
  enemyAttackCooldown = 0;
  const nextSpawn = (savedRoad && savedRoad.active) ? (savedRoad.mode === 'farm' ? spawnFarmEnemy : spawnRoadEnemy) : spawnEnemy;
  setTimeout(nextSpawn, 2000);
}

function handleBossFailed() {
  const savedRoad = bossEnemy?._savedRoad;
  bossBattleActive = false;
  bossStarting = false;
  currentEnemy = null;
  bossEnemy = null;
  document.getElementById('arena').style.background = '';
  if(savedRoad && savedRoad.active) { gameState.road = savedRoad; document.getElementById('arena').classList.add('road-mode'); }
  addLog('💀 RAYQUAZA DESTROYED YOUR TEAM! You fled!', 'log-dmg');
  toast('💀 Rayquaza wiped your team!', 5000);
  saveGame(); // auto-save on boss end
  gameState.team.forEach(p => { p.currentHp = Math.max(1, Math.floor(getMaxHp(p)*0.25)); });
  gameState.currentFighterIdx = 0;
  playerAttackCooldown = 0;
  enemyAttackCooldown = 0;
  renderAll();
  const nextSpawn = (savedRoad && savedRoad.active) ? (savedRoad.mode === 'farm' ? spawnFarmEnemy : spawnRoadEnemy) : spawnEnemy;
  setTimeout(nextSpawn, 2500);
}

// ============================================================
// VICTORY ROAD
// ============================================================

const VICTORY_ROAD_POOL = [
  {id:445,name:'Garchomp',types:['dragon','ground'],w:10},
  {id:983,name:'Kingambit',types:['dark','steel'],w:10},
  {id:149,name:'Dragonite',types:['dragon','flying'],w:8},
  {id:248,name:'Tyranitar',types:['rock','dark'],w:8},
  {id:260,name:'Swampert',types:['water','ground'],w:7},
  {id:373,name:'Salamence',types:['dragon','flying'],w:6},
  {id:376,name:'Metagross',types:['steel','psychic'],w:6},
  {id:466,name:'Electivire',types:['electric'],w:5},
  {id:467,name:'Magmortar',types:['fire'],w:5},
  {id:635,name:'Hydreigon',types:['dark','dragon'],w:3},
  {id:706,name:'Goodra',types:['dragon'],w:3},
  {id:448,name:'Lucario',types:['fighting','steel'],w:7},
  {id:395,name:'Empoleon',types:['water','steel'],w:7},
  {id:392,name:'Infernape',types:['fire','fighting'],w:7},
  {id:389,name:'Torterra',types:['grass','ground'],w:7},
  {id:282,name:'Gardevoir',types:['psychic','fairy'],w:6},
  {id:229,name:'Houndoom',types:['dark','fire'],w:6},
  {id:212,name:'Scizor',types:['bug','steel'],w:5},
  {id:398,name:'Staraptor',types:['normal','flying'],w:5},
  {id:644,name:'Zekrom',types:['dragon','electric'],w:2},
  {id:643,name:'Reshiram',types:['dragon','fire'],w:2},
  // Gen 5 additions
  {id:530,name:'Excadrill',types:['ground','steel'],w:8},
  {id:534,name:'Conkeldurr',types:['fighting'],w:7},
  {id:625,name:'Bisharp',types:['dark','steel'],w:7},
  {id:612,name:'Haxorus',types:['dragon'],w:6},
  {id:637,name:'Volcarona',types:['bug','fire'],w:4},
  {id:609,name:'Chandelure',types:['ghost','fire'],w:5},
  {id:553,name:'Krookodile',types:['ground','dark'],w:6},
  {id:571,name:'Zoroark',types:['dark'],w:5},
  {id:628,name:'Braviary',types:['normal','flying'],w:5},
  {id:623,name:'Golurk',types:['ground','ghost'],w:5},
  {id:635,name:'Hydreigon',types:['dark','dragon'],w:3},
  {id:579,name:'Reuniclus',types:['psychic'],w:4},
  {id:500,name:'Emboar',types:['fire','fighting'],w:6},
  {id:503,name:'Samurott',types:['water'],w:6},
  {id:497,name:'Serperior',types:['grass'],w:6},
];

const VR_FIXED_LEVEL = 250;
let vrBattleActive = false;
let vrEnemy = null;

function startVictoryRoad() {
  if(gameState.gems < 80) { toast('Need 80 💎 Gems to enter Victory Road!'); return; }
  if(gameState.team.length === 0) { toast('You need a team!'); return; }
  battlePaused = true;
  document.getElementById('auto-btn').textContent = '▶ RESUME';
  const chosen = pickFromPool(VICTORY_ROAD_POOL);
  document.getElementById('modal-title').textContent = '⛰️ VICTORY ROAD Lv.265';
  document.getElementById('modal-content').innerHTML = `
    <div style="text-align:center;padding:8px">
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${chosen.id}.png" width="120" height="120" style="image-rendering:pixelated;filter:drop-shadow(0 0 14px rgba(255,180,0,0.5))">
      <div style="margin:10px 0;font-family:'Press Start 2P';font-size:8px;color:#ffd700">VICTORY ROAD CHALLENGER</div>
      <div style="font-size:22px;color:var(--gold);margin-bottom:4px">${chosen.name} <span style="color:var(--text2);font-size:16px">Lv.${VR_FIXED_LEVEL}</span></div>
      <div style="display:flex;gap:4px;justify-content:center;margin-bottom:10px">
        ${chosen.types.map(t=>`<span class="type-badge" style="background:${TYPE_COLORS[t]}">${t}</span>`).join('')}
      </div>
      <div style="font-size:14px;color:var(--text2);margin-bottom:12px">
        <span style="color:var(--gold)">Capture chance: ~30% · Shiny: 1/50</span><br>
        <span style="color:var(--text2)">Cost: 80 💎 · Level stays at ${VR_FIXED_LEVEL}</span>
      </div>
      <div style="display:flex;gap:8px;justify-content:center">
        <button class="btn" style="border-color:#ffd700;color:#ffd700" onclick="confirmVictoryRoad(${chosen.id},'${chosen.name}','${chosen.types.join(',')}')">⚔️ Fight! (80💎)</button>
        <button class="btn gold" onclick="closeModal()">Back</button>
      </div>
    </div>
  `;
  openModal();
}

async function confirmVictoryRoad(id, name, typesStr) {
  if(gameState.gems < 80) { toast('Not enough Gems!'); closeModal(); return; }
  gameState.gems -= 80;
  updateResourceUI();
  closeModal();
  battlePaused = true;
  playerAttackCooldown = 0;
  enemyAttackCooldown = 0;
  currentEnemy = null;
  const savedRoad = { ...gameState.road };
  gameState.road.active = false;
  document.getElementById('arena').classList.remove('road-mode');
  const types = typesStr.split(',');
  const stats = await fetchPokemonStats(id);
  vrEnemy = newPokemonEntry(id, name, types, VR_FIXED_LEVEL, false, true);
  vrEnemy.stats = stats;
  vrEnemy.statsLoaded = true;
  vrEnemy._vrSavedRoad = savedRoad;
  vrEnemy._isVR = true;
  vrEnemy._attackMult = 0.65;
  const baseHp = getMaxHp(vrEnemy);
  vrEnemy._bossHpMax = Math.floor(baseHp * 7);
  vrEnemy.currentHp = vrEnemy._bossHpMax;
  vrEnemy.isBoss = true;
  currentEnemy = vrEnemy;
  vrBattleActive = true;
  bossBattleActive = true;
  gameState.team.forEach(p => { if(p.statsLoaded) p.currentHp = getMaxHp(p); });
  document.getElementById('arena').style.background = 'radial-gradient(ellipse at 30% 60%, rgba(150,80,0,0.4) 0%, transparent 50%), linear-gradient(180deg, #0a0500 0%, #1a0f00 40%, #100800 100%)';
  addLog(`⛰️ Victory Road: ${name} (Lv.${VR_FIXED_LEVEL}) appeared!`, 'log-evolve');
  toast(`⛰️ VICTORY ROAD: ${name} Lv.${VR_FIXED_LEVEL}!`, 3000);
  battlePaused = false;
  updateEnemyUI();
}

function handleVRDefeated(player) {
  const savedRoad = vrEnemy?._vrSavedRoad;
  vrBattleActive = false;
  bossBattleActive = false;
  const defeatedMon = vrEnemy;
  currentEnemy = null;
  vrEnemy = null;
  document.getElementById('arena').style.background = '';
  if(savedRoad && savedRoad.active) { gameState.road = savedRoad; document.getElementById('arena').classList.add('road-mode'); }
  addLog(`🏆 ${defeatedMon.name} was defeated on Victory Road!`, 'log-evolve');
  saveGame(); // auto-save on boss end
  const captureChance = 0.30;
  const canCapture = Math.random() < captureChance;
  const isShiny = Math.random() < 1/50;
  playerAttackCooldown = 0;
  enemyAttackCooldown = 0;
  showVRCaptureCutscene(defeatedMon, canCapture, isShiny, savedRoad);
}

function showVRCaptureCutscene(mon, canCapture, isShiny, savedRoad) {
  const overlay = document.getElementById('capture-overlay');
  const title = document.getElementById('capture-title');
  const spriteEl = document.getElementById('capture-sprite');
  const textEl = document.getElementById('capture-text');
  const btnsEl = document.getElementById('capture-btns');
  title.textContent = canCapture ? '⛰️ CAPTURE POSSIBLE!' : '⛰️ VICTORY ROAD CLEAR!';
  title.style.color = canCapture ? '#ffd700' : '#66bb6a';
  const spriteUrl = isShiny
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${mon.id}.png`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${mon.id}.png`;
  spriteEl.innerHTML = `<img src="${spriteUrl}" width="110" height="110" style="image-rendering:pixelated;${isShiny?'filter:drop-shadow(0 0 16px rgba(255,215,0,1)) drop-shadow(0 0 24px rgba(255,100,200,0.8))':''}">`;
  if(canCapture) {
    textEl.innerHTML = `<div style="font-size:18px;color:var(--gold);margin-bottom:4px">${isShiny?'✨ SHINY ':''}<b>${mon.name}</b></div><div style="color:var(--text2);margin-bottom:4px">Lv.${VR_FIXED_LEVEL} wants to join!</div>`;
    btnsEl.innerHTML = `<button class="btn gold" onclick="captureVRPokemon(${mon.id},'${mon.name}','${mon.types.join(',')}',${isShiny})">🎯 Capture!</button><button class="btn" onclick="skipVRCapture()">Pass</button>`;
  } else {
    textEl.innerHTML = `<div style="font-size:18px;color:var(--gold);margin-bottom:4px"><b>${mon.name}</b> fled!</div>`;
    btnsEl.innerHTML = `<button class="btn gold" style="width:100%" onclick="skipVRCapture()">Continue</button>`;
  }
  overlay.classList.add('active');
}

async function captureVRPokemon(id, name, typesStr, isShiny) {
  document.getElementById('capture-overlay').classList.remove('active');
  const types = typesStr.split(',');
  const pk = newPokemonEntry(id, name, types, VR_FIXED_LEVEL, isShiny);
  pk.ivs = generateHighIVs();
  pk.stats = await fetchPokemonStats(id);
  pk.statsLoaded = true;
  pk.currentHp = getMaxHp(pk);
  gameState.box.push(pk);
  checkAndAnnounceCosmic(pk);
  addLog(`${isShiny?'✨ SHINY ':''} ${name} captured from Victory Road!`, isShiny ? 'log-shiny' : 'log-evolve');
  toast(`${isShiny?'✨ SHINY ':''} ${name} captured!`, 4000);
  renderAll();
  showGachaResult(pk);
  setTimeout(() => {
    const savedRoad = { ...gameState.road };
    const nextSpawn = savedRoad.active ? (savedRoad.mode === 'farm' ? spawnFarmEnemy : spawnRoadEnemy) : spawnEnemy;
    nextSpawn();
  }, 500);
}

function skipVRCapture() {
  document.getElementById('capture-overlay').classList.remove('active');
  const savedRoad = { ...gameState.road };
  const nextSpawn = savedRoad.active ? (savedRoad.mode === 'farm' ? spawnFarmEnemy : spawnRoadEnemy) : spawnEnemy;
  setTimeout(nextSpawn, 600);
  renderAll();
}

function handleVRFailed() {
  const savedRoad = vrEnemy?._vrSavedRoad;
  vrBattleActive = false;
  bossBattleActive = false;
  currentEnemy = null;
  vrEnemy = null;
  document.getElementById('arena').style.background = '';
  if(savedRoad && savedRoad.active) { gameState.road = savedRoad; document.getElementById('arena').classList.add('road-mode'); }
  addLog('💀 Victory Road challenger wiped your team!', 'log-dmg');
  toast('💀 Defeated on Victory Road!', 4000);
  saveGame(); // auto-save on boss end
  gameState.team.forEach(p => { p.currentHp = Math.max(1, Math.floor(getMaxHp(p)*0.25)); });
  gameState.currentFighterIdx = 0;
  playerAttackCooldown = 0;
  enemyAttackCooldown = 0;
  renderAll();
  const nextSpawn = (savedRoad && savedRoad.active) ? (savedRoad.mode === 'farm' ? spawnFarmEnemy : spawnRoadEnemy) : spawnEnemy;
  setTimeout(nextSpawn, 2500);
}

// ============================================================
// MEGA CLASH
// ============================================================
const MEGA_CLASH_POOL = [
  {id:254, name:'Mega Sceptile',  baseId:254, types:['grass','dragon'],  stone:'sceptilite',  megaSpriteId:10065},
  {id:260, name:'Mega Swampert',  baseId:260, types:['water','ground'],  stone:'swampertite', megaSpriteId:10064},
  {id:257, name:'Mega Blaziken',  baseId:257, types:['fire','fighting'],  stone:'blazikenite', megaSpriteId:10050},
  {id:94,  name:'Mega Gengar',    baseId:94,  types:['ghost','poison'],   stone:'gengarite',   megaSpriteId:10038},
  {id:306, name:'Mega Aggron',    baseId:306, types:['steel'],            stone:'aggronite',   megaSpriteId:10053},
  {id:445, name:'Mega Garchomp',  baseId:445, types:['dragon','ground'],  stone:'garchompite', megaSpriteId:10058},
];
const MC_FIXED_LEVEL = 270;
let mcBattleActive = false;
let mcEnemy = null;

function startMegaClash() {
  if(gameState.gems < 125) { toast('Need 125 💎 Gems for Mega Clash!'); return; }
  if(gameState.team.length === 0) { toast('You need a team!'); return; }
  battlePaused = true;
  document.getElementById('auto-btn').textContent = '▶ RESUME';
  const chosen = MEGA_CLASH_POOL[Math.floor(Math.random() * MEGA_CLASH_POOL.length)];
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${chosen.megaSpriteId}.png`;
  document.getElementById('modal-title').textContent = '⚡ MEGA CLASH Lv.270';
  document.getElementById('modal-content').innerHTML = `
    <div style="text-align:center;padding:8px">
      <img src="${spriteUrl}" width="120" height="120" style="image-rendering:pixelated;filter:drop-shadow(0 0 14px rgba(0,230,118,0.7))">
      <div style="margin:10px 0;font-family:'Press Start 2P';font-size:8px;color:#00e676">MEGA CLASH CHALLENGER</div>
      <div style="font-size:22px;color:#69f0ae;margin-bottom:4px">${chosen.name} <span style="color:var(--text2);font-size:16px">Lv.${MC_FIXED_LEVEL}</span></div>
      <div style="display:flex;gap:4px;justify-content:center;margin-bottom:10px">
        ${chosen.types.map(t=>`<span class="type-badge" style="background:${TYPE_COLORS[t]}">${t}</span>`).join('')}
      </div>
      <div style="font-size:14px;color:var(--text2);margin-bottom:6px">
        <span style="color:#69f0ae">Capture chance: ~30% · Shiny: 1/50</span><br>
        <span style="color:#00e676">1% chance: random Mega Stone drop</span><br>
        <span style="color:var(--text2);font-size:12px">Cost: 125 💎 · Level stays at ${MC_FIXED_LEVEL}</span>
      </div>
      <div style="font-size:11px;color:#aaa;margin-bottom:12px">Stone drop is random — any of the 6 Mega Stones!</div>
      <div style="display:flex;gap:8px;justify-content:center">
        <button class="btn" style="border-color:#00e676;color:#00e676" onclick="confirmMegaClash(${chosen.baseId},'${chosen.name}','${chosen.types.join(',')}',${chosen.megaSpriteId},'${chosen.stone}')">⚡ Fight! (125💎)</button>
        <button class="btn gold" onclick="closeModal()">Back</button>
      </div>
    </div>
  `;
  openModal();
}

async function confirmMegaClash(baseId, name, typesStr, megaSpriteId, stone) {
  if(gameState.gems < 125) { toast('Not enough Gems!'); closeModal(); return; }
  gameState.gems -= 125;
  updateResourceUI();
  closeModal();
  battlePaused = true;
  playerAttackCooldown = 0;
  enemyAttackCooldown = 0;
  currentEnemy = null;
  const savedRoad = { ...gameState.road };
  gameState.road.active = false;
  document.getElementById('arena').classList.remove('road-mode');
  const types = typesStr.split(',');
  const stats = await fetchPokemonStats(baseId);
  mcEnemy = newPokemonEntry(baseId, name, types, MC_FIXED_LEVEL, false, true);
  mcEnemy.stats = stats;
  mcEnemy.statsLoaded = true;
  mcEnemy._mcSavedRoad = savedRoad;
  mcEnemy._isMC = true;
  mcEnemy._mcStone = stone;
  mcEnemy._mcMegaSpriteId = megaSpriteId;
  mcEnemy._customSprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${megaSpriteId}.png`;
  mcEnemy._attackMult = 0.7;
  const baseHp = getMaxHp(mcEnemy);
  mcEnemy._bossHpMax = Math.floor(baseHp * 7.5);
  mcEnemy.currentHp = mcEnemy._bossHpMax;
  mcEnemy.isBoss = true;
  currentEnemy = mcEnemy;
  mcBattleActive = true;
  bossBattleActive = true;
  gameState.team.forEach(p => { if(p.statsLoaded) p.currentHp = getMaxHp(p); });
  document.getElementById('arena').style.background = 'radial-gradient(ellipse at 50% 30%, rgba(0,120,60,0.5) 0%, transparent 60%), linear-gradient(180deg, #000d05 0%, #001a0b 40%, #000800 100%)';
  addLog(`⚡ Mega Clash: ${name} (Lv.${MC_FIXED_LEVEL}) appeared!`, 'log-evolve');
  toast(`⚡ MEGA CLASH: ${name} Lv.${MC_FIXED_LEVEL}!`, 3000);
  battlePaused = false;
  updateEnemyUI();
}

function handleMCDefeated(player) {
  const savedRoad = mcEnemy?._mcSavedRoad;
  const defeatedMon = mcEnemy;
  mcBattleActive = false;
  bossBattleActive = false;
  currentEnemy = null;
  mcEnemy = null;
  document.getElementById('arena').style.background = '';
  if(savedRoad && savedRoad.active) { gameState.road = savedRoad; document.getElementById('arena').classList.add('road-mode'); }
  addLog(`🏆 ${defeatedMon.name} was defeated in Mega Clash!`, 'log-evolve');
  saveGame();

  // 1% chance: award a RANDOM mega stone (as instanced, with bonus stats)
  const stoneDropped = Math.random() < 0.01;
  if(stoneDropped) {
    const ALL_STONES = ['sceptilite','swampertite','blazikenite','gengarite','aggronite','garchompite'];
    const droppedStone = ALL_STONES[Math.floor(Math.random() * ALL_STONES.length)];
    const STONE_NAMES = {sceptilite:'Sceptilite',swampertite:'Swampertite',blazikenite:'Blazikenite',gengarite:'Gengarite',aggronite:'Aggronite',garchompite:'Garchompite'};
    const BONUS_STATS = ['attack','speed'];
    const bonusStat = BONUS_STATS[Math.floor(Math.random()*BONUS_STATS.length)];
    const bonusPct  = +(0.04 + Math.random() * 0.06).toFixed(3);
    const instanceId = droppedStone + '_' + Date.now() + '_' + Math.floor(Math.random()*9999);
    if(!gameState.megaStoneInstances) gameState.megaStoneInstances = {};
    gameState.megaStoneInstances[instanceId] = { base: droppedStone, stat: bonusStat, pct: bonusPct };
    gameState.inventory[instanceId] = 1;
    const bonusLabel = `+${Math.round(bonusPct*100)}% ${bonusStat.replace('special-attack','Sp.Atk')}`;
    addLog(`💎 MEGA STONE DROPPED! ${STONE_NAMES[droppedStone]} (${bonusLabel})`, 'log-shiny');
    toast(`💎 ${STONE_NAMES[droppedStone]} (${bonusLabel}) dropped from Mega Clash!`, 5000);
    renderAll();
  }

  const captureChance = 0.30;
  const canCapture = Math.random() < captureChance;
  const isShiny = Math.random() < 1/50;
  playerAttackCooldown = 0;
  enemyAttackCooldown = 0;
  showMCCaptureCutscene(defeatedMon, canCapture, isShiny, savedRoad);
}

function showMCCaptureCutscene(mon, canCapture, isShiny, savedRoad) {
  const overlay = document.getElementById('capture-overlay');
  const title = document.getElementById('capture-title');
  const spriteEl = document.getElementById('capture-sprite');
  const textEl = document.getElementById('capture-text');
  const btnsEl = document.getElementById('capture-btns');
  title.textContent = canCapture ? '⚡ MEGA CLASH CAPTURE!' : '⚡ MEGA CLASH CLEAR!';
  title.style.color = canCapture ? '#00e676' : '#69f0ae';
  // Show base form sprite in capture screen
  const spriteUrl = isShiny
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${mon.id}.png`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${mon.id}.png`;
  const BASE_NAMES = {254:'Sceptile',260:'Swampert',257:'Blaziken',94:'Gengar',306:'Aggron',445:'Garchomp'};
  const baseName = BASE_NAMES[mon.id] || mon.name.replace(/^Mega\s+/i,'');
  spriteEl.innerHTML = `<img src="${spriteUrl}" width="110" height="110" style="image-rendering:pixelated;filter:drop-shadow(0 0 16px rgba(0,230,118,0.8))${isShiny?' drop-shadow(0 0 24px rgba(255,215,0,1))':''}">`;
  if(canCapture) {
    textEl.innerHTML = `<div style="font-size:18px;color:#69f0ae;margin-bottom:4px">${isShiny?'✨ SHINY ':''}<b>${baseName}</b></div><div style="color:var(--text2);margin-bottom:4px">Lv.${MC_FIXED_LEVEL} wants to join!</div>`;
    btnsEl.innerHTML = `<button class="btn" style="border-color:#00e676;color:#00e676" onclick="captureMCPokemon(${mon.id},'${mon.name}','${mon.types.join(',')}',${isShiny},${mon._mcMegaSpriteId||mon.id},'${mon._mcStone||''}')">🎯 Capture!</button><button class="btn" onclick="skipMCCapture()">Pass</button>`;
  } else {
    textEl.innerHTML = `<div style="font-size:18px;color:#69f0ae;margin-bottom:4px"><b>${baseName}</b> fled!</div>`;
    btnsEl.innerHTML = `<button class="btn" style="border-color:#00e676;color:#00e676;width:100%" onclick="skipMCCapture()">Continue</button>`;
  }
  overlay.classList.add('active');
}

async function captureMCPokemon(id, name, typesStr, isShiny, megaSpriteId, stone) {
  document.getElementById('capture-overlay').classList.remove('active');
  const types = typesStr.split(',');
  // Capture the BASE form (Gengar, Aggron, etc.) — not the mega
  const BASE_NAMES = {254:'Sceptile',260:'Swampert',257:'Blaziken',94:'Gengar',306:'Aggron',445:'Garchomp'};
  const baseName = BASE_NAMES[id] || name.replace(/^Mega\s+/i,'');
  const pk = newPokemonEntry(id, baseName, types, MC_FIXED_LEVEL, isShiny);
  pk.ivs = generateHighIVs();
  pk.stats = await fetchPokemonStats(id);
  pk.statsLoaded = true;
  pk.currentHp = getMaxHp(pk);
  gameState.box.push(pk);
  checkAndAnnounceCosmic(pk);
  addLog(`${isShiny?'✨ SHINY ':''} ${baseName} captured from Mega Clash!`, isShiny ? 'log-shiny' : 'log-evolve');
  toast(`${isShiny?'✨ SHINY ':''} ${baseName} captured!`, 4000);
  renderAll();
  showGachaResult(pk);
  setTimeout(() => {
    const savedRoad = { ...gameState.road };
    const nextSpawn = savedRoad.active ? (savedRoad.mode === 'farm' ? spawnFarmEnemy : spawnRoadEnemy) : spawnEnemy;
    nextSpawn();
  }, 500);
}

function skipMCCapture() {
  document.getElementById('capture-overlay').classList.remove('active');
  const savedRoad = { ...gameState.road };
  const nextSpawn = savedRoad.active ? (savedRoad.mode === 'farm' ? spawnFarmEnemy : spawnRoadEnemy) : spawnEnemy;
  setTimeout(nextSpawn, 600);
  renderAll();
}

function handleMCFailed() {
  const savedRoad = mcEnemy?._mcSavedRoad;
  mcBattleActive = false;
  bossBattleActive = false;
  currentEnemy = null;
  mcEnemy = null;
  document.getElementById('arena').style.background = '';
  if(savedRoad && savedRoad.active) { gameState.road = savedRoad; document.getElementById('arena').classList.add('road-mode'); }
  addLog('💀 Mega Clash challenger wiped your team!', 'log-dmg');
  toast('💀 Defeated in Mega Clash!', 4000);
  saveGame();
  gameState.team.forEach(p => { p.currentHp = Math.max(1, Math.floor(getMaxHp(p)*0.25)); });
  gameState.currentFighterIdx = 0;
  playerAttackCooldown = 0;
  enemyAttackCooldown = 0;
  renderAll();
  const nextSpawn = (savedRoad && savedRoad.active) ? (savedRoad.mode === 'farm' ? spawnFarmEnemy : spawnRoadEnemy) : spawnEnemy;
  setTimeout(nextSpawn, 2500);
}

async function doPokemonGacha(count) {
  const cost = count === 1 ? 5 : 40;
  if(gameState.gems < cost) { toast('Not enough Gems! 💎'); return; }
  gameState.gems -= cost;
  updateResourceUI();
  const pulls = [];
  for(let i=0; i<count; i++) {
    const chosen = pickFromPool(GACHA_POOL);
    const isShiny = Math.random() < 1/512;
    const level = Math.min(175, Math.max(1, Math.floor(gameState.wave * 0.3 + 2)));
    const pk = newPokemonEntry(chosen.id, chosen.name, chosen.types, level, isShiny, true);
    pk.stats = await fetchPokemonStats(chosen.id);
    pk.statsLoaded = true;
    pk.currentHp = getMaxHp(pk);
    gameState.box.push(pk);
    pulls.push(pk);
    if(isCosmic(pk)) checkAndAnnounceCosmic(pk);
  }
  if(count === 1) showGachaResult(pulls[0]);
  else showGachaResultMulti(pulls);
  renderAll();
}

async function doItemGacha(count) {
  const cost = count === 1 ? 200 : 1800;
  if(gameState.gold < cost) { toast('Not enough Gold! 💰'); return; }
  gameState.gold -= cost;
  updateResourceUI();
  const gotten = [];
  for(let i=0; i<count; i++) {
    const isRareCandy = Math.random() < 0.30;
    const item = isRareCandy ? EPIC_ITEMS.find(i=>i.id==='rare_candy') : ITEMS[Math.floor(Math.random()*ITEMS.length)];
    gameState.inventory[item.id] = (gameState.inventory[item.id] || 0) + 1;
    gotten.push(item);
  }
  const unique = [...new Set(gotten.map(i=>i.name))];
  toast(`Got items: ${unique.join(', ')}!`);
  renderAll();
  if(count === 1) showItemGachaResult(gotten[0]);
}

async function doEpicItemGacha(count) {
  const cost = count === 1 ? 5000 : 40000;
  if(gameState.gold < cost) { toast(`Need ${formatNum(cost)} 💰 Gold!`); return; }
  gameState.gold -= cost;
  updateResourceUI();
  const gotten = [];
  for(let i=0; i<count; i++) {
    const roll = Math.random();
    let item;
    let wasEpic = false;
    if(roll < 0.10) {
      // 10% Max Candy
      item = EPIC_ITEMS.find(e=>e.id==='max_candy');
      wasEpic = true;
    } else if(roll < 0.45) {
      // ~35% epic roll - exclude meteorite (boss-only drop) and max_candy (handled above)
      wasEpic = true;
      const epicPool = EPIC_ITEMS.filter(e => e.id !== 'meteorite' && e.id !== 'max_candy' && e.id !== 'origin_orb' && e.id !== 'dna_splicer' && e.id !== 'heros_sword' && e.id !== 'heros_shield' && e.id !== 'royal_sword' && e.id !== 'royal_shield' && e.id !== 'outer_world_meteor' && e.id !== 'sss_candy' && e.id !== 'sceptilite' && e.id !== 'swampertite' && e.id !== 'blazikenite' && e.id !== 'gengarite' && e.id !== 'aggronite' && e.id !== 'garchompite' && e.id !== 'red_orb' && e.id !== 'blue_orb' && e.id !== 'mysterious_meteorite');
      item = Math.random() < 0.60 ? EPIC_ITEMS.find(e=>e.id==='rare_candy') : epicPool[Math.floor(Math.random()*epicPool.length)];
    } else {
      item = ITEMS[Math.floor(Math.random()*ITEMS.length)];
    }
    gameState.inventory[item.id] = (gameState.inventory[item.id] || 0) + 1;
    gotten.push({...item, wasEpic});
  }
  const unique = [...new Set(gotten.map(i=>i.name))];
  toast(`💠 Items: ${unique.join(', ')}!`, 4000);
  renderAll();
  if(count === 1) showItemGachaResult(gotten[0]);
  else {
    document.getElementById('modal-title').textContent = '💠 Items Received!';
    document.getElementById('modal-content').innerHTML = `
      <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;padding:8px">
        ${gotten.map(item=>`<div style="text-align:center;background:${item.id==='max_candy'?'rgba(255,105,180,0.15)':item.wasEpic?'rgba(200,0,255,0.1)':'rgba(255,255,255,0.04)'};border:1px solid ${item.id==='max_candy'?'#ff69b4':item.wasEpic?'#e040fb':'var(--border)'};border-radius:8px;padding:10px;width:90px">
          <div style="font-size:36px">${item.emoji}</div>
          <div style="font-family:'Press Start 2P';font-size:6px;color:${item.id==='max_candy'?'#ff69b4':item.wasEpic?'#e040fb':'var(--gold)'};margin-top:4px">${item.name}</div>
          ${item.id==='max_candy'?'<div style="font-size:10px;color:#ff69b4">ULTRA RARE!</div>':item.wasEpic?'<div style="font-size:10px;color:#e040fb">EPIC!</div>':''}
        </div>`).join('')}
      </div>
      <button class="btn" onclick="closeModal()" style="width:100%;margin-top:12px">Nice haul!</button>
    `;
    openModal();
  }
}

// ── SSS Candy ──────────────────────────────────────────────────────────────
const LEGENDARY_IDS = new Set([
  144,145,146,150,151,243,244,245,249,250,251,377,378,379,380,381,382,383,384,
  385,386,480,481,482,483,484,485,486,487,488,489,490,491,492,493,638,639,640,
  641,642,643,644,645,646,647,648,716,717,718,721,785,786,787,788,789,790,791,
  792,800,801,802,888,889,890,891,892,893,894,895,896,897,898,905,
  718, // Zygarde 50%, 10%, Perfected all share same dex ID but we track via _zygardeForm
]);

function showSSSCandyModal() {
  const count = gameState.inventory['sss_candy'] || 0;
  if(count <= 0) { toast('No SSS Candy left!'); return; }
  const eligible = gameState.box.filter(p =>
    !LEGENDARY_IDS.has(p.id) && !p._sssUsed &&
    p.ivs && Object.values(p.ivs).some(iv => iv >= 31)
  );
  document.getElementById('modal-title').textContent = '\u2b50 SSS Candy \u2014 Pick Pokemon';
  document.getElementById('modal-content').innerHTML = `
    <div style="font-size:13px;color:var(--text2);margin-bottom:4px">Permanently elevates one SS stat to SSS (x2 that stat forever). Non-legendary only. One use per Pokemon.</div>
    <div style="font-size:13px;color:#ffd700;margin-bottom:10px">In Bag: <b>x${count}</b></div>
    ${eligible.length === 0 ? '<div style="color:#ef5350;text-align:center;padding:20px">No eligible Pokemon!<br><span style="font-size:12px;color:var(--text2)">Need a non-legendary with at least one SS stat that has not used SSS Candy yet.</span></div>' : ''}
    <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;max-height:360px;overflow-y:auto;padding:4px">
      ${eligible.map(p => {
        const cosmic = isCosmic(p);
        return `<div style="text-align:center;cursor:pointer;background:rgba(255,215,0,0.06);border:1px solid rgba(255,215,0,0.3);border-radius:8px;padding:8px;width:90px;transition:all 0.15s" onmouseover="this.style.borderColor='#ffd700';this.style.background='rgba(255,215,0,0.12)'" onmouseout="this.style.borderColor='rgba(255,215,0,0.3)';this.style.background='rgba(255,215,0,0.06)'" onclick="pickSSSCandyStat(${p.uid})">
          <img src="${getSpriteUrl(p.id, p.isShiny, p.uid)}" width="52" height="52" style="image-rendering:pixelated">
          <div style="font-family:'Press Start 2P';font-size:5px;color:${cosmic?'#00ffff':p.isShiny?'#ffd700':'var(--gold)'};margin-top:3px">${p.name}</div>
          <div style="font-size:11px;color:var(--text2)">Lv.${p.level}</div>
        </div>`;
      }).join('')}
    </div>
    <button class="btn" style="width:100%;margin-top:10px" onclick="closeModal()">Cancel</button>
  `;
  openModal();
}

function pickSSSCandyStat(uid) {
  const pk = gameState.box.find(p => p.uid === uid);
  if(!pk || !pk.ivs) return;
  const ssStats = Object.entries(pk.ivs).filter(([s, iv]) => iv >= 31);
  if(ssStats.length === 0) { toast('No SS stats on this Pokemon!'); return; }
  const lbl = {hp:'HP',attack:'ATK',defense:'DEF','special-attack':'SpA','special-defense':'SpD',speed:'SPD'};
  document.getElementById('modal-title').textContent = '\u2b50 ' + pk.name + ' \u2014 Choose SS Stat';
  document.getElementById('modal-content').innerHTML = `
    <div style="text-align:center;padding:8px">
      <img src="${getSpriteUrl(pk.id, pk.isShiny, pk.uid)}" width="80" height="80" style="image-rendering:pixelated">
      <div style="font-size:13px;color:var(--text2);margin:10px 0">Which SS stat to elevate to <span class="ss-rainbow" style="font-size:13px">SSS</span>?</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:14px">
        ${ssStats.map(([stat]) => `
          <button class="btn" style="border-color:#ffd700;color:#ffd700;padding:12px 18px;font-size:15px" onclick="applySSSCandy(${uid},'${stat}')">
            ${lbl[stat] || stat}
            <div style="font-family:'Press Start 2P';font-size:7px;margin-top:4px"><span class="ss-rainbow" style="animation:shimmer 0.8s linear infinite">SS \u2192 SSS</span></div>
          </button>`).join('')}
      </div>
      <button class="btn" onclick="showSSSCandyModal()" style="width:100%">\u2190 Back</button>
    </div>
  `;
}

function applySSSCandy(uid, statName) {
  const pk = gameState.box.find(p => p.uid === uid);
  if(!pk) return;
  if(pk._sssUsed) { toast('SSS Candy already used on this Pokemon!'); return; }
  if(!pk.ivs || pk.ivs[statName] < 31) { toast('That stat is not SS!'); return; }
  if((gameState.inventory['sss_candy'] || 0) <= 0) { toast('No SSS Candy left!'); return; }
  gameState.inventory['sss_candy']--;
  pk._sssUsed = true;
  pk._sssStat = statName;
  if(pk.stats) pk.currentHp = getMaxHp(pk);
  const lbl = {hp:'HP',attack:'ATK',defense:'DEF','special-attack':'SpA','special-defense':'SpD',speed:'SPD'};
  addLog('\u2b50 SSS Candy! ' + pk.name + ' ' + (lbl[statName]||statName) + ' reached SSS tier!', 'log-cosmic');
  toast('\u2b50 ' + pk.name + ' - ' + (lbl[statName]||statName) + ' is now SSS!', 4000);
  closeModal();
  renderAll();
}

// ── Premium Item Gacha ──────────────────────────────────────────────────────
async function doPremiumItemGacha() {
  const COST = 1500000;
  if(gameState.gold < COST) { toast('Need 1,500,000 Gold for Premium x10!'); return; }
  gameState.gold -= COST;
  updateResourceUI();

  const bossOnly = new Set(['meteorite','outer_world_meteor','origin_orb','dna_splicer','heros_sword','heros_shield','royal_sword','royal_shield','red_orb','blue_orb','mysterious_meteorite']);
  const epicPool  = EPIC_ITEMS.filter(e => !bossOnly.has(e.id) && e.id !== 'max_candy' && e.id !== 'rare_candy' && e.id !== 'sss_candy' && e.id !== 'sceptilite' && e.id !== 'swampertite' && e.id !== 'blazikenite' && e.id !== 'gengarite' && e.id !== 'aggronite' && e.id !== 'garchompite');
  const sssCandy  = EPIC_ITEMS.find(e => e.id === 'sss_candy');
  const maxCandy  = EPIC_ITEMS.find(e => e.id === 'max_candy');
  const rareCandy = EPIC_ITEMS.find(e => e.id === 'rare_candy');

  const gotten = [];
  for(let i = 0; i < 10; i++) {
    const roll = Math.random();
    let item, tier;
    if(roll < 0.007)       { item = sssCandy;   tier = 'sss';    }
    else if(roll < 0.062)  { item = maxCandy;   tier = 'epic';   }
    else if(roll < 0.35)   { item = epicPool[Math.floor(Math.random()*epicPool.length)]; tier = 'epic'; }
    else if(roll < 0.65)   { item = rareCandy;  tier = 'candy';  }
    else                   { item = ITEMS[Math.floor(Math.random()*ITEMS.length)]; tier = 'normal'; }

    gameState.inventory[item.id] = (gameState.inventory[item.id] || 0) + 1;
    gotten.push({...item, tier});
  }
  renderAll();

  const bg  = {sss:'rgba(255,215,0,0.22)',mega:'rgba(0,200,100,0.18)',epic:'rgba(200,0,255,0.12)',candy:'rgba(255,105,180,0.10)',normal:'rgba(255,255,255,0.04)'};
  const bdr = {sss:'#ffd700',mega:'#00e676',epic:'#e040fb',candy:'#ff69b4',normal:'var(--border)'};
  const clr = {sss:'#ffd700',mega:'#00e676',epic:'#e040fb',candy:'#ff69b4',normal:'var(--text)'};
  document.getElementById('modal-title').textContent = '\u2b50 Premium Items!';
  document.getElementById('modal-content').innerHTML = `
    <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;padding:8px;max-height:380px;overflow-y:auto">
      ${(()=>{
        const MEGA_SPRITES={sceptilite:'sceptilite',swampertite:'swampertite',blazikenite:'blazikenite',gengarite:'gengarite',aggronite:'aggronite',garchompite:'garchompite'};
        return gotten.map(it => {
          const baseId = it._instanceId ? getMegaStoneBaseId(it.id) : it.id;
          const megaKey = MEGA_SPRITES[baseId];
          const icon = megaKey
            ? `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${megaKey}.png" style="width:52px;height:52px;image-rendering:pixelated">`
            : `<div style="font-size:34px">${it.emoji}</div>`;
          return `<div style="text-align:center;background:${bg[it.tier]};border:1px solid ${bdr[it.tier]};border-radius:8px;padding:10px;width:90px">
            ${icon}
            <div style="font-family:'Press Start 2P';font-size:5px;color:${clr[it.tier]};margin-top:4px">${it.name}</div>
            ${it.tier==='sss'?'<div style="font-size:10px;color:#ffd700;margin-top:2px">SSS CANDY!</div>':it.tier==='mega'?`<div style="font-size:10px;color:#00e676;margin-top:2px">MEGA STONE!</div>${it._bonusStat?`<div style="font-size:9px;color:#b9f6ca;margin-top:1px">+${Math.round(it._bonusPct*100)}% ${it._bonusStat.replace('special-attack','Sp.Atk').replace('special-defense','Sp.Def')}</div>`:''}`:it.tier==='epic'?'<div style="font-size:10px;color:#e040fb">EPIC!</div>':''}
          </div>`;
        }).join('');
      })()}
    </div>
    <button class="btn" onclick="closeModal()" style="width:100%;margin-top:12px">Nice haul!</button>
  `;
  openModal();
}

// ── Limited Item Gacha ──────────────────────────────────────────────────────
// To move the event window: change LIMITED_GACHA_START (ISO 8601 UTC)
const LIMITED_GACHA_START = '2026-03-05T14:00:00Z';
const LIMITED_GACHA_DURATION_MS = 2 * 60 * 60 * 1000;

function getLimitedGachaMs() {
  const end = new Date(LIMITED_GACHA_START).getTime() + LIMITED_GACHA_DURATION_MS;
  const left = end - Date.now();
  return left > 0 ? left : null;
}

function updateLimitedGachaUI() {
  const timerEl = document.getElementById('limited-gacha-timer');
  const btnWrap = document.getElementById('limited-gacha-btn-wrap');
  if(!timerEl) return;
  const ms = getLimitedGachaMs();
  if(ms === null) {
    timerEl.textContent = 'Event has ended';
    timerEl.style.color = '#666';
    if(btnWrap) { btnWrap.style.opacity = '0.35'; btnWrap.style.pointerEvents = 'none'; }
  } else {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    timerEl.textContent = 'Ends in: ' + h + 'h ' + m + 'm ' + s + 's';
    timerEl.style.color = ms < 3600000 ? '#ff4444' : '#ff6b6b';
  }
}
setInterval(updateLimitedGachaUI, 1000);
setTimeout(updateLimitedGachaUI, 500);

async function doLimitedItemGacha() {
  if(getLimitedGachaMs() === null) { toast('The Limited Item Gacha has ended!'); return; }
  const COST = 15000000;
  if(gameState.gold < COST) { toast('Need 15,000,000 Gold for Limited x10!'); return; }
  gameState.gold -= COST;
  updateResourceUI();

  const bossIds = ['meteorite','origin_orb','dna_splicer','heros_sword','heros_shield'];
  const bossPool = bossIds.map(function(id){ return EPIC_ITEMS.find(function(e){ return e.id===id; }); }).filter(Boolean);
  const excludeIds = ['meteorite','outer_world_meteor','origin_orb','dna_splicer','heros_sword','heros_shield','royal_sword','royal_shield','sss_candy'];
  const epicPool = EPIC_ITEMS.filter(function(e){ return !excludeIds.includes(e.id); });
  const rareCandy = EPIC_ITEMS.find(function(e){ return e.id === 'rare_candy'; });
  const maxCandy  = EPIC_ITEMS.find(function(e){ return e.id === 'max_candy'; });

  const gotten = [];
  for(let i = 0; i < 10; i++) {
    const roll = Math.random();
    let item, tier;
    if(roll < 0.01)      { item = bossPool[Math.floor(Math.random()*bossPool.length)]; tier = 'boss'; }
    else if(roll < 0.06) { item = maxCandy;  tier = 'epic'; }
    else if(roll < 0.30) { item = epicPool[Math.floor(Math.random()*epicPool.length)]; tier = 'epic'; }
    else if(roll < 0.60) { item = rareCandy; tier = 'candy'; }
    else                 { item = ITEMS[Math.floor(Math.random()*ITEMS.length)]; tier = 'normal'; }
    gameState.inventory[item.id] = (gameState.inventory[item.id] || 0) + 1;
    gotten.push({name:item.name, emoji:item.emoji, tier:tier});
  }
  renderAll();

  const bg  = {boss:'rgba(255,60,0,0.25)', epic:'rgba(200,0,255,0.12)', candy:'rgba(255,105,180,0.10)', normal:'rgba(255,255,255,0.04)'};
  const bdr = {boss:'#ff4444', epic:'#e040fb', candy:'#ff69b4', normal:'var(--border)'};
  const clr = {boss:'#ff6b6b', epic:'#e040fb', candy:'#ff69b4', normal:'var(--text)'};
  document.getElementById('modal-title').textContent = 'Limited Items!';
  let cards = '';
  gotten.forEach(function(it) {
    const badge = it.tier==='boss' ? '<div style="font-size:9px;color:#ff4444;margin-top:2px">BOSS DROP!</div>'
                : it.tier==='epic' ? '<div style="font-size:10px;color:#e040fb">EPIC!</div>' : '';
    cards += '<div style="text-align:center;background:'+bg[it.tier]+';border:1px solid '+bdr[it.tier]+';border-radius:8px;padding:10px;width:90px">'
           + '<div style="font-size:34px">'+it.emoji+'</div>'
           + '<div style="font-family:\'Press Start 2P\';font-size:5px;color:'+clr[it.tier]+';margin-top:4px">'+it.name+'</div>'
           + badge + '</div>';
  });
  document.getElementById('modal-content').innerHTML =
    '<div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;padding:8px;max-height:380px;overflow-y:auto">'+cards+'</div>'
    + '<button class="btn" onclick="closeModal()" style="width:100%;margin-top:12px">Nice haul!</button>';
  openModal();
}


async function doShinyGacha() {
  const cost = 450;
  if(gameState.gems < cost) { toast(`Need ${cost} 💎 Gems!`); return; }
  gameState.gems -= cost;
  updateResourceUI();
  const chosen = pickFromPool(EPIC_GACHA_POOL);
  const level = Math.min(175, Math.max(1, Math.floor(gameState.wave * 0.3 + 5)));
  const pk = newPokemonEntry(chosen.id, chosen.name, chosen.types, level, true, true);
  pk.stats = await fetchPokemonStats(chosen.id);
  pk.statsLoaded = true;
  pk.currentHp = getMaxHp(pk);
  gameState.box.push(pk);
  checkAndAnnounceCosmic(pk);
  addLog(`✨ SHINY ${chosen.name} obtained from Shiny Gacha!`, 'log-shiny');
  showGachaResult(pk);
  renderAll();
}

// ============================================================
// BOX SORT
// ============================================================

let boxSortMode = 'default';
let boxSortAsc = true;

function sortBox(mode) {
  if(boxSortMode === mode) boxSortAsc = !boxSortAsc;
  else { boxSortMode = mode; boxSortAsc = mode !== 'level'; }
  renderPokemonBox();
  toast(`Sorted by: ${mode}`);
}

function getBoxSorted() {
  const arr = [...gameState.box];
  const dir = boxSortAsc ? 1 : -1;
  switch(boxSortMode) {
    case 'level': return arr.sort((a,b)=>dir*(b.level-a.level));
    case 'name': return arr.sort((a,b)=>dir*a.name.localeCompare(b.name));
    case 'shiny': return arr.sort((a,b)=>{
      if(isCosmic(a) && !isCosmic(b)) return -1;
      if(!isCosmic(a) && isCosmic(b)) return 1;
      if(a.isShiny && !b.isShiny) return -1;
      if(!a.isShiny && b.isShiny) return 1;
      return b.level-a.level;
    });
    case 'type': return arr.sort((a,b)=>dir*a.types[0].localeCompare(b.types[0]));
    case 'stats': return arr.sort((a,b)=>{
      const gradeOrder = {'SSS':9,'SS':7,'S':6,'A':5,'B':4,'C':3,'D':2,'F':1};
      const overallGrade = p => {
        const ivs = p.ivs || {};
        const vals = Object.values(ivs);
        if(!vals.length) return 0;
        const avg = vals.reduce((s,v)=>s+v,0) / vals.length;
        const isMega = isMegaRayquaza(p); const isOrigin = isOriginGiratina(p);
        const isFused = isDNAFused(p); const isCrownedForm = isCrownedZacian(p) || isCrownedZamazenta(p);
        const isMegaStart = isMegaSceptile(p)||isMegaSwampert(p)||isMegaBlaziken(p);
        const isMegaNew = isMegaGengar(p)||isMegaAggron(p)||isMegaGarchomp(p);
        const hasSSStat = (isMega||isOrigin||isFused||p._naturalSSS||isCrownedForm||p._sssUsed||p._isEnvy||isMegaStart||isPerfectedZygarde(p)||isMegaNew) && vals.some(iv=>iv>=31);
        if(hasSSStat) return gradeOrder['SSS'];
        return gradeOrder[getStatGrade(Math.round(avg)).label] || 0;
      };
      const diff = (overallGrade(b) - overallGrade(a)) * dir;
      if(diff !== 0) return diff;
      const sumIVs = p => Object.values(p.ivs||{}).reduce((s,v)=>s+v,0);
      return (sumIVs(b) - sumIVs(a)) * dir;
    });
    case 'team': return arr.sort((a,b)=>{
      const aInTeam = gameState.team.includes(a) ? 0 : 1;
      const bInTeam = gameState.team.includes(b) ? 0 : 1;
      if(aInTeam !== bInTeam) return aInTeam - bInTeam;
      return b.level - a.level;
    });
    default: return arr;
  }
}

function doDaily() {
  const now = Date.now();
  if(gameState.dailyClaimed && now - gameState.lastDaily < 86400000) { toast('Daily already claimed! Come back tomorrow.'); return; }
  gameState.lastDaily = now;
  gameState.dailyClaimed = true;
  gameState.gems += 3;
  gameState.gold += 300;
  toast('🎁 Daily claimed! +3 💎 +300 💰');
  document.getElementById('daily-btn').textContent = 'CLAIMED ✓';
  updateResourceUI();
  doPokemonGacha(1).then(()=>{ gameState.gems += 5; });
}
