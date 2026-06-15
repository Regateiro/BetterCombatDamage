import { ActorUtils } from "./utils.js";
import { BCDSettings } from "./settings.js";

// Storage for pre-update values captured in preUpdateActor hook.
// Keyed by actor.id so concurrent updates on different actors don't interfere.
const _preUpdateValues = new Map();

// Capture old HP/AHP/THP/Fp values BEFORE any updates are applied.
// Fires only for the client initiating the update (before system data is mutated).
Hooks.on("preUpdateActor", (actor, data) => {
	if (!data || !actor?.id || !game.combat?.isActive) {
		return;
	}

	const hp = actor.system.attributes.hp ?? {};
	const fp = actor.system.resources?.legres ?? {};

	_preUpdateValues.set(actor.id, {
		hp: getDataValue(data, "system.attributes.hp.value") !== undefined
			? hp.value || 0
			: undefined,
		ahp: getDataValue(data, "system.attributes.hp.armor") !== undefined
			? hp.armor || 0
			: undefined,
		thp: getDataValue(data, "system.attributes.hp.temp") !== undefined
			? hp.temp || 0
			: undefined,
		fp: getDataValue(data, "system.resources.legres.value") !== undefined
			? (fp?.value ?? 0)
			: undefined,
	});
});

// Helper: get a value from nested or flat dot-notation keys.
function getDataValue(data, path) {
	if (data[path] !== undefined && data[path] !== null) {
		return data[path];
	}

	const parts = path.split(".");
	let current = data;
	for (const part of parts) {
		if (current === undefined || current === null || typeof current !== "object") {
			return undefined;
		}
		current = current[part];
	}
	return current;
}

// Helper: compute delta from pre-update values captured in preUpdateActor.
function computeDeltas(actor, data) {
	const newVal = getDataValue(data, "system.attributes.hp.value");
	const newAhp = getDataValue(data, "system.attributes.hp.armor");
	const newThp = getDataValue(data, "system.attributes.hp.temp");
	const newFp = getDataValue(data, "system.resources.legres.value");

	const stored = _preUpdateValues.get(actor.id);
	_preUpdateValues.delete(actor.id);
	if (!stored) {
		return null;
	}

	return {
		hp:
			Number.isFinite(newVal) && Number.isFinite(stored.hp)
				? newVal - stored.hp
				: undefined,
		ahp:
			Number.isFinite(newAhp) && Number.isFinite(stored.ahp)
				? newAhp - stored.ahp
				: undefined,
		thp:
			Number.isFinite(newThp) && Number.isFinite(stored.thp)
				? newThp - stored.thp
				: undefined,
		fp:
			Number.isFinite(newFp) && Number.isFinite(stored.fp)
				? newFp - stored.fp
				: undefined,
	};
}

function hasAnyDelta(deltas) {
	return (
		(Number.isFinite(deltas?.ahp) && deltas.ahp !== 0) ||
		(Number.isFinite(deltas?.thp) && deltas.thp !== 0) ||
		(Number.isFinite(deltas?.hp) && deltas.hp !== 0) ||
		(Number.isFinite(deltas?.fp) && deltas.fp !== 0)
	);
}

// Attach to actor updates to render processed changes and issue new updates
Hooks.on("updateActor", (actor, data, opts) => {
	if (!game.combat?.isActive) {
		return true;
	}

	let backoff = 0;

	// Compute deltas from incoming data when not provided by caller
	const deltas = opts?.deltas ?? computeDeltas(actor, data);

	// If there's nothing to display after computing deltas, bail
	if (!hasAnyDelta(deltas)) {
		return true;
	}

	// Display scrolling texts in order: AHP → THP → HP → FP
	if (Number.isFinite(deltas.ahp) && deltas.ahp !== 0) {
		if (BCDSettings.scrollTextEnabled && BCDSettings.hitPointsEnabled) {
			ActorUtils.displayScrollingText(
				actor,
				deltas.ahp,
				BCDSettings.armorMasteryPointsColor,
				750 * backoff++,
			);
		}
	}

	if (Number.isFinite(deltas.thp) && deltas.thp !== 0) {
		if (BCDSettings.scrollTextEnabled && BCDSettings.hitPointsEnabled) {
			ActorUtils.displayScrollingText(
				actor,
				deltas.thp,
				BCDSettings.tempHitPointsColor,
				750 * backoff++,
			);
		}
	}

	if (Number.isFinite(deltas.hp) && deltas.hp !== 0) {
		if (BCDSettings.scrollTextEnabled && BCDSettings.hitPointsEnabled) {
			const color =
				deltas.hp <= 0
					? BCDSettings.hitPointsDamageColor
					: BCDSettings.hitPointsHealingColor;
			ActorUtils.displayScrollingText(actor, deltas.hp, color, 750 * backoff++);
		}
	}

	if (Number.isFinite(deltas.fp) && deltas.fp !== 0) {
		if (
			BCDSettings.scrollTextEnabled &&
			BCDSettings.legendaryResistanceEnabled
		) {
			ActorUtils.displayScrollingText(
				actor,
				deltas.fp,
				BCDSettings.legendaryResistanceColor,
				750 * backoff++,
			);
		}
	}

	return true;
});

// One time registration steps for settings and core function overrides.
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
