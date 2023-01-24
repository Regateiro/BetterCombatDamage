// Supported fields
export const BTS_FIELDS = {
    LEGENDARY_RESISTANCE: "legres",
    HP: "hp",
    NONE: ""
}

// Determines the updated field
export function getUpdatedField(update) {
    if(typeof update.system?.resources?.legres?.value !== 'undefined') {
        return BTS_FIELDS.LEGENDARY_RESISTANCE;
    } else if (typeof update.system?.attributes?.hp?.value !== 'undefined') {
        return BTS_FIELDS.HP;
    }
    return BTS_FIELDS.NONE;
}