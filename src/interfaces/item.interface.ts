import type { BigNumber } from "bignumber.js"
import type { Coordinate } from "./coordinate.interface";

export interface ItemAttributes {
	name: string;
	tokenId: BigNumber;
	itemLevel: BigNumber;
	maxLevel: BigNumber;
	durability: BigNumber;
	classRequired: BigNumber;
	strengthRequired: BigNumber;
	agilityRequired: BigNumber;
	energyRequired: BigNumber;
	vitalityRequired: BigNumber;
	itemWidth: BigNumber;
	itemHeight: BigNumber;
	acceptableSlot1: BigNumber;
	acceptableSlot2: BigNumber;

	baseMinPhysicalDamage: BigNumber;
	baseMaxPhysicalDamage: BigNumber;
	baseMinMagicDamage: BigNumber;
	baseMaxMagicDamage: BigNumber;
	baseDefense: BigNumber;
	attackSpeed: BigNumber;
	additionalDamage: BigNumber;
	additionalDefense: BigNumber;

	fighterId: BigNumber;
	lastUpdBlock: BigNumber;
	itemRarityLevel: BigNumber;
	itemAttributesId: BigNumber;

	luck: boolean;
	skill: boolean;
	isBox: boolean;
	isWeapon: boolean;
	isArmour: boolean;
	isJewel: boolean;
	isWings: boolean;
	isMisc: boolean;
	inShop: boolean;

	// Excellent
	// Wings
	increaseAttackSpeedPoints: BigNumber;
	reflectDamagePercent: BigNumber;
	restoreHPChance: BigNumber;
	restoreMPChance: BigNumber;
	doubleDamageChance: BigNumber;
	ignoreOpponentDefenseChance: BigNumber;

	// Weapons
	lifeAfterMonsterIncrease: BigNumber;
	manaAfterMonsterIncrease: BigNumber;
	excellentDamageProbabilityIncrease: BigNumber;
	attackSpeedIncrease: BigNumber;
	attackLvl20: BigNumber;
	attackIncreasePercent: BigNumber;

	// Armours
	defenseSuccessRateIncrease: BigNumber;
	goldAfterMonsterIncrease: BigNumber;
	reflectDamage: BigNumber;
	maxLifeIncrease: BigNumber;
	maxManaIncrease: BigNumber;
	hpRecoveryRateIncrease: BigNumber;
	mpRecoveryRateIncrease: BigNumber;
	decreaseDamageRateIncrease: BigNumber;
}


export interface ItemDroppedEvent {
	itemHash: string;
	item: ItemAttributes;
	qty: BigNumber;
	blockNumber: BigNumber;
	coords: Coordinate;
	ownerId: BigNumber;
}
