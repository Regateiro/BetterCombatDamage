// Supported fields
export const BCD_FIELDS = {
    LEGENDARY_RESISTANCE: "legres",
    HP: "hp",
    NONE: ""
}

// Determines the updated field
export function getUpdatedField(update) {
    if(typeof update.system?.resources?.legres?.value !== 'undefined') {
        return BCD_FIELDS.LEGENDARY_RESISTANCE;
    } else if (typeof update.system?.attributes?.hp?.value !== 'undefined') {
        return BCD_FIELDS.HP;
    }
    return BCD_FIELDS.NONE;
}