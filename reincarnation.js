/* ============================================================
   reincarnation.js — Permanent upgrade store
   ============================================================ */

// PERMANENT_UPGRADES is defined in config.js (loaded before this script in reincarnation.html)

let currentMode = normalizeGameMode(getSelectedGameMode());

// ─── Load state from localStorage ────────────────────────────────
let state = null;

function loadState() {
  try {
    let raw = localStorage.getItem(getGameSaveKey(currentMode));
    if (!raw && currentMode === 'classic') raw = localStorage.getItem(LEGACY_SAVE_KEY);
    if (raw) state = JSON.parse(raw);
  } catch(e) {
    console.warn('Could not load save:', e);
  }
  if (!state) {
    state = {
      water: 0, totalWater: 0, reincarnations: 0,
      startingWater: 0,
      reincarnationPoints: 0, reincarnationStoreViewedFor: 0,
      owned: {}, purchasedUpgrades: [], permanentUpgrades: []
    };
  }
  if (!state.permanentUpgrades) state.permanentUpgrades   = [];
  if (!state.reincarnationPoints) state.reincarnationPoints = 0;
  if (typeof state.reincarnationStoreViewedFor !== 'number') state.reincarnationStoreViewedFor = 0;
  if (typeof state.startingWater !== 'number' || state.startingWater <= 0) {
    state.startingWater = calculateStartingWater(state.permanentUpgrades);
  }
  if (state.startingWater > 0) {
    if (state.water < state.startingWater) state.water = state.startingWater;
    if (state.totalWater < state.startingWater) state.totalWater = state.startingWater;
  }
}

function saveState() {
  const saveKey = getGameSaveKey(currentMode);
  localStorage.setItem(saveKey, JSON.stringify(state));
  if (currentMode === 'classic') {
    localStorage.setItem(LEGACY_SAVE_KEY, JSON.stringify(state));
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
    const cleaned = scaled.toFixed(decimals).replace(/\.0+$|0+$/,'').replace(/\.$/, '');
    return sign + cleaned + suffixes[tier - 1];
  }

  return sign + value.toExponential(2).replace('+', '');
}

function calculateStartingWater(permanentUpgradeIds = []) {
  return permanentUpgradeIds.reduce((sum, uid) => {
    const p = PERMANENT_UPGRADES.find(x => x.id === uid);
    return (p && p.effect === 'startWater') ? sum + p.value : sum;
  }, 0);
}

const RESEARCH_BRANCHES = [
  { id: 'water', title: 'Water Storage', icon: '🏞️', desc: 'Future cycles start stronger.' },
  { id: 'click', title: 'Manual Flow', icon: '💪', desc: 'Boosts every well click.' },
  { id: 'auto', title: 'Auto Flow', icon: '🪣', desc: 'Improves passive production.' },
];

function isResearchUnlocked(upgrade) {
  return (upgrade.requires || []).every(reqId => state.permanentUpgrades.includes(reqId));
}

function buildResearchTree() {
  return RESEARCH_BRANCHES.map(branch => {
    const nodes = PERMANENT_UPGRADES.filter(p => p.branch === branch.id);
    const nodeMarkup = nodes.map(p => {
      const owned = state.permanentUpgrades.includes(p.id);
      const unlocked = owned || isResearchUnlocked(p);
      const canAfford = !owned && unlocked && state.reincarnationPoints >= p.cost;
      const prereqText = (p.requires && p.requires.length)
        ? 'Requires: ' + p.requires.map(reqId => PERMANENT_UPGRADES.find(x => x.id === reqId)?.name || reqId).join(', ')
        : 'Root research';

      let cls = 'research-node';
      if (owned) cls += ' owned';
      else if (canAfford) cls += ' affordable';
      else if (!unlocked) cls += ' locked';

      return `<div class="${cls}">
        <div class="perma-upgrade-card">
          <div class="perma-card-icon">${p.icon}</div>
          <div class="perma-card-name">${p.name}</div>
          <div class="perma-card-desc">${p.desc}</div>
          <div class="research-prereq">${prereqText}</div>
          <div class="perma-card-cost">
            ${owned ? '✅ Purchased' : p.cost + ' RP'}
          </div>
          <button class="perma-card-btn"
                  onclick="buyPermanent('${p.id}')"
                  ${owned || !canAfford ? 'disabled' : ''}>
            ${owned ? 'Owned' : unlocked ? 'Research' : 'Locked'}
          </button>
        </div>
      </div>`;
    }).join('');

    return `<section class="research-branch">
      <div class="research-branch-header">
        <div class="research-branch-icon">${branch.icon}</div>
        <div>
          <h3>${branch.title}</h3>
          <p>${branch.desc}</p>
        </div>
      </div>
      <div class="research-branch-track">${nodeMarkup}</div>
    </section>`;
  }).join('');
}

// ─── Render permanent upgrades grid ──────────────────────────────
function renderGrid() {
  document.getElementById('rp-display').textContent  = fmt(state.reincarnationPoints);
  document.getElementById('stat-reinc').textContent  = state.reincarnations;
  document.getElementById('stat-best').textContent   =
    state.totalWater > 0 ? fmt(state.totalWater) + ' L' : '—';

  const grid = document.getElementById('perma-grid');
  grid.innerHTML = buildResearchTree();
}

// ─── Buy permanent upgrade ────────────────────────────────────────
function buyPermanent(upgradeId) {
  const p = PERMANENT_UPGRADES.find(x => x.id === upgradeId);
  if (!p) return;
  if (state.permanentUpgrades.includes(upgradeId)) return;
  if (state.reincarnationPoints < p.cost) return;
  if (!isResearchUnlocked(p)) return;

  state.reincarnationPoints -= p.cost;
  state.permanentUpgrades.push(upgradeId);
  saveState();
  renderGrid();
}

function syncStoreVisibility() {
  const openForCurrentCycle = state.reincarnations > state.reincarnationStoreViewedFor;
  const header = document.getElementById('reinc-header');
  const grid = document.querySelector('.perma-upgrades-grid');
  const rpBalance = document.querySelector('.rp-balance');
  const stats = document.querySelector('.reinc-stats');
  const returnBtn = document.querySelector('.return-btn');
  const locked = document.getElementById('store-locked');

  if (header) header.classList.toggle('hidden', !openForCurrentCycle);
  if (locked) locked.classList.toggle('hidden', openForCurrentCycle);
  if (grid) grid.classList.toggle('hidden', !openForCurrentCycle);
  if (rpBalance) rpBalance.classList.toggle('hidden', !openForCurrentCycle);
  if (stats) stats.classList.toggle('hidden', !openForCurrentCycle);
  if (returnBtn) returnBtn.classList.remove('hidden');
}

// ─── Return to game ───────────────────────────────────────────────
function returnToGame() {
  state.reincarnationStoreViewedFor = state.reincarnations;
  state.startingWater = calculateStartingWater(state.permanentUpgrades);
  if (state.startingWater > 0) {
    if (state.water < state.startingWater) state.water = state.startingWater;
    if (state.totalWater < state.startingWater) state.totalWater = state.startingWater;
  }
  saveState();
  window.location.href = 'index.html';
}

// ─── Init ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  currentMode = setSelectedGameMode(getSelectedGameMode());
  applyGameTheme(currentMode);
  document.body.classList.toggle('mode-drought', currentMode === 'drought');
  document.body.classList.toggle('mode-classic', currentMode === 'classic');

  loadState();
  syncStoreVisibility();
  renderGrid();
});
