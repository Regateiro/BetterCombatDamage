// Supported fields
export const BCD_FIELDS = {
    LEGENDARY_RESISTANCE: "system.resources.legres.value",
    HP: "system.attributes.hp.value",
    NONE: ""
}

export class ActorUtils {
	static ACTOR_UPDATES = {};
    static ACTOR_UPDATING = {};
    static TEXT_SCROLL = {};

	static addActorUpdate(actor, key, value) {
		if (typeof ActorUtils.ACTOR_UPDATES[actor._id] === 'undefined') {
			ActorUtils.ACTOR_UPDATES[actor._id] = {};
		}

        ActorUtils.ACTOR_UPDATES[actor._id][key] = value;
	}

	static updateActor(actor) {
        if (ActorUtils.ACTOR_UPDATING[actor._id]) {
            ActorUtils.ACTOR_UPDATING[actor._id] = false;
        }
        
		// Update only if there is something to update
		if(typeof ActorUtils.ACTOR_UPDATES[actor._id] === 'undefined' || Object.keys(ActorUtils.ACTOR_UPDATES[actor._id]).length === 0) {
			return;
		}

		actor.update(ActorUtils.ACTOR_UPDATES[actor._id])
		ActorUtils.ACTOR_UPDATES[actor._id] = {};
        ActorUtils.ACTOR_UPDATING[actor._id] = true;
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

        return fields;
    }

    // Returns whether an item makes an attack roll
    static addScrollingText(actor, diff, color) {
        if (!actor || ActorUtils.ACTOR_UPDATING[actor._id] || diff === 0) return;

        if (typeof ActorUtils.TEXT_SCROLL[actor._id] === 'undefined') {
            ActorUtils.TEXT_SCROLL[actor._id] = [];
        }
        
        ActorUtils.TEXT_SCROLL[actor._id].push({diff, color});
    }

    static renderScrollingText(actor) {
        if (typeof ActorUtils.TEXT_SCROLL[actor._id] === 'undefined') {
            return;
        }

        for (let i = 0; i < ActorUtils.TEXT_SCROLL[actor._id].length; i++) {
            const diff = ActorUtils.TEXT_SCROLL[actor._id][i].diff;
            const color = ActorUtils.TEXT_SCROLL[actor._id][i].color;
            setTimeout(() => ActorUtils._displayScrollingText(actor, diff, color), 750 * i);
        }

        ActorUtils.TEXT_SCROLL[actor._id] = [];
    }

    // Returns whether an item makes an attack roll
    static _displayScrollingText(actor, diff, color) {
        if ( !actor ) return;
        const tokens = actor.getActiveTokens(true);
        for ( const t of tokens ) {
            canvas.interface.createScrollingText(t.center, diff.signedString(), {
                anchor: CONST.TEXT_ANCHOR_POINTS.TOP,
                fontSize: 48, // Range between [16, 48]
                fill: color,
                stroke: 0x000000,
                strokeThickness: 4,
                jitter: 0.25
            });
        }
    }
}