import { BCD_FIELDS, ActorUtils, random, _rollAttack } from "./utils.js";
import { BCDSettings } from "./settings.js"

// Attach to actor updates to render processed changes and issue new updates
Hooks.on("updateActor", (actor, update, _) => {
    // Issue an actor update with any changes and differences to be rendered
    ActorUtils.updateActor(actor);

    // Render scrolling texts for all BCD updates
    let i = 0;

    // If there is a change in temporary HP, display that first
    if(typeof update.flags?.bcd?.thp?.diff !== 'undefined') {
        const diff = Number(update.flags.bcd.thp.diff.split(".")[1]);
        if (diff !== 0) {
            if (BCDSettings.scrollTextEnabled && BCDSettings.hitPointsEnabled) {
                ActorUtils.displayScrollingText(actor, diff, BCDSettings.tempHitPointsColor, 750 * i);
            }
            i++;
        }
    }

    // If there is a change in HP, display that next
    if(typeof update.flags?.bcd?.hp?.diff !== 'undefined') {
        const diff = Number(update.flags.bcd.hp.diff.split(".")[1]);
        if (diff !== 0) {
            if (BCDSettings.scrollTextEnabled && BCDSettings.hitPointsEnabled) {
                const color = diff <= 0 ? BCDSettings.hitPointsDamageColor : BCDSettings.hitPointsHealingColor;
                ActorUtils.displayScrollingText(actor, diff, color, 750 * i);
            }
            i++;
        }
    }

    // If there is a change in legendary resistance, display that last
    if(typeof update.flags?.bcd?.legres?.diff !== 'undefined') {
        const diff = Number(update.flags.bcd.legres.diff.split(".")[1]);
        if (diff !== 0) {
            if (BCDSettings.scrollTextEnabled && BCDSettings.legendaryResistanceEnabled) {
                ActorUtils.displayScrollingText(actor, diff, BCDSettings.legendaryResistanceColor, 750 * i);
            }
            i++;
        }
    }

    return true;
});

// Attach to preActor updates so (T)HP and LegRes changes can be processed
Hooks.on("preUpdateActor", (actor, update, opts) => {
    // Check if this update has already been processed
    if(typeof update.flags?.bcd !== 'undefined') {
        return true;
    }

    // Generate a new random update id to force updates
    const updateID = random();

    // If a supported value was updated, process the change
    const updatedFields = ActorUtils.getUpdatedField(update);
    let diff = null;
    for (let field of updatedFields) {
        switch(field) {
            case BCD_FIELDS.HP:
                // Calculate the change in HP
                if (typeof opts.dhp !== 'undefined') {
                    if (opts.dhp >= 0) diff = opts.dhp;
                    else diff = (opts.dhp + actor.system.attributes.hp.temp);
                } else {
                    diff = update.system.attributes.hp.value - actor.system.attributes.hp.value;
                }

                // Check if Fortitude Points are on and whether the HP change would go through the threshold
                const THRESHOLD = Math.floor((actor.system.attributes.hp.max * BCDSettings.triggerAtPercentage) / 100);
                if(BCDSettings.fortitudePointsEnabled && actor.system.resources?.legres?.value > 0 && actor.system.attributes.hp.value + diff <= THRESHOLD) {
                    // Calculate the difference to reach the threshold
                    let hpDiff = THRESHOLD - actor.system.attributes.hp.value;
                    // If the threshold is 0, add 1 so the creature isn't considered dead
                    if (THRESHOLD == 0) hpDiff += 1;
                    // Remove the rest of the damage from the legendary resistance
                    let legresDiff = (diff - hpDiff);

                    // If the difference is such that completely exhausts the fortitude points, add the rest to the hpDiff
                    if (Math.abs(legresDiff) > actor.system.resources.legres.value) {
                        legresDiff = -actor.system.resources.legres.value;
                        hpDiff = diff - legresDiff;
                    }

                    // Update the actor HP and legendary resistance values
                    ActorUtils.addActorUpdate(actor, BCD_FIELDS.LEGENDARY_RESISTANCE, Math.max(actor.system.resources.legres.value + legresDiff, 0));
                    ActorUtils.addActorUpdate(actor, BCD_FIELDS.HP, Math.max(actor.system.attributes.hp.value + hpDiff, 0));

                    // Add the differences to be rendered
                    ActorUtils.addActorUpdate(actor, "flags.bcd.legres.diff", updateID.concat(".", legresDiff));
                    ActorUtils.addActorUpdate(actor, "flags.bcd.hp.diff", updateID.concat(".", hpDiff));
                } else {
                    // If the HP difference would not go below the trigger threshold, simply add the HP difference to be rendered
                    ActorUtils.addActorUpdate(actor, "flags.bcd.hp.diff", updateID.concat(".", diff));
                }
                break;
            case BCD_FIELDS.TEMP_HP:
                // Calculate the temporary HP difference
                diff = update.system.attributes.hp.temp - actor.system.attributes.hp.temp;

                // Add the difference to be rendered
                ActorUtils.addActorUpdate(actor, "flags.bcd.thp.diff", updateID.concat(".", diff));

                // If the new amount of tempHP is smaller than the current amount of armor mastery temp HP, update it
                if (Number(update.system.attributes.hp.temp) < Number(actor.flags.mae.tempArmorMastery || 0)) {
                    ActorUtils.addActorUpdate(actor, "flags.mae.tempArmorMastery", Number(update.system.attributes.hp.temp));
                }
                break;
            case BCD_FIELDS.LEGENDARY_RESISTANCE:
                // Calculate the legendary resistance difference
                diff = update.system.resources.legres.value - actor.system.resources.legres.value;

                // Add the difference to be rendered
                ActorUtils.addActorUpdate(actor, "flags.bcd.legres.diff", updateID.concat(".", diff));
                break;
            default:
                // Do nothing if a non supported field is updated
                break;
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