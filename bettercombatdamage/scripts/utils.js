/**
 * Static utility class for actor-related operations during combat.
 */
export class ActorUtils {
	// Storage for pre-update values captured by capturePreUpdateValues().
	// Keyed by actor.id so concurrent updates on different actors don't interfere.
	/** @type {Map<string, {hp?: number, ahp?: number, thp?: number, fp?: number}>} */
	static _preUpdateValues = new Map();

	/**
	 * Display scrolling text above an actor's tokens.
	 * @param {object} actor - The actor document.
	 * @param {number} diff - The signed value to display (e.g. -12, +5).
	 * @param {string} color - CSS color string for the text fill.
	 * @param {number} delay - Milliseconds to delay before rendering.
	 */
	static displayScrollingText(actor, diff, color, delay) {
		// If the actor doesn't exist or the difference is 0, don't render
		if (!actor || diff === 0) {
			return;
		}

		// Get the active tokens to render on top of
		const tokens = actor.getActiveTokens(true);
		for (const t of tokens) {
			// Render the difference on top of the active tokens after a set delay
			setTimeout(() => canvas.interface.createScrollingText(t.center, diff.signedString(), {
				anchor: CONST.TEXT_ANCHOR_POINTS.TOP,
				fontSize: 48, // Range between [16, 48]
				fill: color,
				stroke: 0x000000,
				strokeThickness: 4,
				jitter: 0.25
			}), delay);
		}
	}

	/**
	 * Read a value from a nested object using a dot-notation path.
	 * Falls back to a direct key lookup on the top-level object first.
	 * @param {object} data - The data object to traverse.
	 * @param {string} path - Dot-notation path, e.g. "system.attributes.hp.value".
	 * @returns {*|undefined} The value at the path, or undefined if not found.
	 */
	static getDataValue(data, path) {
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

	/**
	 * Snapshot an actor's current HP/AHP/THP/Fp values before an update.
	 * Only stores values for keys that are actually being changed.
	 * @param {object} actor - The actor being updated.
	 * @param {object} data - The update payload (delta object).
	 */
	static capturePreUpdateValues(actor, data) {
		const hp = actor.system.attributes.hp ?? {};
		const fp = actor.system.resources?.legres ?? {};

		ActorUtils._preUpdateValues.set(actor.id, {
			hp: this.getDataValue(data, "system.attributes.hp.value") !== undefined
				? hp.value || 0
				: undefined,
			ahp: this.getDataValue(data, "system.attributes.hp.armor") !== undefined
				? hp.armor || 0
				: undefined,
			thp: this.getDataValue(data, "system.attributes.hp.temp") !== undefined
				? hp.temp || 0
				: undefined,
			fp: this.getDataValue(data, "system.resources.legres.value") !== undefined
				? (fp?.value ?? 0)
				: undefined,
		});
	}

	/**
	 * Compute deltas for HP/AHP/THP/Fp by comparing current data against
	 * pre-update values (captured by capturePreUpdateValues).
	 * Clears the stored pre-update entry for the actor after reading.
	 * @param {object} actor - The actor that was updated.
	 * @param {object} data - The update payload (delta object).
	 * @returns {{hp?: number, ahp?: number, thp?: number, fp?: number}|null}
	 */
	static computeDeltas(actor, data) {
		const newVal = this.getDataValue(data, "system.attributes.hp.value");
		const newAhp = this.getDataValue(data, "system.attributes.hp.armor");
		const newThp = this.getDataValue(data, "system.attributes.hp.temp");
		const newFp = this.getDataValue(data, "system.resources.legres.value");

		const stored = ActorUtils._preUpdateValues.get(actor.id);
		ActorUtils._preUpdateValues.delete(actor.id);
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

	/**
	 * Check whether a deltas object has any non-zero values.
	 * @param {{hp?: number, ahp?: number, thp?: number, fp?: number}} deltas
	 * @returns {boolean}
	 */
	static hasAnyDelta(deltas) {
		return (
			(Number.isFinite(deltas?.ahp) && deltas.ahp !== 0) ||
			(Number.isFinite(deltas?.thp) && deltas.thp !== 0) ||
			(Number.isFinite(deltas?.hp) && deltas.hp !== 0) ||
			(Number.isFinite(deltas?.fp) && deltas.fp !== 0)
		);
	}
}
