import { BigNumber } from "bignumber.js";

export interface FighterAttributes {
  Name: string;
  TokenID: BigNumber;
  Strength: BigNumber;
  Agility: BigNumber;
  Energy: BigNumber;
  Vitality: BigNumber;
  Experience: BigNumber;
  Class: BigNumber;
  HpPerVitalityPoint: BigNumber;
  ManaPerEnergyPoint: BigNumber;
  HpIncreasePerLevel: BigNumber;
  ManaIncreasePerLevel: BigNumber;
  StatPointsPerLevel: BigNumber;
  AttackSpeed: BigNumber;
  AgilityPointsPerSpeed: BigNumber;
  IsNpc: BigNumber;
}
