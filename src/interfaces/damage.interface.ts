export interface Damage {
    npcId: BigInt;
    damage: BigInt;
    dmgType: any
}

export interface DamageType  {
    isCritical: boolean
    isExcellent: boolean
    isDouble: boolean
    isIgnoreDefence: boolean
}