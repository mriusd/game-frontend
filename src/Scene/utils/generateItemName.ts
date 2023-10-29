import { isExcellent } from "./isExcellent";

export const generateItemName = (item: any, qty: any) => {
    let itemName = item.name;

    if (item.itemLevel > 0) {
        itemName += " +" + item.itemLevel;
    }

    if (item.luck) {
        itemName += " +Luck";
    }

    if (item.skill) {
        itemName += " +Skill";
    }

    if (isExcellent(item)) {
        itemName = "Exc " + itemName;
    }

    if (item.additionalDamage > 0) {
        itemName += " +" + item.additionalDamage;
    }

    if (item.additionalDefense > 0) {
        itemName += " +" + item.additionalDefense;
    }

    if (item.name == "Gold") {
        itemName = qty + ' ' + itemName;
    }

    return itemName;
}