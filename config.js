/* ============================================================
   config.js — Shared constants used by game.js & reincarnation.js
   ============================================================ */

const GAME_MODE_STORAGE_KEY = 'cwgame_mode_v1';
const LEGACY_SAVE_KEY = 'cwgame_v1';

const GAME_MODES = {
  classic: {
    label: 'Classic Mode',
    saveKey: 'cwgame_classic_v1',
    theme: {
      bg: '#77A8BB',
      bgDark: '#5B8FA3',
      storeBg: '#12304A',
      storeItemBg: '#1A3C5B',
      storeItemHover: '#234F72',
      accent: '#FFC907',
      accentDark: '#D4A800',
      waterBlue: '#4A9EC8',
      waterLight: '#7BC4E0',
      text: '#FFFFFF',
      textMuted: 'rgba(255,255,255,0.65)',
      textDark: '#12304A',
      footerBg: '#FFFFFF',
      footerText: '#4B5563',
      footerBorder: 'rgba(18,48,74,0.12)',
      footerLogoFilter: 'none',
      footerLogoSrc: '07ba71b4-cace-4d28-b026-58a64e21128c-1647885411174.png',
    },
    difficulty: {
      costMult: 1,
      productionMult: 1,
      clickMult: 1,
    },
  },
  drought: {
    label: 'Drought Mode',
    saveKey: 'cwgame_drought_v1',
    theme: {
      bg: '#FFC907',
      bgDark: '#D4A800',
      storeBg: '#2B2200',
      storeItemBg: '#423300',
      storeItemHover: '#5E4900',
      accent: '#FFF1A8',
      accentDark: '#E6D37A',
      waterBlue: '#8C5A00',
      waterLight: '#B87A00',
      text: '#FFFFFF',
      textMuted: 'rgba(255,255,255,0.74)',
      textDark: '#1E1600',
      footerBg: '#000000',
      footerText: '#FFFFFF',
      footerBorder: 'rgba(255,255,255,0.15)',
      footerLogoFilter: 'brightness(0) invert(1)',
      footerLogoSrc: '65ccd832c69e7c2e566c5445_charity water banner_white.png',
    },
    difficulty: {
      costMult: 3,
      productionMult: 0.8,
      clickMult: 0.2,
      upgradeCostMult: 10,
    },
  },
};

function normalizeGameMode(mode) {
  return mode === 'drought' ? 'drought' : 'classic';
}

function getSelectedGameMode() {
  if (typeof window === 'undefined') return 'classic';
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('mode');
  if (fromQuery) return normalizeGameMode(fromQuery);
  try {
    return normalizeGameMode(localStorage.getItem(GAME_MODE_STORAGE_KEY) || 'classic');
  } catch (e) {
    return 'classic';
  }
}

function setSelectedGameMode(mode) {
  const normalized = normalizeGameMode(mode);
  localStorage.setItem(GAME_MODE_STORAGE_KEY, normalized);
  return normalized;
}

function getGameModeConfig(mode = getSelectedGameMode()) {
  return GAME_MODES[normalizeGameMode(mode)] || GAME_MODES.classic;
}

function getGameSaveKey(mode = getSelectedGameMode()) {
  return getGameModeConfig(mode).saveKey;
}

function applyGameTheme(mode = getSelectedGameMode()) {
  const config = getGameModeConfig(mode);
  const theme = config.theme;
  const root = document.documentElement;

  root.style.setProperty('--bg', theme.bg);
  root.style.setProperty('--bg-dark', theme.bgDark);
  root.style.setProperty('--store-bg', theme.storeBg);
  root.style.setProperty('--store-item-bg', theme.storeItemBg);
  root.style.setProperty('--store-item-hover', theme.storeItemHover);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent-dark', theme.accentDark);
  root.style.setProperty('--water-blue', theme.waterBlue);
  root.style.setProperty('--water-light', theme.waterLight);
  root.style.setProperty('--text', theme.text);
  root.style.setProperty('--text-muted', theme.textMuted);
  root.style.setProperty('--text-dark', theme.textDark);
  root.style.setProperty('--footer-bg', theme.footerBg);
  root.style.setProperty('--footer-text', theme.footerText);
  root.style.setProperty('--footer-border', theme.footerBorder);
  root.style.setProperty('--logo-filter', theme.footerLogoFilter);

  document.querySelectorAll('.cw-logo').forEach(img => {
    if (theme.footerLogoSrc) img.src = theme.footerLogoSrc;
  });
}

// Permanent upgrades survive every reincarnation cycle.
// Purchased with Reincarnation Points (RP) on reincarnation.html.
const PERMANENT_UPGRADES = [
  { id:'pu1',  name:'Reservoir Memory', icon:'🏞️',  desc:'Start each new cycle with 1,000 L already collected.',                    cost:1,  effect:'startWater', value:1000    },
  { id:'pu2',  name:'Iron Hands',       icon:'💪',  desc:'Permanently gain +1 L per manual click (stacks with other upgrades).',    cost:2,  effect:'bonusClick', value:1       },
  { id:'pu3',  name:'Free Bucket',      icon:'🪣',  desc:'Start every cycle with 1 free Bucket Brigade auto-clicker.',              cost:3,  effect:'freeUnit',   value:'bucket'},
  { id:'pu4',  name:'Flow Memory',      icon:'🌊',  desc:'All auto-clickers permanently run at 2× their normal speed.',             cost:5,  effect:'autoMult',   value:2       },
  { id:'pu5',  name:'Deep Reservoir',   icon:'⛰️',  desc:'Start each new cycle with 100,000 L already collected.',                  cost:8,  effect:'startWater', value:100000  },
  { id:'pu6',  name:'Ancient Spring',   icon:'✨',  desc:'Your click power is permanently multiplied by 3.',                        cost:10, effect:'clickMult',  value:3       },
  { id:'pu7',  name:'Water Wisdom',     icon:'📚',  desc:'All auto-clickers permanently run at 3× their normal speed.',             cost:15, effect:'autoMult',   value:3       },
  { id:'pu8',  name:'Undying River',    icon:'🏔️',  desc:'Start each new cycle with 10,000,000 L already collected.',               cost:25, effect:'startWater', value:1e7     },
  { id:'pu9',  name:'World Water',      icon:'🌐',  desc:'All auto-clickers permanently run at 5× their normal speed.',             cost:40, effect:'autoMult',   value:5       },
  { id:'pu10', name:'Divine Flow',      icon:'⚡',  desc:'Your click power is permanently multiplied by 10.',                       cost:50, effect:'clickMult',  value:10      },
];
