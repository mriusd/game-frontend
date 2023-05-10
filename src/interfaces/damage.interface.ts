export interface Damage {
    npcId: BigInt;
    damage: BigInt;
}

export interface DamageType  {
    isCritical: boolean
    isExcellent: boolean
    isDouble: boolean
    isIgnoreDefence: boolean
}

/*
    Damage colors:
    
    if isIgnoreDefence { light yelow }
    else if isExcellent { light green }
    else if isCritical { light blue }
    else { yellow }

    if double { display twice damage/2 }

*/