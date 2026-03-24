# Charity: Water Game

A browser-based idle/clicker game inspired by [charity: water](https://www.charitywater.org)'s mission to bring clean water to people in need.

## How to play

Open `index.html` in any modern web browser — no server or installation required.

### Gameplay

- **Click the well** to manually collect liters of water.
- **Buy auto-clickers** from the store (☰ hamburger, top-left) to passively gather water.
- **Buy upgrades** (shown above auto-clickers) to multiply your production.
- Purchase auto-clickers individually or in bulk of **×10, ×100, ×1 000, ×10 000** (max 10 000 per tier).
- When you reach **1 trillion liters** in a single cycle you can **Reincarnate** — resetting your progress in exchange for **Reincarnation Points**.
- Spend RP in the **Reincarnation Store** on permanent upgrades that persist across all future cycles.

### Three improvements added

| # | Improvement | Detail |
|---|-------------|--------|
| 1 | **Click animation** | Floating "+N L" text and a ripple ring appear on every well click, giving satisfying visual feedback. |
| 2 | **Real-world impact milestones** | A pop-up notification fires at key water totals (25 K, 1 M, 1 B … litres) with real charity: water facts connecting your progress to actual impact. |
| 3 | **Animated wave progress bar** | A water-wave fill bar below the well shows how far you are toward the 1-trillion-litre reincarnation threshold. |

### Brand identity

- Background: `#77A8BB` (charity: water sky-blue)
- Accent: `#FFC907` (charity: water yellow)
- Footer links to [charitywater.org](https://www.charitywater.org)

## File structure

```
index.html              Main game page
reincarnation.html      Permanent-upgrade store
style.css               All styles
game.js                 Main game logic
reincarnation.js        Reincarnation page logic
well.svg                Water-well illustration
charity-water-logo.svg  Footer logo
```