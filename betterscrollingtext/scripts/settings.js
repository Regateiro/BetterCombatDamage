const getBSTSetting = (setting) => game.settings.get("betterscrollingtext", setting);

/**
 * Class type used to initialize and retrieve settings.
 */
class Settings {
	/**
	 * Register settings.
	 * This should only be called once, at initialization.
	 */
	init() {
		game.settings.register("betterscrollingtext", "scrollTextEnabled", {
			name: "Enable Better Scrolling Text",
			hint: "Enables/Disables the module without having to restart Foundry.",
			scope: "world",
			config: true,
			default: true,
			type: Boolean
		});

		game.settings.register("betterscrollingtext", "legendaryResistanceEnabled", {
			name: "Legendary Resistance",
			hint: "Enables/Disables the display of the scrolling text for the legendary resistance.",
			scope: "world",
			config: true,
			default: true,
			type: Boolean
		});
	}

	get scrollTextEnabled() {
		return getBSTSetting("scrollTextEnabled");
	}

	get legendaryResistanceEnabled() {
		return getBSTSetting("legendaryResistanceEnabled");
	}
}

/**
 * Class instance that can be used to both initialize and retrieve config
 */
export const BSTSettings = new Settings();

/**
 * Returns a proxy that returns the given config and falls
 * back to global better roll config.
 * @param {Settings} config
 * @returns {Settings}
 */
export const getSettings = config => {
	if (!config || typeof config !== "object") {
		return BSTSettings;
	}

	if (config.__isProxy) {
		return config;
	}

	const proxy = new Proxy(config, {
		get: (target, name) => {
			if (name === "__isProxy") {
				return true;
			}

			if (Reflect.has(target, name)) {
				return Reflect.get(target, name);
			}

			return Reflect.get(BSTSettings, name);
		}
	});

	proxy.isWrapped = true;
	return proxy;
};
