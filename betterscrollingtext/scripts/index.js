import { displayScrollingText } from "./betterscrollingtext.js";
import { BTS_FIELDS, getUpdatedField } from "./utils.js";
import { BSTSettings } from "./settings.js"

// Attach to actor updates
Hooks.on("preUpdateActor", (actor, update, opts) => {
	// Do nothing if the scrolling text is globally disabled
	if(!BSTSettings.scrollTextEnabled) 
		return;

	let diff = null, pct = null, color = null;
	// If a supported value was updated, process the change
	switch (getUpdatedField(update)) {
		case BTS_FIELDS.HP:
			// Do nothing is this field is disabled
			if(!BSTSettings.hitPointsEnabled)
				return;
			
			diff = opts.dhp;
			pct = Math.clamped(Math.abs(diff) / actor.system.attributes.hp.max, 0, 1);
			color = diff < 0 ? BSTSettings.hitPointsDamageColor : BSTSettings.hitPointsHealingColor;

			// Display the scrolling text
			displayScrollingText(actor, diff, pct, color);
			break;
		case BTS_FIELDS.LEGENDARY_RESISTANCE:
			// Do nothing is this field is disabled
			if(!BSTSettings.legendaryResistanceEnabled)
				return;
			
			diff = update.system.resources.legres.value - actor.system.resources.legres.value;
			pct = Math.clamped(Math.abs(diff) / actor.system.resources.legres.max, 0, 1);
			color = BSTSettings.legendaryResistanceColor;

			// Display the scrolling text
			displayScrollingText(actor, diff, pct, color);
			break;
		default:
			// Do nothing if a non supported field is updated
			return;
	}
});

Hooks.once("init", () => {
	BSTSettings.init();
});