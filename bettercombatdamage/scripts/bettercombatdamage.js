import { ActorUtils } from "./utils.js";
import { BCDSettings } from "./settings.js";

// Storage for pre-update values captured in preUpdateActor hook.
// Keyed by actor.id so concurrent updates on different actors don't interfere.
const _preUpdateValues = new Map();

// Capture old HP/AHP/THP/Fp values BEFORE any updates are applied.
// Fires only for the client initiating the update (before system data is mutated).
Hooks.on("preUpdateActor", (actor, data) => {
	if (!data || !actor?.id) return;

	const hp = actor.system.attributes.hp ?? {};
	const fp = actor.system.resources?.legres ?? {};

	_preUpdateValues.set(actor.id, {
		hp: hasDataKey(data, "system.attributes.hp.value")
			? hp.value || 0
			: undefined,
		ahp: hasDataKey(data, "system.attributes.hp.armor")
			? hp.armor || 0
			: undefined,
		thp: hasDataKey(data, "system.attributes.hp.temp")
			? hp.temp || 0
			: undefined,
		fp: hasDataKey(data, "system.resources.legres.value")
			? (fp?.value ?? 0)
			: undefined,
	});
});

// Helper: get a value from nested or flat dot-notation keys.
function getDataValue(data, path) {
	if (data[path] != null) return data[path]; // flat key
	const parts = path.split(".");
	let current = data;
	for (const part of parts) {
		if (current == null || typeof current !== "object") return undefined;
		current = current[part];
	}
	return current;
}

// Helper: check if a path exists in nested or flat dot-notation keys.
function hasDataKey(data, path) {
	if (path in data) return true; // flat key
	const parts = path.split(".");
	let current = data;
	for (const part of parts) {
		if (current == null || typeof current !== "object") return false;
		current = current[part];
	}
	return true;
}

// Helper: compute delta from pre-update values captured in preUpdateActor.
function computeDeltas(actor, data) {
	const newVal = getDataValue(data, "system.attributes.hp.value");
	const newAhp = getDataValue(data, "system.attributes.hp.armor");
	const newThp = getDataValue(data, "system.attributes.hp.temp");
	const newFp = getDataValue(data, "system.resources.legres.value");

	const stored = _preUpdateValues.get(actor.id);
	if (stored)
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

	// Fallback for non-initiating clients: use system._source (D&D 5e DataModel's _source)
	const src = getSourceValues(actor);
	if (!src) return null;

	return {
		hp:
			Number.isFinite(newVal) && Number.isFinite(src.hp)
				? newVal - src.hp
				: undefined,
		ahp:
			Number.isFinite(newAhp) && Number.isFinite(src.ahp)
				? newAhp - src.ahp
				: undefined,
		thp:
			Number.isFinite(newThp) && Number.isFinite(src.thp)
				? newThp - src.thp
				: undefined,
		fp:
			Number.isFinite(newFp) && Number.isFinite(src.fp)
				? newFp - src.fp
				: undefined,
	};
}

// Helper: get pre-update HP values from the system DataModel's _source.
// D&D 5e stores pre-update source on actor.system._source (not actor._source).
function getSourceValues(actor) {
	const src = actor?.system?._source;
	if (!src) return null;

	return {
		ahp: src.attributes?.hp?.armor,
		thp: src.attributes?.hp?.temp,
		hp: src.attributes?.hp?.value,
		fp: src.resources?.legres?.value,
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
