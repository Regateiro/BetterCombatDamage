// Utility class for Actor actions
export class ActorUtils {
    // Returns whether an item makes an attack roll
    static displayScrollingText(actor, diff, color, delay) {
        // If the actor doesn't exist or the difference is 0, don't render
        if ( !actor || diff === 0 ) return;

        // Get the active tokens to render on top of
        const tokens = actor.getActiveTokens(true);
        for ( const t of tokens ) {
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
    };
};
