// Returns whether an item makes an attack roll
export function displayScrollingText(actor, diff, color) {
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