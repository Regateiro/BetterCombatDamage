import { displayScrollingText } from "./bettercombatdamage.js";
import { BCD_FIELDS, getUpdatedField } from "./utils.js";
import { BCDSettings } from "./settings.js"

const ACTOR_UPDATES = {}
let ignoreNextActorHPChange = {}
Hooks.on("updateActor", (actor, update, opts) => {
	if(ACTOR_UPDATES[actor._id]) {
		actor.update(ACTOR_UPDATES[actor._id]);
		delete ACTOR_UPDATES[actor._id];
	}
});

// Attach to actor updates
Hooks.on("preUpdateActor", (actor, update, opts) => {
	// If a supported value was updated, process the change
	const updatedFields = getUpdatedField(update);
	for (let i in updatedFields) {
		let diff = null, color = null;
		switch(updatedFields[i]) {
			case BCD_FIELDS.HP:
				// Calculate the change in HP
				if (typeof opts.dhp !== 'undefined') {
					diff = opts.dhp;
				} else {
					diff = update.system.attributes.hp.value - actor.system.attributes.hp.value;
				}

				// Check if Fortitude Points are on and whether the HP change would kill the actor
				let fortitudeDiff = 0, hpDiff = diff, _ignoreNextActorHPChange = false;
				if(BCDSettings.fortitudePointsEnabled && actor.system.resources?.legres?.value > 0 && actor.system.attributes.hp.value + diff <= 0) {
					hpDiff = 1 - actor.system.attributes.hp.value;
					fortitudeDiff = (diff - hpDiff);
					_ignoreNextActorHPChange = true;

					// If the difference is such that completely exhausts the fortitude points, add the rest to the hpDiff
					if (Math.abs(fortitudeDiff) > actor.system.resources.legres.value) {
						fortitudeDiff = -actor.system.resources.legres.value;
						hpDiff = diff - fortitudeDiff;
						_ignoreNextActorHPChange = false;
					}

					// Update the actor legendary resistance value
					ACTOR_UPDATES[actor._id] = {
						"system.resources.legres.value": Math.max(actor.system.resources.legres.value + fortitudeDiff, 0),
						"system.attributes.hp.value": Math.max(actor.system.attributes.hp.value + hpDiff, 0)
					};
				}

				// Display the hit points scrolling text
				if(BCDSettings.scrollTextEnabled && BCDSettings.hitPointsEnabled) {
					if(!ignoreNextActorHPChange[actor._id]) {
						if(hpDiff != 0) {
							color = hpDiff < 0 ? BCDSettings.hitPointsDamageColor : BCDSettings.hitPointsHealingColor;
							setTimeout(() => {displayScrollingText(actor, hpDiff, color);}, 0);
						}
					} else ignoreNextActorHPChange[actor._id] = false;
				}

				ignoreNextActorHPChange[actor._id] = _ignoreNextActorHPChange;
				break;
			case BCD_FIELDS.LEGENDARY_RESISTANCE:
				// Calculate the legendary resistance difference	
				diff = update.system.resources.legres.value - actor.system.resources.legres.value;

				// Display the scrolling text
				if(BCDSettings.scrollTextEnabled && BCDSettings.legendaryResistanceEnabled) {
					setTimeout(() => {displayScrollingText(actor, diff, BCDSettings.legendaryResistanceColor);}, 750);
				}
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