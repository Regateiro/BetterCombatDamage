# Better Combat Damage

FoundryVTT module for D&D 5e that enhances damage and scrolling text display.

## Dev Commands

```bash
make lint        # Lint JS files
make compress     # Create module.zip
make install      # Compress + install to FoundryVTT Data/modules/
```

## Structure

- `bettercombatdamage/module.json` - Module manifest, defines entry point at `./scripts/bettercombatdamage.js`
- `bettercombatdamage/scripts/bettercombatdamage.js` - Main module (hooks: init, updateActor)
- `bettercombatdamage/scripts/settings.js` - Client settings registration
- `bettercombatdamage/scripts/utils.js` - Utility functions

## Requirements

- FoundryVTT 10.291+
- Dependencies (auto-installed): color-picker, lib-wrapper, _mathjs

## Notes

- No tests or CI. Pure vanilla JS module with linting.
- Settings are client-scoped.
- Uses lib-wrapper to override `_displayScrollingDamage` to disable default scrolling text.