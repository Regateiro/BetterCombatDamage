const getBCDSetting = (setting) => game.settings.get("bettercombatdamage", setting);

/**
 * Class type used to initialize and retrieve settings.
 */
class Settings {
	/**
	 * Register settings.
	 * This should only be called once, at initialization.
	 */
	init() {
		
		game.settings.register("bettercombatdamage", "fortitudePointsEnabled", {
			name: "Enable Fortitute Points",
			hint: "Use Legendary Resistance as Fortitude Points (Ishiir).",
			scope: "world",
			config: true,
			default: true,
			type: Boolean
		});

		game.settings.register("bettercombatdamage", "scrollTextEnabled", {
			name: "Enable Damage Scrolling Text",
			hint: "Enables/Disables the module without having to restart Foundry.",
			scope: "world",
			config: true,
			default: true,
			type: Boolean
		});

		game.settings.register("bettercombatdamage", "hitPointsEnabled", {
			name: "Hit Points",
			hint: "Enables/Disables the display of the scrolling text for hit points.",
			scope: "world",
			config: true,
			default: true,
			type: Boolean
		});

		ColorPicker.register(
			"bettercombatdamage",
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
			"bettercombatdamage",
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

		game.settings.register("bettercombatdamage", "legendaryResistanceEnabled", {
			name: "Legendary Resistance",
			hint: "Enables/Disables the display of the scrolling text for the legendary resistance.",
			scope: "world",
			config: true,
			default: true,
			type: Boolean
		});

		ColorPicker.register(
			"bettercombatdamage",
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
	}

	get fortitudePointsEnabled() {
		return getBCDSetting("fortitudePointsEnabled");
	}

	get scrollTextEnabled() {
		return getBCDSetting("scrollTextEnabled");
	}

	get hitPointsEnabled() {
		return getBCDSetting("hitPointsEnabled");
	}

	get hitPointsDamageColor() {
		return getBCDSetting("hitPointsDamageColor");
	}

	get hitPointsHealingColor() {
		return getBCDSetting("hitPointsHealingColor");
	}

	get legendaryResistanceEnabled() {
		return getBCDSetting("legendaryResistanceEnabled");
	}

	get legendaryResistanceColor() {
		return getBCDSetting("legendaryResistanceColor");
	}
}

/**
 * Class instance that can be used to both initialize and retrieve config
 */
export const BCDSettings = new Settings();
