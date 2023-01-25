import { BCD_FIELDS, ActorUtils } from "./utils.js";
import { BCDSettings } from "./settings.js"

Hooks.on("updateActor", (actor, update, opts) => {
	ActorUtils.updateActor(actor);
});

// Attach to actor updates
Hooks.on("preUpdateActor", (actor, update, opts) => {
	// If a supported value was updated, process the change
	const updatedFields = ActorUtils.getUpdatedField(update);
	for (let field of updatedFields) {
		let diff = null, color = null;
		switch(field) {
			case BCD_FIELDS.HP:
				// Calculate the change in HP
				if (typeof opts.dhp !== 'undefined') {
					diff = opts.dhp;
				} else {
					diff = update.system.attributes.hp.value - actor.system.attributes.hp.value;
				}

				// Check if Fortitude Points are on and whether the HP change would kill the actor
				let fortitudeDiff = 0, hpDiff = diff;
				if(BCDSettings.fortitudePointsEnabled && actor.system.resources?.legres?.value > 0 && actor.system.attributes.hp.value + diff <= 0) {
					hpDiff = 1 - actor.system.attributes.hp.value;
					fortitudeDiff = (diff - hpDiff);

					// If the difference is such that completely exhausts the fortitude points, add the rest to the hpDiff
					if (Math.abs(fortitudeDiff) > actor.system.resources.legres.value) {
						fortitudeDiff = -actor.system.resources.legres.value;
						hpDiff = diff - fortitudeDiff;
					}

					// Update the actor legendary resistance value
					ActorUtils.addActorUpdate(actor, BCD_FIELDS.LEGENDARY_RESISTANCE, Math.max(actor.system.resources.legres.value + fortitudeDiff, 0));
					ActorUtils.addActorUpdate(actor, BCD_FIELDS.HP, Math.max(actor.system.attributes.hp.value + hpDiff, 0));
					if(BCDSettings.scrollTextEnabled && BCDSettings.legendaryResistanceEnabled) {
						ActorUtils.addScrollingText(actor, fortitudeDiff, BCDSettings.legendaryResistanceColor);
					}
				}

				// Display the hit points scrolling text
				if(BCDSettings.scrollTextEnabled && BCDSettings.hitPointsEnabled) {
					color = hpDiff <= 0 ? BCDSettings.hitPointsDamageColor : BCDSettings.hitPointsHealingColor;
					ActorUtils.addScrollingText(actor, hpDiff, color);
				}

				ActorUtils.renderScrollingText(actor);
				break;
			case BCD_FIELDS.LEGENDARY_RESISTANCE:
				// Calculate the legendary resistance difference	
				diff = update.system.resources.legres.value - actor.system.resources.legres.value;

				// Display the scrolling text
				if(BCDSettings.scrollTextEnabled && BCDSettings.legendaryResistanceEnabled) {
					ActorUtils.addScrollingText(actor, diff, BCDSettings.legendaryResistanceColor);
				}

				ActorUtils.renderScrollingText(actor);
				break;
			default:
				// Do nothing if a non supported field is updated
				return;
		}
	}
});

Hooks.once("init", () => {
	// Init the settings
	BCDSettings.init();
	// Disable the normal scrolling text
	libWrapper.register("bettercombatdamage", "CONFIG.Actor.documentClass.prototype._displayScrollingDamage", (_) => {}, "OVERRIDE", {chain: true});
});