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
	physicalDamage: BigNumber;
	magicDamage: BigNumber;
	defense: BigNumber;
	attackSpeed: BigNumber;
	defenseSuccessRate: BigNumber;
	additionalDamage: BigNumber;
	additionalDefense: BigNumber;
	increasedExperienceGain: BigNumber;
	damageIncrease: BigNumber;
	defenseSuccessRateIncrease: BigNumber;
	lifeAfterMonsterIncrease: BigNumber;
	manaAfterMonsterIncrease: BigNumber;
	goldAfterMonsterIncrease: BigNumber;
	doubleDamageProbabilityIncrease: BigNumber;
	excellentDamageProbabilityIncrease: BigNumber;
	ignoreOpponentsDefenseRateIncrease: BigNumber;
	reflectDamage: BigNumber;
	maxLifeIncrease: BigNumber;
	maxManaIncrease: BigNumber;
	excellentDamageRateIncrease: BigNumber;
	doubleDamageRateIncrease: BigNumber;
	ignoreOpponentsDefenseSuccessRateIncrease: BigNumber;
	attackDamageIncrease: BigNumber;
	isAncient: BigNumber;
	reflectDamageRateIncrease: BigNumber;
	decreaseDamageRateIncrease: BigNumber;
	hpRecoveryRateIncrease: BigNumber;
	mpRecoveryRateIncrease: BigNumber;
	defenceIncreasePerLevel: BigNumber;
	damageIncreasePerLevel: BigNumber;
	increaseDefenseRate: BigNumber;
	strengthReqIncreasePerLevel: BigNumber;
	agilityReqIncreasePerLevel: BigNumber;
	energyReqIncreasePerLevel: BigNumber;
	vitalityReqIncreasePerLevel: BigNumber;
	attackSpeedIncrease: BigNumber;

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
	isMisc: boolean;
	isConsumable: boolean;
	inShop: boolean;
}

export interface ItemDroppedEvent {
	itemHash: string;
	item: ItemAttributes;
	qty: BigNumber;
	blockNumber: BigNumber;
	coords: Coordinate;
	ownerId: BigNumber;
}
