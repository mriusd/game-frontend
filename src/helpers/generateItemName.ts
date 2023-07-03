import type { ItemAttributes, ItemDroppedEvent } from "interfaces/item.interface";

export const generateItemName = (item: ItemAttributes, qty: number) => {
    ////@console.log("[generateItemName] ", item.name);
    var itemName = item.name;

    // @ts-expect-error
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
    // @ts-expect-error
    if (item.additionalDamage > 0) {
        itemName += " +" + item.additionalDamage;
    }
    // @ts-expect-error
    if (item.additionalDefense > 0) {
        itemName += " +" + item.additionalDefense;
    }
    // @ts-expect-error
    if (item.itemAttributesId == 1) {
        itemName = qty + ' ' + itemName;
    }

    return itemName;
}

function isExcellent(item: any) {
    if (item.lifeAfterMonsterIncrease == 1 ||
        item.manaAfterMonsterIncrease == 1 ||
        item.excellentDamageProbabilityIncrease == 1 ||
        item.attackSpeedIncrease == 1 ||
        item.damageIncrease == 1 ||

        item.defenseSuccessRateIncrease == 1 ||
        item.goldAfterMonsterIncrease == 1 ||
        item.reflectDamage == 1 ||
        item.maxLifeIncrease == 1 ||
        item.maxManaIncrease == 1 ||
        item.hpRecoveryRateIncrease == 1 ||
        item.mpRecoveryRateIncrease == 1 ||
        item.decreaseDamageRateIncrease == 1
    ) {
        return true;
    }

    return false;
}