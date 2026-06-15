import { ActorUtils } from "./utils.js";
import { BCDSettings } from "./settings.js";

/**
 * Snapshot current HP/AHP/THP/Fp values before an actor update.
 * Only fires for the initiating client during active combat.
 */
Hooks.on("preUpdateActor", (actor, data) => {
	// Guard against processing changes outside of combat
	if (!data || !actor?.id || !BCDSettings.scrollTextEnabled || !game.combat?.isActive) {
		// Allow the update to continue
		return true;
	}

	// Capture the actor's values to display future deltas
	ActorUtils.capturePreUpdateValues(actor, data);

	// Allow the update to continue
	return true;
});

/**
 * After an actor update, display scrolling text for any resource changes.
 * Displays in order: AHP -> THP -> HP -> FP, with 750ms stagger between each.
 */
Hooks.on("updateActor", (actor, data, opts) => {
	// Guard against processing changes outside of combat
	if (!BCDSettings.scrollTextEnabled || !game.combat?.isActive) {
		// Allow the update to continue
		return true;
	}

	// Text display delay backoff
	let backoff = 0;

	// Compute deltas from incoming data when not provided by caller
	const deltas = opts?.deltas ?? ActorUtils.computeDeltas(actor, data);

	// If there's nothing to display after computing deltas, bail
	if (!ActorUtils.hasAnyDelta(deltas)) {
		return true;
	}

	// Display scrolling texts in order: AHP -> THP -> HP -> FP
	if (Number.isFinite(deltas.ahp) && deltas.ahp !== 0) {
		if (BCDSettings.hitPointsEnabled) {
			ActorUtils.displayScrollingText(
				actor,
				deltas.ahp,
				BCDSettings.armorMasteryPointsColor,
				750 * backoff++,
			);
		}
	}

	if (Number.isFinite(deltas.thp) && deltas.thp !== 0) {
		if (BCDSettings.hitPointsEnabled) {
			ActorUtils.displayScrollingText(
				actor,
				deltas.thp,
				BCDSettings.tempHitPointsColor,
				750 * backoff++,
			);
		}
	}

	if (Number.isFinite(deltas.hp) && deltas.hp !== 0) {
		if (BCDSettings.hitPointsEnabled) {
			const color =
				deltas.hp <= 0
					? BCDSettings.hitPointsDamageColor
					: BCDSettings.hitPointsHealingColor;
			ActorUtils.displayScrollingText(actor, deltas.hp, color, 750 * backoff++);
		}
	}

	if (Number.isFinite(deltas.fp) && deltas.fp !== 0) {
		if (BCDSettings.legendaryResistanceEnabled) {
			ActorUtils.displayScrollingText(
				actor,
				deltas.fp,
				BCDSettings.legendaryResistanceColor,
				750 * backoff++,
			);
		}
	}

	// Allow the update to continue
	return true;
});

/**
 * One-time initialization:
 * - Register module settings
 * - Disable Foundry's default _displayScrollingDamage via libWrapper OVERRIDE
 */
Hooks.once("init", () => {
	// Init the settings
	BCDSettings.init();

	// Disable the normal scrolling text
	libWrapper.register(
		"bettercombatdamage",
		"CONFIG.Actor.documentClass.prototype._displayScrollingDamage",
		() => {},
		"OVERRIDE",
		{ chain: true },
	);
});
