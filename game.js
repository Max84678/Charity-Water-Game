/* ============================================================
   game.js — Charity: Water Game  (main game logic)
   ============================================================ */

// ─── Constants ───────────────────────────────────────────────────
const COST_MULT      = 1.15;
const MAX_PER_TYPE   = 10000;
const REINC_THRESHOLD = 1e12; // 1 trillion litres

const CLICKER_TYPES = [
  { id:'bucket',    name:'Bucket Brigade',  emoji:'🪣', desc:'Villagers carry water by hand.',           baseCost:10,      baseLps:0.1   },
  { id:'handpump',  name:'Hand Pump',        emoji:'💧', desc:'A simple mechanical hand pump.',           baseCost:100,     baseLps:0.5   },
  { id:'village',   name:'Village Well',     emoji:'🏘️', desc:'A shared well serving the community.',    baseCost:1100,    baseLps:3     },
  { id:'solar',     name:'Solar Pump',       emoji:'☀️', desc:'Solar-powered water extraction.',         baseCost:12000,   baseLps:16    },
  { id:'borehole',  name:'Borehole',         emoji:'⛏️', desc:'Deep drilled underground aquifer.',       baseCost:130000,  baseLps:90    },
  { id:'pipeline',  name:'Water Pipeline',   emoji:'🔩', desc:'A pipe network across many villages.',    baseCost:1400000, baseLps:500   },
  { id:'treatment', name:'Treatment Plant',  emoji:'🏭', desc:'Purifies water for an entire region.',    baseCost:2e7,     baseLps:2800  },
  { id:'grid',      name:'National Grid',    emoji:'🌐', desc:'Country-wide clean water infrastructure.',baseCost:3.3e8,   baseLps:15000 },
];

// One-time purchasable upgrades (shown above auto-clickers in store)
const UPGRADES = [
  // Click upgrades
  { id:'cu1', name:'Stronger Arms',   desc:'Double your click power.',       target:'click',    mult:2,  cost:50,      req:{} },
  { id:'cu2', name:'Water Vessel',    desc:'Double your click power again.', target:'click',    mult:2,  cost:5e3,     req:{} },
  { id:'cu3', name:'Efficient Draw',  desc:'Click power ×5.',                target:'click',    mult:5,  cost:5e4,     req:{} },
  { id:'cu4', name:'Master Hand',     desc:'Click power ×10.',               target:'click',    mult:10, cost:5e6,     req:{} },
  // Bucket Brigade
  { id:'bu1', name:'Bigger Buckets',  desc:'Bucket Brigades produce 2×.',    target:'bucket',   mult:2,  cost:100,     req:{bucket:1}    },
  { id:'bu2', name:'Water Relay',     desc:'Bucket Brigades produce 2×.',    target:'bucket',   mult:2,  cost:500,     req:{bucket:5}    },
  { id:'bu3', name:'Expert Carriers', desc:'Bucket Brigades produce 5×.',    target:'bucket',   mult:5,  cost:5000,    req:{bucket:25}   },
  // Hand Pump
  { id:'hp1', name:'Better Seals',    desc:'Hand Pumps produce 2×.',         target:'handpump', mult:2,  cost:1000,    req:{handpump:1}  },
  { id:'hp2', name:'Pump Overhaul',   desc:'Hand Pumps produce 2×.',         target:'handpump', mult:2,  cost:5000,    req:{handpump:5}  },
  { id:'hp3', name:'Turbo Pump',      desc:'Hand Pumps produce 5×.',         target:'handpump', mult:5,  cost:5e4,     req:{handpump:25} },
  // Village Well
  { id:'vw1', name:'Deeper Shaft',    desc:'Village Wells produce 2×.',      target:'village',  mult:2,  cost:11000,   req:{village:1}   },
  { id:'vw2', name:'Lined Shaft',     desc:'Village Wells produce 2×.',      target:'village',  mult:2,  cost:55000,   req:{village:5}   },
  { id:'vw3', name:'Community Pool',  desc:'Village Wells produce 5×.',      target:'village',  mult:5,  cost:5.5e5,   req:{village:25}  },
  // Solar Pump
  { id:'sp1', name:'Better Panels',   desc:'Solar Pumps produce 2×.',        target:'solar',    mult:2,  cost:1.2e5,   req:{solar:1}     },
  { id:'sp2', name:'Battery Storage', desc:'Solar Pumps produce 2×.',        target:'solar',    mult:2,  cost:6e5,     req:{solar:5}     },
  { id:'sp3', name:'Solar Farm',      desc:'Solar Pumps produce 5×.',        target:'solar',    mult:5,  cost:6e6,     req:{solar:25}    },
  // Borehole
  { id:'br1', name:'Diamond Drill',   desc:'Boreholes produce 2×.',          target:'borehole', mult:2,  cost:1.3e6,   req:{borehole:1}  },
  { id:'br2', name:'High-Flow Pump',  desc:'Boreholes produce 2×.',          target:'borehole', mult:2,  cost:6.5e6,   req:{borehole:5}  },
  { id:'br3', name:'Aquifer Tap',     desc:'Boreholes produce 5×.',          target:'borehole', mult:5,  cost:6.5e7,   req:{borehole:25} },
  // Pipeline
  { id:'pl1', name:'Wider Pipes',     desc:'Pipelines produce 2×.',          target:'pipeline', mult:2,  cost:1.4e7,   req:{pipeline:1}  },
  { id:'pl2', name:'High Pressure',   desc:'Pipelines produce 2×.',          target:'pipeline', mult:2,  cost:7e7,     req:{pipeline:5}  },
  { id:'pl3', name:'Smart Valves',    desc:'Pipelines produce 5×.',          target:'pipeline', mult:5,  cost:7e8,     req:{pipeline:25} },
  // Treatment Plant
  { id:'tp1', name:'Better Filters',  desc:'Treatment Plants produce 2×.',   target:'treatment',mult:2,  cost:2e8,     req:{treatment:1} },
  { id:'tp2', name:'UV System',       desc:'Treatment Plants produce 2×.',   target:'treatment',mult:2,  cost:1e9,     req:{treatment:5} },
  { id:'tp3', name:'Nano Filters',    desc:'Treatment Plants produce 5×.',   target:'treatment',mult:5,  cost:1e10,    req:{treatment:25}},
  // National Grid
  { id:'ng1', name:'Smart Meters',    desc:'National Grid produces 2×.',     target:'grid',     mult:2,  cost:3.3e9,   req:{grid:1}      },
  { id:'ng2', name:'AI Management',   desc:'National Grid produces 2×.',     target:'grid',     mult:2,  cost:1.65e10, req:{grid:5}      },
  { id:'ng3', name:'Global Network',  desc:'National Grid produces 5×.',     target:'grid',     mult:5,  cost:1.65e11, req:{grid:25}     },
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

// ─── Default / fresh game state ──────────────────────────────────
const DEFAULT_STATE = {
  water:              0,
  totalWater:         0,   // this reincarnation cycle
  reincarnations:     0,
  reincarnationPoints:0,
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

function deepClone(o) { return JSON.parse(JSON.stringify(o)); }

// ─── Save / Load ─────────────────────────────────────────────────
function saveGame() {
  localStorage.setItem('cwgame_v1', JSON.stringify(state));
}

function loadGame() {
  try {
    const raw = localStorage.getItem('cwgame_v1');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    state = Object.assign(deepClone(DEFAULT_STATE), parsed);
    // Ensure all clicker types exist in owned map
    CLICKER_TYPES.forEach(t => {
      if (!(t.id in state.owned)) state.owned[t.id] = 0;
    });
  } catch (e) {
    console.warn('Could not load save:', e);
  }
}

// ─── Number formatting ────────────────────────────────────────────
function fmt(n) {
  if (n <  1e3)  return n.toFixed(1);
  if (n <  1e6)  return (n / 1e3).toFixed(2)  + 'K';
  if (n <  1e9)  return (n / 1e6).toFixed(2)  + 'M';
  if (n <  1e12) return (n / 1e9).toFixed(2)  + 'B';
  if (n <  1e15) return (n / 1e12).toFixed(2) + 'T';
  if (n <  1e18) return (n / 1e15).toFixed(2) + 'Qa';
  return              (n / 1e18).toFixed(2) + 'Qi';
}

// ─── Cost calculations ────────────────────────────────────────────
// Cost of buying `count` units starting from `owned` already held
function costForN(typeId, owned, count) {
  const base = CLICKER_TYPES.find(t => t.id === typeId).baseCost;
  // Geometric-series sum: base × r^owned × (r^count − 1) / (r − 1)
  return base * Math.pow(COST_MULT, owned)
       * (Math.pow(COST_MULT, count) - 1) / (COST_MULT - 1);
}

function singleCost(typeId) {
  const base = CLICKER_TYPES.find(t => t.id === typeId).baseCost;
  return base * Math.pow(COST_MULT, state.owned[typeId]);
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

function computeClickValue() {
  const { mult, bonus } = permClickMult();
  return upgradeMultFor('click') * mult + bonus;
}

function computeWPS() {
  const autoM = permAutoMult();
  return CLICKER_TYPES.reduce((sum, t) => {
    const n = state.owned[t.id];
    return sum + (n > 0 ? t.baseLps * n * upgradeMultFor(t.id) * autoM : 0);
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
    const canAfford = state.water >= u.cost;
    return `<div class="upgrade-item">
      <div class="upgrade-info">
        <div class="upgrade-name">⬆️ ${u.name}</div>
        <div class="upgrade-desc">${u.desc}</div>
        <div class="upgrade-cost">Cost: ${fmt(u.cost)} L</div>
      </div>
      <button class="upgrade-buy-btn"
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
    const lpsEach = t.baseLps * upgradeMultFor(t.id) * permAutoMult();

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
  if (state.water < u.cost) return;
  state.water -= u.cost;
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
  const eligible = state.totalWater >= REINC_THRESHOLD;
  document.getElementById('reincarnate-btn').classList.toggle('hidden', !eligible);
  if (state.reincarnations > 0) {
    document.getElementById('reinc-store-link').classList.remove('hidden');
  }
}

function doReincarnate() {
  if (state.totalWater < REINC_THRESHOLD) return;
  const rpEarned = Math.floor(state.totalWater / REINC_THRESHOLD);
  if (!confirm(
    `Reincarnate?\n\nYou will earn ${rpEarned} Reincarnation Point(s).\n` +
    `All water, auto-clickers and regular upgrades will reset.\n` +
    `Permanent upgrades and RP are kept forever.`
  )) return;

  state.reincarnationPoints += rpEarned;
  state.reincarnations      += 1;

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

  // Redirect to reincarnation upgrade store
  window.location.href = 'reincarnation.html';
}

// ─── Display update ───────────────────────────────────────────────
function updateDisplay() {
  const wps = computeWPS();
  const cpv = computeClickValue();

  document.getElementById('water-count').textContent    = fmt(state.water);
  document.getElementById('water-rate').textContent     = fmt(wps);
  document.getElementById('water-per-click').textContent = fmt(cpv);
  document.getElementById('reinc-count').textContent    = state.reincarnations;
  document.getElementById('rp-count').textContent       = state.reincarnationPoints;

  // Progress bar toward 1T (Improvement 3)
  const pct = Math.min(state.totalWater / REINC_THRESHOLD * 100, 100);
  document.getElementById('progress-bar').style.width = pct + '%';
  document.getElementById('progress-text').textContent =
    fmt(state.totalWater) + ' / 1T Liters';

  checkReincarnateBtn();
}

// ─── Game loop (passive production) ──────────────────────────────
function gameTick() {
  const now   = Date.now();
  const delta = (now - lastUpdate) / 1000; // seconds
  lastUpdate  = now;

  const wps = computeWPS();
  if (wps > 0) {
    const gain        = wps * delta;
    state.water      += gain;
    state.totalWater += gain;
    checkMilestones();
  }

  updateDisplay();
}

// ─── Initialisation ───────────────────────────────────────────────
function init() {
  loadGame();

  // Re-arm already-passed milestones as triggered so they don't fire again on load
  MILESTONES.forEach(m => {
    if (state.totalWater >= m.water) m.triggered = true;
  });

  renderStore();
  updateDisplay();
  lastUpdate = Date.now();

  // Game tick every 100 ms
  setInterval(gameTick, 100);
  // Auto-save every 10 s
  setInterval(saveGame, 10000);
  // Refresh store affordability every 500 ms
  setInterval(renderStore, 500);

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

// PERMANENT_UPGRADES is defined in config.js (loaded before this script in index.html)

document.addEventListener('DOMContentLoaded', init);
