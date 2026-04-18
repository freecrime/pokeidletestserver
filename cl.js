// ============================================================
// CHAMPION'S LEAGUE
// ============================================================

const TYPE_CHART={normal:{rock:0.5,ghost:0,steel:0.5},fire:{fire:0.5,water:0.5,grass:2,ice:2,bug:2,rock:0.5,dragon:0.5,steel:2},water:{fire:2,water:0.5,grass:0.5,ground:2,rock:2,dragon:0.5},electric:{water:2,electric:0.5,grass:0.5,ground:0,flying:2,dragon:0.5},grass:{fire:0.5,water:2,grass:0.5,poison:0.5,ground:2,flying:0.5,bug:0.5,rock:2,dragon:0.5,steel:0.5},ice:{fire:0.5,water:0.5,grass:2,ice:0.5,ground:2,flying:2,dragon:2,steel:0.5},fighting:{normal:2,ice:2,poison:0.5,flying:0.5,psychic:0.5,bug:0.5,rock:2,ghost:0,dark:2,steel:2,fairy:0.5},poison:{grass:2,poison:0.5,ground:0.5,rock:0.5,ghost:0.5,steel:0,fairy:2},ground:{fire:2,electric:2,grass:0.5,poison:2,flying:0,bug:0.5,rock:2,steel:2},flying:{electric:0.5,grass:2,fighting:2,bug:2,rock:0.5,steel:0.5},psychic:{fighting:2,poison:2,psychic:0.5,dark:0,steel:0.5},bug:{fire:0.5,grass:2,fighting:0.5,flying:0.5,psychic:2,ghost:0.5,dark:2,steel:0.5,fairy:0.5},rock:{fire:2,ice:2,fighting:0.5,ground:0.5,flying:2,bug:2,steel:0.5},ghost:{normal:0,psychic:2,ghost:2,dark:0.5},dragon:{dragon:2,steel:0.5,fairy:0},dark:{fighting:0.5,psychic:2,ghost:2,dark:0.5,fairy:0.5},steel:{fire:0.5,water:0.5,electric:0.5,ice:2,rock:2,steel:0.5,fairy:2},fairy:{fire:0.5,fighting:2,poison:0.5,dragon:2,dark:2,steel:0.5}};

function getTypeEffectiveness(mt,dt){let m=1;for(const t of dt){const v=(TYPE_CHART[mt]||{})[t];if(v!==undefined)m*=v;}return m;}
function effectLabel(m){if(m===0)return{text:"No effect!",color:"#888"};if(m>=4)return{text:"Super effective!! ×4",color:"#ff4444"};if(m>=2)return{text:"Super effective! ×2",color:"#ff9e40"};if(m<=0.25)return{text:"Not very effective… ×¼",color:"#4fc3f7"};if(m<1)return{text:"Not very effective… ×½",color:"#4fc3f7"};return null;}

const CL_MOVE_DB={
"Tackle":{power:40,cat:"physical",type:"normal",pp:35},"Body Slam":{power:85,cat:"physical",type:"normal",pp:15},"Hyper Voice":{power:90,cat:"special",type:"normal",pp:10},"Double-Edge":{power:120,cat:"physical",type:"normal",pp:15,recoil:0.33},"Swift":{power:60,cat:"special",type:"normal",pp:20},"Quick Attack":{power:40,cat:"physical",type:"normal",pp:30},"Mega Kick":{power:120,cat:"physical",type:"normal",pp:5},"Hyper Beam":{power:150,cat:"special",type:"normal",pp:5},"Stomp":{power:65,cat:"physical",type:"normal",pp:20},"Horn Attack":{power:65,cat:"physical",type:"normal",pp:25},"Sonic Boom":{power:20,cat:"special",type:"normal",pp:20},"Bind":{power:15,cat:"physical",type:"normal",pp:20},"Explosion":{power:250,cat:"physical",type:"normal",pp:5,selfKO:true},"Self-Destruct":{power:200,cat:"physical",type:"normal",pp:5,selfKO:true},
"Ember":{power:40,cat:"special",type:"fire",pp:25},"Flamethrower":{power:90,cat:"special",type:"fire",pp:15},"Fire Blast":{power:110,cat:"special",type:"fire",pp:5},"Fire Punch":{power:75,cat:"physical",type:"fire",pp:15},"Flare Blitz":{power:120,cat:"physical",type:"fire",pp:15,recoil:0.33},"Overheat":{power:130,cat:"special",type:"fire",pp:5},"Fire Spin":{power:35,cat:"special",type:"fire",pp:15},
"Water Gun":{power:40,cat:"special",type:"water",pp:25},"Surf":{power:90,cat:"special",type:"water",pp:15},"Hydro Pump":{power:110,cat:"special",type:"water",pp:5},"Waterfall":{power:80,cat:"physical",type:"water",pp:15},"Bubble Beam":{power:65,cat:"special",type:"water",pp:20},
"Vine Whip":{power:45,cat:"physical",type:"grass",pp:25},"Razor Leaf":{power:55,cat:"physical",type:"grass",pp:25},"Energy Ball":{power:90,cat:"special",type:"grass",pp:10},"Solar Beam":{power:120,cat:"special",type:"grass",pp:10},"Petal Blizzard":{power:90,cat:"physical",type:"grass",pp:15},"Leaf Blade":{power:90,cat:"physical",type:"grass",pp:15},
"Thundershock":{power:40,cat:"special",type:"electric",pp:30},"Thunderbolt":{power:90,cat:"special",type:"electric",pp:15},"Thunder":{power:110,cat:"special",type:"electric",pp:10},"Wild Charge":{power:90,cat:"physical",type:"electric",pp:15,recoil:0.25},"Volt Tackle":{power:120,cat:"physical",type:"electric",pp:15,recoil:0.33},"Discharge":{power:80,cat:"special",type:"electric",pp:15},"Thunder Wave":{power:0,cat:"status",type:"electric",pp:20,effect:"paralyze"},
"Ice Shard":{power:40,cat:"physical",type:"ice",pp:30},"Ice Beam":{power:90,cat:"special",type:"ice",pp:10},"Blizzard":{power:110,cat:"special",type:"ice",pp:5},"Ice Punch":{power:75,cat:"physical",type:"ice",pp:15},
"Karate Chop":{power:50,cat:"physical",type:"fighting",pp:25},"Close Combat":{power:120,cat:"physical",type:"fighting",pp:5},"Brick Break":{power:75,cat:"physical",type:"fighting",pp:15},"Aura Sphere":{power:80,cat:"special",type:"fighting",pp:20},
"Poison Jab":{power:80,cat:"physical",type:"poison",pp:20},"Sludge Bomb":{power:90,cat:"special",type:"poison",pp:10},"Gunk Shot":{power:120,cat:"physical",type:"poison",pp:5},"Sludge Wave":{power:95,cat:"special",type:"poison",pp:10},"Acid":{power:40,cat:"special",type:"poison",pp:30},"Toxic":{power:0,cat:"status",type:"poison",pp:10,effect:"toxic"},
"Earthquake":{power:100,cat:"physical",type:"ground",pp:10},"Earth Power":{power:90,cat:"special",type:"ground",pp:10},"Magnitude":{power:70,cat:"physical",type:"ground",pp:30},"Sand Attack":{power:0,cat:"status",type:"ground",pp:15,effect:"lower_acc"},
"Brave Bird":{power:120,cat:"physical",type:"flying",pp:15,recoil:0.33},"Air Slash":{power:75,cat:"special",type:"flying",pp:15},"Aerial Ace":{power:60,cat:"physical",type:"flying",pp:20},"Hurricane":{power:110,cat:"special",type:"flying",pp:10},"Sky Attack":{power:140,cat:"physical",type:"flying",pp:5},
"Psychic":{power:90,cat:"special",type:"psychic",pp:10},"Psybeam":{power:65,cat:"special",type:"psychic",pp:20},"Zen Headbutt":{power:80,cat:"physical",type:"psychic",pp:15},"Future Sight":{power:120,cat:"special",type:"psychic",pp:10},"Psystrike":{power:100,cat:"special",type:"psychic",pp:10},"Aura Storm":{power:150,cat:"special",type:"psychic",pp:5},"Psycho Cut":{power:70,cat:"physical",type:"psychic",pp:20},
"Bug Buzz":{power:90,cat:"special",type:"bug",pp:10},"X-Scissor":{power:80,cat:"physical",type:"bug",pp:15},"Signal Beam":{power:75,cat:"special",type:"bug",pp:15},"Megahorn":{power:120,cat:"physical",type:"bug",pp:10},"String Shot":{power:0,cat:"status",type:"bug",pp:40,effect:"lower_spd"},
"Rock Throw":{power:50,cat:"physical",type:"rock",pp:15},"Rock Slide":{power:75,cat:"physical",type:"rock",pp:10},"Stone Edge":{power:100,cat:"physical",type:"rock",pp:5},"Power Gem":{power:80,cat:"special",type:"rock",pp:20},"Rock Blast":{power:25,cat:"physical",type:"rock",pp:10},
"Shadow Ball":{power:80,cat:"special",type:"ghost",pp:15},"Shadow Claw":{power:70,cat:"physical",type:"ghost",pp:15},"Lick":{power:30,cat:"physical",type:"ghost",pp:30},
"Dragon Claw":{power:80,cat:"physical",type:"dragon",pp:15},"Draco Meteor":{power:130,cat:"special",type:"dragon",pp:5},"Outrage":{power:120,cat:"physical",type:"dragon",pp:10},"Dragon Rage":{power:40,cat:"special",type:"dragon",pp:10},"Dragon Breath":{power:60,cat:"special",type:"dragon",pp:20},
"Crunch":{power:80,cat:"physical",type:"dark",pp:15},"Dark Pulse":{power:80,cat:"special",type:"dark",pp:15},"Foul Play":{power:95,cat:"physical",type:"dark",pp:15},
"Iron Head":{power:80,cat:"physical",type:"steel",pp:15},"Flash Cannon":{power:80,cat:"special",type:"steel",pp:10},"Meteor Mash":{power:90,cat:"physical",type:"steel",pp:10},
"Moonblast":{power:95,cat:"special",type:"fairy",pp:10},"Play Rough":{power:90,cat:"physical",type:"fairy",pp:10},"Dazzling Gleam":{power:80,cat:"special",type:"fairy",pp:10},
"Recover":{power:0,cat:"status",type:"normal",pp:10,effect:"heal"},"Softboiled":{power:0,cat:"status",type:"normal",pp:10,effect:"heal"},"Roost":{power:0,cat:"status",type:"flying",pp:10,effect:"heal"},
"Harden":{power:0,cat:"status",type:"normal",pp:30,effect:"boost_def"},"Defense Curl":{power:0,cat:"status",type:"normal",pp:40,effect:"boost_def"},"Screech":{power:0,cat:"status",type:"normal",pp:40,effect:"lower_def"},"Agility":{power:0,cat:"status",type:"psychic",pp:30,effect:"boost_spd"},"Calm Mind":{power:0,cat:"status",type:"psychic",pp:20,effect:"boost_spa"},"Nasty Plot":{power:0,cat:"status",type:"dark",pp:20,effect:"boost_spa2"},"Swords Dance":{power:0,cat:"status",type:"normal",pp:20,effect:"boost_atk2"},"Smokescreen":{power:0,cat:"status",type:"normal",pp:20,effect:"lower_acc"},"Minimize":{power:0,cat:"status",type:"normal",pp:10,effect:"boost_eva"},"Sleep Powder":{power:0,cat:"status",type:"grass",pp:15,effect:"sleep"},"Stun Spore":{power:0,cat:"status",type:"grass",pp:30,effect:"paralyze"},"Disable":{power:0,cat:"status",type:"normal",pp:20},"Scary Face":{power:0,cat:"status",type:"normal",pp:10,effect:"lower_spd"},"Tail Whip":{power:0,cat:"status",type:"normal",pp:30,effect:"lower_def"},"Mud Sport":{power:0,cat:"status",type:"ground",pp:15},"Sunny Day":{power:0,cat:"status",type:"fire",pp:5},"Iron Tail":{power:100,cat:"physical",type:"steel",pp:15},"Seismic Toss":{power:50,cat:"physical",type:"fighting",pp:20},"Horn Drill":{power:30,cat:"physical",type:"normal",pp:5},"Wrap":{power:15,cat:"physical",type:"normal",pp:20},"Curse":{power:0,cat:"status",type:"ghost",pp:10}
};

const CL_TYPE_MOVES={normal:["Body Slam","Hyper Voice","Double-Edge","Swift"],fire:["Flamethrower","Fire Blast","Fire Punch","Flare Blitz"],water:["Surf","Hydro Pump","Waterfall","Water Gun"],grass:["Leaf Blade","Energy Ball","Razor Leaf","Petal Blizzard"],electric:["Thunderbolt","Thunder","Wild Charge","Discharge"],ice:["Ice Beam","Blizzard","Ice Punch","Ice Shard"],fighting:["Close Combat","Aura Sphere","Brick Break","Karate Chop"],poison:["Sludge Bomb","Poison Jab","Gunk Shot","Acid"],ground:["Earthquake","Earth Power","Magnitude","Sand Attack"],flying:["Brave Bird","Air Slash","Aerial Ace","Hurricane"],psychic:["Psychic","Future Sight","Zen Headbutt","Psybeam"],bug:["Bug Buzz","X-Scissor","Signal Beam","Megahorn"],rock:["Stone Edge","Rock Slide","Power Gem","Rock Throw"],ghost:["Shadow Ball","Shadow Claw","Lick","Curse"],dragon:["Draco Meteor","Outrage","Dragon Claw","Dragon Rage"],dark:["Dark Pulse","Crunch","Foul Play","Bite"],steel:["Iron Head","Flash Cannon","Meteor Mash","Iron Tail"],fairy:["Moonblast","Play Rough","Dazzling Gleam","Dazzling Gleam"]};

function getDefaultCLMoves(pk){const t=(pk.types&&pk.types[0])||"normal";const pool=CL_TYPE_MOVES[t]||CL_TYPE_MOVES["normal"];const t2=pk.types&&pk.types[1];const p2=t2?(CL_TYPE_MOVES[t2]||[]):[];const moves=[...pool.slice(0,3)];const b=p2.find(m=>!moves.includes(m));moves.push(b||pool[3]||"Tackle");return moves.slice(0,4);}

const CL_GYMS=[
{id:0,name:"Brock",city:"Pewter City",type:"rock",badge:"Boulder Badge",badgeEmoji:"🪨",color:"#B8A038",bgGrad:"135deg,rgba(90,70,20,0.6),rgba(30,20,5,0.4)",minLevel:1,boost:{id:"cl_badge_0",desc:"+3% Gem find in idle",icon:"💎"},trainers:[{name:"Youngster Ben",team:[{id:74,name:"Geodude",types:["rock","ground"],level:10}]},{name:"Lass Robin",team:[{id:27,name:"Sandshrew",types:["ground"],level:11}]}],leader:{name:"Brock",team:[{id:74,name:"Geodude",types:["rock","ground"],level:12,moves:["Rock Throw","Tackle","Defense Curl","Mud Sport"],item:"iron_ball"},{id:111,name:"Onix",types:["rock","ground"],level:14,moves:["Rock Slide","Bind","Screech","Harden"],item:"rocky_helmet"}]}},
{id:1,name:"Misty",city:"Cerulean City",type:"water",badge:"Cascade Badge",badgeEmoji:"💧",color:"#6890F0",bgGrad:"135deg,rgba(20,40,120,0.6),rgba(5,10,50,0.4)",minLevel:15,boost:{id:"cl_badge_1",desc:"+10% EXP gain",icon:"⬆️"},trainers:[{name:"Swimmer Rick",team:[{id:54,name:"Psyduck",types:["water"],level:17}]},{name:"Beauty Lola",team:[{id:60,name:"Poliwag",types:["water"],level:18},{id:72,name:"Tentacool",types:["water","poison"],level:18}]}],leader:{name:"Misty",team:[{id:120,name:"Staryu",types:["water"],level:18,moves:["Water Gun","Harden","Swift","Bubble Beam"],item:"shell_bell"},{id:121,name:"Starmie",types:["water","psychic"],level:21,moves:["Surf","Psychic","Swift","Recover"],item:"leftovers"}]}},
{id:2,name:"Lt. Surge",city:"Vermilion City",type:"electric",badge:"Thunder Badge",badgeEmoji:"⚡",color:"#F8D030",bgGrad:"135deg,rgba(100,80,0,0.6),rgba(40,30,0,0.4)",minLevel:25,boost:{id:"cl_badge_2",desc:"+20% Gold from battles",icon:"💰"},trainers:[{name:"Sailor Tide",team:[{id:100,name:"Voltorb",types:["electric"],level:23}]},{name:"Gentleman Tucker",team:[{id:25,name:"Pikachu",types:["electric"],level:24},{id:100,name:"Voltorb",types:["electric"],level:24}]}],leader:{name:"Lt. Surge",team:[{id:100,name:"Voltorb",types:["electric"],level:25,moves:["Thundershock","Screech","Sonic Boom","Self-Destruct"],item:"focus_sash"},{id:26,name:"Raichu",types:["electric"],level:28,moves:["Thunderbolt","Mega Kick","Thunder Wave","Quick Attack"],item:"choice_band"}]}},
{id:3,name:"Erika",city:"Celadon City",type:"grass",badge:"Rainbow Badge",badgeEmoji:"🌿",color:"#78C850",bgGrad:"135deg,rgba(30,70,20,0.6),rgba(10,30,5,0.4)",minLevel:40,boost:{id:"cl_badge_3",desc:"+1% Boss item drop chance",icon:"👑"},trainers:[{name:"Beauty June",team:[{id:43,name:"Oddish",types:["grass","poison"],level:30},{id:44,name:"Gloom",types:["grass","poison"],level:30}]},{name:"Lass Dawn",team:[{id:102,name:"Exeggcute",types:["grass","psychic"],level:31}]}],leader:{name:"Erika",team:[{id:71,name:"Victreebel",types:["grass","poison"],level:29,moves:["Razor Leaf","Wrap","Acid","Sleep Powder"],item:"leftovers"},{id:45,name:"Vileplume",types:["grass","poison"],level:34,moves:["Petal Blizzard","Acid","Moonblast","Stun Spore"],item:"assault_vest"}]}},
{id:4,name:"Koga",city:"Fuchsia City",type:"poison",badge:"Soul Badge",badgeEmoji:"☠️",color:"#A040A0",bgGrad:"135deg,rgba(60,10,60,0.6),rgba(20,5,20,0.4)",minLevel:80,boost:{id:"cl_badge_4",desc:"+5% Shiny luck",icon:"✨"},trainers:[{name:"Juggler Ethan",team:[{id:109,name:"Koffing",types:["poison"],level:37},{id:109,name:"Koffing",types:["poison"],level:37}]},{name:"Tamer Phil",team:[{id:89,name:"Muk",types:["poison"],level:38}]}],leader:{name:"Koga",team:[{id:89,name:"Muk",types:["poison"],level:37,moves:["Sludge Bomb","Minimize","Screech","Toxic"],item:"rocky_helmet"},{id:110,name:"Weezing",types:["poison"],level:43,moves:["Sludge Wave","Explosion","Smokescreen","Toxic"],item:"focus_sash"}]}},
{id:5,name:"Sabrina",city:"Saffron City",type:"psychic",badge:"Marsh Badge",badgeEmoji:"🔮",color:"#F85888",bgGrad:"135deg,rgba(100,20,50,0.6),rgba(40,5,20,0.4)",minLevel:150,boost:{id:"cl_badge_5",desc:"Breeding: +1 inherited stat",icon:"🥚"},trainers:[{name:"Psychic Mark",team:[{id:96,name:"Drowzee",types:["psychic"],level:42},{id:97,name:"Hypno",types:["psychic"],level:42}]},{name:"Channeler Kay",team:[{id:64,name:"Kadabra",types:["psychic"],level:43}]}],leader:{name:"Sabrina",team:[{id:64,name:"Kadabra",types:["psychic"],level:46,moves:["Psychic","Recover","Disable","Future Sight"],item:"choice_specs"},{id:65,name:"Alakazam",types:["psychic"],level:50,moves:["Psychic","Recover","Shadow Ball","Calm Mind"],item:"life_orb"}]}},
{id:6,name:"Blaine",city:"Cinnabar Island",type:"fire",badge:"Volcano Badge",badgeEmoji:"🔥",color:"#F08030",bgGrad:"135deg,rgba(100,30,5,0.6),rgba(40,10,0,0.4)",minLevel:200,boost:{id:"cl_badge_6",desc:"+2% Epic item gacha luck",icon:"🎰"},trainers:[{name:"Burglar Simon",team:[{id:58,name:"Growlithe",types:["fire"],level:47},{id:58,name:"Growlithe",types:["fire"],level:47}]},{name:"Fire Breather Ray",team:[{id:126,name:"Magmar",types:["fire"],level:48}]}],leader:{name:"Blaine",team:[{id:78,name:"Rapidash",types:["fire"],level:50,moves:["Flare Blitz","Stomp","Agility","Sunny Day"],item:"choice_band"},{id:146,name:"Moltres",types:["fire","flying"],level:54,moves:["Fire Blast","Hurricane","Agility","Sky Attack"],item:"life_orb"}]}},
{id:7,name:"Giovanni",city:"Viridian City",type:"ground",badge:"Earth Badge",badgeEmoji:"🌍",color:"#E0C068",bgGrad:"135deg,rgba(80,60,0,0.6),rgba(30,20,0,0.4)",minLevel:250,boost:{id:"cl_badge_7",desc:"All badge bonuses ×2!",icon:"🏆"},trainers:[{name:"Rocket Igor",team:[{id:111,name:"Rhyhorn",types:["ground","rock"],level:50},{id:112,name:"Rhydon",types:["ground","rock"],level:52}]},{name:"Rocket Mia",team:[{id:50,name:"Dugtrio",types:["ground"],level:53},{id:76,name:"Golem",types:["rock","ground"],level:54}]}],leader:{name:"Giovanni",team:[{id:112,name:"Rhydon",types:["ground","rock"],level:260,moves:["Earthquake","Rock Blast","Megahorn","Horn Drill"],item:"choice_band"},{id:76,name:"Golem",types:["rock","ground"],level:262,moves:["Earthquake","Stone Edge","Explosion","Defense Curl"],item:"focus_sash"},{id:111,name:"Rhyhorn",types:["ground","rock"],level:265,moves:["Earthquake","Horn Attack","Scary Face","Stone Edge"],item:"rocky_helmet"}]}}
];

const CL_RED={id:"red",name:"Red",city:"Mt. Silver",type:"mixed",badge:"Red's Trophy",badgeEmoji:"🏅",color:"#ff4444",bgGrad:"135deg,rgba(120,0,0,0.7),rgba(40,0,0,0.5)",minLevel:250,boost:{id:"cl_badge_red",desc:"Flagged for special Pokémon!",icon:"⭐"},trainers:[],leader:{name:"Red",team:[
  {id:6,name:"Red's Charizard",types:["fire","flying"],level:325,moves:["Flare Blitz","Dragon Breath","Aerial Ace","Fire Blast"],item:"choice_band",_customSprite:"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10196.png"},
  {id:25,name:"Red's Pikachu",types:["electric"],level:300,moves:["Volt Tackle","Thunderbolt","Quick Attack","Iron Tail"],item:"life_orb"},
  {id:150,name:"Chosen's Mewtwo",types:["psychic"],level:300,moves:["Aura Storm","Aura Sphere","Ice Beam","Flamethrower"],item:"life_orb"}
]}};

function hasBadge(id){return(gameState.cl?.badges||[]).includes(id);}
function clMult(){return hasBadge(7)?2:1;}
function getCLShinyBonus(){return hasBadge(4)?0.05*clMult():0;}
function getCLBossDropBonus(){return hasBadge(3)?0.01*clMult():0;}
function getCLGemBonus(){return hasBadge(0)?0.03*clMult():0;}
function getCLGoldMult(){return 1+(hasBadge(2)?0.20*clMult():0);}
function getCLExpMult(){return 1+(hasBadge(1)?0.10*clMult():0);}
function getCLBreedingInheritBonus(){return hasBadge(5)?1:0;}
function getCLEpicItemBonus(){return hasBadge(6)?0.02*clMult():0;}

function getCLItemById(id){if(!id)return null;return[...(ITEMS||[]),...(EPIC_ITEMS||[])].find(i=>i.id===id)||null;}

function initCLState() {
  if (!gameState.cl) gameState.cl = { badges: [], currentGym: 0, phase: 'lobby' };
  // Normalize badges: coerce numeric strings to numbers, deduplicate
  if (gameState.cl.badges) {
    const normalized = gameState.cl.badges.map(b => b === 'red' ? 'red' : parseInt(b, 10));
    gameState.cl.badges = [...new Set(normalized)];
  }
}

function getCLMaxPlayerLevel(){if(!gameState.box||gameState.box.length===0)return 5;return Math.max(...gameState.box.map(p=>p.level||1));}

function openCLOverlay(){initCLState();window._clTeamSel=[];window._clMoveSel={};window._clItemSel={};const ov=document.getElementById('cl-overlay');ov.style.display='flex';renderCLLobby();}
function closeCLOverlay(){document.getElementById('cl-overlay').style.display='none';}

function renderCLLobby(){
  const el=document.getElementById('cl-content');
  const cl=gameState.cl;
  const badges=cl.badges||[];
  const maxLv=getCLMaxPlayerLevel();
  const mult=hasBadge(7)?2:1;
  const allGyms=[...CL_GYMS];
  const redUnlocked=badges.includes(7);
  const badgeRow=[...allGyms,CL_RED].map(g=>{const bid=g.id==='red'?'red':g.id;const earned=badges.includes(bid);return`<span title="${g.badge}${earned?' ✓':''}" style="font-size:22px;opacity:${earned?1:0.2};filter:${earned?'':'grayscale(1)'};transition:all 0.3s">${g.badgeEmoji}</span>`;}).join('');
  const bonusList=badges.length>0?badges.map(bid=>{const g=bid==='red'?CL_RED:CL_GYMS[bid];if(!g)return'';return`<div style="display:flex;align-items:center;gap:5px;padding:4px 8px;background:rgba(255,255,255,0.04);border-radius:5px;margin-bottom:3px"><span>${g.badgeEmoji}</span><span style="color:#ffd700;font-size:13px">${g.boost.icon}</span><span style="font-size:13px;color:#a5d6a7">${g.boost.desc}${mult>1?' <b style="color:#ffd700">×2</b>':''}</span></div>`;}).join(''):'';
  const gymCards=allGyms.map(g=>{const beaten=badges.includes(g.id);const prevOk=g.id===0||badges.includes(g.id-1);const locked=!prevOk;const lvLocked=!beaten&&!locked&&maxLv<g.minLevel;const clk=(locked||lvLocked)?'':'startCLGym('+g.id+')';const bc=beaten?g.color:locked||lvLocked?'rgba(255,255,255,0.08)':'rgba(255,255,255,0.2)';return`<div onclick="${clk}" style="cursor:${(locked||lvLocked)?'not-allowed':'pointer'};background:linear-gradient(${g.bgGrad});border:2px solid ${bc};border-radius:10px;padding:10px 12px;margin-bottom:6px;opacity:${(locked||lvLocked)?0.4:1};transition:all 0.15s${beaten?';box-shadow:0 0 14px '+g.color+'55':''}"><div style="display:flex;justify-content:space-between;align-items:center"><div style="display:flex;align-items:center;gap:6px"><span style="font-size:20px">${g.badgeEmoji}</span><div><span style="font-size:16px;color:${g.color}">${beaten?'✓ ':locked?'🔒 ':lvLocked?'📊 ':''}<b>${g.name}</b></span><span style="font-size:12px;color:var(--text2);margin-left:4px">${g.city}</span></div></div><div style="text-align:right"><div style="font-size:11px;color:var(--text2)">${g.badge}</div><div style="font-size:11px;color:${maxLv>=g.minLevel?'#66bb6a':'#ef5350'}">Min Lv.${g.minLevel}</div></div></div><div style="font-size:13px;color:var(--text2);margin-top:4px">${g.type.toUpperCase()} · ${g.boost.icon} <span style="color:#ffd700">${g.boost.desc}</span></div></div>`;}).join('');
  const redCard=redUnlocked?`<div onclick="${badges.includes('red')?'':'startCLRed()'}" style="cursor:${badges.includes('red')?'default':'pointer'};background:linear-gradient(${CL_RED.bgGrad});border:2px solid ${badges.includes('red')?CL_RED.color:'rgba(255,60,60,0.5)'};border-radius:10px;padding:12px;margin-top:6px${badges.includes('red')?';box-shadow:0 0 20px rgba(255,68,68,0.4)':''}"><div style="display:flex;justify-content:space-between;align-items:center"><div><span style="font-size:22px">🏅</span><span style="font-family:'Press Start 2P',monospace;font-size:9px;color:#ff4444;margin-left:8px">${badges.includes('red')?'✓ ':''}<b>??? RED</b></span><span style="font-size:12px;color:var(--text2);margin-left:6px">Mt. Silver · SECRET</span></div><div style="font-size:11px;color:#ff4444">Min Lv.250</div></div><div style="font-size:13px;color:#ff9e40;margin-top:4px">⚠️ The ultimate challenge.</div></div>`:'';
  el.innerHTML=`<div style="font-family:'Press Start 2P';font-size:10px;background:linear-gradient(90deg,#ffd700,#ff8c00,#ffd700);background-size:200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 2s linear infinite;text-align:center;margin-bottom:6px">🏆 CHAMPION'S LEAGUE</div><div style="font-size:13px;color:var(--text2);text-align:center;margin-bottom:8px">Turn-based · 3 Pokémon · No legendaries/megas</div><div style="display:flex;justify-content:center;gap:10px;padding:8px 12px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,215,0,0.2);border-radius:8px;margin-bottom:10px">${badgeRow}</div>${badges.length>0?`<div style="margin-bottom:10px"><div style="font-family:'Press Start 2P';font-size:7px;color:#ffd700;margin-bottom:5px">🏅 ACTIVE BONUSES</div>${bonusList}</div>`:''}<div style="font-family:'Press Start 2P';font-size:7px;color:var(--text2);margin-bottom:6px">GYM LEADERS</div>${gymCards}${redCard}`;
}

function startCLGym(gymId){initCLState();window._clTeamSel=[];window._clMoveSel={};window._clItemSel={};renderCLTeamSelect(gymId,false);}
function startCLRed(){initCLState();window._clTeamSel=[];window._clMoveSel={};window._clItemSel={};renderCLTeamSelect('red',true);}

function renderCLTeamSelect(gymId,isRed){
  const gym=isRed?CL_RED:CL_GYMS[gymId];
  const el=document.getElementById('cl-content');
  const maxLv=getCLMaxPlayerLevel();
  const eligible=gameState.box.filter(p=>!isBossOrLegendary(p)&&!isMegaSceptile(p)&&!isMegaSwampert(p)&&!isMegaBlaziken(p)&&!isMegaGengar(p)&&!isMegaAggron(p)&&!isMegaGarchomp(p)&&!isMegaRayquaza(p)&&!isOriginGiratina(p)&&!isDNAFused(p)).sort((a,b)=>b.level-a.level);
  const sel=window._clTeamSel;
  const cards=eligible.map(pk=>{const picked=sel.includes(pk.uid);const ord=picked?sel.indexOf(pk.uid)+1:null;const avg=pk.ivs?Math.round(Object.values(pk.ivs).reduce((s,v)=>s+v,0)/6):15;const gr=getStatGrade(avg);return`<div onclick="clTogglePick(${pk.uid},'${gymId}',${isRed})" style="cursor:pointer;text-align:center;padding:7px 5px;border-radius:8px;background:rgba(255,255,255,${picked?'0.12':'0.03'});border:2px solid ${picked?'#ffd700':'rgba(255,255,255,0.1)'};transition:all 0.12s;position:relative">${picked?`<div style="position:absolute;top:3px;right:5px;font-family:'Press Start 2P';font-size:8px;color:#ffd700">${ord}</div>`:''}<img src="${getSpriteUrl(pk.id,pk.isShiny,pk.uid)}" width="50" height="50" style="image-rendering:pixelated"><div style="font-size:12px;color:${pk.isShiny?'#ffd700':'var(--text)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${pk.isShiny?'★ ':''}${pk.name}</div><div style="font-size:11px;color:var(--text2)">Lv.${pk.level}</div><div style="font-family:'Press Start 2P';font-size:6px;color:${gr.color}">${gr.label}</div></div>`;}).join('');
  el.innerHTML=`<button onclick="renderCLLobby()" style="background:none;border:none;color:var(--text2);cursor:pointer;font-size:17px;margin-bottom:8px">← Back</button><div style="background:linear-gradient(${gym.bgGrad});border:2px solid ${gym.color};border-radius:10px;padding:10px 12px;margin-bottom:10px"><div style="font-size:18px">${gym.badgeEmoji} <span style="color:${gym.color}">${gym.name}</span> <span style="font-size:12px;color:var(--text2)">${gym.city}</span></div><div style="font-size:13px;color:var(--text2);margin-top:2px">Min level: <span style="color:${maxLv>=gym.minLevel?'#66bb6a':'#ef5350'}">${gym.minLevel}</span> · Your highest: <span style="color:#ffd700">Lv.${maxLv}</span></div><div style="font-size:13px;color:#ffd700;margin-top:2px">${gym.boost.icon} ${gym.boost.desc}</div></div><div style="font-size:13px;color:#ffd700;margin-bottom:5px">Select 3 Pokémon: <span style="color:var(--text2)">${sel.length}/3</span></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;max-height:290px;overflow-y:auto;margin-bottom:10px">${cards}</div>${eligible.length===0?'<div style="color:#ef5350;text-align:center;padding:16px">No eligible Pokémon!</div>':''}${sel.length===3?`<button onclick="renderCLMoveSetup('${gymId}',${isRed})" style="width:100%;padding:10px;background:rgba(255,215,0,0.15);border:2px solid #ffd700;color:#ffd700;border-radius:8px;cursor:pointer;font-family:'VT323',monospace;font-size:19px">⚔️ Set Moves & Items →</button>`:`<div style="text-align:center;color:var(--text2);font-size:13px">Choose ${3-sel.length} more</div>`}`;
}

function clTogglePick(uid,gymId,isRed){const sel=window._clTeamSel;const idx=sel.indexOf(uid);if(idx!==-1)sel.splice(idx,1);else if(sel.length<3)sel.push(uid);renderCLTeamSelect(gymId,isRed);}

function renderCLMoveSetup(gymId,isRed){
  const gym=isRed?CL_RED:CL_GYMS[gymId];
  const el=document.getElementById('cl-content');
  const team=window._clTeamSel.map(uid=>gameState.box.find(p=>p.uid===uid)).filter(Boolean);
  team.forEach(pk=>{if(!window._clMoveSel[pk.uid])window._clMoveSel[pk.uid]=getDefaultCLMoves(pk);});
  const sections=team.map(pk=>{
    const t=pk.types[0]||"normal";const t2=pk.types[1];
    const pool=[...new Set([...(CL_TYPE_MOVES[t]||[]),...(t2?CL_TYPE_MOVES[t2]||[]:[])])].slice(0,12);
    const chosen=window._clMoveSel[pk.uid];
    const moveBtns=pool.map(m=>{const md=CL_MOVE_DB[m]||{power:0,cat:'physical',type:'normal'};const isPicked=chosen.includes(m);const slot=chosen.indexOf(m);const catColor=md.cat==='special'?'#ce93d8':md.cat==='status'?'#4fc3f7':'#ffcc80';const catLabel=md.cat==='special'?'Sp':md.cat==='status'?'St':'Ph';const tc=TYPE_COLORS[md.type]||'#888';return`<button onclick="clToggleMove(${pk.uid},'${m}','${gymId}',${isRed})" style="padding:5px;border-radius:6px;cursor:pointer;font-family:'VT323',monospace;font-size:13px;text-align:left;background:rgba(255,255,255,${isPicked?'0.1':'0.03'});border:1px solid ${isPicked?'#ffd700':'rgba(255,255,255,0.12)'};transition:all 0.1s"><div style="display:flex;align-items:center;gap:3px;margin-bottom:1px"><span style="font-size:9px;padding:1px 3px;border-radius:2px;background:${tc};color:#fff">${md.type}</span><span style="color:${catColor};font-size:10px">${catLabel}</span>${isPicked?`<span style="color:#ffd700;margin-left:auto;font-size:10px">#${slot+1}</span>`:''}</div><div style="color:var(--text)">${m}</div>${md.power>0?`<div style="color:var(--gold);font-size:11px">${md.power}p</div>`:'<div style="color:#4fc3f7;font-size:11px">status</div>'}</button>`;}).join('');
    const itemOpts=ITEMS.map(it=>`<option value="${it.id}" ${(window._clItemSel[pk.uid]||'')=== it.id?'selected':''}>${it.emoji} ${it.name}</option>`).join('');
    return`<div style="background:rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:10px;margin-bottom:10px"><div style="display:flex;align-items:center;gap:8px;margin-bottom:7px"><img src="${getSpriteUrl(pk.id,pk.isShiny,pk.uid)}" width="44" height="44" style="image-rendering:pixelated"><div><div style="font-size:15px;color:${pk.isShiny?'#ffd700':'var(--text)'}">${pk.isShiny?'★ ':''}${pk.name} <span style="color:var(--text2);font-size:12px">Lv.${pk.level}</span></div><div style="display:flex;gap:3px">${pk.types.map(ty=>`<span class="type-badge" style="background:${TYPE_COLORS[ty]};font-size:10px;padding:1px 5px">${ty}</span>`).join('')}</div></div></div><div style="font-family:'Press Start 2P';font-size:6px;color:var(--text2);margin-bottom:4px">MOVES (pick 4) — <span style="color:#ffd700">${chosen.length}/4</span></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;margin-bottom:6px">${moveBtns}</div><div style="font-size:11px;color:var(--text2);margin-bottom:6px">${chosen.join(' / ')||'—'}</div><div style="font-family:'Press Start 2P';font-size:6px;color:var(--text2);margin-bottom:3px">HELD ITEM</div><select onchange="window._clItemSel[${pk.uid}]=this.value" style="width:100%;background:#0a0a1a;border:1px solid var(--border);color:var(--text);padding:5px;border-radius:6px;font-family:'VT323',monospace;font-size:14px"><option value="">— No Item —</option>${itemOpts}</select></div>`;
  }).join('');
  const allReady=team.every(pk=>(window._clMoveSel[pk.uid]||[]).length===4);
  el.innerHTML=`<button onclick="renderCLTeamSelect('${gymId}',${isRed})" style="background:none;border:none;color:var(--text2);cursor:pointer;font-size:17px;margin-bottom:8px">← Back</button><div style="font-family:'Press Start 2P';font-size:8px;color:${gym.color};margin-bottom:8px">${gym.badgeEmoji} MOVES & ITEMS</div>${sections}${allReady?`<button onclick="beginCLChallenge('${gymId}',${isRed})" style="width:100%;padding:12px;background:rgba(255,215,0,0.15);border:2px solid #ffd700;color:#ffd700;border-radius:8px;cursor:pointer;font-family:'VT323',monospace;font-size:20px;letter-spacing:1px">🚀 BEGIN CHALLENGE!</button>`:'<div style="text-align:center;color:var(--text2);font-size:14px;padding:6px;border:1px dashed rgba(255,255,255,0.1);border-radius:6px">Each Pokémon needs exactly 4 moves</div>'}`;
}

function clToggleMove(uid,moveName,gymId,isRed){const arr=window._clMoveSel[uid]=window._clMoveSel[uid]||[];const idx=arr.indexOf(moveName);if(idx!==-1)arr.splice(idx,1);else if(arr.length<4)arr.push(moveName);renderCLMoveSetup(gymId,isRed);}

async function beginCLChallenge(gymId,isRed){
  const gid = isRed ? gymId : parseInt(gymId, 10);
  const rawTeam=window._clTeamSel.map(uid=>gameState.box.find(p=>p.uid===uid)).filter(Boolean);
  const maxPlayerLv=Math.max(...rawTeam.map(p=>p.level));
  const playerTeam=[];
  for(const pk of rawTeam){
    const statsData=pk.stats||await fetchPokemonStats(pk.id).catch(()=>null);
    const baseHp=statsData?(statsData.find(s=>s.stat.name==='hp')?.base_stat||70):70;
    const ivs=pk.ivs||generateIVs();
    const maxHp=Math.floor(((baseHp*2+(ivs['hp']??15))*pk.level/100)+pk.level+10);
    const item=getCLItemById(window._clItemSel[pk.uid]||null);
    const entry={uid:pk.uid,id:pk.id,name:pk.name,types:pk.types,level:pk.level,isShiny:pk.isShiny,statsData,ivs,maxHp,currentHp:maxHp,moves:window._clMoveSel[pk.uid]||getDefaultCLMoves(pk),item,stages:{atk:0,def:0,spa:0,spd:0,spe:0},status:null,statusCounter:0,isPlayer:true};
    clInitPP(entry);
    playerTeam.push(entry);
  }
  await launchCLBattle(gid, isRed, 0, playerTeam, maxPlayerLv);
}

async function launchCLBattle(gymId,isRed,trainerIdx,playerTeam,maxPlayerLv){
  const gym=isRed?CL_RED:CL_GYMS[gymId];
  const isLeader=isRed||trainerIdx>=gym.trainers.length;
  const trainerData=isLeader?gym.leader:gym.trainers[trainerIdx];
  const enemyTeam=[];
  for(const pkDef of trainerData.team){
    const scaledLv=isLeader?Math.max(pkDef.level,Math.floor(maxPlayerLv*1.05)):Math.max(pkDef.level,Math.floor(maxPlayerLv*0.9));
    const statsData=await fetchPokemonStats(pkDef.id).catch(()=>null);
    const baseHp=statsData?(statsData.find(s=>s.stat.name==='hp')?.base_stat||70):70;
    const ivs=generateIVs();
    const maxHp=Math.floor(((baseHp*2+(ivs['hp']??15))*scaledLv/100)+scaledLv+10);
    const item=pkDef.item?getCLItemById(pkDef.item):null;
    const eEntry={id:pkDef.id,name:pkDef.name,types:pkDef.types,level:scaledLv,statsData,ivs,maxHp,currentHp:maxHp,moves:pkDef.moves||getDefaultCLMoves(pkDef),item,stages:{atk:0,def:0,spa:0,spd:0,spe:0},status:null,statusCounter:0,isPlayer:false,_customSprite:pkDef._customSprite||null};
    clInitPP(eEntry);
    enemyTeam.push(eEntry);
  }
  window._clBattle={gymId,isRed,trainerIdx,isLeader,playerTeam,enemyTeam,playerIdx:0,enemyIdx:0,log:[],turn:1,waitingForAction:true,maxPlayerLv,trainerName:trainerData.name};
  renderCLBattle();
}

// ── Damage formula (Gen 1/2 style adapted for high levels) ───
function clCalcDamage(attacker, move, defender) {
  if(!move || move.power === 0) return { dmg: 0, typeMult: 1 };
  const isSpec = move.cat === 'special';
  const atkStatName = isSpec ? 'special-attack' : 'attack';
  const defStatName = isSpec ? 'special-defense' : 'defense';

  const atkBase = attacker.statsData
    ? (attacker.statsData.find(s => s.stat.name === atkStatName)?.base_stat || 65)
    : 65;
  const defBase = defender.statsData
    ? (defender.statsData.find(s => s.stat.name === defStatName)?.base_stat || 65)
    : 65;

  const atkIV = attacker.ivs ? (attacker.ivs[atkStatName] ?? 15) : 15;
  const defIV = defender.ivs ? (defender.ivs[defStatName] ?? 15) : 15;

  // Standard Gen formula: ((2*Level/5 + 2) * Power * Atk/Def) / 50 + 2
  const L = attacker.level;
  let A = Math.floor(((atkBase * 2 + atkIV) * L / 100) + 5);
  let D = Math.max(1, Math.floor(((defBase * 2 + defIV) * defender.level / 100) + 5));

  // Stat stage multipliers
  const as = attacker.stages || {}, ds = defender.stages || {};
  const aSt = isSpec ? (as.spa || 0) : (as.atk || 0);
  const dSt = isSpec ? (ds.spd || 0) : (ds.def || 0);
  A = Math.max(1, Math.floor(A * (aSt >= 0 ? (2 + aSt) / 2 : 2 / (2 - aSt))));
  D = Math.max(1, Math.floor(D * (dSt >= 0 ? (2 + dSt) / 2 : 2 / (2 - dSt))));

  // Item boosts
  if (attacker.item?.effect === 'choice_band' && !isSpec)  A = Math.floor(A * 1.5);
  if (attacker.item?.effect === 'choice_specs' && isSpec)   A = Math.floor(A * 1.5);
  if (attacker.item?.effect === 'atk_boost' && !isSpec)     A = Math.floor(A * (attacker.item.value || 1.3));
  if (attacker.item?.effect === 'spatk_boost' && isSpec)    A = Math.floor(A * (attacker.item.value || 1.3));
  if (attacker.item?.effect === 'life_orb')                 A = Math.floor(A * 1.3);
  if (defender.item?.effect === 'def_boost' && !isSpec)     D = Math.floor(D * (defender.item.value || 1.35));
  if (defender.item?.effect === 'spdef_boost' && isSpec)    D = Math.floor(D * (defender.item.value || 1.35));
  if (defender.item?.effect === 'eviolite')                 D = Math.floor(D * 1.4);
  if (defender.item?.effect === 'assault_vest' && isSpec)   D = Math.floor(D * 1.35);

  const typeMult = getTypeEffectiveness(move.type, defender.types);
  if (typeMult === 0) return { dmg: 0, typeMult: 0 };

  const rand = 0.85 + Math.random() * 0.15;
  const baseDmg = Math.floor((Math.floor(2 * L / 5 + 2) * move.power * A / D) / 50) + 2;
  return { dmg: Math.max(1, Math.floor(baseDmg * rand * typeMult)), typeMult };
}

function clGetSpd(pk) {
  const base = pk.statsData ? (pk.statsData.find(s => s.stat.name === 'speed')?.base_stat || 50) : 50;
  const iv = pk.ivs?.['speed'] ?? 15;
  const raw = Math.floor(((base * 2 + iv) * pk.level / 100) + 5);
  const stage = pk.stages?.spe || 0;
  return Math.max(1, Math.floor(raw * (stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage))));
}

// ── PP tracking: init pp on combatants ───────────────────────
function clInitPP(combatant) {
  combatant.pp = {};
  (combatant.moves || []).forEach(m => {
    const md = CL_MOVE_DB[m];
    combatant.pp[m] = md ? md.pp : 10;
  });
}

// ── Battle render — clean GBA/DS style layout ─────────────────
function renderCLBattle() {
  const el = document.getElementById('cl-content');
  const b = window._clBattle;
  if (!b) return;
  const gym = b.isRed ? CL_RED : CL_GYMS[b.gymId];
  const player = b.playerTeam[b.playerIdx];
  const enemy  = b.enemyTeam[b.enemyIdx];

  // HP bar renderer
  const hpBar = (cur, max, label) => {
    const pct = Math.max(0, Math.round(cur / max * 100));
    const col = pct > 50 ? '#4caf50' : pct > 20 ? '#ff9800' : '#f44336';
    return `
      <div style="display:flex;align-items:center;gap:6px;margin-top:3px">
        <span style="font-family:'Press Start 2P',monospace;font-size:7px;color:#aaa;width:18px;text-align:right">HP</span>
        <div style="flex:1;height:8px;background:rgba(0,0,0,0.4);border-radius:4px;overflow:hidden;border:1px solid rgba(255,255,255,0.1)">
          <div style="height:100%;border-radius:3px;background:${col};width:${pct}%;transition:width 0.35s ease"></div>
        </div>
        <span style="font-family:'Press Start 2P',monospace;font-size:7px;color:${col};white-space:nowrap">${cur}/${max}</span>
      </div>`;
  };

  // Status badge
  const statusBadge = pk => {
    if (!pk.status) return '';
    const map = { paralyze: ['PAR','#f5c518'], poison: ['PSN','#ab47bc'], toxic: ['TOX','#7b1fa2'], sleep: ['SLP','#78909c'], burn: ['BRN','#ef6c00'] };
    const [lbl, col] = map[pk.status] || ['???','#555'];
    return `<span style="font-family:'Press Start 2P',monospace;font-size:7px;padding:2px 5px;border-radius:3px;background:${col};color:#fff;margin-left:6px">${lbl}</span>`;
  };

  // Stage badges
  const stageBadges = pk => {
    const s = pk.stages || {};
    const tags = [];
    if (s.atk > 0) tags.push(`<span style="color:#ff9e40;font-size:11px;font-family:'VT323',monospace">ATK+${s.atk}</span>`);
    if (s.def > 0) tags.push(`<span style="color:#4fc3f7;font-size:11px;font-family:'VT323',monospace">DEF+${s.def}</span>`);
    if (s.spa > 0) tags.push(`<span style="color:#ce93d8;font-size:11px;font-family:'VT323',monospace">SPA+${s.spa}</span>`);
    if (s.spe > 0) tags.push(`<span style="color:#ffd700;font-size:11px;font-family:'VT323',monospace">SPE+${s.spe}</span>`);
    if (s.atk < 0) tags.push(`<span style="color:#ef5350;font-size:11px;font-family:'VT323',monospace">ATK${s.atk}</span>`);
    if (s.def < 0) tags.push(`<span style="color:#ef5350;font-size:11px;font-family:'VT323',monospace">DEF${s.def}</span>`);
    return tags.length ? `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:2px">${tags.join('')}</div>` : '';
  };

  // Team dots
  const teamDots = (team, curIdx) => team.map((p, i) => `<span style="display:inline-block;width:13px;height:13px;border-radius:50%;background:${p.currentHp <= 0 ? '#333' : i === curIdx ? '#4fc3f7' : '#4caf50'};border:1px solid rgba(255,255,255,0.25);margin:0 2px;box-shadow:${i === curIdx ? '0 0 4px #4fc3f7' : 'none'}" title="${p.name} ${p.currentHp}/${p.maxHp}"></span>`).join('');

  // Type badges
  const typeBadges = types => types.map(t => `<span style="font-size:10px;padding:1px 6px;border-radius:3px;background:${TYPE_COLORS[t]||'#555'};color:#fff;font-family:'Press Start 2P',monospace;font-size:7px">${t.toUpperCase()}</span>`).join(' ');

  // Item tag
  const itemTag = pk => pk.item ? `<span style="font-family:'VT323',monospace;font-size:13px;color:#ffd700">${pk.item.emoji} ${pk.item.name}</span>` : '';

  // Move buttons with PP
  const ppLeft = (pk, m) => (pk.pp && pk.pp[m] != null) ? pk.pp[m] : (CL_MOVE_DB[m]?.pp || 10);
  const moveBtns = player.moves.map((m, mi) => {
    const md = CL_MOVE_DB[m] || { power: 40, cat: 'physical', type: 'normal', pp: 10 };
    const eff = md.power > 0 ? getTypeEffectiveness(md.type, enemy.types) : 1;
    const ei  = effectLabel(eff);
    const tc  = TYPE_COLORS[md.type] || '#888';
    const pp  = ppLeft(player, m);
    const ppColor = pp <= 1 ? '#f44336' : pp <= Math.ceil((md.pp || 10) / 2) ? '#ff9800' : '#aaa';
    const catLabel = md.cat === 'special' ? 'SPECIAL' : md.cat === 'status' ? 'STATUS' : 'PHYSICAL';
    const catColor = md.cat === 'special' ? '#ce93d8' : md.cat === 'status' ? '#4fc3f7' : '#ff9e40';
    const disabled = pp <= 0;
    const onclickStr = disabled ? '' : 'clPlayerMove(' + mi + ')';
    const borderCol  = disabled ? 'rgba(255,255,255,0.08)' : tc;
    const bgAlpha    = disabled ? '0.02' : '0.06';
    const cursorStr  = disabled ? 'not-allowed' : 'pointer';
    return `<button onclick="${onclickStr}" ${disabled ? 'disabled' : ''} style="padding:8px 6px;border-radius:8px;cursor:${cursorStr};font-family:'VT323',monospace;background:rgba(255,255,255,${bgAlpha});border:2px solid ${borderCol};color:${disabled?'#555':'var(--text)'};text-align:left;transition:all 0.12s;opacity:${disabled?0.4:1}">
      <div style="font-family:'Press Start 2P',monospace;font-size:8px;color:${tc};margin-bottom:3px">${m}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:4px">
        <div style="display:flex;align-items:center;gap:3px">
          <span style="font-size:9px;padding:1px 4px;border-radius:2px;background:${tc}33;color:${tc};border:1px solid ${tc}66">${md.type}</span>
          <span style="font-size:10px;color:${catColor}">${md.power > 0 ? md.power + ' pw' : catLabel}</span>
        </div>
        <span style="font-family:'Press Start 2P',monospace;font-size:7px;color:${ppColor}">PP ${pp}</span>
      </div>
      ${ei ? `<div style="font-size:10px;color:${ei.color};margin-top:2px;font-style:italic">${ei.text}</div>` : ''}
    </button>`;
  }).join('');

  // Switch buttons (uses a turn — enemy attacks)
  const switchBtns = b.playerTeam
    .map((pk, i) => i !== b.playerIdx && pk.currentHp > 0
      ? `<button onclick="clDoSwitch(${i})" style="padding:5px 10px;border-radius:6px;cursor:pointer;font-family:'VT323',monospace;font-size:14px;background:rgba(79,195,247,0.08);border:1px solid rgba(79,195,247,0.4);color:#4fc3f7;transition:all 0.1s">${pk.name} <span style="color:#aaa;font-size:12px">${pk.currentHp}/${pk.maxHp}</span></button>`
      : null)
    .filter(Boolean).join('');

  // Log lines
  const logHtml = b.log.slice(-6).map(l =>
    `<div style="font-family:'VT323',monospace;font-size:15px;color:${l.color || '#ccc'};line-height:1.4;padding:1px 0">${l.msg}</div>`
  ).join('');

  el.innerHTML = `
<!-- BATTLE HEADER -->
<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;margin-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.08)">
  <div style="font-family:'Press Start 2P',monospace;font-size:7px;color:${gym.color}">${gym.badgeEmoji} ${b.isLeader ? 'LEADER ' : ''}${b.trainerName}</div>
  <div style="font-family:'Press Start 2P',monospace;font-size:7px;color:#555">TURN ${b.turn}</div>
</div>

<!-- BATTLE FIELD — enemy top-right, player bottom-left (classic GBA layout) -->
<div class="cl-field" style="background:linear-gradient(180deg,#0d1117 0%,#131d2e 40%,#1a2535 60%,#0f1923 100%);border-radius:10px;padding:10px;margin-bottom:6px;border:1px solid rgba(255,255,255,0.06);position:relative;min-height:210px">

  <!-- ENEMY INFO CARD — top left -->
  <div style="display:flex;justify-content:flex-start;margin-bottom:4px">
    <div style="background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:8px 12px;min-width:180px;max-width:210px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px">
        <span style="font-family:'Press Start 2P',monospace;font-size:8px;color:#ddd">${enemy.name}</span>
        <span style="font-family:'Press Start 2P',monospace;font-size:7px;color:#888">Lv.${enemy.level}</span>
      </div>
      <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;flex-wrap:wrap">
        ${typeBadges(enemy.types)}
        ${statusBadge(enemy)}
        ${itemTag(enemy)}
      </div>
      ${stageBadges(enemy)}
      ${hpBar(enemy.currentHp, enemy.maxHp)}
      <div style="margin-top:4px">${teamDots(b.enemyTeam, b.enemyIdx)}</div>
    </div>
  </div>

  <!-- ENEMY SPRITE — top RIGHT (front-facing, no back sprite) -->
  <div style="position:absolute;top:8px;right:14px">
    <img id="cl-sprite-enemy" src="${enemy._customSprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${enemy.id}.png`}"
      style="width:96px;height:96px;image-rendering:pixelated;filter:drop-shadow(0 6px 10px rgba(0,0,0,0.9))">
  </div>

  <!-- PLAYER SPRITE — bottom LEFT (back sprite, larger, feels closer) -->
  <div style="position:absolute;bottom:8px;left:14px">
    <img id="cl-sprite-player" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${player.id}.png"
      style="width:108px;height:108px;image-rendering:pixelated;filter:drop-shadow(0 6px 10px rgba(0,0,0,0.9))"
      onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${player.id}.png'">
  </div>

  <!-- PLAYER INFO CARD — bottom right -->
  <div style="display:flex;justify-content:flex-end;margin-top:68px">
    <div style="background:rgba(0,0,0,0.6);border:1px solid rgba(79,195,247,0.3);border-radius:8px;padding:8px 12px;min-width:180px;max-width:210px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px">
        <span style="font-family:'Press Start 2P',monospace;font-size:8px;color:#4fc3f7">${player.name}</span>
        <span style="font-family:'Press Start 2P',monospace;font-size:7px;color:#888">Lv.${player.level}</span>
      </div>
      <div style="display:flex;align-items:center;gap:4px;margin-bottom:4px;flex-wrap:wrap">
        ${typeBadges(player.types)}
        ${statusBadge(player)}
        ${itemTag(player)}
      </div>
      ${stageBadges(player)}
      ${hpBar(player.currentHp, player.maxHp)}
      <div style="margin-top:4px">${teamDots(b.playerTeam, b.playerIdx)}</div>
    </div>
  </div>
</div>

<!-- BATTLE LOG -->
<div style="background:rgba(5,8,15,0.9);border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:8px 12px;margin-bottom:8px;min-height:72px;max-height:90px;overflow-y:auto" id="cl-log">${logHtml || '<span style="color:#555;font-family:VT323,monospace;font-size:14px">Waiting for action…</span>'}</div>

${b.waitingForAction && player.currentHp > 0 ? `
<!-- ACTION PANEL -->
<div style="background:rgba(10,14,24,0.95);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:10px">
  <div style="font-family:'Press Start 2P',monospace;font-size:7px;color:#555;margin-bottom:7px;text-align:center">WHAT WILL ${player.name.toUpperCase()} DO?</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:${switchBtns ? '8px' : '0'}">${moveBtns}</div>
  ${switchBtns ? `<div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:7px"><div style="font-family:'Press Start 2P',monospace;font-size:6px;color:#555;margin-bottom:5px">SWITCH (wastes a turn)</div><div style="display:flex;gap:5px;flex-wrap:wrap">${switchBtns}</div></div>` : ''}
</div>
` : ''}
`;

  const logEl = document.getElementById('cl-log');
  if (logEl) logEl.scrollTop = logEl.scrollHeight;
}

function clLog(msg, color) {
  window._clBattle.log.push({ msg, color });
}

// ── Battle animations ──────────────────────────────────────────
function clAnimAttack(isPlayer) {
  const id = isPlayer ? 'cl-sprite-player' : 'cl-sprite-enemy';
  const cls = isPlayer ? 'cl-anim-attack-p' : 'cl-anim-attack-e';
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth; // reflow to restart
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), 500);
}

function clAnimHurt(isPlayer) {
  // The *defender* gets hurt — so if player attacks, enemy gets hurt
  const id = isPlayer ? 'cl-sprite-enemy' : 'cl-sprite-player';
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('cl-anim-hurt');
  void el.offsetWidth;
  el.classList.add('cl-anim-hurt');
  setTimeout(() => el.classList.remove('cl-anim-hurt'), 550);
}

function clAnimShake(isPlayer) {
  // Screen / field shake for big hits
  const field = document.querySelector('#cl-content .cl-field');
  if (!field) return;
  field.classList.remove('cl-anim-shake');
  void field.offsetWidth;
  field.classList.add('cl-anim-shake');
  setTimeout(() => field.classList.remove('cl-anim-shake'), 400);
}

// ── Turn cooldown state ────────────────────────────────────────
let _clInputCooldown = false;

// ── Turn execution ─────────────────────────────────────────────
async function clPlayerMove(mi) {
  const b = window._clBattle;
  if (!b || !b.waitingForAction || _clInputCooldown) return;
  b.waitingForAction = false;
  _clInputCooldown = true;

  const player = b.playerTeam[b.playerIdx];
  const enemy  = b.enemyTeam[b.enemyIdx];
  const moveName = player.moves[mi];
  const move = CL_MOVE_DB[moveName] || { power: 40, cat: 'physical', type: 'normal', pp: 10 };

  // Deduct PP
  if (!player.pp) clInitPP(player);
  if (player.pp[moveName] > 0) player.pp[moveName]--;

  clLog(`— Turn ${b.turn} —`, '#333');

  const pSpd = clGetSpd(player);
  const eSpd = clGetSpd(enemy);

  if (pSpd >= eSpd) {
    clExecMove(player, move, moveName, enemy, true);
    if (enemy.currentHp > 0 && player.currentHp > 0) clEnemyTurn(player, enemy);
  } else {
    clEnemyTurn(player, enemy);
    if (player.currentHp > 0 && enemy.currentHp > 0) clExecMove(player, move, moveName, enemy, true);
  }

  if (player.currentHp > 0) clTickStatus(player);
  if (enemy.currentHp > 0)  clTickStatus(enemy);

  b.turn++;
  renderCLBattle();
  await clCheckFaint();

  // Release cooldown after a short delay so UI feels responsive but not spammable
  setTimeout(() => { _clInputCooldown = false; }, 650);
}

function clEnemyTurn(player, enemy) {
  if (!enemy.pp) clInitPP(enemy);
  const usable = enemy.moves.filter(m => (enemy.pp[m] ?? (CL_MOVE_DB[m]?.pp || 10)) > 0);
  const pool = usable.length > 0 ? usable : enemy.moves;
  const dmgMoves = pool.filter(m => (CL_MOVE_DB[m]?.power || 0) > 0);
  const chosen = (dmgMoves.length > 0 && Math.random() < 0.75) ? dmgMoves : pool;
  const name = chosen[Math.floor(Math.random() * chosen.length)];
  if (enemy.pp[name] > 0) enemy.pp[name]--;
  clExecMove(enemy, CL_MOVE_DB[name] || { power: 40, cat: 'physical', type: 'normal', pp: 10 }, name, player, false);
}

function clExecMove(attacker, move, moveName, defender, isPlayer) {
  const aCol = isPlayer ? '#80cbc4' : '#ef9a9a';
  const dCol = isPlayer ? '#ef9a9a' : '#80cbc4';
  const aLbl = `<b style="color:${aCol}">${attacker.name}</b>`;
  const dLbl = `<b style="color:${dCol}">${defender.name}</b>`;

  // Sleep
  if (attacker.status === 'sleep') {
    attacker.statusCounter--;
    if (attacker.statusCounter <= 0) { attacker.status = null; clLog(`${aLbl} woke up!`, '#fff9c4'); }
    else { clLog(`${aLbl} is fast asleep…`, '#78909c'); return; }
  }
  // Paralysis
  if (attacker.status === 'paralyze' && Math.random() < 0.25) {
    clLog(`${aLbl} is paralyzed! It can't move!`, '#f5c518'); return;
  }

  clLog(`${aLbl} used <b>${moveName}</b>!`);

  if (move.cat === 'status') { clApplyStatus(move, attacker, defender, aLbl, dLbl); return; }
  if (!move.power) return;

  // Trigger attack animation
  clAnimAttack(isPlayer);

  if (move.selfKO) {
    const { dmg, typeMult } = clCalcDamage(attacker, move, defender);
    if (typeMult === 0) { clLog(`${dLbl} is immune!`, '#666'); return; }
    const ei = effectLabel(typeMult); if (ei) clLog(ei.text, ei.color);
    setTimeout(() => clAnimHurt(isPlayer), 220);
    defender.currentHp = Math.max(0, defender.currentHp - dmg);
    attacker.currentHp = 0;
    clLog(`${dLbl} took <b style="color:#ffd700">${dmg}</b>! ${aLbl} fainted!`);
    return;
  }

  const { dmg, typeMult } = clCalcDamage(attacker, move, defender);
  if (typeMult === 0) { clLog(`It doesn't affect ${dLbl}…`, '#666'); return; }
  const ei = effectLabel(typeMult); if (ei) clLog(ei.text, ei.color);

  // Hurt animation on defender, shake on big hits
  setTimeout(() => {
    clAnimHurt(isPlayer);
    if (typeMult >= 2) clAnimShake(isPlayer);
  }, 220);

  defender.currentHp = Math.max(0, defender.currentHp - dmg);
  clLog(`${dLbl} took <b style="color:#ffd700">${dmg}</b> damage!`);

  if (move.recoil) {
    const rd = Math.max(1, Math.floor(dmg * move.recoil));
    attacker.currentHp = Math.max(0, attacker.currentHp - rd);
    clLog(`${aLbl} took <b>${rd}</b> recoil damage!`, '#ff9e40');
  }
  if (attacker.item?.effect === 'shell_bell') {
    const h = Math.max(1, Math.floor(dmg / 4));
    attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + h);
    clLog(`${aLbl} restored ${h} HP (Shell Bell)!`, '#69f0ae');
  }
  if (attacker.item?.effect === 'life_orb') {
    const sd = Math.max(1, Math.floor(attacker.maxHp * 0.1));
    attacker.currentHp = Math.max(1, attacker.currentHp - sd);
  }
  if (defender.item?.effect === 'rocky_helmet' && move.cat === 'physical') {
    const rh = Math.floor(attacker.maxHp / 6);
    attacker.currentHp = Math.max(0, attacker.currentHp - rh);
    clLog(`${aLbl} was hurt by Rocky Helmet! (${rh})`, '#ff9e40');
  }
}

function clApplyStatus(move, attacker, defender, aLbl, dLbl) {
  switch (move.effect) {
    case 'paralyze':
      if (!defender.status) { defender.status = 'paralyze'; clLog(`${dLbl} is paralyzed!`, '#f5c518'); } break;
    case 'toxic': case 'poison':
      if (!defender.status) {
        defender.status = move.effect === 'toxic' ? 'toxic' : 'poison';
        defender.statusCounter = 1;
        clLog(`${dLbl} was ${move.effect === 'toxic' ? 'badly ' : ''}poisoned!`, '#ab47bc');
      } break;
    case 'sleep':
      if (!defender.status) {
        defender.status = 'sleep';
        defender.statusCounter = 2 + Math.floor(Math.random() * 3);
        clLog(`${dLbl} fell asleep!`, '#78909c');
      } break;
    case 'heal': {
      const h = Math.floor(attacker.maxHp / 2);
      attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + h);
      clLog(`${aLbl} restored ${h} HP!`, '#69f0ae'); break;
    }
    case 'boost_atk2': attacker.stages.atk = Math.min(6, attacker.stages.atk + 2); clLog(`${aLbl}'s Attack sharply rose!`, '#ff9e40'); break;
    case 'boost_spd':  attacker.stages.spe = Math.min(6, attacker.stages.spe + 2); clLog(`${aLbl}'s Speed sharply rose!`, '#ffd700'); break;
    case 'boost_def':  attacker.stages.def = Math.min(6, attacker.stages.def + 1); clLog(`${aLbl}'s Defense rose!`, '#4fc3f7'); break;
    case 'boost_spa':  attacker.stages.spa = Math.min(6, attacker.stages.spa + 1); clLog(`${aLbl}'s Sp. Atk rose!`, '#ce93d8'); break;
    case 'boost_spa2': attacker.stages.spa = Math.min(6, attacker.stages.spa + 2); clLog(`${aLbl}'s Sp. Atk sharply rose!`, '#ce93d8'); break;
    case 'lower_def':  defender.stages.def = Math.max(-6, defender.stages.def - 1); clLog(`${dLbl}'s Defense fell!`, '#ff9e40'); break;
    case 'lower_spd':  defender.stages.spe = Math.max(-6, defender.stages.spe - 1); clLog(`${dLbl}'s Speed fell!`, '#ff9e40'); break;
    case 'lower_acc':  clLog(`${dLbl}'s accuracy fell!`, '#aaa'); break;
    default: clLog(`But nothing happened!`, '#555');
  }
}

function clTickStatus(pk) {
  if (!pk.status || pk.currentHp <= 0) return;
  if (pk.status === 'poison') {
    const d = Math.max(1, Math.floor(pk.maxHp / 8));
    pk.currentHp = Math.max(0, pk.currentHp - d);
    clLog(`${pk.name} was hurt by poison! (${d})`, '#ab47bc');
  }
  if (pk.status === 'toxic') {
    const d = Math.max(1, Math.floor(pk.maxHp / 16 * pk.statusCounter));
    pk.statusCounter++;
    pk.currentHp = Math.max(0, pk.currentHp - d);
    clLog(`${pk.name} is badly poisoned! (${d})`, '#7b1fa2');
  }
  if (pk.status === 'burn') {
    const d = Math.max(1, Math.floor(pk.maxHp / 8));
    pk.currentHp = Math.max(0, pk.currentHp - d);
    clLog(`${pk.name} was hurt by its burn! (${d})`, '#ef6c00');
  }
}

// Switching wastes a turn — enemy attacks once
function clDoSwitch(toIdx) {
  const b = window._clBattle;
  const enemy = b.enemyTeam[b.enemyIdx];
  const oldName = b.playerTeam[b.playerIdx].name;
  b.playerIdx = toIdx;
  const newPk = b.playerTeam[toIdx];
  clLog(`${oldName}, come back!`, '#4fc3f7');
  clLog(`Go, <b style="color:#4fc3f7">${newPk.name}</b>!`, '#4fc3f7');
  // Enemy gets a free attack on the incoming pokemon
  if (enemy.currentHp > 0) clEnemyTurn(newPk, enemy);
  if (newPk.currentHp > 0) clTickStatus(newPk);
  if (enemy.currentHp > 0)  clTickStatus(enemy);
  b.turn++;
  renderCLBattle();
  clCheckFaint();
}

async function clCheckFaint() {
  const b = window._clBattle;
  // Always read current state fresh
  const enemy = b.enemyTeam[b.enemyIdx];

  // ── Enemy fainted ──────────────────────────────────────────
  if (enemy && enemy.currentHp <= 0) {
    clLog(`<b style="color:#ef9a9a">${enemy.name}</b> fainted!`, '#ffd700');
    b.enemyIdx++;
    if (b.enemyIdx >= b.enemyTeam.length) {
      await clTrainerDefeated();
      return;
    }
    // Make sure new enemy has PP init'd
    const nextEnemy = b.enemyTeam[b.enemyIdx];
    if (!nextEnemy.pp) clInitPP(nextEnemy);
    clLog(`<b style="color:#ef9a9a">${b.trainerName}</b> sent out <b style="color:#ef9a9a">${nextEnemy.name}</b>!`);
  }

  // ── Player fainted ─────────────────────────────────────────
  const player = b.playerTeam[b.playerIdx];
  if (player && player.currentHp <= 0) {
    clLog(`<b style="color:#4fc3f7">${player.name}</b> fainted!`, '#ef5350');
    const anyAlive = b.playerTeam.some(p => p.currentHp > 0);
    if (!anyAlive) {
      clBattleLost();
      return;
    }
    // Auto-send next pokemon
    const next = b.playerTeam.findIndex((p, i) => i > b.playerIdx && p.currentHp > 0);
    const fallback = b.playerTeam.findIndex(p => p.currentHp > 0);
    b.playerIdx = next !== -1 ? next : fallback;
    const nextPk = b.playerTeam[b.playerIdx];
    clLog(`<b style="color:#4fc3f7">${nextPk.name}</b> was sent out!`, '#4fc3f7');
  }

  // Resume — re-render with fresh action panel
  b.waitingForAction = true;
  renderCLBattle();
}

async function clTrainerDefeated() {
  const b = window._clBattle;
  const gym = b.isRed ? CL_RED : CL_GYMS[b.gymId];

  if (b.isLeader) { clGymBeaten(); return; }

  b.trainerIdx++;
  const nextIsLeader = b.trainerIdx >= gym.trainers.length;
  const prevName = gym.trainers[b.trainerIdx - 1].name;
  const nextData = nextIsLeader ? gym.leader : gym.trainers[b.trainerIdx];

  // Build next enemy team
  b.enemyTeam = [];
  for (const pkDef of nextData.team) {
    const slv = nextIsLeader
      ? Math.max(pkDef.level, Math.floor(b.maxPlayerLv * 1.05))
      : Math.max(pkDef.level, Math.floor(b.maxPlayerLv * 0.9));
    const sd = await fetchPokemonStats(pkDef.id).catch(() => null);
    const bh = sd ? (sd.find(s => s.stat.name === 'hp')?.base_stat || 70) : 70;
    const ivs = generateIVs();
    const mh = Math.floor(((bh * 2 + (ivs['hp'] ?? 15)) * slv / 100) + slv + 10);
    const item = pkDef.item ? getCLItemById(pkDef.item) : null;
    const entry = { id: pkDef.id, name: pkDef.name, types: pkDef.types, level: slv, statsData: sd, ivs, maxHp: mh, currentHp: mh, moves: pkDef.moves || getDefaultCLMoves(pkDef), item, stages: { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }, status: null, statusCounter: 0, isPlayer: false, _customSprite: pkDef._customSprite || null };
    clInitPP(entry);
    b.enemyTeam.push(entry);
  }
  b.enemyIdx = 0;
  b.isLeader = nextIsLeader;
  b.trainerName = nextData.name;
  b.waitingForAction = true;

  const el = document.getElementById('cl-content');
  el.innerHTML = `<div style="text-align:center;padding:40px 10px">
    <div style="font-size:36px;margin-bottom:10px">✓</div>
    <div style="font-family:'Press Start 2P',monospace;font-size:11px;color:#69f0ae;margin-bottom:8px">${prevName} defeated!</div>
    <div style="font-size:15px;color:var(--text2);margin-bottom:20px">Next up: ${nextIsLeader ? `<b style="color:#ffd700">Gym Leader ${gym.leader.name}</b>` : gym.trainers[b.trainerIdx].name}</div>
    <button onclick="renderCLBattle()" style="background:rgba(255,215,0,0.15);border:2px solid #ffd700;color:#ffd700;padding:12px 28px;border-radius:8px;cursor:pointer;font-family:'VT323',monospace;font-size:20px;letter-spacing:1px">⚔️ Continue!</button>
  </div>`;
}

function clGymBeaten() {
  const b = window._clBattle;
  const gym = b.isRed ? CL_RED : CL_GYMS[b.gymId];
  const bid = b.isRed ? 'red' : (typeof b.gymId === 'string' ? parseInt(b.gymId, 10) : b.gymId);

  if (!gameState.cl.badges) gameState.cl.badges = [];
  if (!gameState.cl.badges.includes(bid)) gameState.cl.badges.push(bid);
  gameState.cl.phase = 'lobby';

  // Gem rewards per gym (progressive, big reward for Red)
  const GEM_REWARDS = [20, 35, 55, 80, 110, 150, 200, 275, 2500]; // 0-7 = gyms, 8 = Red
  const gemReward = b.isRed ? 2500 : (GEM_REWARDS[bid] ?? 20);
  gameState.gems += gemReward;
  saveGame();
  updateResourceUI();

  const el = document.getElementById('cl-content');

  if (b.isRed) {
    el.innerHTML = `<div style="text-align:center;padding:20px 10px">
      <div style="font-size:48px;margin-bottom:10px">🏅</div>
      <div style="font-family:'Press Start 2P',monospace;font-size:11px;background:linear-gradient(90deg,#ff4444,#ffd700,#ff4444);background-size:200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 1s linear infinite;margin-bottom:10px">YOU BEAT RED!</div>
      <div style="font-size:16px;color:var(--text2);margin-bottom:12px;line-height:1.7">You've conquered the Champion's League!<br>You are the true Champion!</div>
      <div style="background:rgba(255,215,0,0.15);border:2px solid #ffd700;border-radius:10px;padding:14px;margin:10px 0">
        <div style="font-family:'Press Start 2P',monospace;font-size:9px;color:#ffd700;margin-bottom:6px">💎 GEM REWARD</div>
        <div style="font-size:22px;color:#ffd700">+${gemReward.toLocaleString()} 💎 Gems!</div>
      </div>
      <div style="background:rgba(255,215,0,0.08);border:2px solid #ffd700;border-radius:10px;padding:16px;margin:12px 0;text-align:left">
        <div style="font-family:'Press Start 2P',monospace;font-size:9px;color:#ffd700;margin-bottom:8px;text-align:center">⭐ ACCOUNT FLAGGED</div>
        <div style="font-size:15px;color:var(--text);line-height:1.7">Your save has been flagged as eligible for a <b style="color:#ffd700">special custom Pokémon</b>. It will be added to your Box automatically in a future update. Keep an eye on your Box!</div>
      </div>
      <button onclick="renderCLLobby()" style="background:rgba(255,68,68,0.15);border:2px solid #ff4444;color:#ff4444;padding:10px 24px;border-radius:8px;cursor:pointer;font-family:'VT323',monospace;font-size:18px">🏆 Back to League</button>
    </div>`;
    toast(`🏅 You beat Red! +${gemReward.toLocaleString()} 💎 Gems! A special Pokémon awaits!`, 7000);
    return;
  }

  el.innerHTML = `<div style="text-align:center;padding:20px 10px">
    <div style="font-size:44px;margin-bottom:10px">${gym.badgeEmoji}</div>
    <div style="font-family:'Press Start 2P',monospace;font-size:10px;background:linear-gradient(90deg,${gym.color},#fff,${gym.color});background-size:200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 1.5s linear infinite;margin-bottom:8px">${gym.badge} obtained!</div>
    <div style="font-size:16px;color:var(--text2);margin-bottom:8px">You defeated ${gym.name}!</div>
    <div style="background:rgba(255,215,0,0.12);border:1px solid rgba(255,215,0,0.4);border-radius:8px;padding:10px;margin:8px 0">
      <div style="font-size:18px;color:#ffd700">+${gemReward} 💎 Gems!</div>
    </div>
    <div style="background:rgba(255,215,0,0.06);border:2px solid ${gym.color};border-radius:10px;padding:14px;margin:10px 0">
      <div style="font-family:'Press Start 2P',monospace;font-size:8px;color:#ffd700;margin-bottom:6px">🎁 IDLE BONUS UNLOCKED</div>
      <div style="font-size:17px;color:var(--text)">${gym.boost.icon} ${gym.boost.desc}</div>
    </div>
    <button onclick="renderCLLobby()" style="background:rgba(255,215,0,0.15);border:2px solid #ffd700;color:#ffd700;padding:10px 24px;border-radius:8px;cursor:pointer;font-family:'VT323',monospace;font-size:18px">🏆 Back to League</button>
  </div>`;
  toast(`${gym.badgeEmoji} ${gym.badge} obtained! +${gemReward} 💎 ${gym.boost.desc}`, 5000);
}

function clBattleLost() {
  document.getElementById('cl-content').innerHTML = `<div style="text-align:center;padding:40px 10px">
    <div style="font-size:44px;margin-bottom:10px">💀</div>
    <div style="font-family:'Press Start 2P',monospace;font-size:11px;color:#ef5350;margin-bottom:10px">BLACKED OUT!</div>
    <div style="font-size:16px;color:var(--text2);margin-bottom:16px;line-height:1.7">All your Pokémon fainted…<br>Heal up and try again!</div>
    <button onclick="renderCLLobby()" style="background:rgba(239,83,80,0.15);border:2px solid #ef5350;color:#ef5350;padding:10px 24px;border-radius:8px;cursor:pointer;font-family:'VT323',monospace;font-size:18px">← Back to League</button>
  </div>`;
}
