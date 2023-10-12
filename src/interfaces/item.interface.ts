import type { BigNumber } from "bignumber.js"
import type { Coordinate } from "./coordinate.interface";

export interface TokenAttributes {
    name: string;
    tokenId?: BigNumber;
    itemLevel?: BigNumber;
    additionalDamage?: BigNumber;
    additionalDefense?: BigNumber;
    fighterId?: BigNumber;
    lastUpdBlock?: BigNumber;
    packSize?: BigNumber;
    luck: boolean;
    skill: boolean;
    itemAttributes?: ItemAttributes;
    itemParameters?: ItemParameters;
    excellentItemAttributes?: ExcellentItemAttributes;
}

interface ItemParameters {
    durability: number;
    classRequired: string;
    strengthRequired: number;
    agilityRequired: number;
    energyRequired: number;
    vitalityRequired: number;
    itemWidth: number;
    itemHeight: number;
    acceptableSlot1: number;
    acceptableSlot2: number;
    minPhysicalDamage: number;
    maxPhysicalDamage: number;
    minMagicDamage: number;
    maxMagicDamage: number;
    defense: number;
    attackSpeed: number;
}

interface ItemAttributes {
    name: string;
    maxLevel?: BigNumber;
    isPackable: boolean;
    isBox: boolean;
    isWeapon: boolean;
    isArmour: boolean;
    isJewel: boolean;
    isWings: boolean;
    isMisc: boolean;
    isConsumable: boolean;
    inShop: boolean;
}

interface ExcellentItemAttributes {
    increaseAttackSpeedPoints?: BigNumber;
    reflectDamagePercent?: BigNumber;
    restoreHPChance?: BigNumber;
    restoreMPChance?: BigNumber;
    doubleDamageChance?: BigNumber;
    ignoreOpponentDefenseChance?: BigNumber;
    lifeAfterMonsterIncrease?: BigNumber;
    manaAfterMonsterIncrease?: BigNumber;
    excellentDamageProbabilityIncrease?: BigNumber;
    attackSpeedIncrease?: BigNumber;
    attackLvl20?: BigNumber;
    attackIncreasePercent?: BigNumber;
    defenseSuccessRateIncrease?: BigNumber;
    goldAfterMonsterIncrease?: BigNumber;
    reflectDamage?: BigNumber;
    maxLifeIncrease?: BigNumber;
    maxManaIncrease?: BigNumber;
    hpRecoveryRateIncrease?: BigNumber;
    mpRecoveryRateIncrease?: BigNumber;
    decreaseDamageRateIncrease?: BigNumber;
}


export interface ItemDroppedEvent {
	itemHash: string;
	item: TokenAttributes;
	qty: BigNumber;
	blockNumber: BigNumber;
	coords: Coordinate;
	ownerId: BigNumber;
}
