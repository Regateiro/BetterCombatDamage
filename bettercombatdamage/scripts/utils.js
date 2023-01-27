// Supported fields
export const BCD_FIELDS = {
    LEGENDARY_RESISTANCE: "system.resources.legres.value",
    HP: "system.attributes.hp.value",
    TEMP_HP: "system.attributes.hp.temp",
    NONE: ""
};

export const random = (length = 16) => {
    // Declare all characters
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    // Pick characers randomly
    let str = '';
    for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return str;
};

export class ActorUtils {
	static ACTOR_UPDATES = {};

	static addActorUpdate(actor, key, value) {
		if (typeof ActorUtils.ACTOR_UPDATES[actor._id] === 'undefined') {
			ActorUtils.ACTOR_UPDATES[actor._id] = {};
		}

        ActorUtils.ACTOR_UPDATES[actor._id][key] = value;
	}

	static updateActor(actor) {        
		// Update only if there is something to update
		if(typeof ActorUtils.ACTOR_UPDATES[actor._id] === 'undefined' || Object.keys(ActorUtils.ACTOR_UPDATES[actor._id]).length === 0) {
			return;
		}

		actor.update(ActorUtils.ACTOR_UPDATES[actor._id])
		ActorUtils.ACTOR_UPDATES[actor._id] = {};
	}

    // Determines the updated field
    static getUpdatedField(update) {
        let fields = [];

        if (typeof update.system?.attributes?.hp?.value !== 'undefined') {
            fields.push(BCD_FIELDS.HP);
        }

        if(typeof update.system?.resources?.legres?.value !== 'undefined') {
            fields.push(BCD_FIELDS.LEGENDARY_RESISTANCE);
        } 

        if(typeof update.system?.attributes?.hp?.temp !== 'undefined') {
            fields.push(BCD_FIELDS.TEMP_HP);
        }

        return fields;
    }

    // Returns whether an item makes an attack roll
    static displayScrollingText(actor, diff, color, delay) {
        if ( !actor || diff === 0 ) return;
        const tokens = actor.getActiveTokens(true);
        for ( const t of tokens ) {
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
};