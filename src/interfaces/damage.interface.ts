export interface Damage {
    npcId: BigInt;
    damage: BigInt;
}

export interface DamageType  {
    isCritical: bool
    isExcellent: bool
    isDouble: bool
    isIgnoreDefence: bool
}

/*
    Damage colors:
    
    if isIgnoreDefence { light yelow }
    else if isExcellent { light green }
    else if isCritical { light blue }

    if double { display twice damage/2 }

*/