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

		ColorPicker.register(
			"betterscrollingtext",
			"legendaryResistanceColor", 
			{
			  name: "Legendary Resistance Text Color",
			  hint: "Sets the scrolling text color of the legendary resistance.",
			  scope: "client",
			  config: true,
			  default: "#FFB300FF"
			},
			{
			  format: "hexa",
			  alphaChannel: true
			}
		)

		game.settings.register("betterscrollingtext", "hitPointsEnabled", {
			name: "Hit Points",
			hint: "Enables/Disables the display of the scrolling text for hit points.",
			scope: "world",
			config: true,
			default: true,
			type: Boolean
		});

		ColorPicker.register(
			"betterscrollingtext",
			"hitPointsDamageColor", 
			{
			  name: "Hit Points Damage Text Color",
			  hint: "Sets the scrolling text color of damage to hit points.",
			  scope: "client",
			  config: true,
			  default: "#FF0000FF"
			},
			{
			  format: "hexa",
			  alphaChannel: true
			}
		)
		
		ColorPicker.register(
			"betterscrollingtext",
			"hitPointsHealingColor", 
			{
			  name: "Hit Points Healing Text Color",
			  hint: "Sets the scrolling text color of healing to hit points.",
			  scope: "client",
			  config: true,
			  default: '#00FF00FF'
			},
			{
			  format: "hexa",
			  alphaChannel: true
			}
		)
	}

	get scrollTextEnabled() {
		return getBSTSetting("scrollTextEnabled");
	}

	get legendaryResistanceEnabled() {
		return getBSTSetting("legendaryResistanceEnabled");
	}

	get legendaryResistanceColor() {
		return getBSTSetting("legendaryResistanceColor");
	}

	get hitPointsEnabled() {
		return getBSTSetting("hitPointsEnabled");
	}

	get hitPointsDamageColor() {
		return getBSTSetting("hitPointsDamageColor");
	}

	get hitPointsHealingColor() {
		return getBSTSetting("hitPointsHealingColor");
	}
}

/**
 * Class instance that can be used to both initialize and retrieve config
 */
export const BSTSettings = new Settings();
