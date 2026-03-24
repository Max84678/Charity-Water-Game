/* ============================================================
   config.js — Shared constants used by game.js & reincarnation.js
   ============================================================ */

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
