// ============================================================
// TRADING SYSTEM
// ============================================================

function encodePokemonTrade(pk) {
  const data = {
    uid: pk.uid, id: pk.id, name: pk.name, types: pk.types, level: pk.level,
    isShiny: pk.isShiny, exp: pk.exp, expToNext: pk.expToNext,
    stats: pk.stats, statsLoaded: pk.statsLoaded, ivs: pk.ivs,
    ot: pk.ot || gameState.trainerName, currentHp: pk.currentHp,
  };
  return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}

function decodePokemonTrade(code) {
  try {
    const data = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
    if(!data.id || !data.name) throw new Error('Invalid');
    return data;
  } catch(e) { return null; }
}

function openTradeForPokemon(uid) {
  const pk = gameState.box.find(p => p.uid === uid);
  if(!pk) return;
  openTradeOverlay();
  showOnlineTradeConfirm(uid);
}

function openTradeForItem(itemId) {
  const allItems = ITEMS.concat(EPIC_ITEMS);
  const item = allItems.find(i => i.id === itemId);
  if(!item) return;
  const count = gameState.inventory[itemId] || 0;
  if(count <= 0) { toast('No more of that item!'); return; }
  openTradeOverlay();
  showOnlineItemAmountPicker(itemId);
}

function openTradeOverlay() {
  document.getElementById('trade-overlay').classList.add('active');
  renderOnlineTradeMenu();
}

function closeTradeOverlay() {
  document.getElementById('trade-overlay').classList.remove('active');
  clearOnlineCountdown();
}

function switchTradeTab(tab) {
  // Tabs removed — all trades go through online now
  renderOnlineTradeMenu();
}

function renderTradeMenu() {
  renderOnlineTradeMenu();
}


// ============================================================
// GIRATINA BOSS
// ============================================================

let giratinaBattleActive = false;
let giratinaEnemy = null;

async function startGiratinaBoss() {
  if(gameState.gems < 250) { toast('Need 250 💎 Gems to challenge Giratina!'); return; }
  if(gameState.team.length === 0) { toast('You need a team!'); return; }
  battlePaused = true;
  document.getElementById('auto-btn').textContent = '▶ RESUME';
  document.getElementById('modal-title').textContent = '👻 GIRATINA Lv.270';
  document.getElementById('modal-content').innerHTML = `
    <div style="text-align:center;padding:8px">
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/487.png" width="140" height="140" style="image-rendering:pixelated;filter:drop-shadow(0 0 24px rgba(150,0,255,0.8))">
      <div style="margin:10px 0;font-family:'Press Start 2P';font-size:8px;color:#ce93d8">THE RENEGADE POKÉMON</div>
      <div style="font-size:14px;color:var(--text2);margin-bottom:12px">
        A fearsome dragon from the Distortion World.<br>Stronger than Rayquaza in every way.<br><br>
        <span style="color:#ffd700">Drop: Giratina (1/20 shiny!)</span><br>
        <span style="color:#ce93d8;font-size:12px">1% 🔮 Origin Orb · Transforms Giratina!</span>
        <span style="color:#ce93d8">Stats: 1.4× Rayquaza's power</span><br>
        <span style="color:var(--text2)">Cost: 250 💎</span>
      </div>
      <div style="display:flex;gap:8px;justify-content:center">
        <button class="btn" style="border-color:#9c27b0;color:#ce93d8" onclick="confirmGiratinaBoss()">⚔️ Fight! (250💎)</button>
        <button class="btn gold" onclick="closeModal()">Back</button>
      </div>
    </div>
  `;
  openModal();
}

async function confirmGiratinaBoss() {
  bossStarting = true;
  if(gameState.gems < 250) { toast('Not enough Gems!'); closeModal(); return; }
  gameState.gems -= 250;
  updateResourceUI();
  closeModal();
  battlePaused = true;
  playerAttackCooldown = 0;
  enemyAttackCooldown = 0;
  currentEnemy = null;
  const savedRoad = { ...gameState.road };
  gameState.road.active = false;
  document.getElementById('arena').classList.remove('road-mode');

  // Giratina is Pokemon #487 (Origin Forme)
  const giratinaStats = await fetchPokemonStats(487);
  // Scale stats 1.4x vs Rayquaza: we'll use level 378 = 270 * 1.4
  giratinaEnemy = newPokemonEntry(487, 'Giratina', ['ghost','dragon'], 270, false, true);
  giratinaEnemy.stats = giratinaStats;
  giratinaEnemy.statsLoaded = true;
  giratinaEnemy._bossHpMax = 32000;
  giratinaEnemy.currentHp = giratinaEnemy._bossHpMax;
  giratinaEnemy.isBoss = true;
  giratinaEnemy._isGiratina = true;
  giratinaEnemy._savedRoad = savedRoad;
  giratinaEnemy._attackMult = 0.8;
  currentEnemy = giratinaEnemy;
  giratinaBattleActive = true;
  bossBattleActive = true;
  bossStarting = false;
  gameState.team.forEach(p => { if(p.statsLoaded) p.currentHp = getMaxHp(p); });
  document.getElementById('arena').style.background = 'radial-gradient(ellipse at 50% 0%, rgba(130,0,200,0.4) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(50,0,100,0.5) 0%, transparent 50%), linear-gradient(180deg, #05000a 0%, #100020 40%, #080015 100%)';
  addLog('👻 GIRATINA emerged from the Distortion World!', 'log-cosmic');
  toast('👻 BOSS FIGHT: Giratina Lv.378! The Renegade awakens!', 4000);
  battlePaused = false;
  updateEnemyUI();
}

function handleGiratinaDefeated(player) {
  const savedRoad = giratinaEnemy?._savedRoad;
  giratinaBattleActive = false;
  bossBattleActive = false;
  currentEnemy = null;
  giratinaEnemy = null;
  document.getElementById('arena').style.background = '';
  if(savedRoad && savedRoad.active) { gameState.road = savedRoad; document.getElementById('arena').classList.add('road-mode'); }
  addLog('🎉 GIRATINA DEFEATED! You captured it!', 'log-cosmic');
  toast('🏆 GIRATINA CAPTURED!', 5000);
  saveGame(); // auto-save on boss end
  // 1% chance to drop Origin Orb (or guaranteed if debug flag set)
  if(debugGuaranteeRareDrop || Math.random() < 0.01) {
    gameState.inventory['origin_orb'] = (gameState.inventory['origin_orb'] || 0) + 1;
    addLog('🔮 A mysterious ORIGIN ORB fell from the Distortion World!', 'log-cosmic');
    toast('🔮 RARE DROP: Origin Orb!', 5000);
  }
  const isShiny = debugGuaranteeShinyDrop || Math.random() < 1/20;
  const gt = newPokemonEntry(487, 'Giratina', ['ghost','dragon'], 270, isShiny);
  gt.ivs = generateHighIVs();
  fetchPokemonStats(487).then(stats => {
    gt.stats = stats;
    gt.statsLoaded = true;
    gt.currentHp = getMaxHp(gt);
    gameState.box.push(gt);
    checkAndAnnounceCosmic(gt);
    renderAll();
    showGachaResult(gt);
  });
  playerAttackCooldown = 0;
  enemyAttackCooldown = 0;
  const nextSpawn = (savedRoad && savedRoad.active) ? (savedRoad.mode === 'farm' ? spawnFarmEnemy : spawnRoadEnemy) : spawnEnemy;
  setTimeout(nextSpawn, 2000);
}

function handleGiratinaFailed() {
  const savedRoad = giratinaEnemy?._savedRoad;
  giratinaBattleActive = false;
  bossBattleActive = false;
  bossStarting = false;
  currentEnemy = null;
  giratinaEnemy = null;
  document.getElementById('arena').style.background = '';
  if(savedRoad && savedRoad.active) { gameState.road = savedRoad; document.getElementById('arena').classList.add('road-mode'); }
  addLog('💀 GIRATINA DEVOURED YOUR TEAM and returned to the Distortion World!', 'log-dmg');
  toast('💀 Giratina destroyed your team!', 5000);
  saveGame(); // auto-save on boss end
  gameState.team.forEach(p => { p.currentHp = Math.max(1, Math.floor(getMaxHp(p)*0.20)); });
  gameState.currentFighterIdx = 0;
  playerAttackCooldown = 0;
  enemyAttackCooldown = 0;
  renderAll();
  const nextSpawn = (savedRoad && savedRoad.active) ? (savedRoad.mode === 'farm' ? spawnFarmEnemy : spawnRoadEnemy) : spawnEnemy;
  setTimeout(nextSpawn, 2500);
}


// ============================================================
// EVENT BOSS SYSTEM
// ============================================================

// To add a new event boss, just add an entry to this array.
// startDate / endDate are ISO strings (UTC). Set endDate to
// far future while an event is "permanent until replaced".
const EVENT_BOSSES = [
  {
    id: 'deoxys',
    name: 'Deoxys',
    pokeId: 386,
    types: ['psychic'],
    level: 270,
    bossHp: 60000,
    attackMult: 0.9,
    canBeShiny: true,
    shinyChance: 1/30,
    naturalSSS: true,
    catchChance: 0.30,
    cost: 500,
    costLabel: '💎 500',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/diamond-pearl/386.png',
    spriteShiny: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/diamond-pearl/shiny/386.png',
    artworkFallback: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/diamond-pearl/386.png',
    color: '#ce93d8',
    borderColor: '#9c27b0',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, rgba(160,0,255,0.35) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(60,0,100,0.5) 0%, transparent 50%), linear-gradient(180deg, #050010 0%, #0f0020 40%, #080015 100%)',
    badgeText: '🌌 THE DNA POKÉMON',
    badgeColor: '#ce93d8',
    flavorText: 'A Pokémon that emerged from a meteorite crash 65 million years ago.<br>Its DNA is unlike any creature of this world.<br><br>',
    statsText: '<span style="color:#ce93d8">60,000 HP · Shiny 1/30!</span><br><span style="color:#ffd700;font-size:12px">Can roll naturally with SSS stats! 30% catch rate!</span><br><span style="color:#f48fb1;font-size:12px">1% ☄️ Mysterious Meteorite · Transforms Deoxys into 3 forms!</span><br>',
    logStartText: '🌌 DEOXYS descended from the cosmos!',
    logDefeatText: '🎉 DEOXYS DEFEATED! The alien Pokémon acknowledges your power!',
    logFailText: '💀 DEOXYS warped away… your team could not match its alien mind!',
    dropText: 'Drop: Deoxys (Shiny 1/30 · Natural SSS · 30% catch!)',
    rareDrop: {
      itemId: 'mysterious_meteorite',
      emoji: '☄️',
      name: 'Mysterious Meteorite',
      chance: 0.01,
      logText: '☄️ A MYSTERIOUS METEORITE fell from the sky — the mark of an alien Pokémon!',
      toastText: 'Mysterious Meteorite',
    },
    startDate: '2026-03-13T00:00:00Z',
    endDate:   '2026-03-27T23:59:59Z',
  },
  // Template for future event bosses:
  // {
  //   id: 'next_event',
  //   name: 'Event Pokémon',
  //   pokeId: 999,
  //   types: ['type1'],
  //   level: 270,
  //   bossHp: 45000,
  //   attackMult: 0.9,
  //   canBeShiny: false,
  //   naturalSSS: false,
  //   cost: 400,
  //   costLabel: '💎 400',
  //   sprite: 'https://...',
  //   artworkFallback: 'https://...',
  //   color: '#xxx',
  //   borderColor: '#xxx',
  //   bgGradient: '...',
  //   badgeText: '...',
  //   badgeColor: '#xxx',
  //   flavorText: '...',
  //   statsText: '...',
  //   logStartText: '...',
  //   logDefeatText: '...',
  //   logFailText: '...',
  //   dropText: '...',
  //   rareDrop: { itemId: 'item_id', emoji: '🔮', name: 'Item Name', chance: 0.01, logText: '...', toastText: '...' },
  //   startDate: '2025-06-01T00:00:00Z',
  //   endDate:   '2025-07-01T00:00:00Z',
  // },
];

function getActiveEventBoss() {
  const now = Date.now();
  return EVENT_BOSSES.find(e => {
    const start = new Date(e.startDate).getTime();
    const end   = new Date(e.endDate).getTime();
    return now >= start && now <= end;
  }) || null;
}

let eventBossBattleActive = false;
let eventBossEnemy = null;

function startEventBossChallenge() {
  const ev = getActiveEventBoss();
  if(!ev) { toast('No event boss is active right now!', 3000); return; }
  if(gameState.gems < ev.cost) { toast(`Need ${ev.costLabel} to challenge ${ev.name}!`, 3000); return; }
  if(gameState.team.length === 0) { toast('You need a team!'); return; }
  battlePaused = true;
  document.getElementById('auto-btn').textContent = '▶ RESUME';
  document.getElementById('modal-title').textContent = `⭐ ${ev.name}`;
  document.getElementById('modal-content').innerHTML = `
    <div style="text-align:center;padding:8px">
      <img src="${ev.sprite}" width="140" height="140" style="image-rendering:pixelated;filter:drop-shadow(0 0 24px ${ev.color}aa)" onerror="this.src='${ev.artworkFallback}'">      <div style="margin:10px 0;font-family:'Press Start 2P';font-size:8px;color:${ev.badgeColor}">${ev.badgeText}</div>
      <div style="font-size:14px;color:var(--text2);margin-bottom:12px">
        ${ev.flavorText}
        <span style="color:#ffd700">${ev.dropText}</span><br>
        ${ev.statsText}
        <span style="color:var(--text2)">Cost: ${ev.costLabel}</span>
      </div>
      <div style="display:flex;gap:8px;justify-content:center">
        <button class="btn" style="border-color:${ev.borderColor};color:${ev.color}" onclick="confirmEventBoss()">⚔️ Fight! (${ev.costLabel})</button>
        <button class="btn gold" onclick="closeModal()">Back</button>
      </div>
    </div>
  `;
  openModal();
}

async function confirmEventBoss() {
  const ev = getActiveEventBoss();
  if(!ev) { toast('Event has ended!', 3000); closeModal(); return; }
  if(gameState.gems < ev.cost) { toast('Not enough Gems!'); closeModal(); return; }
  gameState.gems -= ev.cost;
  updateResourceUI();
  closeModal();
  battlePaused = true;
  playerAttackCooldown = 0;
  enemyAttackCooldown = 0;
  currentEnemy = null;
  const savedRoad = { ...gameState.road };
  gameState.road.active = false;
  document.getElementById('arena').classList.remove('road-mode');

  const fetchedStats = await fetchPokemonStats(ev.pokeId);
  eventBossEnemy = newPokemonEntry(ev.pokeId, ev.name, ev.types, ev.level, false, true);
  eventBossEnemy.stats = fetchedStats;
  eventBossEnemy.statsLoaded = true;
  eventBossEnemy._bossHpMax = ev.bossHp;
  eventBossEnemy.currentHp = ev.bossHp;
  eventBossEnemy.isBoss = true;
  eventBossEnemy._isEventBoss = true;
  eventBossEnemy._eventBossId = ev.id;
  eventBossEnemy._savedRoad = savedRoad;
  eventBossEnemy._attackMult = ev.attackMult;
  if(ev.naturalSSS) eventBossEnemy._naturalSSS = true;
  // Use the custom sprite URL directly for battle display
  eventBossEnemy._customSprite = ev.sprite;
  eventBossEnemy._spriteFallback = ev.artworkFallback;
  // For shiny boss sprite (displayed on the shiny catch result)
  eventBossEnemy._customSpriteShiny = ev.spriteShiny || ev.sprite;

  currentEnemy = eventBossEnemy;
  eventBossBattleActive = true;
  bossBattleActive = true;
  gameState.team.forEach(p => { if(p.statsLoaded) p.currentHp = getMaxHp(p); });
  document.getElementById('arena').style.background = ev.bgGradient;
  addLog(ev.logStartText, 'log-cosmic');
  toast(`⭐ EVENT BOSS: ${ev.name}!`, 4000);
  battlePaused = false;
  updateEnemyUI();
}

function handleEventBossDefeated(player) {
  const ev = EVENT_BOSSES.find(e => e.id === eventBossEnemy?._eventBossId) || EVENT_BOSSES[0];
  const savedRoad = eventBossEnemy?._savedRoad;
  eventBossBattleActive = false;
  bossBattleActive = false;
  currentEnemy = null;
  eventBossEnemy = null;
  document.getElementById('arena').style.background = '';
  if(savedRoad && savedRoad.active) { gameState.road = savedRoad; document.getElementById('arena').classList.add('road-mode'); }
  addLog(ev.logDefeatText, 'log-cosmic');
  toast(`🏆 ${ev.name.toUpperCase()} CAPTURED!`, 5000);
  saveGame(); // auto-save on boss end
  // Rare item drop
  if(ev.rareDrop && (debugGuaranteeRareDrop || Math.random() < ev.rareDrop.chance)) {
    gameState.inventory[ev.rareDrop.itemId] = (gameState.inventory[ev.rareDrop.itemId] || 0) + 1;
    addLog(ev.rareDrop.logText, 'log-cosmic');
    toast(`${ev.rareDrop.emoji} RARE DROP: ${ev.rareDrop.name}!`, 5000);
  }
  // Drop the pokemon (never shiny if canBeShiny=false, custom shinyChance if set)
  const shinyProb = ev.shinyChance !== undefined ? ev.shinyChance : 1/20;
  const isShiny = ev.canBeShiny && (debugGuaranteeShinyDrop || Math.random() < shinyProb);
  const caught = newPokemonEntry(ev.pokeId, ev.name, ev.types, ev.level, isShiny);
  caught.ivs = generateHighIVs();
  // naturalSSS on the caught pokemon mirrors boss catchChance or defaults to 30%
  const naturalSSSChance = ev.catchChance !== undefined ? ev.catchChance : 0.30;
  if(ev.naturalSSS && Math.random() < naturalSSSChance) caught._naturalSSS = true;
  // Set sprite: use shiny variant if caught shiny and spriteShiny exists, else normal sprite
  if(ev.sprite) caught._customSprite = (isShiny && ev.spriteShiny) ? ev.spriteShiny : ev.sprite;
  if(ev.spriteFallback) caught._spriteFallback = ev.artworkFallback;
  // Mark Deoxys so item equip UI can identify it
  if(ev.id === 'deoxys') caught._isDeoxys = true;
  fetchPokemonStats(ev.pokeId).then(stats => {
    caught.stats = stats;
    caught.statsLoaded = true;
    caught.currentHp = getMaxHp(caught);
    gameState.box.push(caught);
    checkAndAnnounceCosmic(caught);
    renderAll();
    showGachaResult(caught);
  });
  playerAttackCooldown = 0;
  enemyAttackCooldown = 0;
  const nextSpawn = (savedRoad && savedRoad.active) ? (savedRoad.mode === 'farm' ? spawnFarmEnemy : spawnRoadEnemy) : spawnEnemy;
  setTimeout(nextSpawn, 2000);
}

function handleEventBossFailed() {
  const ev = EVENT_BOSSES.find(e => e.id === eventBossEnemy?._eventBossId) || EVENT_BOSSES[0];
  const savedRoad = eventBossEnemy?._savedRoad;
  eventBossBattleActive = false;
  bossBattleActive = false;
  currentEnemy = null;
  eventBossEnemy = null;
  document.getElementById('arena').style.background = '';
  if(savedRoad && savedRoad.active) { gameState.road = savedRoad; document.getElementById('arena').classList.add('road-mode'); }
  addLog(ev.logFailText, 'log-dmg');
  toast(`💀 ${ev.name} escaped!`, 5000);
  saveGame(); // auto-save on boss end
  gameState.team.forEach(p => { p.currentHp = Math.max(1, Math.floor(getMaxHp(p)*0.20)); });
  gameState.currentFighterIdx = 0;
  playerAttackCooldown = 0;
  enemyAttackCooldown = 0;
  renderAll();
  const nextSpawn = (savedRoad && savedRoad.active) ? (savedRoad.mode === 'farm' ? spawnFarmEnemy : spawnRoadEnemy) : spawnEnemy;
  setTimeout(nextSpawn, 2500);
}

initPresetSystem();
initStarterScreen();

// Show gem boost banner only while event is active
if(isGemBoostActive()) {
  document.getElementById('gem-boost-banner').style.display = '';
}

// ============================================================
// KYUREM BOSS
// ============================================================

let kyuremBattleActive = false;
let kyuremEnemy = null;

// SWORD & SHIELD BOSS
// ============================================================

let swordShieldBattleActive = false;
let swordShieldEnemy = null;

async function startKyuremBoss() {
  if(gameState.gems < 350) { toast('Need 350 💎 Gems to challenge Kyurem!'); return; }
  if(gameState.team.length === 0) { toast('You need a team!'); return; }
  battlePaused = true;
  document.getElementById('auto-btn').textContent = '▶ RESUME';
  document.getElementById('modal-title').textContent = '🐲 KYUREM Lv.270';
  document.getElementById('modal-content').innerHTML = `
    <div style="text-align:center;padding:8px">
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/646.png" width="140" height="140" style="image-rendering:pixelated;filter:drop-shadow(0 0 24px rgba(0,200,255,0.9))">
      <div style="margin:10px 0;font-family:'Press Start 2P';font-size:8px;color:#80deea">THE BOUNDARY POKÉMON</div>
      <div style="font-size:14px;color:var(--text2);margin-bottom:12px">
        An ancient dragon of ice lurking in the frozen ruins.<br>More devastating than even Giratina.<br><br>
        <span style="color:#ffd700">Drop: Kyurem (1/20 shiny!)</span><br>
        <span style="color:#80deea">37,000 HP · Relentless ice power</span><br>
        <span style="color:#80deea;font-size:12px">1% 🧬 DNA Splicer · Fuse with Zekrom/Reshiram!</span><br>
        <span style="color:var(--text2)">Cost: 350 💎</span>
      </div>
      <div style="display:flex;gap:8px;justify-content:center">
        <button class="btn" style="border-color:#4dd0e1;color:#80deea" onclick="confirmKyuremBoss()">⚔️ Fight! (350💎)</button>
        <button class="btn gold" onclick="closeModal()">Back</button>
      </div>
    </div>
  `;
  openModal();
}

async function confirmKyuremBoss() {
  bossStarting = true;
  if(gameState.gems < 350) { toast('Not enough Gems!'); closeModal(); return; }
  gameState.gems -= 350;
  updateResourceUI();
  closeModal();
  battlePaused = true;
  playerAttackCooldown = 0;
  enemyAttackCooldown = 0;
  currentEnemy = null;
  const savedRoad = { ...gameState.road };
  gameState.road.active = false;
  document.getElementById('arena').classList.remove('road-mode');

  const kyuremStats = await fetchPokemonStats(646);
  kyuremEnemy = newPokemonEntry(646, 'Kyurem', ['dragon','ice'], 270, false, true);
  kyuremEnemy.stats = kyuremStats;
  kyuremEnemy.statsLoaded = true;
  kyuremEnemy._bossHpMax = 37000;
  kyuremEnemy.currentHp = kyuremEnemy._bossHpMax;
  kyuremEnemy.isBoss = true;
  kyuremEnemy._isKyurem = true;
  kyuremEnemy._savedRoad = savedRoad;
  kyuremEnemy._attackMult = 1.0; // slightly more than Giratina's 0.8
  currentEnemy = kyuremEnemy;
  kyuremBattleActive = true;
  bossBattleActive = true;
  bossStarting = false;
  gameState.team.forEach(p => { if(p.statsLoaded) p.currentHp = getMaxHp(p); });
  document.getElementById('arena').style.background = 'radial-gradient(ellipse at 50% 0%, rgba(0,180,255,0.35) 0%, transparent 60%), radial-gradient(ellipse at 80% 90%, rgba(0,80,140,0.5) 0%, transparent 50%), linear-gradient(180deg, #000a12 0%, #001a2e 40%, #000d1a 100%)';
  addLog('🐲 KYUREM descended from the frozen tundra!', 'log-cosmic');
  toast('🐲 BOSS FIGHT: Kyurem Lv.270! The Boundary awakens!', 4000);
  battlePaused = false;
  updateEnemyUI();
}

function handleKyuremDefeated(player) {
  const savedRoad = kyuremEnemy?._savedRoad;
  kyuremBattleActive = false;
  bossBattleActive = false;
  currentEnemy = null;
  kyuremEnemy = null;
  document.getElementById('arena').style.background = '';
  if(savedRoad && savedRoad.active) { gameState.road = savedRoad; document.getElementById('arena').classList.add('road-mode'); }
  addLog('🎉 KYUREM DEFEATED! The ice dragon is yours!', 'log-cosmic');
  toast('🏆 KYUREM CAPTURED!', 5000);
  saveGame(); // auto-save on boss end
  // 1% chance to drop DNA Splicer (or guaranteed if debug flag set)
  if(debugGuaranteeRareDrop || Math.random() < 0.01) {
    gameState.inventory['dna_splicer'] = (gameState.inventory['dna_splicer'] || 0) + 1;
    addLog('🧬 A mysterious DNA SPLICER fell from the frozen ruins!', 'log-cosmic');
    toast('🧬 RARE DROP: DNA Splicer!', 5000);
  }
  const isShiny = debugGuaranteeShinyDrop || Math.random() < 1/20;
  const ky = newPokemonEntry(646, 'Kyurem', ['dragon','ice'], 270, isShiny);
  ky.ivs = generateHighIVs();
  fetchPokemonStats(646).then(stats => {
    ky.stats = stats;
    ky.statsLoaded = true;
    ky.currentHp = getMaxHp(ky);
    gameState.box.push(ky);
    checkAndAnnounceCosmic(ky);
    renderAll();
    showGachaResult(ky);
  });
  playerAttackCooldown = 0;
  enemyAttackCooldown = 0;
  const nextSpawn = (savedRoad && savedRoad.active) ? (savedRoad.mode === 'farm' ? spawnFarmEnemy : spawnRoadEnemy) : spawnEnemy;
  setTimeout(nextSpawn, 2000);
}

function handleKyuremFailed() {
  const savedRoad = kyuremEnemy?._savedRoad;
  kyuremBattleActive = false;
  bossBattleActive = false;
  bossStarting = false;
  currentEnemy = null;
  kyuremEnemy = null;
  document.getElementById('arena').style.background = '';
  if(savedRoad && savedRoad.active) { gameState.road = savedRoad; document.getElementById('arena').classList.add('road-mode'); }
  addLog('💀 KYUREM FROZE YOUR ENTIRE TEAM and vanished into the blizzard!', 'log-dmg');
  toast('💀 Kyurem destroyed your team!', 5000);
  saveGame(); // auto-save on boss end
  gameState.team.forEach(p => { p.currentHp = Math.max(1, Math.floor(getMaxHp(p)*0.20)); });
  gameState.currentFighterIdx = 0;
  playerAttackCooldown = 0;
  enemyAttackCooldown = 0;
  renderAll();
  const nextSpawn = (savedRoad && savedRoad.active) ? (savedRoad.mode === 'farm' ? spawnFarmEnemy : spawnRoadEnemy) : spawnEnemy;
  setTimeout(nextSpawn, 2500);
}

// ============================================================
// ZYGARDE BOSS
// ============================================================

let zygardeBattleActive = false;
let zygardeEnemy = null;

async function startZygardeBoss() {
  if(gameState.gems < 400) { toast('Need 400 💎 Gems to challenge Zygarde!'); return; }
  if(gameState.team.length === 0) { toast('You need a team!'); return; }
  battlePaused = true;
  document.getElementById('auto-btn').textContent = '▶ RESUME';
  const cells = gameState.inventory['zygarde_cell'] || 0;
  document.getElementById('modal-title').textContent = '🌿 ZYGARDE Lv.270';
  document.getElementById('modal-content').innerHTML = `
    <div style="text-align:center;padding:8px">
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10119.png" width="140" height="140" style="image-rendering:pixelated;filter:drop-shadow(0 0 24px rgba(0,220,100,0.8))">
      <div style="margin:10px 0;font-family:'Press Start 2P';font-size:8px;color:#69f0ae">THE ORDER POKÉMON · 50% FORM</div>
      <div style="font-size:14px;color:var(--text2);margin-bottom:12px">
        A serpent made of countless cells, guarding the ecosystem.<br><br>
        <span style="color:#ffd700">Reward: 1–5 Zygarde Cells per win!</span><br>
        <span style="color:#69f0ae">Cells: <b style="color:#ffd700">${cells}</b> / 10 → Zygarde 10% · 50 → upgrade to 50% · 100 more → Perfected!</span><br>
        <span style="color:var(--text2)">Cost: 400 💎</span>
      </div>
      <div style="display:flex;gap:8px;justify-content:center">
        <button class="btn" style="border-color:#00c853;color:#69f0ae" onclick="confirmZygardeBoss()">⚔️ Fight! (400💎)</button>
        <button class="btn gold" onclick="closeModal()">Back</button>
      </div>
    </div>
  `;
  openModal();
}

async function confirmZygardeBoss() {
  bossStarting = true;
  if(gameState.gems < 400) { toast('Not enough Gems!'); closeModal(); bossStarting = false; return; }
  gameState.gems -= 400;
  updateResourceUI();
  closeModal();
  battlePaused = true;
  playerAttackCooldown = 0;
  enemyAttackCooldown = 0;
  currentEnemy = null;
  const savedRoad = { ...gameState.road };
  gameState.road.active = false;
  document.getElementById('arena').classList.remove('road-mode');

  const zyStats = await fetchPokemonStats(718);
  zygardeEnemy = newPokemonEntry(718, 'Zygarde', ['dragon','ground'], 270, false, true);
  zygardeEnemy.stats = zyStats;
  zygardeEnemy.statsLoaded = true;
  zygardeEnemy._bossHpMax = 43000;
  zygardeEnemy.currentHp = zygardeEnemy._bossHpMax;
  zygardeEnemy.isBoss = true;
  zygardeEnemy._isZygarde = true;
  zygardeEnemy._zygardeForm = '_boss50'; // use 50% boss sprite
  zygardeEnemy._savedRoad = savedRoad;
  zygardeEnemy._attackMult = 0.9;
  currentEnemy = zygardeEnemy;
  zygardeBattleActive = true;
  bossBattleActive = true;
  bossStarting = false;
  gameState.team.forEach(p => { if(p.statsLoaded) p.currentHp = getMaxHp(p); });
  document.getElementById('arena').style.background = 'radial-gradient(ellipse at 50% 0%, rgba(0,200,80,0.35) 0%, transparent 60%), radial-gradient(ellipse at 80% 90%, rgba(0,100,40,0.5) 0%, transparent 50%), linear-gradient(180deg, #000a05 0%, #001a0a 40%, #000d05 100%)';
  addLog('🌿 ZYGARDE appeared from the earth — its cells unite!', 'log-cosmic');
  toast('🌿 BOSS FIGHT: Zygarde Lv.270! The Order Pokémon!', 4000);
  battlePaused = false;
  updateEnemyUI();
}

function handleZygardeDefeated(player) {
  const savedRoad = zygardeEnemy?._savedRoad;
  zygardeBattleActive = false;
  bossBattleActive = false;
  currentEnemy = null;
  zygardeEnemy = null;
  document.getElementById('arena').style.background = '';
  if(savedRoad && savedRoad.active) { gameState.road = savedRoad; document.getElementById('arena').classList.add('road-mode'); }
  addLog('🎉 ZYGARDE DEFEATED! Its cells scatter...', 'log-cosmic');
  toast('🏆 ZYGARDE DEFEATED!', 5000);
  saveGame();
  // Give 1–5 Zygarde Cells
  const cellsGained = Math.floor(Math.random() * 5) + 1;
  gameState.inventory['zygarde_cell'] = (gameState.inventory['zygarde_cell'] || 0) + cellsGained;
  addLog(`🟢 Collected ${cellsGained} Zygarde Cell${cellsGained>1?'s':''}! Total: ${gameState.inventory['zygarde_cell']}`, 'log-heal');
  toast(`🟢 +${cellsGained} Zygarde Cell${cellsGained>1?'s':''}! (${gameState.inventory['zygarde_cell']} total)`, 4000);
  // Check if we can fuse into 10%
  const totalCells = gameState.inventory['zygarde_cell'] || 0;
  if(totalCells >= 10) {
    toast(`🟢 You have ${totalCells} cells! Open Items to fuse Zygarde 10%!`, 5000);
  }
  renderAll();
  playerAttackCooldown = 0;
  enemyAttackCooldown = 0;
  const nextSpawn = (savedRoad && savedRoad.active) ? (savedRoad.mode === 'farm' ? spawnFarmEnemy : spawnRoadEnemy) : spawnEnemy;
  setTimeout(nextSpawn, 2000);
}

function handleZygardeFailed() {
  const savedRoad = zygardeEnemy?._savedRoad;
  zygardeBattleActive = false;
  bossBattleActive = false;
  bossStarting = false;
  currentEnemy = null;
  zygardeEnemy = null;
  document.getElementById('arena').style.background = '';
  if(savedRoad && savedRoad.active) { gameState.road = savedRoad; document.getElementById('arena').classList.add('road-mode'); }
  addLog('💀 ZYGARDE reclaimed the earth — your team was overwhelmed!', 'log-dmg');
  toast('💀 Zygarde defeated your team!', 5000);
  saveGame();
  gameState.team.forEach(p => { p.currentHp = Math.max(1, Math.floor(getMaxHp(p)*0.20)); });
  gameState.currentFighterIdx = 0;
  playerAttackCooldown = 0;
  enemyAttackCooldown = 0;
  renderAll();
  const nextSpawn = (savedRoad && savedRoad.active) ? (savedRoad.mode === 'farm' ? spawnFarmEnemy : spawnRoadEnemy) : spawnEnemy;
  setTimeout(nextSpawn, 2500);
}

function showZygardeCellModal() {
  const cells = gameState.inventory['zygarde_cell'] || 0;

  let fuseBtns = '';
  if(cells >= 10)
    fuseBtns += `<button class="btn" style="border-color:#69f0ae;color:#69f0ae;width:100%;margin-top:8px" onclick="closeModal();fuseZygarde10()">🟢 Fuse Zygarde 10% (10 cells)</button>`;
  else
    fuseBtns += `<button class="btn" style="border-color:#444;color:#666;width:100%;margin-top:8px;cursor:not-allowed" disabled>🟢 Fuse Zygarde 10% (need 10 cells)</button>`;

  document.getElementById('modal-title').textContent = '🟢 Zygarde Cells';
  document.getElementById('modal-content').innerHTML = `
    <div style="text-align:center;padding:8px">
      <div style="font-size:48px;margin-bottom:6px">🟢</div>
      <div style="font-size:22px;color:#69f0ae;margin-bottom:4px">×${cells} Cells</div>
      <div style="color:var(--text2);font-size:13px;margin-bottom:14px">Defeat Zygarde on Diamond Road to collect cells. Fuse them to obtain Zygarde in different forms.</div>
      <div style="font-size:12px;color:#8888bb;margin-bottom:12px;line-height:1.8">
        10 cells → <span style="color:#69f0ae">Zygarde 10%</span><br>
        + 50 cells → <span style="color:#a5d6a7">Zygarde 50%</span> (via stat card)<br>
        + 100 cells → <span style="color:#00e676">Perfected Zygarde (SSS)</span> (via stat card)
      </div>
      ${fuseBtns}
      <button class="btn gold" style="width:100%;margin-top:10px" onclick="closeModal()">Close</button>
    </div>
  `;
  openModal();
}

function confirmZygardeTransform(uid, targetForm) {
  const pk = gameState.box.find(p => p.uid == uid);
  if(!pk) return;
  const cost = targetForm === '50' ? 50 : 100;
  const cells = gameState.inventory['zygarde_cell'] || 0;
  const targetName = targetForm === '50' ? 'Zygarde 50%' : 'Perfected Zygarde';
  const targetColor = targetForm === '50' ? '#69f0ae' : '#00e676';
  const targetEmoji = targetForm === '50' ? '🌿' : '✨';
  document.getElementById('modal-title').textContent = `${targetEmoji} Transform Zygarde`;
  document.getElementById('modal-content').innerHTML = `
    <div style="text-align:center;padding:8px">
      <div style="font-size:42px;margin-bottom:8px">${targetEmoji}</div>
      <div style="color:${targetColor};font-size:18px;margin-bottom:6px">${pk.name} → ${targetName}</div>
      <div style="color:var(--text2);font-size:14px;margin-bottom:4px">This will consume <span style="color:#69f0ae">${cost} Zygarde Cells</span>.</div>
      <div style="color:#a5d6a7;font-size:13px;margin-bottom:16px">You have: ${cells} cells</div>
      <div style="display:flex;gap:8px;justify-content:center">
        <button class="btn" style="border-color:${targetColor};color:${targetColor}" onclick="doZygardeTransform('${uid}','${targetForm}')">${targetEmoji} Yes, Transform!</button>
        <button class="btn gold" onclick="showPokemonInfoCard(gameState.box.find(p=>p.uid===${uid}))">Cancel</button>
      </div>
    </div>
  `;
  openModal();
}

function doZygardeTransform(uid, targetForm) {
  const numUid = Number(uid);
  const pk = gameState.box.find(p => p.uid === numUid);
  if(!pk) { closeModal(); return; }
  if(targetForm === '50') {
    upgradeZygarde50(numUid);
  } else {
    upgradeZygardePerfected(numUid);
  }
}


async function fuseZygarde10() {
  const cells = gameState.inventory['zygarde_cell'] || 0;
  if(cells < 10) { toast(`Need 10 Zygarde Cells! You have ${cells}.`); return; }
  gameState.inventory['zygarde_cell'] -= 10;
  const isShiny = Math.random() < 1/20;
  const zy10 = newPokemonEntry(718, 'Zygarde 10%', ['dragon','ground'], 270, isShiny);
  zy10._zygardeForm = '10';
  zy10.ivs = generateHighIVs();
  const stats = await fetchPokemonStats(718);
  zy10.stats = stats;
  zy10.statsLoaded = true;
  zy10.currentHp = getMaxHp(zy10);
  gameState.box.push(zy10);
  checkAndAnnounceCosmic(zy10);
  renderAll();
  addLog(`🟢 10 cells fused! Zygarde 10%${isShiny?' ✨ SHINY':''} added to your box!`, 'log-heal');
  toast(`🟢 Zygarde 10%${isShiny?' ✨ SHINY!':''} obtained!`, 4000);
  showGachaResult(zy10);
  saveGame();
}

// Upgrade 10% → 50% (costs 50 cells, modifies existing pokemon)
function upgradeZygarde50(uid) {
  const pk = gameState.box.find(p=>p.uid===uid);
  if(!pk || pk.id !== 718 || pk._zygardeForm !== '10') { toast('Need a Zygarde 10% for this!'); return; }
  const cells = gameState.inventory['zygarde_cell'] || 0;
  if(cells < 50) { toast(`Need 50 Zygarde Cells to upgrade! You have ${cells}.`); return; }
  gameState.inventory['zygarde_cell'] -= 50;
  pk._zygardeForm = '50';
  pk.name = 'Zygarde 50%';
  pk.ivs = generateHighIVs();
  if(pk.statsLoaded) pk.currentHp = getMaxHp(pk);
  addLog(`🌿 Zygarde evolved from 10% to 50% Form!`, 'log-evolve');
  toast(`🌿 Zygarde 50% Form! Power rising!`, 4000);
  renderAll();
  closeModal();
  saveGame();
}

// Upgrade 50% → Perfected (costs 100 cells)
function upgradeZygardePerfected(uid) {
  const pk = gameState.box.find(p=>p.uid===uid);
  if(!pk || pk.id !== 718 || pk._zygardeForm !== '50') { toast('Need a Zygarde 50% for this!'); return; }
  const cells = gameState.inventory['zygarde_cell'] || 0;
  if(cells < 100) { toast(`Need 100 Zygarde Cells to perfect! You have ${cells}.`); return; }
  gameState.inventory['zygarde_cell'] -= 100;
  pk._zygardeForm = 'perfected';
  pk.name = 'Perfected Zygarde';
  pk.ivs = generateHighIVs();
  if(pk.statsLoaded) pk.currentHp = getMaxHp(pk);
  addLog(`✨ ZYGARDE PERFECTED! All 100% of its cells united!`, 'log-cosmic');
  toast(`✨ PERFECTED ZYGARDE! Maximum power!`, 5000);
  renderAll();
  closeModal();
  saveGame();
}

// ============================================================
// GROUDON & KYOGRE BOSS
// ============================================================

async function startGroudonKyogreBoss() {
  if(gameState.gems < 400) { toast('Need 400 💎 Gems to challenge the Ancient Titans!'); return; }
  if(gameState.team.length === 0) { toast('You need a team!'); return; }
  battlePaused = true;
  document.getElementById('auto-btn').textContent = '▶ RESUME';
  // Pick randomly which one appears
  const isGroudon = Math.random() < 0.5;
  const id = isGroudon ? 383 : 382;
  const name = isGroudon ? 'Groudon' : 'Kyogre';
  const spriteUrl = isGroudon
    ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/diamond-pearl/383.png'
    : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/382.png';
  const color = isGroudon ? '#ef9a9a' : '#81d4fa';
  const rareDrop = isGroudon ? '🔴 Red Orb' : '🔵 Blue Orb';
  const subtitle = isGroudon ? '🌋 THE CONTINENT POKÉMON' : '🌊 THE SEA BASIN POKÉMON';
  document.getElementById('modal-title').textContent = '🌋🌊 ANCIENT TITANS';
  document.getElementById('modal-content').innerHTML = `
    <div style="text-align:center;padding:8px">
      <img src="${spriteUrl}" width="140" height="140" style="image-rendering:pixelated;filter:drop-shadow(0 0 24px ${color}cc)">
      <div style="margin:10px 0;font-family:'Press Start 2P';font-size:8px;color:${color}">${subtitle}</div>
      <div style="font-size:14px;color:var(--text2);margin-bottom:12px">
        The ancient titan of land/sea rouses from its slumber!<br><br>
        <span style="color:#ffd700">Drop: ${name} (1/20 shiny!)</span><br>
        <span style="color:${color}">50,000 HP · Primordial power</span><br>
        <span style="color:#ffd700;font-size:12px">1% ${rareDrop} → PRIMAL form · SSS stats!</span><br>
        <span style="color:var(--text2)">Cost: 400 💎</span>
      </div>
      <div style="display:flex;gap:8px;justify-content:center">
        <button class="btn" style="border-color:${color};color:${color}" onclick="confirmGroudonKyogreBoss(${id})">⚔️ Fight! (400💎)</button>
        <button class="btn gold" onclick="closeModal()">Back</button>
      </div>
    </div>
  `;
  openModal();
}

async function confirmGroudonKyogreBoss(pokemonId) {
  bossStarting = true;
  if(gameState.gems < 400) { toast('Not enough Gems!'); closeModal(); bossStarting = false; return; }
  gameState.gems -= 400;
  updateResourceUI();
  closeModal();
  battlePaused = true;
  playerAttackCooldown = 0;
  enemyAttackCooldown = 0;
  currentEnemy = null;
  const savedRoad = { ...gameState.road };
  gameState.road.active = false;
  document.getElementById('arena').classList.remove('road-mode');

  const isGroudon = pokemonId === 383;
  const name = isGroudon ? 'Groudon' : 'Kyogre';
  const types = isGroudon ? ['ground','fire'] : ['water'];
  const color = isGroudon ? '#ef9a9a' : '#81d4fa';

  const stats = await fetchPokemonStats(pokemonId);
  swordShieldEnemy = newPokemonEntry(pokemonId, name, types, 270, false, true);
  swordShieldEnemy.stats = stats;
  swordShieldEnemy.statsLoaded = true;
  swordShieldEnemy._bossHpMax = 50000;
  swordShieldEnemy.currentHp = swordShieldEnemy._bossHpMax;
  swordShieldEnemy.isBoss = true;
  swordShieldEnemy._isSwordShield = true;
  swordShieldEnemy._savedRoad = savedRoad;
  swordShieldEnemy._attackMult = 0.85;
  currentEnemy = swordShieldEnemy;
  swordShieldBattleActive = true;
  bossBattleActive = true;
  bossStarting = false;
  gameState.team.forEach(p => { if(p.statsLoaded) p.currentHp = getMaxHp(p); });
  document.getElementById('arena').style.background = isGroudon
    ? 'radial-gradient(ellipse at 50% 0%, rgba(255,80,0,0.35) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(180,40,0,0.5) 0%, transparent 50%), linear-gradient(180deg, #120500 0%, #2a0a00 40%, #0e0300 100%)'
    : 'radial-gradient(ellipse at 50% 0%, rgba(0,120,255,0.35) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(0,50,140,0.5) 0%, transparent 50%), linear-gradient(180deg, #00050f 0%, #000f28 40%, #000408 100%)';
  addLog(`${isGroudon ? '🌋 GROUDON' : '🌊 KYOGRE'} awakened from its ancient slumber!`, 'log-cosmic');
  toast(`${isGroudon ? '🌋' : '🌊'} BOSS FIGHT: ${name} Lv.270! The ancient titan awakens!`, 4000);
  battlePaused = false;
  updateEnemyUI();
}

function handleGroudonKyogreDefeated(player) {
  const enemy = swordShieldEnemy;
  const savedRoad = enemy?._savedRoad;
  const isGroudon = enemy?.id === 383;
  const name = isGroudon ? 'Groudon' : 'Kyogre';
  swordShieldBattleActive = false;
  bossBattleActive = false;
  currentEnemy = null;
  swordShieldEnemy = null;
  document.getElementById('arena').style.background = '';
  if(savedRoad && savedRoad.active) { gameState.road = savedRoad; document.getElementById('arena').classList.add('road-mode'); }
  addLog(`🎉 ${name.toUpperCase()} DEFEATED! The ancient titan yields to your strength!`, 'log-cosmic');
  toast(`🏆 ${name.toUpperCase()} CAPTURED!`, 5000);
  saveGame();
  // 1% rare drop — Red Orb for Groudon, Blue Orb for Kyogre
  const rareItemId = isGroudon ? 'red_orb' : 'blue_orb';
  const rareEmoji = isGroudon ? '🔴' : '🔵';
  const rareName = isGroudon ? 'Red Orb' : 'Blue Orb';
  if(debugGuaranteeRareDrop || Math.random() < 0.01) {
    gameState.inventory[rareItemId] = (gameState.inventory[rareItemId] || 0) + 1;
    addLog(`${rareEmoji} The ${rareName} resonates with primordial power — ${name} left it behind!`, 'log-cosmic');
    toast(`${rareEmoji} RARE DROP: ${rareName}!`, 5000);
  }
  const isShiny = debugGuaranteeShinyDrop || Math.random() < 1/20;
  const types = isGroudon ? ['ground','fire'] : ['water'];
  const pk = newPokemonEntry(enemy.id, name, types, 270, isShiny);
  pk.ivs = generateHighIVs();
  fetchPokemonStats(enemy.id).then(stats => {
    pk.stats = stats;
    pk.statsLoaded = true;
    pk.currentHp = getMaxHp(pk);
    gameState.box.push(pk);
    checkAndAnnounceCosmic(pk);
    renderAll();
    showGachaResult(pk);
  });
  playerAttackCooldown = 0;
  enemyAttackCooldown = 0;
  const nextSpawn = (savedRoad && savedRoad.active) ? (savedRoad.mode === 'farm' ? spawnFarmEnemy : spawnRoadEnemy) : spawnEnemy;
  setTimeout(nextSpawn, 2000);
}

function handleGroudonKyogreFailed() {
  const savedRoad = swordShieldEnemy?._savedRoad;
  swordShieldBattleActive = false;
  bossBattleActive = false;
  bossStarting = false;
  currentEnemy = null;
  swordShieldEnemy = null;
  document.getElementById('arena').style.background = '';
  if(savedRoad && savedRoad.active) { gameState.road = savedRoad; document.getElementById('arena').classList.add('road-mode'); }
  addLog('💀 CRUSHED by the ancient titan! Your team was overwhelmed by primordial power!', 'log-dmg');
  toast('💀 The Ancient Titan was too powerful!', 5000);
  saveGame();
  gameState.team.forEach(p => { p.currentHp = Math.max(1, Math.floor(getMaxHp(p)*0.20)); });
  gameState.currentFighterIdx = 0;
  playerAttackCooldown = 0;
  enemyAttackCooldown = 0;
  renderAll();
  const nextSpawn = (savedRoad && savedRoad.active) ? (savedRoad.mode === 'farm' ? spawnFarmEnemy : spawnRoadEnemy) : spawnEnemy;
  setTimeout(nextSpawn, 2500);
}

// Keep aliases so engine.js calls still work seamlessly
function handleSwordShieldDefeated(player) { handleGroudonKyogreDefeated(player); }
function handleSwordShieldFailed() { handleGroudonKyogreFailed(); }

// ============================================================
// ONLINE TRADE SYSTEM  (Cloudflare Worker-backed)
// ============================================================

// ▶ PASTE YOUR WORKER URL HERE after deploying to Cloudflare:
const TRADE_WORKER_URL = 'https://pkmtrade.nichtbannenbitte008.workers.dev';

// Internal state for the online trade flow
let _onlineTradeCountdownInterval = null;

// ── Utility ──────────────────────────────────────────────────

function clearOnlineCountdown() {
  if (_onlineTradeCountdownInterval) {
    clearInterval(_onlineTradeCountdownInterval);
    _onlineTradeCountdownInterval = null;
  }
}

function fmtSeconds(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2,'0')}`;
}

// ── Main menu ─────────────────────────────────────────────────

function renderOnlineTradeMenu() {
  clearOnlineCountdown();
  document.getElementById('trade-content').innerHTML = `
    <div style="background:rgba(79,195,247,0.08);border:1px solid rgba(79,195,247,0.3);border-radius:8px;padding:10px;margin-bottom:14px;text-align:center">
      <div style="font-family:'Press Start 2P';font-size:8px;color:var(--accent);margin-bottom:4px">🌐 ONLINE TRADE</div>
      <div style="font-size:13px;color:var(--text2)">Trade with anyone worldwide using a short 6-character code.<br>Codes expire in <b style="color:#ffd700">5 minutes</b>.</div>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:8px">
      <button class="btn" style="flex:1;border-color:#00c853;color:#69f0ae;font-size:16px" onclick="showOnlinePostTrade()">🐾 Post Pokémon</button>
      <button class="btn" style="flex:1;border-color:#ff9e40;color:#ff9e40;font-size:16px" onclick="showOnlinePostItem()">🎒 Post Item</button>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:8px">
      <button class="btn" style="flex:1;border-color:#ffd700;color:#ffd700;font-size:16px" onclick="showOnlinePostGold()">💰 Post Gold</button>
      <button class="btn" style="flex:1;border-color:#4fc3f7;color:#4fc3f7;font-size:16px" onclick="showOnlinePostGems()">💎 Post Gems</button>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1;border-color:#4fc3f7;color:var(--accent);font-size:16px" onclick="showOnlineReceiveTrade()">📥 Enter Code</button>
    </div>
  `;
}

// ── POST TRADE: pick a Pokémon ────────────────────────────────

function showOnlinePostTrade() {
  clearOnlineCountdown();
  if (gameState.box.length === 0) {
    document.getElementById('trade-content').innerHTML = `
      <div style="text-align:center;padding:20px;color:var(--text2)">Your box is empty!</div>
      <button class="btn" style="width:100%;margin-top:8px" onclick="renderOnlineTradeMenu()">← Back</button>`;
    return;
  }
  let html = `
    <div style="font-family:'Press Start 2P';font-size:8px;color:#69f0ae;margin-bottom:10px">PICK POKÉMON TO POST</div>
    <div class="poke-box" style="max-height:300px;overflow-y:auto">`;
  gameState.box.forEach(p => {
    const cosmic = isCosmic(p);
    html += `<div class="poke-card${cosmic?' cosmic-card':p.isShiny?' shiny-card':''}"
               onclick="showOnlineTradeConfirm(${p.uid})" style="cursor:pointer">
      ${p.isShiny ? '<div style="position:absolute;top:3px;right:4px;font-size:14px">★</div>' : ''}
      <img src="${getSpriteUrl(p.id, p.isShiny, p.uid)}" onerror="this.src='${getBattleSprite(p.id, p.isShiny, p.uid)}'">
      <span class="cname">${p.name}</span>
      <span class="clevel">Lv.${p.level}</span>
    </div>`;
  });
  html += `</div><button class="btn" style="width:100%;margin-top:10px" onclick="renderOnlineTradeMenu()">← Back</button>`;
  document.getElementById('trade-content').innerHTML = html;
}

// ── POST TRADE: confirm & upload ──────────────────────────────

function showOnlineTradeConfirm(uid) {
  const pk = gameState.box.find(p => p.uid === uid);
  if (!pk) return;
  const cosmic = isCosmic(pk);
  window._onlinePendingUid = uid;
  document.getElementById('trade-content').innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
      <img src="${getSpriteUrl(pk.id, pk.isShiny, pk.uid)}" width="72" height="72"
           class="${cosmic?'cosmic-sprite':pk.isShiny?'shiny-sprite':''}"
           onerror="this.src='${getBattleSprite(pk.id,pk.isShiny)}'">
      <div>
        <div style="font-family:'Press Start 2P';font-size:8px;color:var(--gold)">${cosmic?'🌌 COSMIC ':''}${pk.isShiny?'✨ ':''}${pk.name}</div>
        <div style="font-size:14px;color:var(--text2)">Lv.${pk.level}</div>
      </div>
    </div>
    <div style="background:rgba(239,83,80,0.08);border:1px solid rgba(239,83,80,0.3);border-radius:8px;padding:10px;margin-bottom:10px;font-size:13px;color:var(--text2);text-align:center">
      <b style="color:#ef5350">${pk.name}</b> will be removed from your box immediately.<br>
      A 6-character code valid for <b style="color:#ffd700">5 minutes</b> will be shown.
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1;border-color:#ef5350;color:#ef5350;font-size:16px" onclick="confirmOnlinePost()">✅ Post Trade</button>
      <button class="btn" style="flex:1" onclick="showOnlinePostTrade()">← Back</button>
    </div>`;
}

async function confirmOnlinePost() {
  const uid = window._onlinePendingUid;
  if (!uid) { toast('Trade data lost, try again.', 2500); return; }
  const pk = gameState.box.find(p => p.uid === uid);
  if (!pk) { toast('Pokémon not found!', 2000); return; }
  if (gameState.box.length <= 1) { toast("Can't trade your last Pokémon!", 2000); return; }

  // Remove from box immediately
  gameState.box = gameState.box.filter(p => p.uid !== uid);
  gameState.team = gameState.team.filter(p => p.uid !== uid);
  if (gameState.equippedItems[uid]) delete gameState.equippedItems[uid];
  if (gameState.currentFighterIdx >= gameState.team.length)
    gameState.currentFighterIdx = Math.max(0, gameState.team.length - 1);
  renderAll(); saveGame();
  window._onlinePendingUid = null;

  // Show uploading spinner
  document.getElementById('trade-content').innerHTML = `
    <div style="text-align:center;padding:24px">
      <div style="font-size:36px;margin-bottom:8px;animation:spin 1s linear infinite">⏳</div>
      <div style="font-size:16px;color:var(--text2)">Posting trade…</div>
    </div>`;

  // Upload to Worker
  try {
    const payload = encodePokemonTrade(pk);
    const resp = await fetch(`${TRADE_WORKER_URL}/offer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'pokemon', data: payload, trainerName: gameState.trainerName || 'Trainer' }),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const result = await resp.json();
    showOnlineCodeDisplay(result.code, result.expiresAt, pk);
  } catch (e) {
    // Worker unreachable — give Pokémon back!
    gameState.box.push(pk);
    renderAll(); saveGame();
    toast('❌ Could not reach trade server. Pokémon returned!', 4000);
    document.getElementById('trade-content').innerHTML = `
      <div style="text-align:center;padding:20px;color:#ef5350">
        <div style="font-size:32px;margin-bottom:8px">❌</div>
        Could not reach the trade server.<br><br>
        <span style="font-size:13px;color:var(--text2)">${pk.name} has been returned to your box.</span>
      </div>
      <button class="btn" style="width:100%;margin-top:12px" onclick="renderOnlineTradeMenu()">← Back</button>`;
  }
}

// ── Show code + countdown ─────────────────────────────────────

function showOnlineCodeDisplay(code, expiresAt, pk) {
  clearOnlineCountdown();
  const cosmic = isCosmic(pk);

  document.getElementById('trade-content').innerHTML = `
    <div style="text-align:center;margin-bottom:14px">
      <img src="${getSpriteUrl(pk.id, pk.isShiny, pk.uid)}" width="72" height="72"
           class="${cosmic?'cosmic-sprite':pk.isShiny?'shiny-sprite':''}">
      <div style="font-family:'Press Start 2P';font-size:8px;color:var(--gold);margin-top:6px">${pk.name} posted!</div>
    </div>
    <div style="background:rgba(0,200,83,0.1);border:2px solid #00c853;border-radius:12px;padding:16px;text-align:center;margin-bottom:12px">
      <div style="font-size:13px;color:var(--text2);margin-bottom:6px">Share this code with your trade partner:</div>
      <div id="online-trade-code" style="font-family:'Press Start 2P';font-size:22px;color:#69f0ae;letter-spacing:6px;margin-bottom:10px">${code}</div>
      <button class="btn" style="border-color:#69f0ae;color:#69f0ae;font-size:15px" onclick="copyOnlineCode('${code}')">📋 Copy Code</button>
    </div>
    <div style="text-align:center;margin-bottom:10px">
      <span style="font-size:13px;color:var(--text2)">Expires in: </span>
      <span id="online-trade-timer" style="font-family:'Press Start 2P';font-size:12px;color:#ffd700">5:00</span>
    </div>
    <div style="font-size:12px;color:#555;text-align:center">Once claimed the code becomes invalid automatically.</div>
  `;

  // Countdown ticker
  const tick = () => {
    const remaining = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
    const el = document.getElementById('online-trade-timer');
    if (!el) { clearOnlineCountdown(); return; }
    el.textContent = fmtSeconds(remaining);
    if (remaining <= 60) el.style.color = '#ef5350';
    if (remaining === 0) {
      clearOnlineCountdown();
      toast('⏰ Trade code expired!', 4000);
      el.textContent = 'EXPIRED';
    }
  };
  tick();
  _onlineTradeCountdownInterval = setInterval(tick, 1000);
}

function copyOnlineCode(code) {
  navigator.clipboard.writeText(code).then(() => {
    toast('📋 Code copied!', 2000);
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = code; ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); ta.remove();
    toast('📋 Code copied!', 2000);
  });
}

// ── RECEIVE TRADE: enter code ─────────────────────────────────

function showOnlineReceiveTrade() {
  clearOnlineCountdown();
  document.getElementById('trade-content').innerHTML = `
    <div style="font-family:'Press Start 2P';font-size:8px;color:var(--accent);margin-bottom:10px">📥 ENTER TRADE CODE</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:8px">Ask your trade partner for their 6-character code:</div>
    <input id="online-trade-code-input" type="text" maxlength="6"
      placeholder="e.g. ABC123"
      style="width:100%;background:rgba(0,0,0,0.5);border:2px solid var(--border);border-radius:8px;
             color:#69f0ae;font-family:'Press Start 2P';font-size:18px;padding:12px;text-align:center;
             letter-spacing:6px;outline:none;text-transform:uppercase;margin-bottom:10px"
      oninput="this.value=this.value.toUpperCase()"
      onkeydown="if(event.key==='Enter')previewOnlineTrade()">
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1;border-color:#4fc3f7;color:var(--accent);font-size:16px" onclick="previewOnlineTrade()">🔍 Preview</button>
      <button class="btn" style="flex:1" onclick="renderOnlineTradeMenu()">← Back</button>
    </div>
  `;
  setTimeout(() => document.getElementById('online-trade-code-input')?.focus(), 50);
}

// ── Preview (GET /offer/:code) ────────────────────────────────

async function previewOnlineTrade() {
  const code = (document.getElementById('online-trade-code-input')?.value || '').trim().toUpperCase();
  if (code.length !== 6) { toast('Enter a 6-character code!', 2000); return; }

  document.getElementById('trade-content').innerHTML = `
    <div style="text-align:center;padding:24px">
      <div style="font-size:36px;margin-bottom:8px">🔍</div>
      <div style="font-size:16px;color:var(--text2)">Looking up trade…</div>
    </div>`;

  try {
    const resp = await fetch(`${TRADE_WORKER_URL}/offer/${code}`);
    if (resp.status === 404) {
      toast('❌ Code not found or expired!', 3000);
      showOnlineReceiveTrade();
      return;
    }
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const result = await resp.json();
    showOnlineTradePreview(code, result);
  } catch (e) {
    toast('❌ Could not reach trade server!', 3000);
    showOnlineReceiveTrade();
  }
}

function showOnlineTradePreview(code, result) {
  clearOnlineCountdown();
  const payload = result.payload;
  const expiresAt = result.expiresAt;
  let previewHtml = '';

  if (payload.type === 'pokemon') {
    const pk = decodePokemonTrade(payload.data);
    if (pk) {
      const cosmic = isCosmic(pk);
      previewHtml = `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;background:rgba(255,255,255,0.04);border-radius:8px;padding:10px">
          <img src="${getSpriteUrl(pk.id, pk.isShiny, pk.uid)}" width="72" height="72"
               class="${cosmic?'cosmic-sprite':pk.isShiny?'shiny-sprite':''}">
          <div>
            <div style="font-family:'Press Start 2P';font-size:8px;color:var(--gold)">${cosmic?'🌌 COSMIC ':pk.isShiny?'✨ ':''}${pk.name}</div>
            <div style="font-size:14px;color:var(--text2)">Lv.${pk.level}</div>
            <div style="font-size:13px;color:var(--text2)">OT: ${pk.ot||'Unknown'}</div>
            <div style="font-size:13px">${(pk.types||[]).map(t=>`<span class="type-badge" style="background:${TYPE_COLORS[t]}">${t}</span>`).join(' ')}</div>
          </div>
        </div>`;
    }
  } else if (payload.type === 'item') {
    const allItems = ITEMS.concat(EPIC_ITEMS);
    const item = allItems.find(i => i.id === payload.itemId);
    if (item) {
      previewHtml = `
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;background:rgba(255,150,0,0.06);border:1px solid rgba(255,150,0,0.25);border-radius:8px;padding:12px">
          <span style="font-size:52px">${item.emoji}</span>
          <div>
            <div style="font-family:'Press Start 2P';font-size:8px;color:var(--gold)">${item.name}</div>
            <div style="font-size:16px;color:#ff9e40;margin-top:4px">×${payload.amount}</div>
            <div style="font-size:13px;color:var(--text2);margin-top:2px">${item.desc||''}</div>
          </div>
        </div>`;
    }
  } else if (payload.type === 'gold') {
    previewHtml = `
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;background:rgba(255,215,0,0.08);border:1px solid rgba(255,215,0,0.3);border-radius:8px;padding:12px">
        <span style="font-size:52px">💰</span>
        <div>
          <div style="font-family:'Press Start 2P';font-size:8px;color:#ffd700">GOLD TRADE</div>
          <div style="font-size:20px;color:#ffd700;margin-top:6px">💰 ${formatNum(payload.amount)}</div>
          <div style="font-size:13px;color:var(--text2);margin-top:2px">from ${result.trainerName||'Trainer'}</div>
        </div>
      </div>`;
  } else if (payload.type === 'gems') {
    previewHtml = `
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;background:rgba(79,195,247,0.08);border:1px solid rgba(79,195,247,0.3);border-radius:8px;padding:12px">
        <span style="font-size:52px">💎</span>
        <div>
          <div style="font-family:'Press Start 2P';font-size:8px;color:#4fc3f7">GEMS TRADE</div>
          <div style="font-size:20px;color:#4fc3f7;margin-top:6px">💎 ${payload.amount}</div>
          <div style="font-size:13px;color:var(--text2);margin-top:2px">from ${result.trainerName||'Trainer'}</div>
        </div>
      </div>`;
  }

  if (!previewHtml) {
    previewHtml = `<div style="text-align:center;padding:12px;color:var(--text2)">Trade data loaded.</div>`;
  }

  document.getElementById('trade-content').innerHTML = `
    <div style="font-family:'Press Start 2P';font-size:8px;color:var(--accent);margin-bottom:8px">🔍 TRADE PREVIEW — ${code}</div>
    ${previewHtml}
    <div style="text-align:center;margin-bottom:10px">
      <span style="font-size:13px;color:var(--text2)">Expires in: </span>
      <span id="online-trade-timer" style="font-family:'Press Start 2P';font-size:12px;color:#ffd700">${fmtSeconds(result.remaining)}</span>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1;border-color:#00c853;color:#69f0ae;font-size:16px" onclick="acceptOnlineTrade('${code}')">✅ Accept Trade</button>
      <button class="btn" style="flex:1" onclick="showOnlineReceiveTrade()">← Back</button>
    </div>`;

  const tick = () => {
    const remaining = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
    const el = document.getElementById('online-trade-timer');
    if (!el) { clearOnlineCountdown(); return; }
    el.textContent = fmtSeconds(remaining);
    if (remaining <= 60) el.style.color = '#ef5350';
    if (remaining === 0) {
      clearOnlineCountdown();
      toast('⏰ Trade code expired!', 4000);
      renderOnlineTradeMenu();
    }
  };
  tick();
  _onlineTradeCountdownInterval = setInterval(tick, 1000);
}

// ── Accept (POST /claim/:code) ────────────────────────────────

async function acceptOnlineTrade(code) {
  clearOnlineCountdown();
  document.getElementById('trade-content').innerHTML = `
    <div style="text-align:center;padding:24px">
      <div style="font-size:36px;margin-bottom:8px;animation:spin 1s linear infinite">⚡</div>
      <div style="font-size:16px;color:var(--text2)">Claiming trade…</div>
    </div>`;

  try {
    const resp = await fetch(`${TRADE_WORKER_URL}/claim/${code}`, { method: 'POST' });

    if (resp.status === 404) {
      toast('❌ Trade already claimed or expired!', 4000);
      renderOnlineTradeMenu();
      return;
    }
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const result = await resp.json();
    const payload = result.payload;

    if (payload.type === 'pokemon') {
      const data = decodePokemonTrade(payload.data);
      if (!data) { toast('❌ Corrupted trade data!', 3000); renderOnlineTradeMenu(); return; }

      const receivedLevel = gameState.wave >= 1000 ? (data.level||50) : Math.min(50, data.level||50);
      const pk = {
        ...data,
        uid: ++pUid,
        level: receivedLevel,
        ot: data.ot || payload.trainerName || 'Unknown',
        statsLoaded: !!data.stats,
        ivs: data.ivs || generateIVs(),
      };
      if (!pk.stats && pk.id) {
        pk.stats = await fetchPokemonStats(pk.id);
        pk.statsLoaded = true;
      }
      if (!pk.currentHp && pk.stats) pk.currentHp = getMaxHp(pk);

      gameState.box.push(pk);
      checkAndAnnounceCosmic(pk);
      renderAll(); saveGame();

      const cosmic = isCosmic(pk);
      document.getElementById('trade-content').innerHTML = `
        <div style="text-align:center;padding:16px">
          <img src="${getSpriteUrl(pk.id, pk.isShiny, pk.uid)}" width="96" height="96"
               class="${cosmic?'cosmic-sprite':pk.isShiny?'shiny-sprite':''}">
          <div style="font-family:'Press Start 2P';font-size:9px;color:var(--gold);margin-top:10px">${cosmic?'🌌 COSMIC ':pk.isShiny?'✨ ':''}${pk.name} received!</div>
          <div style="font-size:14px;color:var(--text2);margin-top:6px">Lv.${pk.level} · OT: ${pk.ot}</div>
          ${gameState.wave < 1000 && data.level > 50 ? `<div style="font-size:12px;color:#ff9e40;margin-top:2px">⚠️ Capped at Lv.50 (reach Wave 1000 for full level)</div>` : ''}
          <button class="btn" style="width:100%;margin-top:14px" onclick="renderOnlineTradeMenu()">← Back</button>
        </div>`;
      toast(`✅ Trade claimed! ${pk.name} added to your box!`, 5000);
    } else if (payload.type === 'item') {
      const allItems = ITEMS.concat(EPIC_ITEMS);
      const item = allItems.find(i => i.id === payload.itemId);
      if (!item) { toast('❌ Unknown item in trade!', 3000); renderOnlineTradeMenu(); return; }
      const amount = Math.max(1, Math.floor(payload.amount) || 1);
      gameState.inventory[item.id] = (gameState.inventory[item.id] || 0) + amount;
      renderAll(); saveGame();
      document.getElementById('trade-content').innerHTML = `
        <div style="text-align:center;padding:16px">
          <div style="font-size:64px;margin-bottom:8px">${item.emoji}</div>
          <div style="font-family:'Press Start 2P';font-size:9px;color:var(--gold);margin-top:6px">×${amount} ${item.name} received!</div>
          <div style="font-size:14px;color:var(--text2);margin-top:6px">${item.desc||''}</div>
          <button class="btn" style="width:100%;margin-top:14px" onclick="renderOnlineTradeMenu()">← Back</button>
        </div>`;
      toast(`✅ Trade claimed! ×${amount} ${item.name} added!`, 5000);
    } else if (payload.type === 'gold') {
      const amount = Math.max(1, Math.floor(payload.amount) || 1);
      gameState.gold = (gameState.gold || 0) + amount;
      updateResourceUI(); renderAll(); saveGame();
      document.getElementById('trade-content').innerHTML = `
        <div style="text-align:center;padding:16px">
          <div style="font-size:64px;margin-bottom:8px">💰</div>
          <div style="font-family:'Press Start 2P';font-size:9px;color:#ffd700;margin-top:6px">💰 ${formatNum(amount)} Gold received!</div>
          <div style="font-size:14px;color:var(--text2);margin-top:6px">Added to your wallet!</div>
          <button class="btn" style="width:100%;margin-top:14px" onclick="renderOnlineTradeMenu()">← Back</button>
        </div>`;
      toast(`✅ 💰 ${formatNum(amount)} Gold received!`, 5000);
    } else if (payload.type === 'gems') {
      const amount = Math.max(1, Math.floor(payload.amount) || 1);
      gameState.gems = (gameState.gems || 0) + amount;
      updateResourceUI(); renderAll(); saveGame();
      document.getElementById('trade-content').innerHTML = `
        <div style="text-align:center;padding:16px">
          <div style="font-size:64px;margin-bottom:8px">💎</div>
          <div style="font-family:'Press Start 2P';font-size:9px;color:#4fc3f7;margin-top:6px">💎 ${amount} Gems received!</div>
          <div style="font-size:14px;color:var(--text2);margin-top:6px">Added to your gems!</div>
          <button class="btn" style="width:100%;margin-top:14px" onclick="renderOnlineTradeMenu()">← Back</button>
        </div>`;
      toast(`✅ 💎 ${amount} Gems received!`, 5000);
    } else {
      toast('✅ Trade claimed!', 4000);
      renderOnlineTradeMenu();
    }
  } catch (e) {
    toast('❌ Could not reach trade server!', 3000);
    renderOnlineTradeMenu();
  }
}

// CSS spin keyframe (used in loading spinners above)
(function() {
  if (!document.getElementById('online-trade-style')) {
    const s = document.createElement('style');
    s.id = 'online-trade-style';
    s.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
    document.head.appendChild(s);
  }
})();

// ── POST GOLD TRADE ───────────────────────────────────────────

function adjGoldTrade(delta) {
  const maxG = gameState.gold || 0;
  window._onlineGoldAmt = Math.min(maxG, Math.max(1000, (window._onlineGoldAmt || 1000) + delta));
  const el = document.getElementById('gold-trade-display');
  if (el) el.textContent = formatNum(window._onlineGoldAmt);
}
function showOnlinePostGold() {
  clearOnlineCountdown();
  if (!window._onlineGoldAmt || window._onlineGoldAmt < 1000) window._onlineGoldAmt = 10000;
  const max = gameState.gold || 0;
  if (max <= 0) {
    document.getElementById('trade-content').innerHTML = '<div style="text-align:center;padding:20px;color:var(--text2)">No Gold to trade!</div><button class="btn" style="width:100%;margin-top:8px" onclick="renderOnlineTradeMenu()">Back</button>';
    return;
  }
  const amt = window._onlineGoldAmt;
  document.getElementById('trade-content').innerHTML = [
    '<div style="font-family:var(--font);font-size:8px;color:#ffd700;margin-bottom:12px;text-align:center;letter-spacing:1px">TRADE GOLD</div>',
    '<div style="display:flex;align-items:center;justify-content:center;gap:16px;background:rgba(255,215,0,0.07);border:1px solid rgba(255,215,0,0.3);border-radius:10px;padding:14px;margin-bottom:14px">',
    '<div style="font-size:40px">&#128176;</div>',
    '<div style="text-align:center">',
    '<div id="gold-trade-display" style="font-family:var(--font);font-size:16px;color:#ffd700">' + formatNum(amt) + '</div>',
    '<div style="font-size:12px;color:var(--text2);margin-top:4px">You have: ' + formatNum(max) + '</div>',
    '</div></div>',
    '<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-bottom:14px">',
    '<button class="btn" style="border-color:#ffd700;color:#ffd700" onclick="adjGoldTrade(-10000)">-10k</button>',
    '<button class="btn" style="border-color:#ffd700;color:#ffd700" onclick="adjGoldTrade(-1000)">-1k</button>',
    '<button class="btn" style="border-color:#ffd700;color:#ffd700" onclick="adjGoldTrade(1000)">+1k</button>',
    '<button class="btn" style="border-color:#ffd700;color:#ffd700" onclick="adjGoldTrade(10000)">+10k</button>',
    '<button class="btn" style="border-color:#ffd700;color:#ffd700" onclick="adjGoldTrade(100000)">+100k</button>',
    '<button class="btn" style="border-color:#ffd700;color:#ffd700;background:rgba(255,215,0,0.1)" onclick="adjGoldTrade(999999999)">MAX</button>',
    '</div>',
    '<div style="background:rgba(239,83,80,0.08);border:1px solid rgba(239,83,80,0.3);border-radius:8px;padding:10px;margin-bottom:12px;text-align:center;font-size:13px;color:var(--text2)">Gold is <b style="color:#ef5350">removed immediately</b>. Code valid 5 min.</div>',
    '<div style="display:flex;gap:8px">',
    '<button class="btn" style="flex:1;border-color:#ffd700;color:#ffd700" onclick="confirmOnlineGoldPost()">Post Gold</button>',
    '<button class="btn" style="flex:1" onclick="renderOnlineTradeMenu()">Back</button>',
    '</div>'
  ].join('');
}

async function confirmOnlineGoldPost() {
  const amount = Math.floor(window._onlineGoldAmt || 0);
  if(amount <= 0) { toast('Set an amount first!', 2000); return; }
  if(gameState.gold < amount) { toast('Not enough Gold!', 2000); return; }
  gameState.gold -= amount;
  updateResourceUI(); renderAll(); saveGame();
  window._onlineGoldAmt = null;
  document.getElementById('trade-content').innerHTML = `
    <div style="text-align:center;padding:24px">
      <div style="font-size:36px;margin-bottom:8px;animation:spin 1s linear infinite">⏳</div>
      <div style="font-size:16px;color:var(--text2)">Posting gold trade…</div>
    </div>`;
  try {
    const resp = await fetch(`${TRADE_WORKER_URL}/offer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'gold', amount, trainerName: gameState.trainerName || 'Trainer' }),
    });
    if(!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const result = await resp.json();
    showOnlineCurrencyCodeDisplay(result.code, result.expiresAt, '💰', `${formatNum(amount)} Gold`, '#ffd700');
  } catch(e) {
    gameState.gold += amount;
    updateResourceUI(); renderAll(); saveGame();
    toast('❌ Could not reach trade server. Gold returned!', 4000);
    document.getElementById('trade-content').innerHTML = `
      <div style="text-align:center;padding:20px;color:#ef5350">
        <div style="font-size:32px;margin-bottom:8px">❌</div>
        Could not reach the trade server.<br><br>
        <span style="font-size:13px;color:var(--text2)">💰${formatNum(amount)} Gold returned.</span>
      </div>
      <button class="btn" style="width:100%;margin-top:12px" onclick="renderOnlineTradeMenu()">← Back</button>`;
  }
}

// ── POST GEMS TRADE ───────────────────────────────────────────

function adjGemsTrade(delta) {
  const maxG = gameState.gems || 0;
  window._onlineGemsAmt = Math.min(maxG, Math.max(1, (window._onlineGemsAmt || 10) + delta));
  const el = document.getElementById('gems-trade-display');
  if (el) el.textContent = window._onlineGemsAmt;
}
function showOnlinePostGems() {
  clearOnlineCountdown();
  if (!window._onlineGemsAmt) window._onlineGemsAmt = 10;
  const max = gameState.gems || 0;
  if (max <= 0) {
    document.getElementById('trade-content').innerHTML = '<div style="text-align:center;padding:20px;color:var(--text2)">No Gems to trade!</div><button class="btn" style="width:100%;margin-top:8px" onclick="renderOnlineTradeMenu()">Back</button>';
    return;
  }
  const amt = window._onlineGemsAmt;
  document.getElementById('trade-content').innerHTML = [
    '<div style="font-family:var(--font);font-size:8px;color:#4fc3f7;margin-bottom:12px;text-align:center;letter-spacing:1px">TRADE GEMS</div>',
    '<div style="display:flex;align-items:center;justify-content:center;gap:16px;background:rgba(79,195,247,0.07);border:1px solid rgba(79,195,247,0.3);border-radius:10px;padding:14px;margin-bottom:14px">',
    '<div style="font-size:40px">&#128142;</div>',
    '<div style="text-align:center">',
    '<div id="gems-trade-display" style="font-family:var(--font);font-size:16px;color:#4fc3f7">' + amt + '</div>',
    '<div style="font-size:12px;color:var(--text2);margin-top:4px">You have: ' + max + '</div>',
    '</div></div>',
    '<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-bottom:14px">',
    '<button class="btn" style="border-color:#4fc3f7;color:#4fc3f7" onclick="adjGemsTrade(-100)">-100</button>',
    '<button class="btn" style="border-color:#4fc3f7;color:#4fc3f7" onclick="adjGemsTrade(-10)">-10</button>',
    '<button class="btn" style="border-color:#4fc3f7;color:#4fc3f7" onclick="adjGemsTrade(10)">+10</button>',
    '<button class="btn" style="border-color:#4fc3f7;color:#4fc3f7" onclick="adjGemsTrade(100)">+100</button>',
    '<button class="btn" style="border-color:#4fc3f7;color:#4fc3f7;background:rgba(79,195,247,0.1)" onclick="adjGemsTrade(999999)">MAX</button>',
    '</div>',
    '<div style="background:rgba(239,83,80,0.08);border:1px solid rgba(239,83,80,0.3);border-radius:8px;padding:10px;margin-bottom:12px;text-align:center;font-size:13px;color:var(--text2)">Gems are <b style="color:#ef5350">removed immediately</b>. Code valid 5 min.</div>',
    '<div style="display:flex;gap:8px">',
    '<button class="btn" style="flex:1;border-color:#4fc3f7;color:#4fc3f7" onclick="confirmOnlineGemsPost()">Post Gems</button>',
    '<button class="btn" style="flex:1" onclick="renderOnlineTradeMenu()">Back</button>',
    '</div>'
  ].join('');
}

async function confirmOnlineGemsPost() {
  const amount = Math.floor(window._onlineGemsAmt || 0);
  if(amount <= 0) { toast('Set an amount first!', 2000); return; }
  if(gameState.gems < amount) { toast('Not enough Gems!', 2000); return; }
  gameState.gems -= amount;
  updateResourceUI(); renderAll(); saveGame();
  window._onlineGemsAmt = null;
  document.getElementById('trade-content').innerHTML = `
    <div style="text-align:center;padding:24px">
      <div style="font-size:36px;margin-bottom:8px;animation:spin 1s linear infinite">⏳</div>
      <div style="font-size:16px;color:var(--text2)">Posting gems trade…</div>
    </div>`;
  try {
    const resp = await fetch(`${TRADE_WORKER_URL}/offer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'gems', amount, trainerName: gameState.trainerName || 'Trainer' }),
    });
    if(!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const result = await resp.json();
    showOnlineCurrencyCodeDisplay(result.code, result.expiresAt, '💎', `${amount} Gems`, '#4fc3f7');
  } catch(e) {
    gameState.gems += amount;
    updateResourceUI(); renderAll(); saveGame();
    toast('❌ Could not reach trade server. Gems returned!', 4000);
    document.getElementById('trade-content').innerHTML = `
      <div style="text-align:center;padding:20px;color:#ef5350">
        <div style="font-size:32px;margin-bottom:8px">❌</div>
        Could not reach the trade server.<br><br>
        <span style="font-size:13px;color:var(--text2)">💎${amount} Gems returned.</span>
      </div>
      <button class="btn" style="width:100%;margin-top:12px" onclick="renderOnlineTradeMenu()">← Back</button>`;
  }
}

// ── Shared currency code display ──────────────────────────────

function showOnlineCurrencyCodeDisplay(code, expiresAt, icon, label, color) {
  clearOnlineCountdown();
  document.getElementById('trade-content').innerHTML = `
    <div style="text-align:center;margin-bottom:14px">
      <div style="font-size:64px">${icon}</div>
      <div style="font-family:'Press Start 2P';font-size:8px;color:${color};margin-top:6px">${label} posted!</div>
    </div>
    <div style="background:rgba(79,195,247,0.08);border:2px solid ${color};border-radius:12px;padding:16px;text-align:center;margin-bottom:12px">
      <div style="font-size:13px;color:var(--text2);margin-bottom:6px">Share this code with your trade partner:</div>
      <div style="font-family:'Press Start 2P';font-size:22px;color:${color};letter-spacing:6px;margin-bottom:10px">${code}</div>
      <button class="btn" style="border-color:${color};color:${color};font-size:15px" onclick="copyOnlineCode('${code}')">📋 Copy Code</button>
    </div>
    <div style="text-align:center;margin-bottom:10px">
      <span style="font-size:13px;color:var(--text2)">Expires in: </span>
      <span id="online-trade-timer" style="font-family:'Press Start 2P';font-size:12px;color:#ffd700">5:00</span>
    </div>
    <div style="font-size:12px;color:#555;text-align:center">Once claimed the code becomes invalid automatically.</div>
  `;
  const tick = () => {
    const remaining = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
    const el = document.getElementById('online-trade-timer');
    if(!el) { clearOnlineCountdown(); return; }
    el.textContent = fmtSeconds(remaining);
    if(remaining <= 60) el.style.color = '#ef5350';
    if(remaining === 0) { clearOnlineCountdown(); toast('⏰ Trade code expired!', 4000); el.textContent = 'EXPIRED'; }
  };
  tick();
  _onlineTradeCountdownInterval = setInterval(tick, 1000);
}

// ── POST ITEM TRADE ───────────────────────────────────────────

const ONLINE_UNTRADABLE = new Set(['rare_candy','max_candy','sss_candy','royal_sword','royal_shield','outer_world_meteor','meteorite','origin_orb','dna_splicer','heros_sword','heros_shield','red_orb','blue_orb','mysterious_meteorite']);

function showOnlinePostItem() {
  clearOnlineCountdown();
  const allItems = ITEMS.concat(EPIC_ITEMS);
  const owned = allItems.filter(it => (gameState.inventory[it.id]||0) > 0 && !ONLINE_UNTRADABLE.has(it.id));
  if (owned.length === 0) {
    document.getElementById('trade-content').innerHTML = `
      <div style="text-align:center;padding:20px;color:var(--text2)">You have no tradable items!</div>
      <button class="btn" style="width:100%;margin-top:8px" onclick="renderOnlineTradeMenu()">← Back</button>`;
    return;
  }
  let html = `<div style="font-family:'Press Start 2P';font-size:8px;color:#ff9e40;margin-bottom:10px">🎒 PICK ITEM TO POST</div>
    <div style="max-height:300px;overflow-y:auto;display:flex;flex-direction:column;gap:6px">`;
  owned.forEach(it => {
    const count = gameState.inventory[it.id] || 0;
    html += `<div onclick="showOnlineItemAmountPicker('${it.id}')"
      style="cursor:pointer;display:flex;align-items:center;gap:10px;background:rgba(255,255,255,0.04);
             border:1px solid var(--border);border-radius:8px;padding:8px 12px;transition:background 0.15s"
      onmouseover="this.style.background='rgba(255,150,0,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.04)'">
      <span style="font-size:28px">${it.emoji}</span>
      <div style="flex:1">
        <div style="font-family:'Press Start 2P';font-size:7px;color:var(--gold)">${it.name}</div>
        <div style="font-size:13px;color:var(--text2)">×${count} owned</div>
      </div>
      <span style="font-size:13px;color:#ff9e40">Post →</span>
    </div>`;
  });
  html += `</div><button class="btn" style="width:100%;margin-top:10px" onclick="renderOnlineTradeMenu()">← Back</button>`;
  document.getElementById('trade-content').innerHTML = html;
}

function showOnlineItemAmountPicker(itemId) {
  const allItems = ITEMS.concat(EPIC_ITEMS);
  const item = allItems.find(i => i.id === itemId);
  if (!item) return;
  const maxOwned = gameState.inventory[itemId] || 0;
  if (maxOwned <= 0) { toast('No more of that item!'); return; }
  window._onlineItemId = itemId;
  window._onlineItemAmt = 1;
  window._onlineItemMax = maxOwned;

  document.getElementById('trade-content').innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
      <span style="font-size:52px">${item.emoji}</span>
      <div>
        <div style="font-family:'Press Start 2P';font-size:8px;color:var(--gold)">${item.name}</div>
        <div style="font-size:14px;color:var(--text2)">You own: ×${maxOwned}</div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;justify-content:center">
      <button class="btn" style="font-size:20px;padding:4px 14px"
        onclick="window._onlineItemAmt=Math.max(1,window._onlineItemAmt-1);document.getElementById('online-item-amt').textContent='×'+window._onlineItemAmt">−</button>
      <span id="online-item-amt" style="font-family:'Press Start 2P';font-size:14px;color:#ff9e40;min-width:48px;text-align:center">×1</span>
      <button class="btn" style="font-size:20px;padding:4px 14px"
        onclick="window._onlineItemAmt=Math.min(window._onlineItemMax,window._onlineItemAmt+1);document.getElementById('online-item-amt').textContent='×'+window._onlineItemAmt">+</button>
      <button class="btn" style="font-size:14px"
        onclick="window._onlineItemAmt=window._onlineItemMax;document.getElementById('online-item-amt').textContent='×'+window._onlineItemMax">Max</button>
    </div>
    <div style="background:rgba(255,150,0,0.08);border:1px solid rgba(255,150,0,0.3);border-radius:8px;padding:10px;margin-bottom:10px;text-align:center;font-size:13px;color:var(--text2)">
      Items are <b style="color:#ef5350">removed immediately</b>.<br>A 6-char code valid for <b style="color:#ffd700">5 minutes</b> will be shown.
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn" style="flex:1;border-color:#ff9e40;color:#ff9e40;font-size:16px" onclick="confirmOnlineItemPost()">✅ Post Item</button>
      <button class="btn" style="flex:1" onclick="showOnlinePostItem()">← Back</button>
    </div>`;
}

async function confirmOnlineItemPost() {
  const itemId = window._onlineItemId;
  const amount = window._onlineItemAmt || 1;
  const allItems = ITEMS.concat(EPIC_ITEMS);
  const item = allItems.find(i => i.id === itemId);
  if (!item) { toast('Item not found!', 2000); return; }
  const owned = gameState.inventory[itemId] || 0;
  if (owned < amount) { toast('Not enough items!', 2000); return; }

  // Remove items immediately
  gameState.inventory[itemId] = owned - amount;
  if (gameState.inventory[itemId] <= 0) delete gameState.inventory[itemId];
  renderAll(); saveGame();
  window._onlineItemId = null;
  window._onlineItemAmt = null;

  document.getElementById('trade-content').innerHTML = `
    <div style="text-align:center;padding:24px">
      <div style="font-size:36px;margin-bottom:8px;animation:spin 1s linear infinite">⏳</div>
      <div style="font-size:16px;color:var(--text2)">Posting item trade…</div>
    </div>`;

  try {
    const resp = await fetch(`${TRADE_WORKER_URL}/offer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'item', itemId, amount, trainerName: gameState.trainerName || 'Trainer' }),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const result = await resp.json();
    showOnlineItemCodeDisplay(result.code, result.expiresAt, item, amount);
  } catch (e) {
    // Return items to inventory on failure
    gameState.inventory[itemId] = (gameState.inventory[itemId] || 0) + amount;
    renderAll(); saveGame();
    toast('❌ Could not reach trade server. Items returned!', 4000);
    document.getElementById('trade-content').innerHTML = `
      <div style="text-align:center;padding:20px;color:#ef5350">
        <div style="font-size:32px;margin-bottom:8px">❌</div>
        Could not reach the trade server.<br><br>
        <span style="font-size:13px;color:var(--text2)">×${amount} ${item.name} returned to your inventory.</span>
      </div>
      <button class="btn" style="width:100%;margin-top:12px" onclick="renderOnlineTradeMenu()">← Back</button>`;
  }
}

function showOnlineItemCodeDisplay(code, expiresAt, item, amount) {
  clearOnlineCountdown();
  document.getElementById('trade-content').innerHTML = `
    <div style="text-align:center;margin-bottom:14px">
      <div style="font-size:64px">${item.emoji}</div>
      <div style="font-family:'Press Start 2P';font-size:8px;color:var(--gold);margin-top:6px">×${amount} ${item.name} posted!</div>
    </div>
    <div style="background:rgba(255,150,0,0.1);border:2px solid #ff9e40;border-radius:12px;padding:16px;text-align:center;margin-bottom:12px">
      <div style="font-size:13px;color:var(--text2);margin-bottom:6px">Share this code with your trade partner:</div>
      <div style="font-family:'Press Start 2P';font-size:22px;color:#ff9e40;letter-spacing:6px;margin-bottom:10px">${code}</div>
      <button class="btn" style="border-color:#ff9e40;color:#ff9e40;font-size:15px" onclick="copyOnlineCode('${code}')">📋 Copy Code</button>
    </div>
    <div style="text-align:center;margin-bottom:10px">
      <span style="font-size:13px;color:var(--text2)">Expires in: </span>
      <span id="online-trade-timer" style="font-family:'Press Start 2P';font-size:12px;color:#ffd700">5:00</span>
    </div>
    <div style="font-size:12px;color:#555;text-align:center">Once claimed the code becomes invalid automatically.</div>`;

  const tick = () => {
    const remaining = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
    const el = document.getElementById('online-trade-timer');
    if (!el) { clearOnlineCountdown(); return; }
    el.textContent = fmtSeconds(remaining);
    if (remaining <= 60) el.style.color = '#ef5350';
    if (remaining === 0) { clearOnlineCountdown(); toast('⏰ Trade code expired!', 4000); el.textContent = 'EXPIRED'; }
  };
  tick();
  _onlineTradeCountdownInterval = setInterval(tick, 1000);
}

// ============================================================
// END ONLINE TRADE SYSTEM
// ============================================================


// Alias for any legacy references
function startSwordShieldBoss() { startGroudonKyogreBoss(); }
let debugUnlocked = false;

// Apply DEBUG_MODE on load
(function() { if(DEBUG_MODE) { const el = document.getElementById('debug-btn-wrap'); if(el) el.style.display = 'block'; } })();

function openDebugPanel() {
  if (!debugUnlocked) {
    const pw = prompt('🔒 Enter debug password:');
    if (pw !== DEBUG_PASSWORD) { toast('❌ Wrong password!', 2000); return; }
    debugUnlocked = true;
    toast('🛠 Debug panel unlocked!', 2000);
  }
  const fighter = getCurrentFighter();
  const el = document.getElementById('dbg-current-poke');
  if (fighter) el.textContent = `${fighter.isShiny ? (isCosmic(fighter)?'🌌':'★') + ' ' : ''}${fighter.name} · Lv.${fighter.level}`;
  else el.textContent = 'No active fighter';

  loadDebugStatRows(fighter);
  const zyEl = document.getElementById('dbg-zygarde-count');
  if (zyEl) zyEl.textContent = `Cells: ${gameState.inventory['zygarde_cell'] || 0}`;
  document.getElementById('debug-overlay').style.display = 'flex';
}

function closeDebug() {
  document.getElementById('debug-overlay').style.display = 'none';
}

function debugSetGold() {
  const val = parseInt(document.getElementById('dbg-gold').value);
  if (isNaN(val) || val < 0) { toast('Invalid value!', 1500); return; }
  gameState.gold = val;
  updateResourceUI();
  toast(`💰 Gold set to ${val.toLocaleString()}`, 1500);
}

function debugAddGold() {
  const val = parseInt(document.getElementById('dbg-gold').value);
  if (isNaN(val)) { toast('Invalid value!', 1500); return; }
  gameState.gold = Math.max(0, gameState.gold + val);
  updateResourceUI();
  toast(`💰 Added ${val.toLocaleString()} gold`, 1500);
}

function debugSetGems() {
  const val = parseInt(document.getElementById('dbg-gems').value);
  if (isNaN(val) || val < 0) { toast('Invalid value!', 1500); return; }
  gameState.gems = val;
  updateResourceUI();
  toast(`💎 Gems set to ${val}`, 1500);
}

function debugAddGems() {
  const val = parseInt(document.getElementById('dbg-gems').value);
  if (isNaN(val)) { toast('Invalid value!', 1500); return; }
  gameState.gems = Math.max(0, gameState.gems + val);
  updateResourceUI();
  toast(`💎 Added ${val} gems`, 1500);
}

function debugAddLevels() {
  const fighter = getCurrentFighter();
  if (!fighter) { toast('No active fighter!', 1500); return; }
  const lvls = parseInt(document.getElementById('dbg-levels').value);
  if (isNaN(lvls) || lvls < 1) { toast('Invalid level amount!', 1500); return; }
  const oldLvl = fighter.level;
  fighter.level = Math.min(250, fighter.level + lvls);
  fighter.expToNext = calcExpToNext(fighter.level);
  fighter.exp = 0;
  if (fighter.statsLoaded) fighter.currentHp = getMaxHp(fighter);
  checkEvolution(fighter);
  renderAll();
  updatePlayerUI(fighter);
  document.getElementById('dbg-current-poke').textContent = `${fighter.isShiny ? '★ ' : ''}${fighter.name} · Lv.${fighter.level}`;
  toast(`⬆️ ${fighter.name}: Lv.${oldLvl} → Lv.${fighter.level}`, 2000);
}

function debugAddZygardeCells() {
  const val = parseInt(document.getElementById('dbg-zygarde-cells').value);
  if (isNaN(val) || val < 1) { toast('Invalid amount!', 1500); return; }
  gameState.inventory['zygarde_cell'] = (gameState.inventory['zygarde_cell'] || 0) + val;
  const total = gameState.inventory['zygarde_cell'];
  const el = document.getElementById('dbg-zygarde-count');
  if (el) el.textContent = `Cells: ${total}`;
  renderItems();
  toast(`🟢 Added ${val} Zygarde Cell${val>1?'s':''}! Total: ${total}`, 2000);
}

// ============================================================
// OPTIONS
// ============================================================
const gameOptions = { performance: false, animations: true, compact: false, ivNumbers: false };

function openOptionsOverlay() {
  syncOptionButtons();
  document.getElementById('options-overlay').style.display = 'flex';
}
function closeOptions() {
  document.getElementById('options-overlay').style.display = 'none';
}
function syncOptionButtons() {
  const setBtn = (id, on, onColor='var(--accent)', onBorder='var(--accent)') => {
    const btn = document.getElementById(id);
    if(!btn) return;
    btn.textContent = on ? 'ON' : 'OFF';
    btn.style.background = on ? `rgba(79,195,247,0.2)` : 'rgba(255,255,255,0.08)';
    btn.style.borderColor = on ? onBorder : 'rgba(255,255,255,0.2)';
    btn.style.color = on ? onColor : 'var(--text2)';
  };
  setBtn('opt-perf-btn', gameOptions.performance, '#ff9e40', '#ff9e40');
  setBtn('opt-anim-btn', gameOptions.animations);
  setBtn('opt-compact-btn', gameOptions.compact, '#ab47bc', '#ab47bc');
  setBtn('opt-ivnum-btn', gameOptions.ivNumbers, '#66bb6a', '#66bb6a');
}
function toggleOption(key) {
  gameOptions[key] = !gameOptions[key];
  applyOptions();
  syncOptionButtons();
}
function applyOptions() {
  // Performance mode: disable all animations/rainbow effects
  let styleEl = document.getElementById('perf-mode-style');
  if(!styleEl) { styleEl = document.createElement('style'); styleEl.id = 'perf-mode-style'; document.head.appendChild(styleEl); }
  if(gameOptions.performance) {
    styleEl.textContent = `
      * { animation: none !important; transition: none !important; }
      .ss-rainbow, .shiny-text, .cosmic-text { background: none !important; -webkit-text-fill-color: #ff69b4 !important; }
      .mega-card { border-color: #ff8c00 !important; animation: none !important; }
      .shiny-card { border-color: #ffd700 !important; animation: none !important; }
      .cosmic-card { border-color: #00ffff !important; animation: none !important; }
    `;
  } else {
    styleEl.textContent = '';
  }
  // Battle animations
  window._animationsDisabled = !gameOptions.animations;
  // Compact box
  const boxGrid = document.getElementById('poke-box-grid');
  if(boxGrid) {
    if(gameOptions.compact) boxGrid.classList.add('compact-box');
    else boxGrid.classList.remove('compact-box');
  }
}

let debugGuaranteeRareDrop = false;
function debugToggleRareDrop() {
  debugGuaranteeRareDrop = !debugGuaranteeRareDrop;
  const btn = document.getElementById('dbg-rare-drop-btn');
  if(debugGuaranteeRareDrop) {
    btn.textContent = '🎲 Guarantee Rare Drop: ON';
    btn.style.background = 'rgba(255,105,180,0.35)';
    btn.style.borderColor = '#ff69b4';
    toast('☄️ Rare drops guaranteed from bosses!', 2000);
  } else {
    btn.textContent = '🎲 Guarantee Rare Drop: OFF';
    btn.style.background = 'rgba(255,105,180,0.12)';
    toast('Rare drop guarantee removed.', 2000);
  }
}

let debugGuaranteeRareForm = false;
function debugToggleRareForm() {
  debugGuaranteeRareForm = !debugGuaranteeRareForm;
  const btn = document.getElementById('dbg-rare-form-btn');
  if(debugGuaranteeRareForm) {
    btn.textContent = '👑 Guarantee Rare Form Drop: ON';
    btn.style.background = 'rgba(255,215,0,0.35)';
    btn.style.borderColor = '#ffd700';
    toast('👑 Rare form drops guaranteed! (Royal Sword/Shield, Outer World Meteor)', 3000);
  } else {
    btn.textContent = '👑 Guarantee Rare Form Drop: OFF';
    btn.style.background = 'rgba(255,215,0,0.12)';
    btn.style.borderColor = '#ffd700';
    toast('Rare form guarantee removed.', 2000);
  }
}

let debugGuaranteeShinyDrop = false;
function debugToggleShinyDrop() {
  debugGuaranteeShinyDrop = !debugGuaranteeShinyDrop;
  const btn = document.getElementById('dbg-shiny-drop-btn');
  if(debugGuaranteeShinyDrop) {
    btn.textContent = '★ Guarantee Shiny Boss Drop: ON';
    btn.style.background = 'rgba(255,215,0,0.35)';
    btn.style.borderColor = '#ffd700';
    toast('★ Shiny boss drops guaranteed!', 2000);
  } else {
    btn.textContent = '★ Guarantee Shiny Boss Drop: OFF';
    btn.style.background = 'rgba(255,215,0,0.12)';
    toast('Shiny boss drop guarantee removed.', 2000);
  }
}
