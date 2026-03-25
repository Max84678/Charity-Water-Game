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
      productionMult: 2,
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
      clickMult: 0.1,
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
  { id:'pu1',  branch:'water', name:'Reservoir Memory', icon:'🏞️',  desc:'Start each new cycle with 1,000 L already collected.',                    cost:1,  effect:'startWater', value:1000,    requires:[]       },
  { id:'pu5',  branch:'water', name:'Deep Reservoir',   icon:'⛰️',  desc:'Start each new cycle with 100,000 L already collected.',                  cost:8,  effect:'startWater', value:100000,  requires:['pu1']  },
  { id:'pu8',  branch:'water', name:'Undying River',    icon:'🏔️',  desc:'Start each new cycle with 10,000,000 L already collected.',               cost:25, effect:'startWater', value:1e7,     requires:['pu5']  },
  { id:'pu11', branch:'water', name:'Abyss Reservoir',  icon:'🌌',  desc:'Start each new cycle with 1,000,000,000 L already collected.',             cost:100, effect:'startWater', value:1e9,     requires:['pu8']  },
  { id:'pu14', branch:'water', name:'Ocean Memory',     icon:'🌊',  desc:'Start each new cycle with 1,000,000,000,000 L already collected.',        cost:250, effect:'startWater', value:1e12,    requires:['pu11'] },
  { id:'pu17', branch:'water', name:'Tidal Archive',    icon:'🌊',  desc:'Start each new cycle with 1,000,000,000,000,000 L already collected.',    cost:800, effect:'startWater', value:1e15,    requires:['pu14'] },
  { id:'pu20', branch:'water', name:'Planetary Reservoir', icon:'🪐', desc:'Start each new cycle with 1,000,000,000,000,000,000 L already collected.', cost:2500, effect:'startWater', value:1e18, requires:['pu17'] },
  { id:'pu23', branch:'water', name:'Cosmic Watershed', icon:'🌌',  desc:'Start each new cycle with 1,000,000,000,000,000,000,000 L already collected.', cost:8000, effect:'startWater', value:1e21, requires:['pu20'] },
  { id:'pu26', branch:'water', name:'Aqua Vault',      icon:'🏺',  desc:'Start each new cycle with 1,000,000,000,000,000,000,000,000 L already collected.', cost:30000, effect:'startWater', value:1e24, requires:['pu23'] },
  { id:'pu29', branch:'water', name:'Hydro Archive',   icon:'📁',  desc:'Start each new cycle with 1,000,000,000,000,000,000,000,000,000 L already collected.', cost:150000, effect:'startWater', value:1e27, requires:['pu26'] },
  { id:'pu32', branch:'water', name:'World Reservoir',  icon:'🌍',  desc:'Start each new cycle with 1,000,000,000,000,000,000,000,000,000,000 L already collected.', cost:750000, effect:'startWater', value:1e30, requires:['pu29'] },
  { id:'pu35', branch:'water', name:'Tide Memory',      icon:'🌊',  desc:'Start each new cycle with 1,000,000,000,000,000,000,000,000,000,000,000 L already collected.', cost:3000000, effect:'startWater', value:1e33, requires:['pu32'] },
  { id:'pu38', branch:'water', name:'Cosmos Reservoir', icon:'✨',  desc:'Start each new cycle with 1,000,000,000,000,000,000,000,000,000,000,000,000 L already collected.', cost:15000000, effect:'startWater', value:1e36, requires:['pu35'] },

  { id:'pu2',  branch:'click', name:'Iron Hands',       icon:'💪',  desc:'Permanently gain +1 L per manual click (stacks with other upgrades).',    cost:2,  effect:'bonusClick', value:1,       requires:[]       },
  { id:'pu6',  branch:'click', name:'Ancient Spring',   icon:'✨',  desc:'Your click power is permanently multiplied by 3.',                        cost:10, effect:'clickMult',  value:3,       requires:['pu2']  },
  { id:'pu10', branch:'click', name:'Divine Flow',      icon:'⚡',  desc:'Your click power is permanently multiplied by 10.',                       cost:50, effect:'clickMult',  value:10,      requires:['pu6']  },
  { id:'pu12', branch:'click', name:'Overflowing Hands', icon:'🤲',  desc:'Your click power is permanently multiplied by 25.',                       cost:120, effect:'clickMult',  value:25,      requires:['pu10'] },
  { id:'pu15', branch:'click', name:'Titan Hands',      icon:'🫳',  desc:'Your click power is permanently multiplied by 100.',                      cost:300, effect:'clickMult',  value:100,     requires:['pu12'] },
  { id:'pu18', branch:'click', name:'Elder Hands',      icon:'🫱',  desc:'Your click power is permanently multiplied by 250.',                      cost:800, effect:'clickMult',  value:250,     requires:['pu15'] },
  { id:'pu21', branch:'click', name:'Mythic Grip',      icon:'🖐️',  desc:'Your click power is permanently multiplied by 1,000.',                    cost:2500, effect:'clickMult', value:1000,    requires:['pu18'] },
  { id:'pu24', branch:'click', name:'Legendary Touch',  icon:'✋',  desc:'Your click power is permanently multiplied by 5,000.',                    cost:8000, effect:'clickMult', value:5000,    requires:['pu21'] },
  { id:'pu27', branch:'click', name:'Giant Grip',       icon:'🫳',  desc:'Your click power is permanently multiplied by 10,000.',                   cost:30000, effect:'clickMult', value:10000,   requires:['pu24'] },
  { id:'pu30', branch:'click', name:'Storm Hands',      icon:'🌩️',  desc:'Your click power is permanently multiplied by 100,000.',                  cost:150000, effect:'clickMult', value:100000,  requires:['pu27'] },
  { id:'pu33', branch:'click', name:'Titanic Grip',     icon:'🗿',  desc:'Your click power is permanently multiplied by 1,000,000.',                cost:750000, effect:'clickMult', value:1000000, requires:['pu30'] },
  { id:'pu36', branch:'click', name:'Mythic Pulse',     icon:'💠',  desc:'Your click power is permanently multiplied by 10,000,000.',               cost:3000000, effect:'clickMult', value:10000000, requires:['pu33'] },
  { id:'pu39', branch:'click', name:'Infinite Touch',   icon:'♾️',  desc:'Your click power is permanently multiplied by 100,000,000.',              cost:15000000, effect:'clickMult', value:100000000, requires:['pu36'] },

  { id:'pu3',  branch:'auto',  name:'Free Bucket',      icon:'🪣',  desc:'Start every cycle with 1 free Bucket Brigade auto-clicker.',              cost:3,  effect:'freeUnit',   value:'bucket', requires:[]       },
  { id:'pu4',  branch:'auto',  name:'Flow Memory',      icon:'🌊',  desc:'All auto-clickers permanently run at 2× their normal speed.',             cost:5,  effect:'autoMult',   value:2,       requires:['pu3']  },
  { id:'pu7',  branch:'auto',  name:'Water Wisdom',     icon:'📚',  desc:'All auto-clickers permanently run at 3× their normal speed.',             cost:15, effect:'autoMult',   value:3,       requires:['pu4']  },
  { id:'pu9',  branch:'auto',  name:'World Water',      icon:'🌐',  desc:'All auto-clickers permanently run at 5× their normal speed.',             cost:40, effect:'autoMult',   value:5,       requires:['pu7']  },
  { id:'pu13', branch:'auto',  name:'River Mind',       icon:'🌊',  desc:'All auto-clickers permanently run at 10× their normal speed.',            cost:150, effect:'autoMult',   value:10,      requires:['pu9']  },
  { id:'pu16', branch:'auto',  name:'Infinite Flow',    icon:'♾️',  desc:'All auto-clickers permanently run at 25× their normal speed.',             cost:500, effect:'autoMult',   value:25,      requires:['pu13'] },
  { id:'pu19', branch:'auto',  name:'Celestial Current', icon:'🌠', desc:'All auto-clickers permanently run at 50× their normal speed.',            cost:800, effect:'autoMult',   value:50,      requires:['pu16'] },
  { id:'pu22', branch:'auto',  name:'Infinite Current',  icon:'♾️',  desc:'All auto-clickers permanently run at 100× their normal speed.',            cost:2500, effect:'autoMult',  value:100,     requires:['pu19'] },
  { id:'pu25', branch:'auto',  name:'Transcendent Flow', icon:'✨',  desc:'All auto-clickers permanently run at 500× their normal speed.',            cost:8000, effect:'autoMult',   value:500,     requires:['pu22'] },
  { id:'pu28', branch:'auto',  name:'River Engine',     icon:'⚙️',  desc:'All auto-clickers permanently run at 1,000× their normal speed.',          cost:30000, effect:'autoMult',   value:1000,    requires:['pu25'] },
  { id:'pu31', branch:'auto',  name:'Flow Reactor',     icon:'🔋',  desc:'All auto-clickers permanently run at 5,000× their normal speed.',          cost:150000, effect:'autoMult',   value:5000,    requires:['pu28'] },
  { id:'pu34', branch:'auto',  name:'Monsoon Core',     icon:'🌪️',  desc:'All auto-clickers permanently run at 25,000× their normal speed.',         cost:750000, effect:'autoMult',   value:25000,   requires:['pu31'] },
  { id:'pu37', branch:'auto',  name:'Weather Halo',     icon:'☁️',  desc:'All auto-clickers permanently run at 100,000× their normal speed.',        cost:3000000, effect:'autoMult',   value:100000,  requires:['pu34'] },
  { id:'pu40', branch:'auto',  name:'Eternal Current',  icon:'♾️',  desc:'All auto-clickers permanently run at 500,000× their normal speed.',        cost:15000000, effect:'autoMult',   value:500000,  requires:['pu37'] },
];
