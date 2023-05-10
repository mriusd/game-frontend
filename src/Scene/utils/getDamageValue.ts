import { Damage } from "interfaces/damage.interface";

export const getDamageValue = (damage: Damage): string => {
    if (damage.damage === BigInt(0)) { return 'Miss' }
    // @ts-expect-error
    if (damage.dmgType.isDouble) { return String(damage.damage / 2) }
    return String(damage.damage)
}