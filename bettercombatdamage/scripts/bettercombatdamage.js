import { BCD_FIELDS, ActorUtils } from "./utils.js";
import { BCDSettings } from "./settings.js"

Hooks.on("updateActor", (actor, update, opts) => {
	let i = 0;
	if(typeof actor.flags?.bcd?.render?.hp !== 'undefined') {
		const diff = actor.flags.bcd.render.hp;
		if (diff !== 0) {
			if (BCDSettings.scrollTextEnabled && BCDSettings.hitPointsEnabled) {
				const color = diff <= 0 ? BCDSettings.hitPointsDamageColor : BCDSettings.hitPointsHealingColor;
				ActorUtils.displayScrollingText(actor, diff, color, 750 * i);
			}
			if (actor.flags.bcd.issuer === game.user._id) {
				ActorUtils.addActorUpdate(actor, "flags.bcd.render.hp", 0);
			}
			i++;
		}
	}

	if(typeof actor.flags?.bcd?.render?.legres !== 'undefined') {
		const diff = actor.flags.bcd.render.legres;
		if (diff !== 0) {
			if (BCDSettings.scrollTextEnabled && BCDSettings.legendaryResistanceEnabled) {
				ActorUtils.displayScrollingText(actor, diff, BCDSettings.legendaryResistanceColor, 750 * i);
			}
			if (actor.flags.bcd.issuer === game.user._id) {
				ActorUtils.addActorUpdate(actor, "flags.bcd.render.legres", 0);
			}
			i++;
		}
	}

	ActorUtils.updateActor(actor);
});

// Attach to actor updates
Hooks.on("preUpdateActor", (actor, update, opts) => {
	// If a supported value was updated, process the change
	const updatedFields = ActorUtils.getUpdatedField(update);
	for (let field of updatedFields) {
		let diff = null;
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
					ActorUtils.addActorUpdate(actor, "flags.bcd.render.legres", fortitudeDiff);
					ActorUtils.addActorUpdate(actor, "flags.bcd.render.hp", Math.min(hpDiff, 0));
					ActorUtils.addActorUpdate(actor, "flags.bcd.issuer", game.user._id);
					break;
				}

				// Display the hit points scrolling text
				if (hpDiff !== 1 || actor.system.attributes.hp.value > 0 || typeof update.system?.resources?.legres?.value === 'undefined') {
					ActorUtils.addActorUpdate(actor, "flags.bcd.render.hp", hpDiff);
					ActorUtils.addActorUpdate(actor, "flags.bcd.issuer", game.user._id);
				}
				break;
			case BCD_FIELDS.LEGENDARY_RESISTANCE:
				// Calculate the legendary resistance difference	
				diff = update.system.resources.legres.value - actor.system.resources.legres.value;

				// Display the scrolling text
				ActorUtils.addActorUpdate(actor, "flags.bcd.render.legres", diff);
				ActorUtils.addActorUpdate(actor, "flags.bcd.issuer", game.user._id);
				break;
			default:
				// Do nothing if a non supported field is updated
				break;
		}
	}
});

Hooks.once("init", () => {
	// Init the settings
	BCDSettings.init();
	// Disable the normal scrolling text
	libWrapper.register("bettercombatdamage", "CONFIG.Actor.documentClass.prototype._displayScrollingDamage", (_) => {}, "OVERRIDE", {chain: true});
});