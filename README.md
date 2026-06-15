# Better Combat Damage

A [FoundryVTT](https://foundryvtt.com/) module for the **D&D 5e** system that enhances the display of combat damage and resource changes as scrolling text on the canvas.

## Features

- **Colored scrolling text** for changes to HP, Temp HP, Armor Mastery Points, and Legendary Resistance during combat
- **Separate colors** for damage (default red) and healing (default green)
- **Customizable colors** per resource type via a color picker UI
- **Staggered display** — each value appears sequentially (750ms apart) to prevent overlap
- **Replaces Foundry's default** scrolling damage with a more readable, per-resource breakdown
- **Per-user settings** — each player configures their own colors and toggles

## Installation

### FoundryVTT Module Manager (Recommended)

1. Open FoundryVTT and navigate to **Add-on Modules**
2. Click **Install Module**
3. Paste the manifest URL:
   ```
   https://github.com/Regateiro/BetterCombatDamage/releases/latest/download/module.json
   ```

### Manual Install

1. Download the latest `module.zip` from the [releases page](https://github.com/Regateiro/BetterCombatDamage/releases)
2. Extract to `FoundryVTT/Data/modules/bettercombatdamage/`

### Requirements

| | Min | Verified |
|---|---|---|
| **FoundryVTT** | 10.291 | 10 |
| **dnd5e system** | 2.4.4 | 2.4.4 |

### Dependencies (auto-installed)

| Module ID | Purpose |
|---|---|
| `lib-wrapper` | Override Foundry's default `_displayScrollingDamage` |
| `color-picker` | Color picker UI for settings |
| `_mathjs` | Math utilities |

## Usage

Once installed and enabled, the module activates automatically during combat. When a token takes damage, receives healing, gains/loses temp HP, or uses legendary resistance, colored scrolling text appears above the token.

### Settings

All settings are **per-user** and found under **Configure Settings > Module Settings > Better Combat Damage**.

#### Toggles

| Setting | Default | Description |
|---|---|---|
| Enable Damage Scrolling Text | On | Master toggle for all scrolling text |
| Hit Points | On | Show/hide HP, AHP, and THP changes |
| Legendary Resistance | On | Show/hide legendary resistance (Fp) changes |

#### Colors

| Setting | Default | Description |
|---|---|---|
| Hit Points Damage Text Color | `#FF0000` (red) | Color for HP damage |
| Hit Points Healing Text Color | `#00FF00` (green) | Color for HP healing |
| Temporary Hit Points Text Color | `#00FFFF` (cyan) | Color for temp HP changes |
| Armor Mastery Points Text Color | `#888888` (gray) | Color for armor mastery changes |
| Legendary Resistance Text Color | `#FFB300` (amber) | Color for legendary resistance changes |

## Development

### Project Structure

```
bettercombatdamage/
  module.json                    # Module manifest
  scripts/
    bettercombatdamage.js        # Entry point: hooks (init, preUpdateActor, updateActor)
    settings.js                  # Client settings via BCDSettings singleton
    utils.js                     # ActorUtils class with all actor utility methods
```

### Commands

```bash
make lint        # Lint JS files with ESLint
make compress    # Create module.zip for distribution
make install     # Compress + install to local FoundryVTT Data/modules/
```

### Architecture

The module entry point (`bettercombatdamage.js`) registers three hooks:

1. **`init`** — Registers all settings via `BCDSettings.init()` and uses `libWrapper` to override `_displayScrollingDamage` with a no-op, disabling Foundry's default scrolling text.

2. **`preUpdateActor`** — Calls `ActorUtils.capturePreUpdateValues(actor, data)` to snapshot the actor's current HP, THP, AHP, and Legendary Resistance values into a static `Map` before the update is applied. Only fires during active combat.

3. **`updateActor`** — Calls `ActorUtils.computeDeltas(actor, data)` to diff post-update values against the pre-update snapshot, then displays scrolling text for each changed resource with a 750ms stagger. Skips if `ActorUtils.hasAnyDelta()` returns false.

All actor utility logic lives in `ActorUtils` (`utils.js`):
- `displayScrollingText()` — Renders colored text above active tokens via `canvas.interface.createScrollingText()`
- `capturePreUpdateValues()` — Stores pre-update resource values
- `computeDeltas()` — Computes diffs from stored pre-update values
- `hasAnyDelta()` — Checks if any delta is non-zero
- `getDataValue()` — Reads nested dot-notation keys from the update payload

## License

[GNU General Public License v3](LICENSE)
