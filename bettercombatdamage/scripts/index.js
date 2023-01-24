import { displayScrollingText } from "./bettercombatdamage.js";
import { BCD_FIELDS, getUpdatedField } from "./utils.js";
import { BCDSettings } from "./settings.js"

// Attach to actor updates
Hooks.on("preUpdateActor", (actor, update, opts) => {
	// Do nothing if the scrolling text is globally disabled
	if(!BCDSettings.scrollTextEnabled) 
		return;

	let diff = null, pct = null, color = null;
	// If a supported value was updated, process the change
	switch (getUpdatedField(update)) {
		case BCD_FIELDS.HP:
			// Do nothing is this field is disabled
			if(!BCDSettings.hitPointsEnabled)
				return;
			
			if (typeof opts.dhp !== 'undefined') {
				diff = opts.dhp;
			} else {
				diff = update.system.attributes.hp.value - actor.system.attributes.hp.value;
			}

			pct = Math.clamped(Math.abs(diff) / actor.system.attributes.hp.max, 0, 1);
			color = diff < 0 ? BCDSettings.hitPointsDamageColor : BCDSettings.hitPointsHealingColor;

			// Display the scrolling text
			displayScrollingText(actor, diff, pct, color);
			break;
		case BCD_FIELDS.LEGENDARY_RESISTANCE:
			// Do nothing is this field is disabled
			if(!BCDSettings.legendaryResistanceEnabled)
				return;
			
			diff = update.system.resources.legres.value - actor.system.resources.legres.value;
			pct = Math.clamped(Math.abs(diff) / actor.system.resources.legres.max, 0, 1);
			color = BCDSettings.legendaryResistanceColor;

			// Display the scrolling text
			displayScrollingText(actor, diff, pct, color);
			break;
		default:
			// Do nothing if a non supported field is updated
			return;
	}
});

Hooks.once("init", () => {
	BCDSettings.init();
	// Disable the normal scrolling text
	libWrapper.register("bettercombatdamage", "CONFIG.Actor.documentClass.prototype._displayScrollingDamage", (_) => {}, "OVERRIDE", {chain: true});
});