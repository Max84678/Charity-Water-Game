/* ============================================================
   game.js — Charity: Water Game  (main game logic)
   ============================================================ */

// ─── Constants ───────────────────────────────────────────────────
const COST_MULT      = 1.15;
const MAX_PER_TYPE   = 10000;
const REINC_THRESHOLD = 1e12; // 1 trillion litres

const CLICKER_TYPES = [
  { id:'bucket',    name:'Bucket Brigade',  emoji:'🪣', desc:'Villagers carry water by hand.',           baseCost:10,      baseLps:0.1   },
  { id:'handpump',  name:'Hand Pump',        emoji:'💧', desc:'A simple mechanical hand pump.',           baseCost:100,     baseLps:1.5   },
  { id:'village',   name:'Village Well',     emoji:'🏘️', desc:'A shared well serving the community.',    baseCost:1100,    baseLps:15    },
  { id:'solar',     name:'Solar Pump',       emoji:'☀️', desc:'Solar-powered water extraction.',         baseCost:12000,   baseLps:160   },
  { id:'borehole',  name:'Borehole',         emoji:'⛏️', desc:'Deep drilled underground aquifer.',       baseCost:130000,  baseLps:100000,   droughtLps:100   },
  { id:'pipeline',  name:'Water Pipeline',   emoji:'🔩', desc:'A pipe network across many villages.',    baseCost:1400000, baseLps:10000,    droughtLps:50    },
  { id:'treatment', name:'Treatment Plant',  emoji:'🏭', desc:'Purifies water for an entire region.',    baseCost:2e7,     baseLps:1000000,  droughtLps:1000  },
  { id:'grid',      name:'National Grid',    emoji:'🌐', desc:'Country-wide clean water infrastructure.',baseCost:3.3e8,   baseLps:10000000, droughtLps:10000 },
  { id:'desal',     name:'Desalination Plant', emoji:'🌊', desc:'Industrial desalination turns seawater into supply.', baseCost:5e9,   baseLps:100000000,  droughtLps:100000  },
  { id:'aqueduct',  name:'Grand Aqueduct',    emoji:'🏛️', desc:'Gravity-fed channels move water across nations.',   baseCost:7.5e10, baseLps:1000000000, droughtLps:1000000 },
  { id:'cloud',     name:'Cloud Harvester',   emoji:'☁️', desc:'Harvests moisture directly from the sky.',          baseCost:1e12,   baseLps:10000000000, droughtLps:10000000 },
  { id:'orbital',   name:'Orbital Rain Array',emoji:'🛰️', desc:'Orbital systems seed and steer rainfall.',         baseCost:1.5e13, baseLps:100000000000, droughtLps:100000000 },
  { id:'relay',     name:'Continental Relay', emoji:'📡', desc:'Moves water through transcontinental relay towers.', baseCost:2e14,  baseLps:1000000000000, droughtLps:1000000000 },
  { id:'pressure',  name:'Pressure Foundry',  emoji:'🛠️', desc:'Raises water with industrial pressure chambers.',   baseCost:3e15,  baseLps:10000000000000, droughtLps:10000000000 },
  { id:'atmo',      name:'Atmospheric Net',   emoji:'🌫️', desc:'Snags moisture from broad atmospheric currents.',   baseCost:4.5e16,baseLps:100000000000000, droughtLps:100000000000 },
  { id:'weather',   name:'Weather Engine',    emoji:'⛈️', desc:'Coordinates rainfall across whole climate zones.',  baseCost:6.5e17,baseLps:1000000000000000, droughtLps:1000000000000 },
  { id:'strato',    name:'Stratospheric Siphon', emoji:'🚀', desc:'Pulls water from high-altitude vapor streams.',    baseCost:1e19,   baseLps:10000000000000000, droughtLps:10000000000000 },
  { id:'seeding',   name:'Cloud Seeding Fleet', emoji:'✈️', desc:'A fleet of aircraft seeds rain on demand.',         baseCost:1.5e20, baseLps:100000000000000000, droughtLps:100000000000000 },
  { id:'lunar',     name:'Lunar Reservoir',    emoji:'🌙', desc:'Stores and releases water from orbital stations.',  baseCost:2e21,   baseLps:1000000000000000000, droughtLps:1000000000000000 },
  { id:'tidal',     name:'Tidal Engine',       emoji:'🌊', desc:'Uses planetary tides to move immense volumes.',     baseCost:3e22,   baseLps:10000000000000000000, droughtLps:10000000000000000 },
  { id:'weir',      name:'Planetary Weir',     emoji:'🏞️', desc:'A continental spillway system for global flow.',   baseCost:5e23,   baseLps:100000000000000000000, droughtLps:100000000000000000000 },
  { id:'monsoon',   name:'Global Monsoon',     emoji:'🌧️', desc:'Creates synchronized monsoon cycles worldwide.',   baseCost:7e24,   baseLps:1000000000000000000000, droughtLps:1000000000000000000 },
  { id:'solarwind', name:'Solar Wind Harvester', emoji:'☀️', desc:'Harnesses solar wind for weather-scale circulation.', baseCost:1e26,  baseLps:10000000000000000000000, droughtLps:10000000000000000000 },
  { id:'fog',       name:'Orbital Fog Net',    emoji:'🕸️', desc:'Collects water from drifting fog bands in orbit.',   baseCost:1.5e27, baseLps:100000000000000000000000, droughtLps:100000000000000000000 },
  { id:'polar',     name:'Polar Ice Drip',     emoji:'🧊', desc:'Melts and routes polar reserves at scale.',          baseCost:2e28,   baseLps:1000000000000000000000000, droughtLps:1000000000000000000000 },
  { id:'deepsea',   name:'Deep-Sea Pump',      emoji:'🌋', desc:'Raises deep ocean water into active circulation.',  baseCost:3e29,   baseLps:10000000000000000000000000, droughtLps:10000000000000000000000 },
  { id:'rift',      name:'Rift Aquifer',       emoji:'🪨', desc:'Taps tectonic rifts for hidden underground flow.',   baseCost:5e30,   baseLps:100000000000000000000000000, droughtLps:100000000000000000000000 },
  { id:'spiral',    name:'Subsurface Spiral',  emoji:'🌀', desc:'Spins groundwater through an endless spiral grid.', baseCost:7e31,   baseLps:1000000000000000000000000000, droughtLps:1000000000000000000000000 },
  { id:'lattice',   name:'Climate Lattice',    emoji:'🕸️', desc:'A lattice that redistributes rainfall globally.',   baseCost:1e33,   baseLps:10000000000000000000000000000, droughtLps:10000000000000000000000000 },
  { id:'matrix',    name:'Hydro Matrix',       emoji:'🔷', desc:'An adaptive matrix of automated waterways.',       baseCost:1.5e34, baseLps:100000000000000000000000000000, droughtLps:100000000000000000000000000 },
  { id:'bridge',    name:'Sky Bridge',         emoji:'🌉', desc:'Raises water between clouds and cities.',          baseCost:2e35,   baseLps:1000000000000000000000000000000, droughtLps:1000000000000000000000000000 },
  { id:'factory',   name:'Rain Factory',       emoji:'🏭', desc:'Mass-produces rainfall with industrial precision.', baseCost:3e36,   baseLps:10000000000000000000000000000000, droughtLps:10000000000000000000000000000 },
  { id:'mist',      name:'Mist Foundry',       emoji:'🫧', desc:'Turns humidity into a constant water stream.',     baseCost:5e37,   baseLps:100000000000000000000000000000000, droughtLps:100000000000000000000000000000 },
  { id:'nimbus',    name:'Nimbus Forge',       emoji:'☁️', desc:'Forged clouds release water on command.',          baseCost:7e38,   baseLps:1000000000000000000000000000000000, droughtLps:1000000000000000000000000000000 },
  { id:'crown',     name:'Ocean Crown',        emoji:'👑', desc:'Commands ocean-scale circulation patterns.',        baseCost:1e40,   baseLps:10000000000000000000000000000000000, droughtLps:10000000000000000000000000000000 },
  { id:'eternal',   name:'Infinite Monsoon',   emoji:'♾️', desc:'A self-sustaining rain cycle without end.',          baseCost:1.5e41, baseLps:100000000000000000000000000000000000, droughtLps:100000000000000000000000000000000 },
];

const AUTO_UPGRADE_PREFIX = {
  bucket: 'Bucket',
  handpump: 'Pump',
  village: 'Village',
  solar: 'Solar',
  borehole: 'Drill',
  pipeline: 'Pipeline',
  treatment: 'Treatment',
  grid: 'Grid',
  desal: 'Desalination',
  aqueduct: 'Aqueduct',
  cloud: 'Cloud',
  orbital: 'Orbital',
  relay: 'Relay',
  pressure: 'Pressure',
  atmo: 'Atmospheric',
  weather: 'Weather',
  strato: 'Stratospheric',
  seeding: 'Seeding',
  lunar: 'Lunar',
  tidal: 'Tidal',
  weir: 'Weir',
  monsoon: 'Monsoon',
  solarwind: 'Solar Wind',
  fog: 'Fog',
  polar: 'Polar',
  deepsea: 'Deep-Sea',
  rift: 'Rift',
  spiral: 'Spiral',
  lattice: 'Lattice',
  matrix: 'Matrix',
  bridge: 'Bridge',
  factory: 'Factory',
  mist: 'Mist',
  nimbus: 'Nimbus',
  crown: 'Ocean',
  eternal: 'Infinite',
};

const AUTO_UPGRADE_SUBJECT = {
  bucket: 'Bucket Brigades',
  handpump: 'Hand Pumps',
  village: 'Village Wells',
  solar: 'Solar Pumps',
  borehole: 'Boreholes',
  pipeline: 'Pipelines',
  treatment: 'Treatment Plants',
  grid: 'National Grid',
  desal: 'Desalination Plants',
  aqueduct: 'Grand Aqueducts',
  cloud: 'Cloud Harvesters',
  orbital: 'Orbital Rain Arrays',
  relay: 'Continental Relays',
  pressure: 'Pressure Forges',
  atmo: 'Atmospheric Nets',
  weather: 'Weather Engines',
  strato: 'Stratospheric Siphons',
  seeding: 'Cloud Seeding Fleets',
  lunar: 'Lunar Reservoirs',
  tidal: 'Tidal Engines',
  weir: 'Planetary Weirs',
  monsoon: 'Global Monsoons',
  solarwind: 'Solar Wind Harvesters',
  fog: 'Orbital Fog Nets',
  polar: 'Polar Ice Drips',
  deepsea: 'Deep-Sea Pumps',
  rift: 'Rift Aquifers',
  spiral: 'Subsurface Spirals',
  lattice: 'Climate Lattices',
  matrix: 'Hydro Matrices',
  bridge: 'Sky Bridges',
  factory: 'Rain Factories',
  mist: 'Mist Forges',
  nimbus: 'Nimbus Forges',
  crown: 'Ocean Crowns',
  eternal: 'Infinite Monsoons',
};

const AUTO_UPGRADE_ID_PREFIX = {
  bucket: 'bu',
  handpump: 'hp',
  village: 'vw',
  solar: 'sp',
  borehole: 'br',
  pipeline: 'pl',
  treatment: 'tp',
  grid: 'ng',
  desal: 'ds',
  aqueduct: 'aq',
  cloud: 'cl',
  orbital: 'or',
  relay: 'rl',
  pressure: 'pr',
  atmo: 'at',
  weather: 'we',
  strato: 'st',
  seeding: 'sd',
  lunar: 'lu',
  tidal: 'td',
  weir: 'wr',
  monsoon: 'mo',
  solarwind: 'sw',
  fog: 'fg',
  polar: 'po',
  deepsea: 'de',
  rift: 'rf',
  spiral: 'si',
  lattice: 'la',
  matrix: 'mx',
  bridge: 'bg',
  factory: 'fa',
  mist: 'mi',
  nimbus: 'ni',
  crown: 'cw',
  eternal: 'et',
};

const LATE_AUTO_UPGRADE_TIERS = [
  { id: 7,  name:'Quantum',     mult:50,   costFactor:5e4,  req:250  },
  { id: 8,  name:'Singularity', mult:100,  costFactor:2.5e5, req:500  },
  { id: 9,  name:'Fusion',      mult:250,  costFactor:1e6,   req:1000 },
  { id: 10, name:'Ascension',   mult:500,  costFactor:5e6,   req:2500 },
  { id: 11, name:'Zenith',      mult:1000, costFactor:2.5e7, req:5000 },
  { id: 12, name:'Apotheosis',  mult:2500, costFactor:1e8,   req:10000 },
];

function buildLateGameAutoUpgrades() {
  return CLICKER_TYPES.flatMap(type => {
    const prefix = AUTO_UPGRADE_PREFIX[type.id];
    const subject = AUTO_UPGRADE_SUBJECT[type.id];
    const idPrefix = AUTO_UPGRADE_ID_PREFIX[type.id];
    if (!prefix || !subject) return [];

    return LATE_AUTO_UPGRADE_TIERS.map(tier => ({
      id: `${idPrefix}${tier.id}`,
      name: `${prefix} ${tier.name}`,
      desc: `${subject} produce ${tier.mult}×.`,
      target: type.id,
      mult: tier.mult,
      cost: Math.round(type.baseCost * tier.costFactor),
      req: { [type.id]: tier.req },
    }));
  });
}

// One-time purchasable upgrades (shown above auto-clickers in store)
const UPGRADES = [
  // Click upgrades
  { id:'cu1', name:'Stronger Arms',   desc:'Double your click power.',       target:'click',    mult:2,  cost:50,      req:{} },
  { id:'cu2', name:'Water Vessel',    desc:'Double your click power again.', target:'click',    mult:2,  cost:5e3,     req:{} },
  { id:'cu3', name:'Efficient Draw',  desc:'Click power ×5.',                target:'click',    mult:5,  cost:5e4,     req:{} },
  { id:'cu5', name:'Power Surge',     desc:'Click power ×4.',                target:'click',    mult:4,  cost:5e5,     req:{} },
  { id:'cu4', name:'Master Hand',     desc:'Click power ×10.',               target:'click',    mult:10, cost:5e6,     req:{} },
  // Bucket Brigade
  { id:'bu1', name:'Bigger Buckets',  desc:'Bucket Brigades produce 2×.',    target:'bucket',   mult:2,  cost:100,     req:{bucket:1}    },
  { id:'bu2', name:'Water Relay',     desc:'Bucket Brigades produce 2×.',    target:'bucket',   mult:2,  cost:500,     req:{bucket:5}    },
  { id:'bu4', name:'Bucket Boost',    desc:'Bucket Brigades produce 4×.',    target:'bucket',   mult:4,  cost:2500,    req:{bucket:10}   },
  { id:'bu3', name:'Expert Carriers', desc:'Bucket Brigades produce 5×.',    target:'bucket',   mult:5,  cost:5000,    req:{bucket:25}   },
  { id:'bu5', name:'Bucket Overdrive',desc:'Bucket Brigades produce 10×.',   target:'bucket',   mult:10, cost:25000,   req:{bucket:50}   },
  { id:'bu6', name:'Bucket Hyperdrive', desc:'Bucket Brigades produce 25×.', target:'bucket',   mult:25, cost:100000,  req:{bucket:100}  },
  // Hand Pump
  { id:'hp1', name:'Better Seals',    desc:'Hand Pumps produce 2×.',         target:'handpump', mult:2,  cost:1000,    req:{handpump:1}  },
  { id:'hp2', name:'Pump Overhaul',   desc:'Hand Pumps produce 2×.',         target:'handpump', mult:2,  cost:5000,    req:{handpump:5}  },
  { id:'hp4', name:'Pump Boost',      desc:'Hand Pumps produce 4×.',         target:'handpump', mult:4,  cost:25000,   req:{handpump:10} },
  { id:'hp3', name:'Turbo Pump',      desc:'Hand Pumps produce 5×.',         target:'handpump', mult:5,  cost:5e4,     req:{handpump:25} },
  { id:'hp5', name:'Pump Overdrive',  desc:'Hand Pumps produce 10×.',        target:'handpump', mult:10, cost:2.5e5,   req:{handpump:50} },
  { id:'hp6', name:'Pump Hyperdrive',  desc:'Hand Pumps produce 25×.',       target:'handpump', mult:25, cost:1e6,     req:{handpump:100} },
  // Village Well
  { id:'vw1', name:'Deeper Shaft',    desc:'Village Wells produce 2×.',      target:'village',  mult:2,  cost:11000,   req:{village:1}   },
  { id:'vw2', name:'Lined Shaft',     desc:'Village Wells produce 2×.',      target:'village',  mult:2,  cost:55000,   req:{village:5}   },
  { id:'vw4', name:'Village Boost',   desc:'Village Wells produce 4×.',      target:'village',  mult:4,  cost:275000,  req:{village:10}  },
  { id:'vw3', name:'Community Pool',  desc:'Village Wells produce 5×.',      target:'village',  mult:5,  cost:5.5e5,   req:{village:25}  },
  { id:'vw5', name:'Village Overdrive',desc:'Village Wells produce 10×.',     target:'village',  mult:10, cost:2.75e6,  req:{village:50}  },
  { id:'vw6', name:'Village Hyperdrive', desc:'Village Wells produce 25×.',   target:'village',  mult:25, cost:1.1e7,   req:{village:100} },
  // Solar Pump
  { id:'sp1', name:'Better Panels',   desc:'Solar Pumps produce 2×.',        target:'solar',    mult:2,  cost:1.2e5,   req:{solar:1}     },
  { id:'sp2', name:'Battery Storage', desc:'Solar Pumps produce 2×.',        target:'solar',    mult:2,  cost:6e5,     req:{solar:5}     },
  { id:'sp4', name:'Solar Boost',     desc:'Solar Pumps produce 4×.',        target:'solar',    mult:4,  cost:3e6,     req:{solar:10}    },
  { id:'sp3', name:'Solar Farm',      desc:'Solar Pumps produce 5×.',        target:'solar',    mult:5,  cost:6e6,     req:{solar:25}    },
  { id:'sp5', name:'Solar Overdrive',  desc:'Solar Pumps produce 10×.',       target:'solar',    mult:10, cost:3e7,     req:{solar:50}    },
  { id:'sp6', name:'Solar Hyperdrive',  desc:'Solar Pumps produce 25×.',      target:'solar',    mult:25, cost:1.2e8,   req:{solar:100}   },
  // Borehole
  { id:'br1', name:'Diamond Drill',   desc:'Boreholes produce 2×.',          target:'borehole', mult:2,  cost:1.3e6,   req:{borehole:1}  },
  { id:'br2', name:'High-Flow Pump',  desc:'Boreholes produce 2×.',          target:'borehole', mult:2,  cost:6.5e6,   req:{borehole:5}  },
  { id:'br4', name:'Drill Boost',     desc:'Boreholes produce 4×.',          target:'borehole', mult:4,  cost:3.25e7,  req:{borehole:10} },
  { id:'br3', name:'Aquifer Tap',     desc:'Boreholes produce 5×.',          target:'borehole', mult:5,  cost:6.5e7,   req:{borehole:25} },
  { id:'br5', name:'Drill Overdrive',  desc:'Boreholes produce 10×.',         target:'borehole', mult:10, cost:3.25e8,  req:{borehole:50} },
  { id:'br6', name:'Drill Hyperdrive',  desc:'Boreholes produce 25×.',        target:'borehole', mult:25, cost:1.3e9,   req:{borehole:100} },
  // Pipeline
  { id:'pl1', name:'Wider Pipes',     desc:'Pipelines produce 2×.',          target:'pipeline', mult:2,  cost:1.4e7,   req:{pipeline:1}  },
  { id:'pl2', name:'High Pressure',   desc:'Pipelines produce 2×.',          target:'pipeline', mult:2,  cost:7e7,     req:{pipeline:5}  },
  { id:'pl4', name:'Pipeline Boost',  desc:'Pipelines produce 4×.',          target:'pipeline', mult:4,  cost:3.5e8,   req:{pipeline:10} },
  { id:'pl3', name:'Smart Valves',    desc:'Pipelines produce 5×.',          target:'pipeline', mult:5,  cost:7e8,     req:{pipeline:25} },
  { id:'pl5', name:'Pipeline Overdrive',desc:'Pipelines produce 10×.',       target:'pipeline', mult:10, cost:3.5e9,   req:{pipeline:50} },
  { id:'pl6', name:'Pipeline Hyperdrive', desc:'Pipelines produce 25×.',     target:'pipeline', mult:25, cost:1.4e10,  req:{pipeline:100} },
  // Treatment Plant
  { id:'tp1', name:'Better Filters',  desc:'Treatment Plants produce 2×.',   target:'treatment',mult:2,  cost:2e8,     req:{treatment:1} },
  { id:'tp2', name:'UV System',       desc:'Treatment Plants produce 2×.',   target:'treatment',mult:2,  cost:1e9,     req:{treatment:5} },
  { id:'tp4', name:'Treatment Boost',  desc:'Treatment Plants produce 4×.',   target:'treatment',mult:4,  cost:5e9,     req:{treatment:10}},
  { id:'tp3', name:'Nano Filters',    desc:'Treatment Plants produce 5×.',   target:'treatment',mult:5,  cost:1e10,    req:{treatment:25}},
  { id:'tp5', name:'Treatment Overdrive',desc:'Treatment Plants produce 10×.', target:'treatment',mult:10, cost:5e10,    req:{treatment:50}},
  { id:'tp6', name:'Treatment Hyperdrive', desc:'Treatment Plants produce 25×.', target:'treatment',mult:25, cost:2e11,   req:{treatment:100}},
  // National Grid
  { id:'ng1', name:'Smart Meters',    desc:'National Grid produces 2×.',     target:'grid',     mult:2,  cost:3.3e9,   req:{grid:1}      },
  { id:'ng2', name:'AI Management',   desc:'National Grid produces 2×.',     target:'grid',     mult:2,  cost:1.65e10, req:{grid:5}      },
  { id:'ng4', name:'Grid Boost',      desc:'National Grid produces 4×.',     target:'grid',     mult:4,  cost:8.25e10, req:{grid:10}     },
  { id:'ng3', name:'Global Network',  desc:'National Grid produces 5×.',     target:'grid',     mult:5,  cost:1.65e11, req:{grid:25}     },
  { id:'ng5', name:'Grid Overdrive',  desc:'National Grid produces 10×.',    target:'grid',     mult:10, cost:8.25e11, req:{grid:50}     },
  { id:'ng6', name:'Grid Hyperdrive',  desc:'National Grid produces 25×.',   target:'grid',     mult:25, cost:3.3e12,  req:{grid:100}    },
  ...buildLateGameAutoUpgrades(),
];

// Improvement 2 — real-world impact milestones with charity: water facts
const MILESTONES = [
  { water:1e3,              icon:'💧', msg:'1,000 Liters — You\'ve started a movement!',                                             triggered:false },
  { water:2.5e4,            icon:'💙', msg:'25,000 L — charity: water can give one person clean water for life for about $30!',      triggered:false },
  { water:1e5,              icon:'🎉', msg:'100,000 L — Enough clean water for 4 people for their entire lives!',                    triggered:false },
  { water:1e6,              icon:'🌊', msg:'1 Million Liters — A small village now has clean water!',                                triggered:false },
  { water:1e7,              icon:'♀️', msg:'10M L — In this area, women and girls no longer walk hours daily to collect water.',     triggered:false },
  { water:1e8,              icon:'🌍', msg:'100 Million Liters — An entire district served with clean water!',                       triggered:false },
  { water:1e9,              icon:'💪', msg:'1 Billion Liters — 703 million people still lack clean water. Keep going!',             triggered:false },
  { water:1e11,             icon:'🏆', msg:'100 Billion Liters — You\'ve changed millions of lives. Incredible!',                   triggered:false },
  { water:REINC_THRESHOLD,  icon:'⚡', msg:'1 TRILLION Liters! Reincarnation is now available — click the ⚡ button!',              triggered:false },
];

let currentMode = normalizeGameMode(getSelectedGameMode());
let activeBoost = null;
let goldenDropElement = null;
let goldenDropRemoveTimer = null;
let goldenDropSpawnTimer = null;
let reincWarningOpen = false;

// ─── Default / fresh game state ──────────────────────────────────
const DEFAULT_STATE = {
  water:              0,
  totalWater:         0,   // this reincarnation cycle
  startingWater:      0,
  reincarnationReady: false,
  reincarnationThresholdsAwarded: 0,
  reincarnations:     0,
  reincarnationPoints:0,
  reincarnationStoreViewedFor: 0,
  owned:              {},  // { typeId: count }
  purchasedUpgrades:  [],  // upgrade ids bought this cycle
  permanentUpgrades:  [],  // permanent upgrade ids (survive reincarnation)
};
CLICKER_TYPES.forEach(t => { DEFAULT_STATE.owned[t.id] = 0; });

// ─── Live state & UI helpers ──────────────────────────────────────
let state       = deepClone(DEFAULT_STATE);
let bulkAmount  = 1;
let storeOpen   = false;
let lastUpdate  = Date.now();
let reincBtnEl = null;
let reincLockedNoteEl = null;
let reincConfirmEl = null;

function deepClone(o) { return JSON.parse(JSON.stringify(o)); }

function getModeBaseLps(type) {
  if (currentMode === 'drought' && typeof type.droughtLps === 'number') return type.droughtLps;
  return type.baseLps;
}

function calculateStartingWater(permanentUpgradeIds = []) {
  return permanentUpgradeIds.reduce((sum, uid) => {
    const p = PERMANENT_UPGRADES.find(x => x.id === uid);
    return (p && p.effect === 'startWater') ? sum + p.value : sum;
  }, 0);
}

// ─── Save / Load ─────────────────────────────────────────────────
function saveGame() {
  const saveKey = getGameSaveKey(currentMode);
  localStorage.setItem(saveKey, JSON.stringify(state));
  if (currentMode === 'classic') {
    localStorage.setItem(LEGACY_SAVE_KEY, JSON.stringify(state));
  }
}

function loadGame() {
  try {
    let raw = localStorage.getItem(getGameSaveKey(currentMode));
    if (!raw && currentMode === 'classic') raw = localStorage.getItem(LEGACY_SAVE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    state = Object.assign(deepClone(DEFAULT_STATE), parsed);
    // Ensure all clicker types exist in owned map
    CLICKER_TYPES.forEach(t => {
      if (!(t.id in state.owned)) state.owned[t.id] = 0;
    });
    if (typeof state.reincarnationStoreViewedFor !== 'number') {
      state.reincarnationStoreViewedFor = 0;
    }
    if (typeof state.reincarnationReady !== 'boolean') {
      state.reincarnationReady = false;
    }
    if (typeof state.reincarnationThresholdsAwarded !== 'number') {
      state.reincarnationThresholdsAwarded = 0;
    }
    if (typeof state.startingWater !== 'number') {
      state.startingWater = calculateStartingWater(state.permanentUpgrades || []);
    }
    if (state.startingWater <= 0) {
      state.startingWater = calculateStartingWater(state.permanentUpgrades || []);
    }
    if (state.startingWater > 0) {
      if (state.water < state.startingWater) state.water = state.startingWater;
      if (state.totalWater < state.startingWater) state.totalWater = state.startingWater;
    }
  } catch (e) {
    console.warn('Could not load save:', e);
  }
}

// ─── Number formatting ────────────────────────────────────────────
function fmt(n) {
  if (!Number.isFinite(n)) return '0.0';
  const sign = n < 0 ? '-' : '';
  const value = Math.abs(n);
  if (value < 1e3) return sign + value.toFixed(1);

  const suffixes = ['K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'Ud', 'Dd', 'Td', 'Qd'];
  const tier = Math.floor(Math.log10(value) / 3);

  if (tier <= suffixes.length) {
    const scaled = value / Math.pow(10, tier * 3);
    const decimals = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
    const raw = scaled.toFixed(decimals);
    const cleaned = decimals > 0
      ? raw.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '').replace(/\.$/, '')
      : raw;
    return sign + cleaned + suffixes[tier - 1];
  }

  return sign + value.toExponential(2).replace('+', '');
}

// ─── Cost calculations ────────────────────────────────────────────
// Cost of buying `count` units starting from `owned` already held
function costForN(typeId, owned, count) {
  const base = CLICKER_TYPES.find(t => t.id === typeId).baseCost;
  const difficulty = getGameModeConfig(currentMode).difficulty.costMult;
  // Geometric-series sum: base × r^owned × (r^count − 1) / (r − 1)
  return base * difficulty * Math.pow(COST_MULT, owned)
       * (Math.pow(COST_MULT, count) - 1) / (COST_MULT - 1);
}

function singleCost(typeId) {
  const base = CLICKER_TYPES.find(t => t.id === typeId).baseCost;
  return base * getGameModeConfig(currentMode).difficulty.costMult * Math.pow(COST_MULT, state.owned[typeId]);
}

function upgradeCost(upgrade) {
  const difficulty = getGameModeConfig(currentMode).difficulty.upgradeCostMult || 1;
  return upgrade.cost * difficulty;
}

// ─── Multiplier helpers ───────────────────────────────────────────
function upgradeMultFor(target) {
  let m = 1;
  state.purchasedUpgrades.forEach(uid => {
    const u = UPGRADES.find(x => x.id === uid);
    if (u && u.target === target) m *= u.mult;
  });
  return m;
}

function permClickMult() {
  let mult = 1, bonus = 0;
  state.permanentUpgrades.forEach(uid => {
    const p = PERMANENT_UPGRADES.find(x => x.id === uid);
    if (!p) return;
    if (p.effect === 'clickMult')  mult  *= p.value;
    if (p.effect === 'bonusClick') bonus += p.value;
  });
  return { mult, bonus };
}

function permAutoMult() {
  let m = 1;
  state.permanentUpgrades.forEach(uid => {
    const p = PERMANENT_UPGRADES.find(x => x.id === uid);
    if (p && p.effect === 'autoMult') m *= p.value;
  });
  return m;
}

function getActiveBoostMult() {
  if (!activeBoost) return 1;
  if (Date.now() >= activeBoost.expiresAt) {
    activeBoost = null;
    updateBoostIndicator();
    return 1;
  }
  return activeBoost.mult;
}

function setActiveBoost(mult, durationMs) {
  activeBoost = {
    mult,
    expiresAt: Date.now() + durationMs,
    durationMs,
  };
  updateBoostIndicator();
}

function updateBoostIndicator() {
  const el = document.getElementById('golden-boost');
  if (!el) return;

  if (!activeBoost) {
    el.classList.add('hidden');
    return;
  }

  const remaining = Math.max(0, activeBoost.expiresAt - Date.now());
  const duration = activeBoost.durationMs || 8000;
  const pct = Math.max(0, Math.min(100, (remaining / duration) * 100));

  document.getElementById('golden-boost-label').textContent = `Golden Boost x${activeBoost.mult}`;
  document.getElementById('golden-boost-fill').style.width = pct + '%';
  el.classList.remove('hidden');
}

function clearGoldenDrop() {
  if (goldenDropElement) {
    goldenDropElement.remove();
    goldenDropElement = null;
  }
  if (goldenDropRemoveTimer) {
    clearTimeout(goldenDropRemoveTimer);
    goldenDropRemoveTimer = null;
  }
}

function awardGoldenDrop() {
  const roll = Math.random();
  if (roll < 0.6) {
    const reward = 777;
    state.water += reward;
    state.totalWater += reward;
    showMilestone('✨', `Golden Raindrop! +${fmt(reward)} L.`);
    updateDisplay();
    renderStore();
    saveGame();
    return;
  }

  const mult = roll < 0.9 ? 7 : 777;
  setActiveBoost(mult, 8000);
  showMilestone('🌟', `Golden Raindrop! x${mult} boost for 8 seconds.`);
  updateDisplay();
}

function spawnGoldenRaindrop() {
  const gameArea = document.getElementById('game-area');
  if (!gameArea || goldenDropElement) return;

  const drop = document.createElement('button');
  drop.type = 'button';
  drop.className = 'golden-drop';
  drop.setAttribute('aria-label', 'Golden raindrop reward');
  drop.textContent = '💧';

  const maxLeft = Math.max(20, gameArea.clientWidth - 80);
  const maxTop = Math.max(20, gameArea.clientHeight - 120);
  drop.style.left = `${20 + Math.random() * (maxLeft - 20)}px`;
  drop.style.top = `${60 + Math.random() * maxTop}px`;

  drop.addEventListener('click', () => {
    clearGoldenDrop();
    awardGoldenDrop();
  });

  gameArea.appendChild(drop);
  goldenDropElement = drop;

  goldenDropRemoveTimer = setTimeout(() => {
    clearGoldenDrop();
  }, 15000);
}

function computeClickValue() {
  const { mult, bonus } = permClickMult();
  const difficulty = getGameModeConfig(currentMode).difficulty.clickMult;
  return (upgradeMultFor('click') * mult + bonus) * difficulty * getActiveBoostMult();
}

function computeWPS() {
  const autoM = permAutoMult();
  const difficulty = getGameModeConfig(currentMode).difficulty.productionMult;
  const boost = getActiveBoostMult();
  return CLICKER_TYPES.reduce((sum, t) => {
    const n = state.owned[t.id];
    return sum + (n > 0 ? getModeBaseLps(t) * n * upgradeMultFor(t.id) * autoM * difficulty * boost : 0);
  }, 0);
}

// ─── Store rendering ─────────────────────────────────────────────
function renderUpgrades() {
  const el = document.getElementById('upgrades-list');
  const available = UPGRADES.filter(u => {
    if (state.purchasedUpgrades.includes(u.id)) return false;
    for (const [k, v] of Object.entries(u.req)) {
      if ((state.owned[k] || 0) < v) return false;
    }
    return true;
  });

  if (!available.length) {
    el.innerHTML = '<p class="no-upgrades">No upgrades available yet.</p>';
    return;
  }

  el.innerHTML = available.map(u => {
    const cost = upgradeCost(u);
    const canAfford = state.water >= cost;
    return `<div class="upgrade-item">
      <div class="upgrade-info">
        <div class="upgrade-name">⬆️ ${u.name}</div>
        <div class="upgrade-desc">${u.desc}</div>
        <div class="upgrade-cost">Cost: ${fmt(cost)} L</div>
      </div>
      <button class="upgrade-buy-btn"
              data-upgrade-id="${u.id}"
              onclick="buyUpgrade('${u.id}')"
              ${canAfford ? '' : 'disabled'}>Buy</button>
    </div>`;
  }).join('');
}

function renderAutoClickers() {
  const el = document.getElementById('autoclickers-list');
  el.innerHTML = CLICKER_TYPES.map(t => {
    const owned  = state.owned[t.id];
    const isMaxed = owned >= MAX_PER_TYPE;
    const cost   = isMaxed ? 0 : costForN(t.id, owned, bulkAmount);
    const canBuy = !isMaxed && state.water >= cost;
    const actualBulk = Math.min(bulkAmount, MAX_PER_TYPE - owned);
    const lpsEach = getModeBaseLps(t) * upgradeMultFor(t.id) * permAutoMult();

    let cls = 'clicker-item';
    if (isMaxed)    cls += ' maxed';
    else if (canBuy) cls += ' affordable';

    return `<div class="${cls}">
      <div class="clicker-emoji">${t.emoji}</div>
      <div class="clicker-info">
        <div class="clicker-name">${t.name}</div>
        <div class="clicker-desc">${t.desc}</div>
        <div class="clicker-stats">${fmt(lpsEach)} L/s each</div>
      </div>
      <div class="clicker-right">
        <div class="clicker-owned">${owned >= MAX_PER_TYPE ? 'MAX' : owned}</div>
        <button class="clicker-buy-btn"
                data-type-id="${t.id}"
                onclick="buyClicker('${t.id}')"
                ${canBuy ? '' : 'disabled'}>
          ${isMaxed ? 'MAX' : 'Buy ×' + actualBulk}
        </button>
        <div class="clicker-cost">${isMaxed ? '' : fmt(cost) + ' L'}</div>
      </div>
    </div>`;
  }).join('');
}

function renderStore() {
  renderUpgrades();
  renderAutoClickers();
}

function updateStoreAvailability() {
  document.querySelectorAll('.upgrade-buy-btn').forEach(btn => {
    const upgrade = UPGRADES.find(u => u.id === btn.dataset.upgradeId);
    if (!upgrade) return;
    btn.disabled = state.water < upgradeCost(upgrade);
  });

  document.querySelectorAll('.clicker-item').forEach(item => {
    const typeId = item.querySelector('.clicker-buy-btn')?.dataset.typeId;
    if (!typeId) return;

    const owned = state.owned[typeId];
    const isMaxed = owned >= MAX_PER_TYPE;
    const cost = isMaxed ? 0 : costForN(typeId, owned, bulkAmount);
    const canBuy = !isMaxed && state.water >= cost;

    item.classList.toggle('affordable', canBuy);
    item.classList.toggle('maxed', isMaxed);

    const buyBtn = item.querySelector('.clicker-buy-btn');
    const costEl = item.querySelector('.clicker-cost');
    const ownedEl = item.querySelector('.clicker-owned');
    if (buyBtn) {
      buyBtn.disabled = !canBuy;
      buyBtn.textContent = isMaxed ? 'MAX' : 'Buy ×' + Math.min(bulkAmount, MAX_PER_TYPE - owned);
    }
    if (costEl) costEl.textContent = isMaxed ? '' : fmt(cost) + ' L';
    if (ownedEl) ownedEl.textContent = isMaxed ? 'MAX' : owned;
  });
}

// ─── Buy actions ─────────────────────────────────────────────────
function buyClicker(typeId) {
  const owned = state.owned[typeId];
  if (owned >= MAX_PER_TYPE) return;
  const count = Math.min(bulkAmount, MAX_PER_TYPE - owned);
  const cost  = costForN(typeId, owned, count);
  if (state.water < cost) return;
  state.water         -= cost;
  state.owned[typeId] += count;
  renderStore();
  updateDisplay();
  saveGame();
}

function buyUpgrade(upgradeId) {
  const u = UPGRADES.find(x => x.id === upgradeId);
  if (!u || state.purchasedUpgrades.includes(upgradeId)) return;
  const cost = upgradeCost(u);
  if (state.water < cost) return;
  state.water -= cost;
  state.purchasedUpgrades.push(upgradeId);
  renderStore();
  updateDisplay();
  saveGame();
}

// ─── Bulk amount selector ─────────────────────────────────────────
function setBulk(amount) {
  bulkAmount = amount;
  document.querySelectorAll('.bulk-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.bulk) === amount);
  });
  renderAutoClickers();
}

// ─── Visual click feedback (Improvement 1) ───────────────────────
function spawnFloatingText(wrapperEl, text) {
  const span = document.createElement('span');
  span.className = 'floating-text';
  span.textContent = text;
  // Randomise horizontal offset slightly so multiple clicks don't stack
  const offsetX = (Math.random() - 0.5) * 60;
  span.style.left = `calc(50% + ${offsetX}px)`;
  span.style.top  = '30%';
  span.style.transform = 'translateX(-50%)';  // keep centred on offset
  wrapperEl.appendChild(span);
  span.addEventListener('animationend', () => span.remove());
}

function spawnRipple(wrapperEl, relX, relY) {
  const div = document.createElement('div');
  div.className = 'ripple';
  div.style.left = relX + 'px';
  div.style.top  = relY + 'px';
  wrapperEl.appendChild(div);
  div.addEventListener('animationend', () => div.remove());
}

// ─── Milestone checker (Improvement 2) ───────────────────────────
let milestoneTimeout = null;

function checkMilestones() {
  for (const m of MILESTONES) {
    if (!m.triggered && state.totalWater >= m.water) {
      m.triggered = true;
      showMilestone(m.icon, m.msg);
    }
  }
}

function showMilestone(icon, msg) {
  const popup  = document.getElementById('milestone-popup');
  document.getElementById('milestone-icon').textContent    = icon;
  document.getElementById('milestone-message').textContent = msg;
  popup.classList.remove('hidden');
  // Auto-dismiss after 7 s
  clearTimeout(milestoneTimeout);
  milestoneTimeout = setTimeout(() => popup.classList.add('hidden'), 7000);
}

// ─── Well click handler ───────────────────────────────────────────
function onWellClick(e) {
  const val     = computeClickValue();
  state.water      += val;
  state.totalWater += val;

  const wrapper = document.getElementById('well-wrapper');
  spawnFloatingText(wrapper, '+' + fmt(val) + ' L');

  // Ripple at click position relative to wrapper
  const rect = wrapper.getBoundingClientRect();
  const relX = (e.clientX || rect.left + rect.width  / 2) - rect.left;
  const relY = (e.clientY || rect.top  + rect.height / 2) - rect.top;
  spawnRipple(wrapper, relX, relY);

  checkMilestones();
  updateDisplay();
  renderStore();
}

// ─── Reincarnation ────────────────────────────────────────────────
function checkReincarnateBtn() {
  const canReincarnate = state.reincarnationReady === true;
  const reincBtn = reincBtnEl || (reincBtnEl = document.getElementById('reincarnate-btn'));
  const lockedNote = reincLockedNoteEl || (reincLockedNoteEl = document.getElementById('reinc-locked-note'));

  if (!reincBtn || !lockedNote) return;

  reincBtn.classList.toggle('locked', !canReincarnate);
  reincBtn.disabled = !canReincarnate;
  lockedNote.classList.toggle('hidden', canReincarnate);

  if (!canReincarnate) reincBtn.classList.remove('hidden');
}

function setReincarnationWarningVisible(isVisible) {
  const confirmBox = reincConfirmEl || (reincConfirmEl = document.getElementById('reinc-confirm'));
  if (!confirmBox) return;
  confirmBox.classList.toggle('hidden', !isVisible);
}

function resetForReincarnation() {
  state.reincarnations      += 1;
  state.reincarnationStoreViewedFor = state.reincarnations - 1;

  // Apply "freeUnit" permanent upgrades before resetting
  const freeUnits = {};
  state.permanentUpgrades.forEach(uid => {
    const p = PERMANENT_UPGRADES.find(x => x.id === uid);
    if (p && p.effect === 'freeUnit') {
      freeUnits[p.value] = (freeUnits[p.value] || 0) + 1;
    }
  });

  // Calculate starting water from permanent upgrades
  let startWater = 0;
  state.permanentUpgrades.forEach(uid => {
    const p = PERMANENT_UPGRADES.find(x => x.id === uid);
    if (p && p.effect === 'startWater') startWater += p.value;
  });

  // Preserve permanent data
  const keepRP    = state.reincarnationPoints;
  const keepReinc = state.reincarnations;
  const keepPerma = state.permanentUpgrades.slice();

  // Reset cycle state
  state = deepClone(DEFAULT_STATE);
  state.reincarnationPoints = keepRP;
  state.reincarnations      = keepReinc;
  state.permanentUpgrades   = keepPerma;
  state.startingWater       = startWater;
  state.reincarnationReady  = false;
  state.reincarnationThresholdsAwarded = 0;
  state.water               = startWater;
  state.totalWater          = startWater;

  // Apply free units
  for (const [typeId, count] of Object.entries(freeUnits)) {
    if (typeId in state.owned) state.owned[typeId] += count;
  }

  // Re-arm milestones
  MILESTONES.forEach(m => { m.triggered = false; });

  saveGame();
  renderStore();
  updateDisplay();
  return true;
}

function processReincarnationThreshold() {
  const startWater = calculateStartingWater(state.permanentUpgrades || []);
  if (state.startingWater !== startWater) state.startingWater = startWater;

  const progressWater = Math.max(0, state.totalWater - state.startingWater);
  const completedThresholds = Math.floor(progressWater / REINC_THRESHOLD);
  const newThresholds = completedThresholds - (state.reincarnationThresholdsAwarded || 0);
  state.reincarnationReady = progressWater >= REINC_THRESHOLD;

  if (newThresholds <= 0) return false;

  state.reincarnationPoints += newThresholds;
  state.reincarnationThresholdsAwarded = completedThresholds;

  saveGame();
  return true;
}

function doReincarnate() {
  if (state.reincarnationReady !== true) return;

  reincWarningOpen = false;
  setReincarnationWarningVisible(false);
  resetForReincarnation();
  window.location.href = 'reincarnation.html';
}

function openReincarnationWarning() {
  if (state.reincarnationReady !== true) return;
  reincWarningOpen = true;
  setReincarnationWarningVisible(true);
}

function acceptReincarnation() {
  doReincarnate();
}

function declineReincarnation() {
  reincWarningOpen = false;
  setReincarnationWarningVisible(false);
}

// ─── Display update ───────────────────────────────────────────────
function updateDisplay() {
  processReincarnationThreshold();

  const wps = computeWPS();
  const cpv = computeClickValue();

  document.getElementById('water-count').textContent    = fmt(state.water);
  document.getElementById('water-rate').textContent     = fmt(wps);
  document.getElementById('water-per-click').textContent = fmt(cpv);
  document.getElementById('reinc-count').textContent    = state.reincarnations;
  document.getElementById('rp-count').textContent       = fmt(state.reincarnationPoints);

  // Progress bar toward 1T (Improvement 3)
  const progressWater = Math.max(0, state.totalWater - state.startingWater);
  const cycleProgressWater = Math.max(0, progressWater - ((state.reincarnationThresholdsAwarded || 0) * REINC_THRESHOLD));
  const barIsPinnedFull = wps >= REINC_THRESHOLD;
  const pct = barIsPinnedFull ? 100 : Math.min(cycleProgressWater / REINC_THRESHOLD * 100, 100);
  const remainingWater = Math.max(0, REINC_THRESHOLD - progressWater);
  const estimatedSecondsToGoal = wps > 0 ? remainingWater / wps : Infinity;
  const progressBarInner = document.getElementById('progress-bar');
  progressBarInner.classList.toggle('solid', barIsPinnedFull || estimatedSecondsToGoal <= 12);
  progressBarInner.style.width = pct + '%';
  document.getElementById('progress-text').textContent =
    fmt(cycleProgressWater) + ' / 1T Liters';

  updateStoreAvailability();
  updateBoostIndicator();
  checkReincarnateBtn();
}

// ─── Game loop (passive production) ──────────────────────────────
function gameTick() {
  const now   = Date.now();
  const delta = (now - lastUpdate) / 1000; // seconds
  lastUpdate  = now;

  if (activeBoost && now >= activeBoost.expiresAt) {
    activeBoost = null;
  }

  const wps = computeWPS();
  if (wps > 0) {
    const gain        = wps * delta;
    state.water      += gain;
    state.totalWater += gain;
    checkMilestones();
  }

  processReincarnationThreshold();
  updateDisplay();
}

// ─── Initialisation ───────────────────────────────────────────────
function init() {
  currentMode = setSelectedGameMode(getSelectedGameMode());
  applyGameTheme(currentMode);
  document.body.classList.toggle('mode-drought', currentMode === 'drought');
  document.body.classList.toggle('mode-classic', currentMode === 'classic');

  reincBtnEl = document.getElementById('reincarnate-btn');
  reincLockedNoteEl = document.getElementById('reinc-locked-note');
  reincConfirmEl = document.getElementById('reinc-confirm');

  loadGame();

  // Re-arm already-passed milestones as triggered so they don't fire again on load
  MILESTONES.forEach(m => {
    if (state.totalWater >= m.water) m.triggered = true;
  });

  processReincarnationThreshold();

  renderStore();
  updateDisplay();
  lastUpdate = Date.now();

  updateModeButtons();
  updateBoostIndicator();
  clearGoldenDrop();

  goldenDropSpawnTimer = setInterval(spawnGoldenRaindrop, 5 * 60 * 1000);
  setTimeout(spawnGoldenRaindrop, 5 * 60 * 1000);

  // Game tick every 100 ms
  setInterval(gameTick, 100);
  // Auto-save every 10 s
  setInterval(saveGame, 10000);

  // ── Event listeners ────────────────────────────────────────────
  // Hamburger
  const hamburger   = document.getElementById('hamburger');
  const storePanel  = document.getElementById('store-panel');
  hamburger.addEventListener('click', () => {
    storeOpen = !storeOpen;
    hamburger.classList.toggle('open', storeOpen);
    storePanel.classList.toggle('open', storeOpen);
    hamburger.setAttribute('aria-expanded', storeOpen);
    storePanel.setAttribute('aria-hidden', !storeOpen);
  });

  // Well click (mouse)
  const wrapper = document.getElementById('well-wrapper');
  wrapper.addEventListener('click', onWellClick);
  // Keyboard support
  wrapper.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onWellClick(e); }
  });

  // Bulk buttons
  document.querySelectorAll('.bulk-btn').forEach(btn => {
    btn.addEventListener('click', () => setBulk(parseInt(btn.dataset.bulk)));
  });

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => switchGameMode(btn.dataset.mode));
  });

  // Keep store interactions from bubbling up to the document close handler
  storePanel.addEventListener('click', e => {
    if (e.target.closest('.upgrade-buy-btn, .clicker-buy-btn, .bulk-btn, .reincarnate-btn')) {
      e.stopPropagation();
    }
  });

  // Milestone dismiss
  document.getElementById('milestone-close').addEventListener('click', () => {
    document.getElementById('milestone-popup').classList.add('hidden');
  });

  // Close store when clicking outside of it
  document.addEventListener('click', e => {
    if (storeOpen &&
        !storePanel.contains(e.target) &&
        !hamburger.contains(e.target)) {
      storeOpen = false;
      hamburger.classList.remove('open');
      storePanel.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
      storePanel.setAttribute('aria-hidden', true);
    }
  });
}

function updateModeButtons() {
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === currentMode);
  });
}

function switchGameMode(mode) {
  const nextMode = normalizeGameMode(mode);
  if (nextMode === currentMode) return;

  saveGame();
  setSelectedGameMode(nextMode);
  window.location.href = `index.html?mode=${nextMode}`;
}

// PERMANENT_UPGRADES is defined in config.js (loaded before this script in index.html)

document.addEventListener('DOMContentLoaded', init);
