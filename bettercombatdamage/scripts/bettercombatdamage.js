import { ActorUtils, _rollAttack } from "./utils.js";
import { BCDSettings } from "./settings.js"

// Attach to actor updates to render processed changes and issue new updates
Hooks.on("updateActor", (actor, _, opts) => {
    // Render scrolling texts for all BCD updates
    let backoff = 0;
    if (!opts.dparts) return true; // If there are no damage parts, don't render

    // If there is a change in temporary HP, display that first
    if (opts.dparts.thp !== 0) {
        if (BCDSettings.scrollTextEnabled && BCDSettings.hitPointsEnabled) {
            ActorUtils.displayScrollingText(actor, opts.dparts.thp ?? 0, BCDSettings.tempHitPointsColor, 750 * backoff++);
        }
    }

    // If there is a change in HP, display that next
    if (opts.dparts.hp !== 0) {
        if (BCDSettings.scrollTextEnabled && BCDSettings.hitPointsEnabled) {
            const color = opts.dparts.hp <= 0 ? BCDSettings.hitPointsDamageColor : BCDSettings.hitPointsHealingColor;
            ActorUtils.displayScrollingText(actor, opts.dparts.hp ?? 0, color, 750 * backoff++);
        }
    }

    // If there is a change in legendary resistance, display that last
    if (opts.dparts.fp !== 0) {
        if (BCDSettings.scrollTextEnabled && BCDSettings.legendaryResistanceEnabled) {
            ActorUtils.displayScrollingText(actor, opts.dparts.fp ?? 0, BCDSettings.legendaryResistanceColor, 750 * backoff++);
        }
    }

    return true;
});

// One time registration steps for settings and core function overrides.
Hooks.once("init", () => {
    // Init the settings
    BCDSettings.init();

    // Disable the normal scrolling text
    libWrapper.register("bettercombatdamage", "CONFIG.Actor.documentClass.prototype._displayScrollingDamage", (_) => {}, "OVERRIDE", {chain: true});

    // Register Extra Character Flags
	CONFIG.DND5E.characterFlags["bladeMastery"] = {
		name: "Blade Mastery",
		hint: "Roll an extra d20 with advantage when using relevant weapons.",
		section: "Feats",
		type: Boolean
	};
    
	CONFIG.DND5E.characterFlags["greaterRage"] = {
		name: "Greater Rage",
		hint: "Roll an extra d20 with advantage on reckless attacks when raging.",
		section: "Feats",
		type: Boolean
	};

    libWrapper.register("bettercombatdamage", "CONFIG.Item.documentClass.prototype.rollAttack", _rollAttack, "WRAPPER");
});