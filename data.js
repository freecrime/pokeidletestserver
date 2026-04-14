// ============================================================
// EVENT CONFIG — adjust dates here to toggle events
// ============================================================

// 2× Diamond Road Gem Boost — set endDate to control when it expires
// Set endDate to a past date to disable, far future to make permanent
// ── Dev toggle — set to true to show the debug button ──
const DEBUG_MODE = false;
const DEBUG_PASSWORD = 'pokemon123'; // Change this to your own password

const GEM_BOOST_EVENT = {
  active: true,
  multiplier: 2,
  endDate: '2026-04-13T23:59:59Z', // Sunday 8.3.2026
};

// Groudon & Kyogre Boss — permanent
const SWORD_SHIELD_EVENT = {
  startDate: '2025-01-01T00:00:00Z',
  endDate:   '2099-12-31T23:59:59Z', // permanent
};

function isGemBoostActive() {
  if(!GEM_BOOST_EVENT.active) return false;
  return Date.now() <= new Date(GEM_BOOST_EVENT.endDate).getTime();
}

function isSwordShieldEventActive() {
  const now = Date.now();
  return now >= new Date(SWORD_SHIELD_EVENT.startDate).getTime()
      && now <= new Date(SWORD_SHIELD_EVENT.endDate).getTime();
}

// ============================================================
// DATA
// ============================================================

const TYPE_COLORS = {
  normal:'#A8A878', fire:'#F08030', water:'#6890F0', electric:'#F8D030',
  grass:'#78C850', ice:'#98D8D8', fighting:'#C03028', poison:'#A040A0',
  ground:'#E0C068', flying:'#A890F0', psychic:'#F85888', bug:'#A8B820',
  rock:'#B8A038', ghost:'#705898', dragon:'#7038F8', dark:'#705848',
  steel:'#B8B8D0', fairy:'#EE99AC'
};

const STARTERS = [
  {id:1, name:'Bulbasaur', types:['grass','poison']},
  {id:4, name:'Charmander', types:['fire']},
  {id:7, name:'Squirtle', types:['water']},
  {id:152, name:'Chikorita', types:['grass']},
  {id:155, name:'Cyndaquil', types:['fire']},
  {id:158, name:'Totodile', types:['water']},
  {id:252, name:'Treecko', types:['grass']},
  {id:255, name:'Torchic', types:['fire']},
  {id:258, name:'Mudkip', types:['water']},
];

const REGIONS = [
  { name: 'Pallet Town', minWave: 1, pool: [
    {id:16,name:'Pidgey',types:['normal','flying'],w:10},{id:19,name:'Rattata',types:['normal'],w:10},
    {id:21,name:'Spearow',types:['normal','flying'],w:8},{id:23,name:'Ekans',types:['poison'],w:7},
    {id:25,name:'Pikachu',types:['electric'],w:4},{id:39,name:'Jigglypuff',types:['normal','fairy'],w:6},
    {id:52,name:'Meowth',types:['normal'],w:5},
  ]},
  { name: 'Viridian Forest', minWave: 20, pool: [
    {id:10,name:'Caterpie',types:['bug'],w:10},{id:13,name:'Weedle',types:['bug','poison'],w:10},
    {id:11,name:'Metapod',types:['bug'],w:7},{id:14,name:'Kakuna',types:['bug','poison'],w:7},
    {id:12,name:'Butterfree',types:['bug','flying'],w:3},{id:15,name:'Beedrill',types:['bug','poison'],w:3},
    {id:35,name:'Clefairy',types:['normal','fairy'],w:2},
  ]},
  { name: 'Mt. Moon', minWave: 50, pool: [
    {id:41,name:'Zubat',types:['poison','flying'],w:10},{id:74,name:'Geodude',types:['rock','ground'],w:8},
    {id:50,name:'Diglett',types:['ground'],w:6},{id:27,name:'Sandshrew',types:['ground'],w:6},
    {id:46,name:'Paras',types:['bug','grass'],w:5},{id:79,name:'Slowpoke',types:['water','psychic'],w:3},
  ]},
  { name: 'Cerulean City', minWave: 100, pool: [
    {id:54,name:'Psyduck',types:['water'],w:8},{id:60,name:'Poliwag',types:['water'],w:8},
    {id:72,name:'Tentacool',types:['water','poison'],w:7},{id:98,name:'Krabby',types:['water'],w:6},
    {id:116,name:'Horsea',types:['water'],w:5},{id:118,name:'Goldeen',types:['water'],w:5},
    {id:120,name:'Staryu',types:['water'],w:3},
  ]},
  { name: 'Pokemon Tower', minWave: 200, pool: [
    {id:92,name:'Gastly',types:['ghost','poison'],w:10},{id:93,name:'Haunter',types:['ghost','poison'],w:6},
    {id:94,name:'Gengar',types:['ghost','poison'],w:2},{id:56,name:'Mankey',types:['fighting'],w:7},
    {id:66,name:'Machop',types:['fighting'],w:6},
  ]},
  { name: 'Safari Zone', minWave: 400, pool: [
    {id:113,name:'Chansey',types:['normal'],w:3},{id:115,name:'Kangaskhan',types:['normal'],w:3},
    {id:123,name:'Scyther',types:['bug','flying'],w:3},{id:127,name:'Pinsir',types:['bug'],w:3},
    {id:128,name:'Tauros',types:['normal'],w:4},{id:147,name:'Dratini',types:['dragon'],w:2},
    {id:148,name:'Dragonair',types:['dragon'],w:1},
  ]},
  { name: 'Victory Road', minWave: 800, pool: [
    {id:66,name:'Machop',types:['fighting'],w:6},{id:95,name:'Onix',types:['rock','ground'],w:5},
    {id:111,name:'Rhyhorn',types:['ground','rock'],w:5},{id:112,name:'Rhydon',types:['ground','rock'],w:3},
    {id:149,name:'Dragonite',types:['dragon','flying'],w:1},
  ]},
];

const EVOLUTIONS = {
  1:{id:2,name:'Ivysaur',level:16}, 2:{id:3,name:'Venusaur',level:32},
  4:{id:5,name:'Charmeleon',level:16}, 5:{id:6,name:'Charizard',level:36},
  7:{id:8,name:'Wartortle',level:16}, 8:{id:9,name:'Blastoise',level:36},
  10:{id:11,name:'Metapod',level:7}, 11:{id:12,name:'Butterfree',level:10},
  13:{id:14,name:'Kakuna',level:7}, 14:{id:15,name:'Beedrill',level:10},
  16:{id:17,name:'Pidgeotto',level:18}, 17:{id:18,name:'Pidgeot',level:36},
  19:{id:20,name:'Raticate',level:20}, 21:{id:22,name:'Fearow',level:20},
  23:{id:24,name:'Arbok',level:22}, 25:{id:26,name:'Raichu',level:30},
  27:{id:28,name:'Sandslash',level:22}, 29:{id:30,name:'Nidorina',level:16},
  30:{id:31,name:'Nidoqueen',level:36}, 32:{id:33,name:'Nidorino',level:16},
  33:{id:34,name:'Nidoking',level:36}, 35:{id:36,name:'Clefable',level:36},
  37:{id:38,name:'Ninetales',level:30}, 39:{id:40,name:'Wigglytuff',level:30},
  41:{id:42,name:'Golbat',level:22}, 42:{id:169,name:'Crobat',level:50},
  43:{id:44,name:'Gloom',level:21}, 44:{id:45,name:'Vileplume',level:36},
  46:{id:47,name:'Parasect',level:24}, 48:{id:49,name:'Venomoth',level:31},
  50:{id:51,name:'Dugtrio',level:26}, 52:{id:53,name:'Persian',level:28},
  54:{id:55,name:'Golduck',level:33}, 56:{id:57,name:'Primeape',level:28},
  58:{id:59,name:'Arcanine',level:36}, 60:{id:61,name:'Poliwhirl',level:25},
  61:{id:62,name:'Poliwrath',level:40}, 63:{id:64,name:'Kadabra',level:16},
  64:{id:65,name:'Alakazam',level:36}, 66:{id:67,name:'Machoke',level:28},
  67:{id:68,name:'Machamp',level:40}, 72:{id:73,name:'Tentacruel',level:30},
  74:{id:75,name:'Graveler',level:25}, 75:{id:76,name:'Golem',level:36},
  79:{id:80,name:'Slowbro',level:37}, 81:{id:82,name:'Magneton',level:30},
  84:{id:85,name:'Dodrio',level:31}, 86:{id:87,name:'Dewgong',level:34},
  88:{id:89,name:'Muk',level:38}, 90:{id:91,name:'Cloyster',level:36},
  92:{id:93,name:'Haunter',level:25}, 93:{id:94,name:'Gengar',level:36},
  95:{id:208,name:'Steelix',level:50}, 98:{id:99,name:'Kingler',level:28},
  100:{id:101,name:'Electrode',level:30}, 102:{id:103,name:'Exeggutor',level:36},
  104:{id:105,name:'Marowak',level:28}, 111:{id:112,name:'Rhydon',level:42},
  112:{id:464,name:'Rhyperior',level:65}, 113:{id:242,name:'Blissey',level:55},
  116:{id:117,name:'Seadra',level:32}, 118:{id:119,name:'Seaking',level:33},
  120:{id:121,name:'Starmie',level:36}, 123:{id:212,name:'Scizor',level:50},
  129:{id:130,name:'Gyarados',level:20}, 133:{id:134,name:'Vaporeon',level:30},
  147:{id:148,name:'Dragonair',level:30}, 148:{id:149,name:'Dragonite',level:55},
  152:{id:153,name:'Bayleef',level:16}, 153:{id:154,name:'Meganium',level:32},
  155:{id:156,name:'Quilava',level:14}, 156:{id:157,name:'Typhlosion',level:36},
  158:{id:159,name:'Croconaw',level:18}, 159:{id:160,name:'Feraligatr',level:30},
  252:{id:253,name:'Grovyle',level:16}, 253:{id:254,name:'Sceptile',level:36},
  255:{id:256,name:'Combusken',level:16}, 256:{id:257,name:'Blaziken',level:36},
  258:{id:259,name:'Marshtomp',level:16}, 259:{id:260,name:'Swampert',level:36},
  // Gen 2 evolutions
  152:{id:153,name:'Bayleef',level:16}, 153:{id:154,name:'Meganium',level:32},
  155:{id:156,name:'Quilava',level:14}, 156:{id:157,name:'Typhlosion',level:36},
  158:{id:159,name:'Croconaw',level:18}, 159:{id:160,name:'Feraligatr',level:30},
  163:{id:164,name:'Noctowl',level:20}, 165:{id:166,name:'Ledian',level:18},
  167:{id:168,name:'Ariados',level:22}, 177:{id:178,name:'Xatu',level:25},
  183:{id:184,name:'Azumarill',level:18}, 187:{id:188,name:'Skiploom',level:18},
  188:{id:189,name:'Jumpluff',level:27}, 193:{id:469,name:'Yanmega',level:50},
  228:{id:229,name:'Houndoom',level:24}, 246:{id:247,name:'Pupitar',level:30},
  247:{id:248,name:'Tyranitar',level:55},
  // Gen 3 evolutions
  261:{id:262,name:'Mightyena',level:18}, 263:{id:264,name:'Linoone',level:20},
  270:{id:271,name:'Lombre',level:14}, 271:{id:272,name:'Ludicolo',level:30},
  278:{id:279,name:'Pelipper',level:25}, 280:{id:281,name:'Kirlia',level:20},
  281:{id:282,name:'Gardevoir',level:30}, 293:{id:294,name:'Loudred',level:20},
  294:{id:295,name:'Exploud',level:40}, 333:{id:334,name:'Altaria',level:35},
  371:{id:372,name:'Shelgon',level:30}, 372:{id:373,name:'Salamence',level:50},
  374:{id:375,name:'Metang',level:20}, 375:{id:376,name:'Metagross',level:45},
  // Gen 4 evolutions
  387:{id:388,name:'Grotle',level:18}, 388:{id:389,name:'Torterra',level:32},
  390:{id:391,name:'Monferno',level:14}, 391:{id:392,name:'Infernape',level:36},
  393:{id:394,name:'Prinplup',level:16}, 394:{id:395,name:'Empoleon',level:36},
  396:{id:397,name:'Staravia',level:14}, 397:{id:398,name:'Staraptor',level:34},
  399:{id:400,name:'Bibarel',level:15}, 403:{id:404,name:'Luxio',level:15},
  404:{id:405,name:'Luxray',level:30}, 443:{id:444,name:'Gabite',level:24},
  444:{id:445,name:'Garchomp',level:48}, 447:{id:448,name:'Lucario',level:30},
  // Additional Gen 2 evolutions
  161:{id:162,name:'Furret',level:15}, 163:{id:164,name:'Noctowl',level:20},
  165:{id:166,name:'Ledian',level:18}, 167:{id:168,name:'Ariados',level:22},
  170:{id:171,name:'Lanturn',level:27}, 177:{id:178,name:'Xatu',level:25},
  179:{id:180,name:'Flaaffy',level:15}, 180:{id:181,name:'Ampharos',level:30},
  183:{id:184,name:'Azumarill',level:18}, 187:{id:188,name:'Skiploom',level:18},
  188:{id:189,name:'Jumpluff',level:27}, 190:{id:424,name:'Ambipom',level:32},
  193:{id:469,name:'Yanmega',level:50}, 198:{id:430,name:'Honchkrow',level:30},
  200:{id:429,name:'Mismagius',level:40}, 204:{id:205,name:'Forretress',level:31},
  209:{id:210,name:'Granbull',level:23}, 215:{id:461,name:'Weavile',level:40},
  221:{id:473,name:'Mamoswine',level:50}, 228:{id:229,name:'Houndoom',level:24},
  246:{id:247,name:'Pupitar',level:30}, 247:{id:248,name:'Tyranitar',level:55},
  // Additional Gen 3 evolutions
  261:{id:262,name:'Mightyena',level:18}, 263:{id:264,name:'Linoone',level:20},
  270:{id:271,name:'Lombre',level:14}, 271:{id:272,name:'Ludicolo',level:30},
  273:{id:274,name:'Nuzleaf',level:14}, 274:{id:275,name:'Shiftry',level:30},
  276:{id:277,name:'Swellow',level:22}, 278:{id:279,name:'Pelipper',level:25},
  280:{id:281,name:'Kirlia',level:20}, 281:{id:282,name:'Gardevoir',level:30},
  281:{id:475,name:'Gallade',level:30},
  285:{id:286,name:'Breloom',level:23}, 287:{id:288,name:'Vigoroth',level:18},
  288:{id:289,name:'Slaking',level:36}, 293:{id:294,name:'Loudred',level:20},
  294:{id:295,name:'Exploud',level:40}, 300:{id:301,name:'Delcatty',level:25},
  304:{id:305,name:'Lairon',level:32}, 305:{id:306,name:'Aggron',level:42},
  316:{id:317,name:'Swalot',level:26}, 322:{id:323,name:'Camerupt',level:33},
  325:{id:326,name:'Grumpig',level:32}, 333:{id:334,name:'Altaria',level:35},
  339:{id:340,name:'Whiscash',level:30}, 371:{id:372,name:'Shelgon',level:30},
  372:{id:373,name:'Salamence',level:50}, 374:{id:375,name:'Metang',level:20},
  375:{id:376,name:'Metagross',level:45},
  // Additional Gen 4 evolutions
  406:{id:407,name:'Roserade',level:30}, 408:{id:409,name:'Rampardos',level:30},
  410:{id:411,name:'Bastiodon',level:30}, 418:{id:419,name:'Floatzel',level:26},
  420:{id:421,name:'Cherrim',level:25}, 425:{id:426,name:'Drifblim',level:28},
  427:{id:428,name:'Lopunny',level:30}, 431:{id:432,name:'Purugly',level:38},
  449:{id:450,name:'Hippowdon',level:34}, 451:{id:452,name:'Drapion',level:40},
  453:{id:454,name:'Toxicroak',level:37}, 456:{id:457,name:'Lumineon',level:31},
  // Gen 5 evolutions
  495:{id:496,name:'Servine',level:17}, 496:{id:497,name:'Serperior',level:36},
  498:{id:499,name:'Pignite',level:17}, 499:{id:500,name:'Emboar',level:36},
  501:{id:502,name:'Dewott',level:17}, 502:{id:503,name:'Samurott',level:36},
  504:{id:505,name:'Watchog',level:20}, 506:{id:507,name:'Herdier',level:16},
  507:{id:508,name:'Stoutland',level:32}, 509:{id:510,name:'Liepard',level:20},
  519:{id:520,name:'Tranquill',level:21}, 520:{id:521,name:'Unfezant',level:32},
  524:{id:525,name:'Boldore',level:25}, 525:{id:526,name:'Gigalith',level:40},
  527:{id:528,name:'Swoobat',level:25}, 529:{id:530,name:'Excadrill',level:31},
  532:{id:533,name:'Gurdurr',level:25}, 533:{id:534,name:'Conkeldurr',level:40},
  535:{id:536,name:'Palpitoad',level:25}, 536:{id:537,name:'Seismitoad',level:36},
  540:{id:541,name:'Swadloon',level:20}, 541:{id:542,name:'Leavanny',level:34},
  543:{id:544,name:'Whirlipede',level:22}, 544:{id:545,name:'Scolipede',level:30},
  546:{id:547,name:'Whimsicott',level:28}, 551:{id:552,name:'Krokorok',level:29},
  552:{id:553,name:'Krookodile',level:40}, 554:{id:555,name:'Darmanitan',level:35},
  559:{id:560,name:'Scrafty',level:28}, 568:{id:569,name:'Garbodor',level:36},
  570:{id:571,name:'Zoroark',level:30}, 577:{id:578,name:'Duosion',level:32},
  578:{id:579,name:'Reuniclus',level:41}, 582:{id:583,name:'Vanillish',level:35},
  583:{id:584,name:'Vanilluxe',level:47}, 588:{id:589,name:'Escavalier',level:30},
  592:{id:593,name:'Jellicent',level:40}, 595:{id:596,name:'Galvantula',level:36},
  602:{id:603,name:'Eelektrik',level:39}, 603:{id:604,name:'Eelektross',level:50},
  607:{id:608,name:'Lampent',level:41}, 608:{id:609,name:'Chandelure',level:50},
  610:{id:611,name:'Fraxure',level:38}, 611:{id:612,name:'Haxorus',level:48},
  616:{id:617,name:'Accelgor',level:30}, 621:{id:621,name:'Druddigon',level:999},
  624:{id:625,name:'Bisharp',level:52}, 633:{id:634,name:'Zweilous',level:50},
  634:{id:635,name:'Hydreigon',level:64}, 636:{id:637,name:'Volcarona',level:59},
};

const ITEMS = [
  // Sustain
  {id:'leftovers',     name:'Leftovers',     emoji:'🍎', desc:'Regenerates 1/8 max HP every second in battle', effect:'regen'},
  {id:'shell_bell',    name:'Shell Bell',     emoji:'🔔', desc:'Heals 1/4 of all damage dealt back as HP', effect:'shell_bell'},
  {id:'focus_sash',    name:'Focus Sash',     emoji:'🩹', desc:'Survives one fatal hit with 1 HP remaining (only from full HP)', effect:'focus_sash'},
  // Offense
  {id:'choice_band',   name:'Choice Band',    emoji:'🎀', desc:'+30% Attack damage', effect:'atk_boost', value:1.3},
  {id:'choice_specs',  name:'Choice Specs',   emoji:'🔵', desc:'+30% Special Attack damage', effect:'spatk_boost', value:1.3},
  {id:'life_orb',      name:'Life Orb',       emoji:'🌑', desc:'+40% all damage dealt. Costs 8% max HP per attack', effect:'life_orb'},
  // Speed / Utility
  {id:'choice_scarf',  name:'Choice Scarf',   emoji:'🧣', desc:'+30% Speed (attacks fire faster)', effect:'spd_boost', value:1.3},
  {id:'lucky_egg',     name:'Lucky Egg',      emoji:'🥚', desc:'Doubles all EXP gained from battle', effect:'lucky_egg', value:2.0},
  {id:'exp_share',     name:'Exp. Share',     emoji:'📡', desc:'Benched Pokémon earns 50% of the active fighter\'s EXP', effect:'exp_share'},
  // Defense
  {id:'assault_vest',  name:'Assault Vest',   emoji:'🦺', desc:'+35% Sp.Def, reduces incoming special damage by ~26%', effect:'spdef_boost', value:1.35},
  {id:'rocky_helmet',  name:'Rocky Helmet',   emoji:'⛑️', desc:'Attacker loses 1/4 of your max HP as recoil each hit', effect:'rocky_helmet'},
  {id:'iron_ball',     name:'Iron Ball',      emoji:'⚫', desc:'+35% Defense, reduces incoming physical damage by ~26%', effect:'def_boost', value:1.35},
];

const EPIC_ITEMS = [
  // Consumables
  {id:'rare_candy',  name:'Rare Candy',   emoji:'🍬', desc:'Levels up a Pokémon by 1. Works up to Lv.175 only', effect:'rare_candy'},
  {id:'max_candy',   name:'Max Candy',    emoji:'🍭', desc:'Levels up any Pokémon by 1. Works up to Lv.250', effect:'max_candy'},
  {id:'sss_candy',   name:'SSS Candy',    emoji:'⭐', desc:'Permanently boosts one SS stat by +40%. Non-legendary only. One use per Pokémon', effect:'sss_candy'},
  // Legendary-only transform items (boss-drop only, never from gacha)
  {id:'meteorite',   name:'Meteorite',    emoji:'☄️', desc:'A fragment of a fallen star. Held by Rayquaza, it awakens Mega Evolution — all stats doubled, rainbow aura. Only one Mega allowed per team', effect:'meteorite'},
  {id:'origin_orb',  name:'Origin Orb',   emoji:'🔮', desc:'An orb that resonates with distorted space. Held by Giratina, it shifts into Origin Forme — all stats doubled, ghostly aura', effect:'origin_orb'},
  {id:'dna_splicer', name:'DNA Splicer',  emoji:'🧬', desc:'Fuses Kyurem with Zekrom or Reshiram on your team into Black or White Kyurem. Massive stat boost. Remove item to split apart', effect:'dna_splicer'},
  {id:'heros_sword', name:"Hero's Sword", emoji:'⚔️', desc:'A legendary blade reforged from rust and faith. Only Zacian can wield it — awakens Crowned Form with SSS stats. 1% drop from the Zacian boss', effect:'heros_sword'},
  {id:'heros_shield',      name:"Hero's Shield",        emoji:'🛡️',   desc:"A legendary shield reforged from rust and will. Only Zamazenta can bear it — awakens Crowned Form with SSS stats. 1% drop from the Zamazenta boss", effect:'heros_shield'},
  {id:'royal_sword',       name:"Royal Sword",           emoji:'👑',  desc:"A sword fit for a true king. Held by Zacian — Royal Crowned Form with beyond-SSS Attack. Rare 5% variant of the Hero's Sword drop. Cannot be traded.", effect:'royal_sword'},
  {id:'royal_shield',      name:"Royal Shield",          emoji:'🛡',   desc:"A shield worthy of a ruler. Held by Zamazenta — Royal Crowned Form with beyond-SSS HP. Rare 5% variant of the Hero's Shield drop. Cannot be traded.", effect:'royal_shield'},
  {id:'outer_world_meteor',name:"Outer World Meteor",    emoji:'🌌',  desc:"A meteorite from beyond the known universe. Held by Rayquaza — Mega form + SSS Speed becomes OUTER tier. Equipped to Envy — awakens Envy Unbound (×2 stats). Rare 5% variant of the Meteorite drop. Cannot be traded.", effect:'outer_world_meteor'},
  {id:'red_orb',           name:'Red Orb',               emoji:'🔴',  spriteUrl:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/red-orb.png',  desc:'A blazing red orb pulsing with ancient land energy. Only Groudon can wield it — awakens Primal Reversion with SSS stats. 1% drop from the Groudon boss.', effect:'red_orb'},
  {id:'blue_orb',          name:'Blue Orb',              emoji:'🔵',  spriteUrl:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/blue-orb.png', desc:'A deep blue orb humming with primordial sea power. Only Kyogre can wield it — awakens Primal Reversion with SSS stats. 1% drop from the Kyogre boss.', effect:'blue_orb'},
  {id:'mysterious_meteorite', name:'Mysterious Meteorite', emoji:'☄️', spriteUrl:'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/meteorite.png', desc:'An alien meteorite of unknown origin. Held by Deoxys only — opens a form selector to transform into Attack, Defense, or Speed form with SSS stats and a GALACTIC boost to the corresponding stat. 1% drop from the Deoxys boss.', effect:'mysterious_meteorite'},
  {id:'sceptilite',  name:'Cracked Sceptilite',   emoji:'💚', desc:'A Mega Stone for Sceptile — but its Mega energy is slowly leaking out. Still triggers Mega Evolution, but cannot carry a stat bonus. Get a new one from Premium Gacha for full power.', effect:'sceptilite'},
  {id:'swampertite', name:'Cracked Swampertite',  emoji:'💙', desc:'A Mega Stone for Swampert — but its Mega energy is slowly leaking out. Still triggers Mega Evolution, but cannot carry a stat bonus. Get a new one from Premium Gacha for full power.', effect:'swampertite'},
  {id:'blazikenite', name:'Cracked Blazikenite',  emoji:'🔥', desc:'A Mega Stone for Blaziken — but its Mega energy is slowly leaking out. Still triggers Mega Evolution, but cannot carry a stat bonus. Get a new one from Premium Gacha for full power.', effect:'blazikenite'},
  {id:'gengarite',   name:'Cracked Gengarite',    emoji:'👻', desc:'A Mega Stone for Gengar — its shadowy energy flickers. Still triggers Mega Evolution, but cannot carry a stat bonus. Get a new one from Premium Gacha for full power.', effect:'gengarite'},
  {id:'aggronite',   name:'Cracked Aggronite',    emoji:'🪨', desc:'A Mega Stone for Aggron — its iron aura is unstable. Still triggers Mega Evolution, but cannot carry a stat bonus. Get a new one from Premium Gacha for full power.', effect:'aggronite'},
  {id:'garchompite', name:'Cracked Garchompite',  emoji:'🦈', desc:'A Mega Stone for Garchomp — its draconic power surges unevenly. Still triggers Mega Evolution, but cannot carry a stat bonus. Get a new one from Premium Gacha for full power.', effect:'garchompite'},
  // Epic held items
  {id:'mega_stone',  name:'Mega Stone',   emoji:'💎', desc:'+35% to all stats. No conditions.', effect:'mega_stone', value:1.35},
  {id:'soul_dew',    name:'Soul Dew',     emoji:'💠', desc:'+45% Special Attack, +25% Special Defense', effect:'soul_dew', value:1.45},
  {id:'rusted_sword',name:'Rusted Sword', emoji:'⚔️', desc:'+50% Attack damage', effect:'rusted_sword', value:1.5},
  {id:'draco_plate', name:'Draco Plate',  emoji:'🐉', desc:'+50% all stats for Dragon-type Pokémon, +20% for all others', effect:'draco_plate', value:1.5},
  {id:'prism_scale', name:'Prism Scale',  emoji:'🌈', desc:'+30% all stats and +20% max HP', effect:'prism_scale', value:1.3},
  {id:'eviolite',    name:'Eviolite',     emoji:'🛡️', desc:'+40% Defense and Sp.Def. Reduces all incoming damage by 22%', effect:'eviolite', value:1.4},
  {id:'power_herb',  name:'Power Herb',   emoji:'🌿', desc:'+35% Speed and +20% Attack', effect:'power_herb', value:1.35},
];

const statsCache = {};

// ============================================================
// GAME STATE
// ============================================================

let gameState = {
  gold: 500, gems: 15, wins: 0, wave: 1, autoBattle: true,
  team: [], box: [], inventory: {}, equippedItems: {},
  currentFighterIdx: 0, dailyClaimed: false, lastDaily: 0,
  road: { active: false, floor: 0, winsOnFloor: 0, winsNeeded: 30, mode: null, farmRegionIdx: 0 },
  trainerName: 'Trainer', lockedPokemon: [], breedingSlots: []
};

let currentEnemy = null;
let battleTimer = null;
let battlePaused = false;
let pUid = 0;

// ============================================================
// COSMIC SHINY DETECTION
// ============================================================

function countSS(pokemon) {
  if(!pokemon.ivs) return 0;
  return Object.values(pokemon.ivs).filter(iv => iv >= 31).length;
}

function isCosmic(pokemon) {
  return pokemon.isShiny && countSS(pokemon) >= 3;
}

function isMegaRayquaza(pokemon) {
  if(!pokemon || pokemon.id !== 384) return false;
  if(pokemon._isEnvy) return false; // Envy Unbound is its own thing
  const equipped = gameState.equippedItems[pokemon.uid];
  return equipped === 'meteorite' || equipped === 'outer_world_meteor';
}

function isOriginGiratina(pokemon) {
  if(!pokemon || pokemon.id !== 487) return false;
  const equipped = gameState.equippedItems[pokemon.uid];
  return equipped === 'origin_orb';
}

function isDNAFused(pokemon) {
  if(!pokemon || pokemon.id !== 646) return false;
  return !!(pokemon._fusedWith);
}

function isBlackKyurem(pokemon) {
  return isDNAFused(pokemon) && pokemon._fusedWith === 644; // Zekrom
}

function isWhiteKyurem(pokemon) {
  return isDNAFused(pokemon) && pokemon._fusedWith === 643; // Reshiram
}

function isCrownedZacian(pokemon) {
  if(!pokemon || pokemon.id !== 888) return false;
  const eq = gameState.equippedItems[pokemon.uid];
  return eq === 'heros_sword' || eq === 'royal_sword';
}

function isCrownedZamazenta(pokemon) {
  if(!pokemon || pokemon.id !== 889) return false;
  const eq = gameState.equippedItems[pokemon.uid];
  return eq === 'heros_shield' || eq === 'royal_shield';
}

function isCrownedRoyalZacian(pokemon) {
  if(!pokemon || pokemon.id !== 888) return false;
  return gameState.equippedItems[pokemon.uid] === 'royal_sword';
}

function isCrownedRoyalZamazenta(pokemon) {
  if(!pokemon || pokemon.id !== 889) return false;
  return gameState.equippedItems[pokemon.uid] === 'royal_shield';
}

function isPrimalGroudon(pokemon) {
  if(!pokemon || pokemon.id !== 383) return false;
  return gameState.equippedItems[pokemon.uid] === 'red_orb';
}

function isPrimalKyogre(pokemon) {
  if(!pokemon || pokemon.id !== 382) return false;
  return gameState.equippedItems[pokemon.uid] === 'blue_orb';
}

function isDeoxysTransformed(pokemon) {
  if(!pokemon || pokemon.id !== 386) return false;
  return gameState.equippedItems[pokemon.uid] === 'mysterious_meteorite' && !!pokemon._deoxysForm;
}

function isOuterWorldMegaRayquaza(pokemon) {
  if(!pokemon || pokemon.id !== 384 || pokemon._isEnvy) return false;
  return gameState.equippedItems[pokemon.uid] === 'outer_world_meteor';
}

function isEnvyUnbound(pokemon) {
  if(!pokemon || !pokemon._isEnvy) return false;
  return gameState.equippedItems[pokemon.uid] === 'outer_world_meteor';
}

function isPerfectedZygarde(pokemon) {
  return !!(pokemon && pokemon.id === 718 && pokemon._zygardeForm === 'perfected');
}

function getMegaStoneBaseId(itemId) {
  if(!itemId) return null;
  if(itemId === 'sceptilite' || itemId === 'swampertite' || itemId === 'blazikenite' || itemId === 'gengarite' || itemId === 'aggronite' || itemId === 'garchompite') return itemId;
  if(gameState && gameState.megaStoneInstances && gameState.megaStoneInstances[itemId]) return gameState.megaStoneInstances[itemId].base;
  return null;
}

function isMegaStoneInstance(itemId) {
  return !!(gameState && gameState.megaStoneInstances && gameState.megaStoneInstances[itemId]);
}

// Resolves any item ID (including instance IDs) to a display-ready item object
function getItemByEquipId(equipId) {
  if(!equipId) return null;
  const allItems = ITEMS.concat(EPIC_ITEMS);
  // Direct match first
  const direct = allItems.find(i => i.id === equipId);
  if(direct) return direct;
  // Check if it's a mega stone instance
  if(gameState && gameState.megaStoneInstances && gameState.megaStoneInstances[equipId]) {
    const data = gameState.megaStoneInstances[equipId];
    const base = allItems.find(i => i.id === data.base);
    if(base) {
      const STAT_LABELS = {'attack':'Atk','special-attack':'Sp.Atk','defense':'Def','special-defense':'Sp.Def','speed':'Spd'};
      const bonusLabel = `+${Math.round(data.pct*100)}% ${STAT_LABELS[data.stat]||data.stat}`;
      const STONE_NAMES = { sceptilite: 'Sceptilite', swampertite: 'Swampertite', blazikenite: 'Blazikenite', gengarite: 'Gengarite', aggronite: 'Aggronite', garchompite: 'Garchompite' };
      const cleanName = STONE_NAMES[data.base] || base.name.replace(/^Cracked\s*/i, '');
      const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${data.base}.png`;
      return { ...base, id: equipId, name: `${cleanName} (${bonusLabel})`, _instanceData: data, spriteUrl };
    }
  }
  // Check if it's a base mega stone ID (old/cracked copies)
  const MEGA_STONE_SPRITE = { sceptilite:'sceptilite', swampertite:'swampertite', blazikenite:'blazikenite', gengarite:'gengarite', aggronite:'aggronite', garchompite:'garchompite' };
  if(MEGA_STONE_SPRITE[equipId]) {
    const base = allItems.find(i => i.id === equipId);
    if(base) return { ...base, spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${MEGA_STONE_SPRITE[equipId]}.png` };
  }
  return null;
}

function getItemIcon(item, size=20) {
  if(!item) return '';
  if(item.spriteUrl) return `<img src="${item.spriteUrl}" style="width:${size}px;height:${size}px;image-rendering:pixelated;vertical-align:middle">`;
  return item.emoji || '';
}

function isMegaSceptile(pokemon) {
  if(!pokemon || pokemon.id !== 254) return false;
  const eq = gameState.equippedItems[pokemon.uid];
  return eq === 'sceptilite' || (getMegaStoneBaseId(eq) === 'sceptilite');
}

function isMegaSwampert(pokemon) {
  if(!pokemon || pokemon.id !== 260) return false;
  const eq = gameState.equippedItems[pokemon.uid];
  return eq === 'swampertite' || (getMegaStoneBaseId(eq) === 'swampertite');
}

function isMegaBlaziken(pokemon) {
  if(!pokemon || pokemon.id !== 257) return false;
  const eq = gameState.equippedItems[pokemon.uid];
  return eq === 'blazikenite' || (getMegaStoneBaseId(eq) === 'blazikenite');
}

function isMegaGengar(pokemon) {
  if(!pokemon || pokemon.id !== 94) return false;
  const eq = gameState.equippedItems[pokemon.uid];
  return eq === 'gengarite' || (getMegaStoneBaseId(eq) === 'gengarite');
}

function isMegaAggron(pokemon) {
  if(!pokemon || pokemon.id !== 306) return false;
  const eq = gameState.equippedItems[pokemon.uid];
  return eq === 'aggronite' || (getMegaStoneBaseId(eq) === 'aggronite');
}

function isMegaGarchomp(pokemon) {
  if(!pokemon || pokemon.id !== 445) return false;
  const eq = gameState.equippedItems[pokemon.uid];
  return eq === 'garchompite' || (getMegaStoneBaseId(eq) === 'garchompite');
}

function hasMegaOnTeam(excludeUid) {
  return gameState.team.some(p => p && p.uid !== excludeUid && isMegaRayquaza(p));
}

// ============================================================
// REDEEM CODES
// ============================================================

const REDEEM_STORAGE_KEY = 'pkm_idle_redeemed_codes';

function getRedeemedCodes() {
  try {
    return JSON.parse(localStorage.getItem(REDEEM_STORAGE_KEY) || '[]');
  } catch(e) { return []; }
}

function markCodeRedeemed(code) {
  const codes = getRedeemedCodes();
  if(!codes.includes(code)) codes.push(code);
  localStorage.setItem(REDEEM_STORAGE_KEY, JSON.stringify(codes));
}

function isCodeRedeemed(code) {
  return getRedeemedCodes().includes(code);
}

// Parse codes from pastebin text
function parseCodeData(rawText) {
  const codeMap = {};
  let currentGems = 0;
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  for(const line of lines) {
    const gemsMatch = line.match(/💎\s*(\d+)\s*Gems?\s*Codes?/i);
    if(gemsMatch) { currentGems = parseInt(gemsMatch[1]); continue; }
    // Code format: uppercase alphanumeric, 8-10 chars
    if(/^[A-Z0-9]{8,12}$/.test(line)) {
      codeMap[line] = currentGems;
    }
  }
  return codeMap;
}

function openRedeemOverlay() {
  document.getElementById('redeem-overlay').classList.add('active');
  document.getElementById('redeem-input').value = '';
  document.getElementById('redeem-result').textContent = '';
  document.getElementById('redeem-result').style.color = '';
  setTimeout(() => document.getElementById('redeem-input').focus(), 100);
}

function closeRedeemOverlay() {
  document.getElementById('redeem-overlay').classList.remove('active');
}

async function doRedeem() {
  const input = document.getElementById('redeem-input');
  const resultEl = document.getElementById('redeem-result');
  const code = input.value.trim().toUpperCase();

  if(!code) {
    resultEl.textContent = '⚠️ Please enter a code!';
    resultEl.style.color = '#ffa726';
    return;
  }

  if(isCodeRedeemed(code)) {
    resultEl.textContent = '❌ Code already redeemed!';
    resultEl.style.color = '#ef5350';
    return;
  }

  resultEl.textContent = '⏳ Checking code...';
  resultEl.style.color = '#4fc3f7';

  try {
    // Fetch from pastebin through a CORS proxy alternative
    let rawText = null;
    try {
      const res = await fetch('https://pastebin.com/raw/MUvCVzuu');
      if(res.ok) rawText = await res.text();
    } catch(e) {
      // Network might be blocked — use hardcoded fallback
    }

    // Fallback: hardcoded codes matching the pastebin
    const FALLBACK_CODES = {
      'X7F2K9LQ5Z': 50, 'M4R8T1VY6P': 50, 'Z9N3W6X2KD': 50,
      'Q5L8C2B7RM': 50, 'T1V9P4X8ZH': 50,
      'A8K3Z7M2QX': 100, 'R6T9L4W1PV': 100, 'Y2X8C5N7KD': 100,
      'B9Q4M1Z6RT': 100, 'L7V2P8X3CW': 100,
      'Z4X9K2M7QP': 250, 'V8L3T6R1ZY': 250, 'Q2M7P4X9KD': 250,
      'N6Z1W8C3LT': 250, 'T9K5R2V7XQ': 250,
      '50GEMSUPDATE': 50, '250POKEMONUPDATE': 250, 'REROLLGALORE': 6000,
      'ORIGINDEVOUR': 250, 'BLACKANDWHITE': 750, 'BATTLEBOND': 750,
      'COOLANDTHEGANG': 'squirtle_gang', 'GEMAWHEEL': 4000, 'DNSFORDAYS': 'dna_splicer_gift',
      'GEMSGALORE': 'greed_sableye',
      'ANOTHERLUCKYGACHA': 'gold_45m',
      'MIDWEEKGIFT777': 777,
      'GAMECHANGER': 'envy_rayquaza',
      'GENVHARD': 500,
      'REVIVEDMEGAS': 'gold_5m',
      'FULLPOWER777': 777,
      'GOINGBEYOND': 4444,
      'EVOLUTIONSPEAK': 'gems_500_new',
      'BROKENSTONES': 'gold_5m_new',
    };

    let codeMap = FALLBACK_CODES;
    if(rawText) {
      const parsed = parseCodeData(rawText);
      if(Object.keys(parsed).length > 0) codeMap = { ...FALLBACK_CODES, ...parsed };
    }

    if(codeMap.hasOwnProperty(code)) {
      const reward = codeMap[code];
      markCodeRedeemed(code);
      input.value = '';

      // ── Special reward codes ────────────────────────────────
      if(reward === 'squirtle_gang') {
        const sq = newPokemonEntry(9, 'Squirtle Gang', ['water'], 250, false);
        sq.ivs = { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 };
        sq._noEvolve = true;
        sq._customSprite = 'https://i.redd.it/first-edit-draft-of-my-fusion-of-the-teenage-mutant-ninja-v0-nvud1m0wrysa1.png?width=288&format=png&auto=webp&s=b666b4dcc0c6decc1149e2aaaaf3781559aba042';
        fetchPokemonStats(9).then(stats => {
          sq.stats = stats;
          sq.statsLoaded = true;
          sq.currentHp = getMaxHp(sq);
          gameState.box.push(sq);
          saveGame();
          renderAll();
          showGachaResult(sq);
        });
        resultEl.innerHTML = `<span style="color:#4fc3f7">🐢 SQUIRTLE GANG redeemed! Check your box!</span>`;
        addLog('🐢 COOLANDTHEGANG: Squirtle Gang Lv.250 (Full SS!) joined!', 'log-evolve');
        toast('🐢 SQUIRTLE GANG! Full SS Lv.250!', 5000);
        setTimeout(() => {
          resultEl.innerHTML = `<span style="font-family:'Press Start 2P';font-size:8px;background:linear-gradient(90deg,#4fc3f7,#81d4fa,#ffffff,#4fc3f7);background-size:200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 1s linear infinite">🐢 GANG CLAIMED!</span>`;
        }, 100);
      } else if(reward === 'dna_splicer_gift') {
        gameState.inventory['dna_splicer'] = (gameState.inventory['dna_splicer'] || 0) + 1;
        updateResourceUI();
        resultEl.innerHTML = '<span style="color:#00e5ff">&#x1F9EC; DNSFORDAYS redeemed! +1 DNA Splicer!</span>';
        addLog('&#x1F9EC; DNSFORDAYS: +1 DNA Splicer added to inventory!', 'log-evolve');
        toast('&#x1F9EC; +1 DNA Splicer!', 4000);
        setTimeout(function(){ resultEl.innerHTML = '<span style="font-family:\'Press Start 2P\';font-size:8px;color:#00e5ff">DNA SPLICER!</span>'; }, 100);
      } else if(reward === 'gold_5m') {
        gameState.gold += 5000000;
        updateResourceUI();
        resultEl.innerHTML = '<span style="color:#ffd700">&#x1F4B0; REVIVEDMEGAS redeemed! +5,000,000 Gold!</span>';
        addLog('&#x1F4B0; REVIVEDMEGAS: +5,000,000 Gold!', 'log-evolve');
        toast('&#x1F4B0; +5,000,000 Gold!', 4000);
        setTimeout(function(){ resultEl.innerHTML = '<span style="font-family:\'Press Start 2P\';font-size:8px;background:linear-gradient(90deg,#ffd700,#fffde7,#ffd700);background-size:200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 1s linear infinite">+5M GOLD!</span>'; }, 100);
      } else if(reward === 'gold_15m') {
        gameState.gold += 15000000;
        updateResourceUI();
        resultEl.innerHTML = '<span style="color:#ffd700">&#x1F4B0; MEGASGALORE redeemed! +15,000,000 Gold!</span>';
        addLog('&#x1F4B0; MEGASGALORE: +15,000,000 Gold!', 'log-evolve');
        toast('&#x1F4B0; +15,000,000 Gold!', 4000);
        setTimeout(function(){ resultEl.innerHTML = '<span style="font-family:\'Press Start 2P\';font-size:8px;background:linear-gradient(90deg,#ffd700,#fffde7,#ffd700);background-size:200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 1s linear infinite">+15M GOLD!</span>'; }, 100);
      } else if(reward === 'gold_45m') {
        gameState.gold += 45000000;
        updateResourceUI();
        resultEl.innerHTML = '<span style="color:#ffd700">&#x1F4B0; LUCKYGACHA redeemed! +45,000,000 Gold!</span>';
        addLog('&#x1F4B0; LUCKYGACHA: +45,000,000 Gold!', 'log-evolve');
        toast('&#x1F4B0; +45,000,000 Gold!', 4000);
        setTimeout(function(){ resultEl.innerHTML = '<span style="font-family:\'Press Start 2P\';font-size:8px;background:linear-gradient(90deg,#ffd700,#fffde7,#ffd700);background-size:200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 1s linear infinite">+45M GOLD!</span>'; }, 100);
      } else if(reward === 'greed_sableye') {
        const greed = newPokemonEntry(302, 'Greed', ['ghost','dark'], 250, true);
        greed.ivs = { hp:31, attack:31, defense:31, 'special-attack':31, 'special-defense':31, speed:31 };
        greed._noEvolve = true;
        fetchPokemonStats(302).then(stats => {
          greed.stats = stats;
          greed.statsLoaded = true;
          greed.currentHp = getMaxHp(greed);
          gameState.box.push(greed);
          saveGame();
          renderAll();
          showGachaResult(greed);
        });
        resultEl.innerHTML = `<span style="color:#e040fb">💜 GEMSGALORE redeemed! Greed joins your team!</span>`;
        addLog('💎 GEMSGALORE: Shiny Greed (Sableye) Lv.250 — Full SS! joined!', 'log-shiny');
        toast('💎 Shiny GREED (Sableye) — Full SS! Lv.250!', 5000);
        setTimeout(() => {
          resultEl.innerHTML = `<span style="font-family:'Press Start 2P';font-size:8px;background:linear-gradient(90deg,#e040fb,#ffd700,#e040fb);background-size:200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 1s linear infinite">💎 GREED CLAIMED!</span>`;
        }, 100);
      } else if(reward === 'envy_rayquaza') {
        // ENVY — custom purple Rayquaza, no shiny, no mega, weaker than Mega Rayquaza
        const envy = newPokemonEntry(384, 'Envy', ['dragon','flying'], 250, false);
        // High-roll IVs from the high pool (3-4 SS stats = SSS display tier)
        const envyStats = ['hp','attack','defense','special-attack','special-defense','speed'];
        envyStats.forEach(s => {
          const r1 = Math.floor(Math.random() * 32);
          const r2 = Math.floor(Math.random() * 32);
          const r3 = Math.floor(Math.random() * 32);
          envy.ivs[s] = Math.max(r1, r2, r3);
        });
        const shuffled = [...envyStats].sort(() => Math.random() - 0.5);
        const numSS = 3 + Math.floor(Math.random() * 2); // 3-4 SS stats
        for(let i = 0; i < numSS; i++) envy.ivs[shuffled[i]] = 31;
        envy._noEvolve = true;
        envy._noMega = true;
        envy._isBossCode = true;
        envy._isEnvy = true; // custom 1.2x stat multiplier — weaker than Mega
        envy._customSprite = 'https://i.redd.it/4t7qxz7fb15d1.png';
        fetchPokemonStats(384).then(stats => {
          envy.stats = stats;
          envy.statsLoaded = true;
          envy.currentHp = getMaxHp(envy);
          gameState.box.push(envy);
          saveGame();
          renderAll();
          showGachaResult(envy);
        });
        resultEl.innerHTML = `<span style="color:#ab47bc">💜 GAMECHANGER redeemed! Envy joins your team!</span>`;
        addLog('💜 GAMECHANGER: Envy (Purple Rayquaza) Lv.250 — SSS! joined!', 'log-cosmic');
        toast('💜 ENVY has arrived! No Mega. Pure SSS power.', 5000);
        setTimeout(() => {
          resultEl.innerHTML = `<span style="font-family:'Press Start 2P';font-size:8px;background:linear-gradient(90deg,#ab47bc,#ce93d8,#ab47bc);background-size:200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 1s linear infinite">💜 ENVY CLAIMED!</span>`;
        }, 100);
      } else if(reward === 'gems_500_new') {
        gameState.gems += 500;
        updateResourceUI();
        resultEl.innerHTML = '<span style="color:#4fc3f7">💎 EVOLUTIONSPEAK redeemed! +500 Gems!</span>';
        addLog('💎 EVOLUTIONSPEAK: +500 Gems!', 'log-evolve');
        toast('💎 +500 Gems!', 4000);
        setTimeout(function(){ resultEl.innerHTML = '<span style="font-family:\'Press Start 2P\';font-size:8px;background:linear-gradient(90deg,#4fc3f7,#81d4fa,#4fc3f7);background-size:200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 1s linear infinite">+500 GEMS!</span>'; }, 100);
      } else if(reward === 'gold_5m_new') {
        gameState.gold += 5000000;
        updateResourceUI();
        resultEl.innerHTML = '<span style="color:#ffd700">💰 BROKENSTONES redeemed! +5,000,000 Gold!</span>';
        addLog('💰 BROKENSTONES: +5,000,000 Gold!', 'log-evolve');
        toast('💰 +5,000,000 Gold!', 4000);
        setTimeout(function(){ resultEl.innerHTML = '<span style="font-family:\'Press Start 2P\';font-size:8px;background:linear-gradient(90deg,#ffd700,#fffde7,#ffd700);background-size:200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 1s linear infinite">+5M GOLD!</span>'; }, 100);
      } else {
        const gems = reward;
        gameState.gems += gems;
        updateResourceUI();
        resultEl.innerHTML = `<span style="color:#ffd700">✨ Code redeemed! +${gems} 💎 Gems!</span>`;
        addLog(`🎁 Code redeemed: +${gems} Gems!`, 'log-evolve');
        toast(`🎁 Code valid! +${gems} 💎 Gems!`, 4000);
        setTimeout(() => {
          resultEl.innerHTML = `<span style="font-family:'Press Start 2P';font-size:8px;background:linear-gradient(90deg,#ffd700,#ff69b4,#4fc3f7,#ffd700);background-size:200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 1s linear infinite">+${gems} 💎 Claimed!</span>`;
        }, 100);
      }
    } else {
      resultEl.textContent = '❌ Invalid code!';
      resultEl.style.color = '#ef5350';
    }
  } catch(e) {
    resultEl.textContent = '⚠️ Network error. Try again!';
    resultEl.style.color = '#ffa726';
  }
}

// ============================================================
// IV / STATS HELPERS
// ============================================================

function generateIVs() {
  const stats = ['hp','attack','defense','special-attack','special-defense','speed'];
  const ivs = {};
  stats.forEach(s => { ivs[s] = Math.floor(Math.random() * 32); });
  return ivs;
}

function generateHighIVs() {
  const stats = ['hp','attack','defense','special-attack','special-defense','speed'];
  const ivs = {};
  stats.forEach(s => {
    const r1 = Math.floor(Math.random() * 32);
    const r2 = Math.floor(Math.random() * 32);
    const r3 = Math.floor(Math.random() * 32);
    ivs[s] = Math.max(r1, r2, r3);
  });
  const shuffled = [...stats].sort(() => Math.random() - 0.5);
  ivs[shuffled[0]] = 31;
  ivs[shuffled[1]] = 31;
  return ivs;
}

function getStatGrade(iv) {
  if(iv >= 31) return {label:'SS', color:'#ff69b4', isSS:true};
  if(iv >= 28) return {label:'S',  color:'#ffd700'};
  if(iv >= 24) return {label:'A',  color:'#66bb6a'};
  if(iv >= 18) return {label:'B',  color:'#4fc3f7'};
  if(iv >= 12) return {label:'C',  color:'#ab47bc'};
  if(iv >= 6)  return {label:'D',  color:'#ff9e40'};
  return {label:'F', color:'#ef5350'};
}

function newPokemonEntry(id, name, types, level, isShiny=false, _skipLvl250=false) {
  // Enemies keep their exact level. Player-obtained pokemon are capped at 250 (preserving levels below 250, e.g. starter at Lv.5).
  const finalLevel = _skipLvl250 ? level : Math.min(250, level);
  const pk = {
    uid: ++pUid, id, name, types, level: finalLevel, isShiny,
    currentHp: null, statsLoaded: false, stats: null,
    exp: 0, expToNext: calcExpToNext(finalLevel), ivs: generateIVs(),
    ot: gameState ? (gameState.trainerName || 'Trainer') : 'Trainer',
  };
  return pk;
}

function calcExpToNext(level) {
  return Math.floor(Math.pow(level, 3) * 0.8 + level * 50 + 100);
}

// Returns the natural level cap for a pokemon.
// Boss-caught pokemon above 250 are capped at their current level (e.g. 270 stays 270).
function maxLevelOf(pokemon) {
  return pokemon.level > 250 ? pokemon.level : 250;
}

function getEffectiveStat(stat, pokemon, statName) {
  let val = stat;
  if(pokemon.level > 100) val = Math.floor(val * (1 + (pokemon.level - 100) * 0.008));
  const allItems = ITEMS.concat(EPIC_ITEMS);
  const equippedId = gameState.equippedItems[pokemon.uid];
  const resolvedId = getMegaStoneBaseId(equippedId) || equippedId;
  const item = allItems.find(i => i.id === resolvedId);
  if(item) {
    if(item.effect === 'atk_boost' && statName === 'attack') val = Math.floor(val * item.value);
    if(item.effect === 'spatk_boost' && statName === 'special-attack') val = Math.floor(val * item.value);
    if(item.effect === 'spdef_boost' && statName === 'special-defense') val = Math.floor(val * item.value);
    if(item.effect === 'spd_boost' && statName === 'speed') val = Math.floor(val * item.value);
    if(item.effect === 'mega_stone') val = Math.floor(val * item.value);
    if(item.effect === 'soul_dew') {
      if(statName === 'special-attack') val = Math.floor(val * item.value);
      else if(statName === 'special-defense') val = Math.floor(val * 1.25);
    }
    if(item.effect === 'draco_plate') { const mult = pokemon.types.includes('dragon') ? item.value : (item.value - 0.3); val = Math.floor(val * mult); }
    if(item.effect === 'def_boost' && statName === 'defense') val = Math.floor(val * item.value);
    if(item.effect === 'rusted_sword' && statName === 'attack') val = Math.floor(val * item.value);
    if(item.effect === 'prism_scale') val = Math.floor(val * item.value);
    if(item.effect === 'eviolite' && (statName === 'defense' || statName === 'special-defense')) val = Math.floor(val * item.value);
    if(item.effect === 'power_herb') {
      if(statName === 'speed') val = Math.floor(val * item.value);
      else if(statName === 'attack' || statName === 'special-attack') val = Math.floor(val * 1.2);
    }
    if(item.effect === 'meteorite' && pokemon.id === 384) val = Math.floor(val * 2.45); // Mega Rayquaza
    if(pokemon._isEnvy) val = Math.floor(val * 1.2); // Envy: modest boost, weaker than Mega
    if(pokemon._naturalSSS) val = Math.floor(val * 2.0); // Natural SSS (e.g. Hero Greninja)
    if(pokemon._sssUsed && pokemon._sssStat === statName) val = Math.floor(val * 1.4); // SSS Candy (+40% on one stat)
    if(item.effect === 'origin_orb' && pokemon.id === 487) val = Math.floor(val * 2.0); // Origin Giratina: SSS = 2x all stats
    // Perfected Zygarde: SSS stats, balanced — strong but not top-tier with held item
    if(isPerfectedZygarde(pokemon)) val = Math.floor(val * 2.2);
    if(item.effect === 'dna_splicer' && isDNAFused(pokemon)) {
      if(isBlackKyurem(pokemon)) {
        if(statName === 'attack' || statName === 'special-attack') val = Math.floor(val * 1.5);
        else val = Math.floor(val * 2.4);
      } else if(isWhiteKyurem(pokemon)) {
        if(statName === 'attack' || statName === 'special-attack') val = Math.floor(val * 2.6);
        else val = Math.floor(val * 1.5);
      } else {
        val = Math.floor(val * 2.0);
      }
    }
    if(item.effect === 'heros_sword' && pokemon.id === 888) {
      // Crowned Zacian: glass cannon — massive attack, normal bulk
      if(statName === 'attack' || statName === 'special-attack') val = Math.floor(val * 3.5);
      else val = Math.floor(val * 1.4);
    }
    if(item.effect === 'royal_sword' && pokemon.id === 888) {
      // Royal Crowned Zacian: same crowned form + extra physical ATK only (ROYAL tier)
      if(statName === 'attack') val = Math.floor(val * 4.5);
      else if(statName === 'special-attack') val = Math.floor(val * 1.4); // same as hero's sword
      else val = Math.floor(val * 1.4);
    }
    if(item.effect === 'heros_shield' && pokemon.id === 889) {
      // Crowned Zamazenta: tank — massive defense, weaker attack
      if(statName === 'defense' || statName === 'special-defense') val = Math.floor(val * 4.5);
      else if(statName === 'attack' || statName === 'special-attack') val = Math.floor(val * 1.2);
      else val = Math.floor(val * 2.0);
    }
    if(item.effect === 'royal_shield' && pokemon.id === 889) {
      // Royal Crowned Zamazenta: same crowned form + extra HP bonus (ROYAL tier)
      if(statName === 'defense' || statName === 'special-defense') val = Math.floor(val * 4.5);
      else if(statName === 'attack' || statName === 'special-attack') val = Math.floor(val * 1.2);
      else val = Math.floor(val * 2.0);
    }
    // Primal Groudon: SSS stats, GALACTIC attack boost
    if(item.effect === 'red_orb' && pokemon.id === 383) {
      val = Math.floor(val * 2.0); // SSS base (all stats)
      if(statName === 'attack') val = Math.floor(val * 1.8); // GALACTIC attack bonus
    }
    // Primal Kyogre: SSS stats, GALACTIC hp boost
    if(item.effect === 'blue_orb' && pokemon.id === 382) {
      val = Math.floor(val * 2.0); // SSS base (all stats)
      if(statName === 'hp') val = Math.floor(val * 1.8); // GALACTIC HP bonus
    }
    // Deoxys forms: SSS base + GALACTIC boost per form
    if(item.effect === 'mysterious_meteorite' && pokemon.id === 386 && pokemon._deoxysForm) {
      val = Math.floor(val * 1.5); // SSS base (all stats)
      if(pokemon._deoxysForm === 'attack' && statName === 'attack') val = Math.floor(val * 1.8); // GALACTIC attack ~10k
      if(pokemon._deoxysForm === 'defense' && statName === 'attack') val = Math.floor(val * 0.38); // Defense: low atk ~3.1k
      if(pokemon._deoxysForm === 'speed' && statName === 'speed') val = Math.floor(val * 2.5); // GALACTIC speed — very fast
      if(pokemon._deoxysForm === 'speed' && statName === 'attack') val = Math.floor(val * 0.85); // speed trades some atk
    }
    if(item.effect === 'outer_world_meteor' && pokemon.id === 384 && !pokemon._isEnvy) {
      // Outer World Mega Rayquaza: Mega stats + extra Speed bonus (OUTER tier)
      val = Math.floor(val * 2.45);
      if(statName === 'speed') val = Math.floor(val * 1.35); // extra Speed on top
    }
    if(item.effect === 'outer_world_meteor' && pokemon._isEnvy) {
      // Envy Unbound: all stats x2 (displayed as ×2, not ×UNBOUND)
      val = Math.floor(val * 2.0);
    }
    // Mega Sceptile
    if(item.effect === 'sceptilite' && pokemon.id === 254) {
      const isSSSCandyStat = pokemon._sssUsed && pokemon._sssStat === statName;
      if(isSSSCandyStat) val = Math.floor(val * 2.3); // SSS candy stat → MEGA tier (extra boost)
      else val = Math.floor(val * 1.85); // all other stats → SSS tier
    }
    // Mega Swampert
    if(item.effect === 'swampertite' && pokemon.id === 260) {
      const isSSSCandyStat = pokemon._sssUsed && pokemon._sssStat === statName;
      if(isSSSCandyStat) val = Math.floor(val * 2.3);
      else val = Math.floor(val * 1.85);
    }
    // Mega Blaziken
    if(item.effect === 'blazikenite' && pokemon.id === 257) {
      const isSSSCandyStat = pokemon._sssUsed && pokemon._sssStat === statName;
      if(isSSSCandyStat) val = Math.floor(val * 2.3);
      else val = Math.floor(val * 1.85);
    }
    // Mega Gengar
    if(item.effect === 'gengarite' && pokemon.id === 94) {
      const isSSSCandyStat = pokemon._sssUsed && pokemon._sssStat === statName;
      if(isSSSCandyStat) val = Math.floor(val * 1.9);
      else val = Math.floor(val * 1.5);
    }
    // Mega Aggron — The Wall: massive defense, reduced attack
    if(item.effect === 'aggronite' && pokemon.id === 306) {
      if(statName === 'defense' || statName === 'special-defense') val = Math.floor(val * 4.0);
      else if(statName === 'attack' || statName === 'special-attack') val = Math.floor(val * 0.6);
      else val = Math.floor(val * 1.5);
    }
    // Mega Garchomp
    if(item.effect === 'garchompite' && pokemon.id === 445) {
      const isSSSCandyStat = pokemon._sssUsed && pokemon._sssStat === statName;
      if(isSSSCandyStat) val = Math.floor(val * 1.9);
      else val = Math.floor(val * 1.5);
    }
    // Pre-rolled stone bonus (new stones only; old ones have _megaStoneBonus = null)
    if(['sceptilite','swampertite','blazikenite','gengarite','aggronite','garchompite'].includes(item.effect) && pokemon._megaStoneBonus && pokemon._megaStoneBonus.stat === statName) {
      val = Math.floor(val * (1 + pokemon._megaStoneBonus.pct));
    }
  }
  return val;
}

function getMaxHp(pokemon) {
  if(!pokemon.stats) return 100;
  const base = pokemon.stats.find(s=>s.stat.name==='hp').base_stat;
  const iv = pokemon.ivs ? pokemon.ivs['hp'] : 15;
  let hp = Math.floor(((base * 2 + iv) * pokemon.level / 100) + pokemon.level + 10);
  if(pokemon.level > 100) hp = Math.floor(hp * (1 + (pokemon.level-100)*0.01));
  const allItems = ITEMS.concat(EPIC_ITEMS);
  const equippedId = gameState.equippedItems[pokemon.uid];
  const resolvedId = getMegaStoneBaseId(equippedId) || equippedId;
  const item = allItems.find(i=>i.id===resolvedId);
  if(item?.effect === 'prism_scale') hp = Math.floor(hp * 1.2);
  if(pokemon._sssUsed && pokemon._sssStat === 'hp') hp = Math.floor(hp * 1.4);
  if(item?.effect === 'meteorite' && pokemon.id === 384) hp = Math.floor(hp * 1.35); // Mega Rayquaza
  if(pokemon._isEnvy) hp = Math.floor(hp * 1.2); // Envy: modest HP boost
  if(pokemon._naturalSSS) hp = Math.floor(hp * 2.0); // Natural SSS (e.g. Hero Greninja)
  if(item?.effect === 'origin_orb' && pokemon.id === 487) hp = Math.floor(hp * 2.0); // Origin Giratina
  if(isPerfectedZygarde(pokemon)) hp = Math.floor(hp * 2.2); // Perfected Zygarde
  if(item?.effect === 'dna_splicer' && isDNAFused(pokemon)) {
    if(isBlackKyurem(pokemon)) hp = Math.floor(hp * 3.0);
    else if(isWhiteKyurem(pokemon)) hp = Math.floor(hp * 1.4);
    else hp = Math.floor(hp * 2.0);
  }
  if(item?.effect === 'heros_sword' && pokemon.id === 888) hp = Math.floor(hp * 1.56); // Crowned Zacian: glass cannon — high ATK, moderate HP (~3.1k at 100)
  if(item?.effect === 'royal_sword' && pokemon.id === 888) hp = Math.floor(hp * 1.56); // Royal Crowned Zacian: same HP as hero's sword
  if(item?.effect === 'heros_shield' && pokemon.id === 889) hp = Math.floor(hp * 4.5); // Crowned Zamazenta: fortress HP
  if(item?.effect === 'royal_shield' && pokemon.id === 889) hp = Math.floor(hp * 5.5); // Royal Crowned Zamazenta: extra HP bonus (ROYAL tier)
  if(item?.effect === 'red_orb' && pokemon.id === 383) hp = Math.floor(hp * 2.0); // Primal Groudon: SSS HP
  if(item?.effect === 'blue_orb' && pokemon.id === 382) hp = Math.floor(hp * 4.5); // Primal Kyogre: SSS HP (~8-9k)
  if(item?.effect === 'mysterious_meteorite' && pokemon.id === 386 && pokemon._deoxysForm) {
    if(pokemon._deoxysForm === 'attack')  hp = Math.floor(hp * 0.85); // Attack form: glass cannon, low HP ~2.5k
    if(pokemon._deoxysForm === 'defense') hp = Math.floor(hp * 3.5);  // Defense form: fortress HP
    if(pokemon._deoxysForm === 'speed')   hp = Math.floor(hp * 0.9);  // Speed form: low HP, compensated by speed
  }
  if(item?.effect === 'outer_world_meteor' && pokemon.id === 384 && !pokemon._isEnvy) hp = Math.floor(hp * 1.35); // Outer World Mega Rayquaza (same as meteorite)
  if(item?.effect === 'outer_world_meteor' && pokemon._isEnvy) hp = Math.floor(hp * 2.0); // Envy Unbound
  if(item?.effect === 'sceptilite' && pokemon.id === 254) hp = Math.floor(hp * 1.2); // Mega Sceptile ~2060
  if(item?.effect === 'swampertite' && pokemon.id === 260) hp = Math.floor(hp * 1.1); // Mega Swampert ~2300
  if(item?.effect === 'blazikenite' && pokemon.id === 257) hp = Math.floor(hp * 1.15); // Mega Blaziken ~2120
  if(item?.effect === 'gengarite' && pokemon.id === 94) hp = Math.floor(hp * 1.15); // Mega Gengar ~2000
  if(item?.effect === 'aggronite' && pokemon.id === 306) hp = Math.floor(hp * 5.0); // Mega Aggron THE WALL ~6000 HP
  if(item?.effect === 'garchompite' && pokemon.id === 445) hp = Math.floor(hp * 1.1); // Mega Garchomp ~2200
  return hp;
}

function getAttack(pokemon) {
  if(!pokemon.stats) return 50;
  const base = pokemon.stats.find(s=>s.stat.name==='attack').base_stat;
  const spa = pokemon.stats.find(s=>s.stat.name==='special-attack').base_stat;
  // If player has chosen an attack mode, respect it; enemies always use best
  let statName;
  if(pokemon._attackMode === 'physical') {
    statName = 'attack';
  } else if(pokemon._attackMode === 'special') {
    statName = 'special-attack';
  } else {
    // default: use the higher one
    statName = base >= spa ? 'attack' : 'special-attack';
  }
  const atk = statName === 'attack' ? base : spa;
  const iv = pokemon.ivs ? pokemon.ivs[statName] : 15;
  let val = Math.floor(((atk * 2 + iv) * pokemon.level / 100) + 5);
  return getEffectiveStat(val, pokemon, statName);
}

function getSpeed(pokemon) {
  if(!pokemon.stats) return 50;
  const base = pokemon.stats.find(s=>s.stat.name==='speed').base_stat;
  const iv = pokemon.ivs ? pokemon.ivs['speed'] : 15;
  let val = Math.floor(((base * 2 + iv) * pokemon.level / 100) + 5);
  return getEffectiveStat(val, pokemon, 'speed');
}

// ============================================================
// API
// ============================================================

async function fetchPokemonStats(id) {
  if(statsCache[id]) return statsCache[id];
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await res.json();
    statsCache[id] = data.stats;
    return data.stats;
  } catch(e) {
    return [
      {stat:{name:'hp'},base_stat:65},{stat:{name:'attack'},base_stat:65},
      {stat:{name:'defense'},base_stat:65},{stat:{name:'special-attack'},base_stat:65},
      {stat:{name:'special-defense'},base_stat:65},{stat:{name:'speed'},base_stat:65},
    ];
  }
}

function getSpriteUrl(id, isShiny=false, uid=null) {
  // Envy Unbound: outer_world_meteor overrides _customSprite — check first
  if(id === 384 && uid != null) {
    const _pk0 = _getPkByUid ? _getPkByUid(uid) : null;
    if(_pk0?._isEnvy && gameState?.equippedItems?.[uid] === 'outer_world_meteor') {
      return 'https://preview.redd.it/necrozma-rayquaza-fusion-sprite-inspired-by-the-dusk-mane-v0-kf7eza5n7yh71.png?auto=webp&s=f350994596870daf47c67a4e0f2b511f54aaddd2';
    }
  }
  // Custom sprite override (e.g. event bosses, Envy base form)
  // Skip for Deoxys with meteorite — form sprite takes priority over _customSprite
  if(uid != null) {
    const _pk = _getPkByUid ? _getPkByUid(uid) : null;
    if(_pk?._customSprite) {
      const _deoxysEq = (gameState?.equippedItems||{})[uid];
      if(!(_pk.id === 386 && _deoxysEq === 'mysterious_meteorite' && _pk._deoxysForm)) {
        return _pk._customSprite;
      }
    }
  }
  if(id === 384 && uid != null) {
    if(gameState && gameState.equippedItems) {
      const eq = gameState.equippedItems[uid];
      const _rq = _getPkByUid ? _getPkByUid(uid) : null;
      if(eq === 'outer_world_meteor') {
        if(_rq?._isEnvy) {
          return 'https://preview.redd.it/necrozma-rayquaza-fusion-sprite-inspired-by-the-dusk-mane-v0-kf7eza5n7yh71.png?auto=webp&s=f350994596870daf47c67a4e0f2b511f54aaddd2';
        }
        return isShiny
          ? `https://art.pixilart.com/sr5z4ff3ccf16faws3.png`
          : `https://data.pokecommunity.com/avatars/h/901/901574.jpg?1700882524`;
      }
      if(eq === 'meteorite') {
        return isShiny
          ? `https://art.pixilart.com/sr5z4ff3ccf16faws3.png`
          : `https://data.pokecommunity.com/avatars/h/901/901574.jpg?1700882524`;
      }
    }
  }
  if(id === 888) {
    const pk = uid != null ? _getPkByUid(uid) : null;
    const shiny = pk ? pk.isShiny : isShiny;
    if(pk && isCrownedZacian(pk)) {
      return shiny
        ? `https://static.wikia.nocookie.net/pokemon-radiance/images/5/5a/718_Crowned_Zacian_Shiny.png/revision/latest?cb=20200507073335`
        : `https://static.wikia.nocookie.net/pokemon-radiance/images/0/09/718_Crowned_Zacian.png/revision/latest?cb=20200507073336`;
    }
    return shiny
      ? `https://static.wikia.nocookie.net/pokemon-radiance/images/0/07/718_Zacian_Shiny.png/revision/latest?cb=20200507073333`
      : `https://static.wikia.nocookie.net/pokemon-radiance/images/3/30/718_Zacian.png/revision/latest?cb=20200507073334`;
  }
  if(id === 889) {
    const pk = uid != null ? _getPkByUid(uid) : null;
    const shiny = pk ? pk.isShiny : isShiny;
    if(pk && isCrownedZamazenta(pk)) {
      return shiny
        ? `https://static.wikia.nocookie.net/pokemon-radiance/images/3/3f/719_Crowned_Zamazenta_Shiny.png/revision/latest?cb=20200507073337`
        : `https://static.wikia.nocookie.net/pokemon-radiance/images/d/d3/719_Crowned_Zamazenta.png/revision/latest?cb=20200507073338`;
    }
    return shiny
      ? `https://static.wikia.nocookie.net/pokemon-radiance/images/1/17/719_Zamazenta_Shiny.png/revision/latest?cb=20200507073339`
      : `https://static.wikia.nocookie.net/pokemon-radiance/images/d/d3/719_Zamazenta.png/revision/latest?cb=20200507073339`;
  }
  if(id === 487 && uid != null) {
    if(gameState && gameState.equippedItems && gameState.equippedItems[uid] === 'origin_orb') {
      // Origin Forme Giratina
      return isShiny
        ? `https://img.pokemondb.net/sprites/heartgold-soulsilver/shiny/giratina-origin.png`
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10007.png`;
    }
  }
  if(id === 646 && uid != null) {
    const pk = _getPkByUid(uid);
    if(pk && isDNAFused(pk)) {
      const useShiny = pk.isShiny;
      if(isBlackKyurem(pk)) {
        return useShiny
          ? `https://img.pokemondb.net/sprites/black-white-2/shiny/kyurem-black.png`
          : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10022.png`;
      } else {
        return useShiny
          ? `https://img.pokemondb.net/sprites/black-white-2/shiny/kyurem-white.png`
          : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10023.png`;
      }
    }
  }
  if(id === 254 && uid != null) {
    const pk = _getPkByUid(uid);
    if(pk && isMegaSceptile(pk)) {
      return pk.isShiny
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10065.png`
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10065.png`;
    }
  }
  if(id === 260 && uid != null) {
    const pk = _getPkByUid(uid);
    if(pk && isMegaSwampert(pk)) {
      return pk.isShiny
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10064.png`
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10064.png`;
    }
  }
  if(id === 257 && uid != null) {
    const pk = _getPkByUid(uid);
    if(pk && isMegaBlaziken(pk)) {
      return pk.isShiny
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10050.png`
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10050.png`;
    }
  }
  if(id === 94 && uid != null) {
    const pk = _getPkByUid(uid);
    if(pk && isMegaGengar(pk)) {
      return pk.isShiny
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10038.png`
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10038.png`;
    }
  }
  if(id === 306 && uid != null) {
    const pk = _getPkByUid(uid);
    if(pk && isMegaAggron(pk)) {
      return pk.isShiny
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10053.png`
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10053.png`;
    }
  }
  if(id === 445 && uid != null) {
    const pk = _getPkByUid(uid);
    if(pk && isMegaGarchomp(pk)) {
      return pk.isShiny
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10058.png`
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10058.png`;
    }
  }
  if(id === 888) {
    const pk = uid != null ? _getPkByUid(uid) : null;
    const shiny = pk ? pk.isShiny : isShiny;
    if(pk && isCrownedZacian(pk)) {
      return shiny
        ? `https://static.wikia.nocookie.net/pokemon-radiance/images/5/5a/718_Crowned_Zacian_Shiny.png/revision/latest?cb=20200507073335`
        : `https://static.wikia.nocookie.net/pokemon-radiance/images/0/09/718_Crowned_Zacian.png/revision/latest?cb=20200507073336`;
    }
    return shiny
      ? `https://static.wikia.nocookie.net/pokemon-radiance/images/0/07/718_Zacian_Shiny.png/revision/latest?cb=20200507073333`
      : `https://static.wikia.nocookie.net/pokemon-radiance/images/3/30/718_Zacian.png/revision/latest?cb=20200507073334`;
  }
  if(id === 889) {
    const pk = uid != null ? _getPkByUid(uid) : null;
    const shiny = pk ? pk.isShiny : isShiny;
    if(pk && isCrownedZamazenta(pk)) {
      return shiny
        ? `https://static.wikia.nocookie.net/pokemon-radiance/images/3/3f/719_Crowned_Zamazenta_Shiny.png/revision/latest?cb=20200507073337`
        : `https://static.wikia.nocookie.net/pokemon-radiance/images/d/d3/719_Crowned_Zamazenta.png/revision/latest?cb=20200507073338`;
    }
    return shiny
      ? `https://static.wikia.nocookie.net/pokemon-radiance/images/1/17/719_Zamazenta_Shiny.png/revision/latest?cb=20200507073339`
      : `https://static.wikia.nocookie.net/pokemon-radiance/images/d/d3/719_Zamazenta.png/revision/latest?cb=20200507073339`;
  }
  // Groudon (Primal)
  if(id === 383 && uid != null) {
    const pk = _getPkByUid(uid);
    if(pk && isPrimalGroudon(pk)) {
      return pk.isShiny
        ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10078.png'
        : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10078.png';
    }
    return (pk?.isShiny || isShiny)
      ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/diamond-pearl/shiny/383.png'
      : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/diamond-pearl/383.png';
  }
  // Kyogre (Primal)
  if(id === 382 && uid != null) {
    const pk = _getPkByUid(uid);
    if(pk && isPrimalKyogre(pk)) {
      return pk.isShiny
        ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10077.png'
        : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10077.png';
    }
    return (pk?.isShiny || isShiny)
      ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/382.png'
      : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/382.png';
  }
  // Deoxys forms
  if(id === 386) {
    const pk = uid != null ? ((gameState.box||[]).find(p=>p.uid==uid)||(gameState.team||[]).find(p=>p&&p.uid==uid)) : null;
    const shiny = pk ? pk.isShiny : isShiny;
    const eq = uid != null ? (gameState.equippedItems||{})[uid] : null;
    if(eq === 'mysterious_meteorite' && pk && pk._deoxysForm === 'attack')  return shiny ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10001.png' : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10001.png';
    if(eq === 'mysterious_meteorite' && pk && pk._deoxysForm === 'defense') return shiny ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10002.png' : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10002.png';
    if(eq === 'mysterious_meteorite' && pk && pk._deoxysForm === 'speed')   return shiny ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10003.png' : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10003.png';
    return shiny
      ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/diamond-pearl/shiny/386.png'
      : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/diamond-pearl/386.png';
  }
  // Zygarde forms
  if(id === 718) {
    const pk = uid != null ? _getPkByUid(uid) : null;
    const shiny = pk ? pk.isShiny : isShiny;
    const form = pk ? pk._zygardeForm : null;
    if(form === '10') return shiny ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10118.png' : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10118.png';
    if(form === 'perfected') return shiny ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10120.png' : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10120.png';
    // default 50% box sprite (use 10119)
    return shiny ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10119.png' : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10119.png';
  }
  if(isShiny) return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`;
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}
function _getPkByUid(uid) {
  if(!gameState) return null;
  if(typeof currentEnemy !== "undefined" && currentEnemy && currentEnemy.uid === uid) return currentEnemy;
  return (gameState.box||[]).find(p=>p.uid===uid) || (gameState.team||[]).find(p=>p.uid===uid) || null;
}

function getBattleSprite(id, isShiny=false, uid=null) {
  // Envy Unbound: outer_world_meteor overrides _customSprite — check first
  if(id === 384 && uid != null) {
    const _pk0 = _getPkByUid ? _getPkByUid(uid) : null;
    if(_pk0?._isEnvy && gameState?.equippedItems?.[uid] === 'outer_world_meteor') {
      return 'https://preview.redd.it/necrozma-rayquaza-fusion-sprite-inspired-by-the-dusk-mane-v0-kf7eza5n7yh71.png?auto=webp&s=f350994596870daf47c67a4e0f2b511f54aaddd2';
    }
  }
  // Custom sprite override (e.g. event bosses)
  if(uid != null) {
    const _pk = _getPkByUid ? _getPkByUid(uid) : null;
    if(_pk?._customSprite) {
      const _deoxysEq = (gameState?.equippedItems||{})[uid];
      if(!(_pk.id === 386 && _deoxysEq === 'mysterious_meteorite' && _pk._deoxysForm)) {
        return _pk._customSprite;
      }
    }
  }
  if(id === 384 && uid != null) {
    const _rq2 = _getPkByUid ? _getPkByUid(uid) : null;
    const _eq2 = gameState?.equippedItems?.[uid];
    if(_eq2 === 'outer_world_meteor') {
      if(_rq2?._isEnvy) {
        return 'https://preview.redd.it/necrozma-rayquaza-fusion-sprite-inspired-by-the-dusk-mane-v0-kf7eza5n7yh71.png?auto=webp&s=f350994596870daf47c67a4e0f2b511f54aaddd2';
      }
      return isShiny
        ? `https://art.pixilart.com/sr5z4ff3ccf16faws3.png`
        : `https://data.pokecommunity.com/avatars/h/901/901574.jpg?1700882524`;
    }
    if(_eq2 === 'meteorite') {
      return isShiny
        ? `https://art.pixilart.com/sr5z4ff3ccf16faws3.png`
        : `https://data.pokecommunity.com/avatars/h/901/901574.jpg?1700882524`;
    }
  }
  if(id === 487 && uid != null) {
    if(gameState && gameState.equippedItems && gameState.equippedItems[uid] === 'origin_orb') {
      return isShiny
        ? `https://img.pokemondb.net/sprites/heartgold-soulsilver/shiny/giratina-origin.png`
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${10007}.png`;
    }
  }
  if(id === 646 && uid != null) {
    const pk = _getPkByUid(uid);
    if(pk && isDNAFused(pk)) {
      const useShiny = pk.isShiny;
      if(isBlackKyurem(pk)) {
        return useShiny
          ? `https://img.pokemondb.net/sprites/black-white-2/shiny/kyurem-black.png`
          : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10022.png`;
      } else {
        return useShiny
          ? `https://img.pokemondb.net/sprites/black-white-2/shiny/kyurem-white.png`
          : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10023.png`;
      }
    }
  }
  if(id === 254 && uid != null) {
    const pk = _getPkByUid(uid);
    if(pk && isMegaSceptile(pk)) {
      return pk.isShiny
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10065.png`
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10065.png`;
    }
  }
  if(id === 260 && uid != null) {
    const pk = _getPkByUid(uid);
    if(pk && isMegaSwampert(pk)) {
      return pk.isShiny
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10064.png`
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10064.png`;
    }
  }
  if(id === 257 && uid != null) {
    const pk = _getPkByUid(uid);
    if(pk && isMegaBlaziken(pk)) {
      return pk.isShiny
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10050.png`
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10050.png`;
    }
  }
  if(id === 94 && uid != null) {
    const pk = _getPkByUid(uid);
    if(pk && isMegaGengar(pk)) {
      return pk.isShiny
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10038.png`
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10038.png`;
    }
  }
  if(id === 306 && uid != null) {
    const pk = _getPkByUid(uid);
    if(pk && isMegaAggron(pk)) {
      return pk.isShiny
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10053.png`
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10053.png`;
    }
  }
  if(id === 445 && uid != null) {
    const pk = _getPkByUid(uid);
    if(pk && isMegaGarchomp(pk)) {
      return pk.isShiny
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10058.png`
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10058.png`;
    }
  }
  if(id === 888) {
    const pk = uid != null ? _getPkByUid(uid) : null;
    const shiny = pk ? pk.isShiny : isShiny;
    if(pk && isCrownedZacian(pk)) {
      return shiny
        ? `https://static.wikia.nocookie.net/pokemon-radiance/images/5/5a/718_Crowned_Zacian_Shiny.png/revision/latest?cb=20200507073335`
        : `https://static.wikia.nocookie.net/pokemon-radiance/images/0/09/718_Crowned_Zacian.png/revision/latest?cb=20200507073336`;
    }
    return shiny
      ? `https://static.wikia.nocookie.net/pokemon-radiance/images/0/07/718_Zacian_Shiny.png/revision/latest?cb=20200507073333`
      : `https://static.wikia.nocookie.net/pokemon-radiance/images/3/30/718_Zacian.png/revision/latest?cb=20200507073334`;
  }
  if(id === 889) {
    const pk = uid != null ? _getPkByUid(uid) : null;
    const shiny = pk ? pk.isShiny : isShiny;
    if(pk && isCrownedZamazenta(pk)) {
      return shiny
        ? `https://static.wikia.nocookie.net/pokemon-radiance/images/3/3f/719_Crowned_Zamazenta_Shiny.png/revision/latest?cb=20200507073337`
        : `https://static.wikia.nocookie.net/pokemon-radiance/images/d/d3/719_Crowned_Zamazenta.png/revision/latest?cb=20200507073338`;
    }
    return shiny
      ? `https://static.wikia.nocookie.net/pokemon-radiance/images/1/17/719_Zamazenta_Shiny.png/revision/latest?cb=20200507073339`
      : `https://static.wikia.nocookie.net/pokemon-radiance/images/d/d3/719_Zamazenta.png/revision/latest?cb=20200507073339`;
  }
  // Groudon (Primal)
  if(id === 383) {
    const pk = uid != null ? _getPkByUid(uid) : null;
    const shiny = pk ? pk.isShiny : isShiny;
    if(pk && isPrimalGroudon(pk)) {
      return shiny ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10078.png' : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10078.png';
    }
    return shiny
      ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/diamond-pearl/shiny/383.png'
      : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/diamond-pearl/383.png';
  }
  // Kyogre (Primal)
  if(id === 382) {
    const pk = uid != null ? _getPkByUid(uid) : null;
    const shiny = pk ? pk.isShiny : isShiny;
    if(pk && isPrimalKyogre(pk)) {
      return shiny ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10077.png' : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10077.png';
    }
    return shiny
      ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/382.png'
      : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/382.png';
  }
  // Deoxys forms in battle
  if(id === 386) {
    const pk = uid != null ? ((gameState.box||[]).find(p=>p.uid==uid)||(gameState.team||[]).find(p=>p&&p.uid==uid)) : null;
    const shiny = pk ? pk.isShiny : isShiny;
    const eq = uid != null ? (gameState.equippedItems||{})[uid] : null;
    if(eq === 'mysterious_meteorite' && pk && pk._deoxysForm === 'attack')  return shiny ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10001.png' : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10001.png';
    if(eq === 'mysterious_meteorite' && pk && pk._deoxysForm === 'defense') return shiny ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10002.png' : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10002.png';
    if(eq === 'mysterious_meteorite' && pk && pk._deoxysForm === 'speed')   return shiny ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10003.png' : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10003.png';
    return shiny
      ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/diamond-pearl/shiny/386.png'
      : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/diamond-pearl/386.png';
  }
  // Zygarde forms in battle
  if(id === 718) {
    const pk = uid != null ? _getPkByUid(uid) : null;
    const shiny = pk ? pk.isShiny : isShiny;
    const form = pk ? pk._zygardeForm : '_boss50';
    if(form === '10') return shiny ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10118.png' : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10118.png';
    if(form === 'perfected') return shiny ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10120.png' : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10120.png';
    // 50% (default / boss)
    return shiny ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10119.png' : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10119.png';
  }
  if(isShiny) return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`;
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

