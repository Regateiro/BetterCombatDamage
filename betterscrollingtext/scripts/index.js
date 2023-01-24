import { displayScrollingText } from "./betterscrollingtext.js";
import { BTS_FIELDS, BST_COLORS, getUpdatedField } from "./utils.js";

// Attach to actor updates
Hooks.on("preUpdateActor", (actor, update, _) => {
	let diff = null, pct = null, color = null;

	// If a supported value was updated, process the change
	switch (getUpdatedField(update)) {
		case BTS_FIELDS.LEGENDARY_RESISTANCE:
			diff = update.system.resources.legres.value - actor.system.resources.legres.value;
			pct = Math.clamped(Math.abs(diff) / actor.system.resources.legres.max, 0, 1);
			color = BST_COLORS.LEGENDARY_RESISTANCE;
			break;
		default:
			// Do nothing if a non supported field is updated
			return;
	}

	// Display the scrolling text
	displayScrollingText(actor, diff, pct, color);
});