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
      reincarnationPoints: 0, reincarnationStoreViewedFor: 0,
      owned: {}, purchasedUpgrades: [], permanentUpgrades: []
    };
  }
  if (!state.permanentUpgrades) state.permanentUpgrades   = [];
  if (!state.reincarnationPoints) state.reincarnationPoints = 0;
  if (typeof state.reincarnationStoreViewedFor !== 'number') state.reincarnationStoreViewedFor = 0;
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
  if (n < 1e3)  return n.toFixed(1);
  if (n < 1e6)  return (n / 1e3).toFixed(2)  + 'K';
  if (n < 1e9)  return (n / 1e6).toFixed(2)  + 'M';
  if (n < 1e12) return (n / 1e9).toFixed(2)  + 'B';
  return              (n / 1e12).toFixed(2) + 'T';
}

// ─── Render permanent upgrades grid ──────────────────────────────
function renderGrid() {
  document.getElementById('rp-display').textContent  = state.reincarnationPoints;
  document.getElementById('stat-reinc').textContent  = state.reincarnations;
  document.getElementById('stat-best').textContent   =
    state.totalWater > 0 ? fmt(state.totalWater) + ' L' : '—';

  const grid = document.getElementById('perma-grid');
  grid.innerHTML = PERMANENT_UPGRADES.map(p => {
    const owned      = state.permanentUpgrades.includes(p.id);
    const canAfford  = !owned && state.reincarnationPoints >= p.cost;
    let cls = 'perma-upgrade-card';
    if (owned)     cls += ' owned';
    else if (canAfford) cls += ' affordable';

    return `<div class="${cls}">
      <div class="perma-card-icon">${p.icon}</div>
      <div class="perma-card-name">${p.name}</div>
      <div class="perma-card-desc">${p.desc}</div>
      <div class="perma-card-cost">
        ${owned ? '✅ Purchased' : p.cost + ' RP'}
      </div>
      <button class="perma-card-btn"
              onclick="buyPermanent('${p.id}')"
              ${owned || !canAfford ? 'disabled' : ''}>
        ${owned ? 'Owned' : 'Purchase'}
      </button>
    </div>`;
  }).join('');
}

// ─── Buy permanent upgrade ────────────────────────────────────────
function buyPermanent(upgradeId) {
  const p = PERMANENT_UPGRADES.find(x => x.id === upgradeId);
  if (!p) return;
  if (state.permanentUpgrades.includes(upgradeId)) return;
  if (state.reincarnationPoints < p.cost) return;

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
