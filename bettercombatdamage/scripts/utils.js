// Supported fields
export const BCD_FIELDS = {
    LEGENDARY_RESISTANCE: "legres",
    HP: "hp",
    NONE: ""
}

// Determines the updated field
export function getUpdatedField(update) {
    let fields = [];

    if (typeof update.system?.attributes?.hp?.value !== 'undefined') {
        fields.push(BCD_FIELDS.HP);
    }

    if(typeof update.system?.resources?.legres?.value !== 'undefined') {
        fields.push(BCD_FIELDS.LEGENDARY_RESISTANCE);
    } 

    return fields;
}