// Supported fields
export const BTS_FIELDS = {
    LEGENDARY_RESISTANCE: "legres",
    NONE: ""
}

// Scrolling text color
export const BST_COLORS = {
    LEGENDARY_RESISTANCE: 0xFFB300
}

// Determines the updated field
export function getUpdatedField(update) {
    if(typeof update.system?.resources?.legres?.value !== 'undefined') {
        return BTS_FIELDS.LEGENDARY_RESISTANCE;
    }
    return BTS_FIELDS.NONE;
}