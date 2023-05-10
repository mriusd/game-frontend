import { Damage } from "interfaces/damage.interface";
import { DAMAGE_COLORS } from "Scene/config";

export const getDamageColor = (damage: Damage): number => {
    if (damage.damage === BigInt(0)) { return DAMAGE_COLORS.miss }
    if (damage.dmgType.isIgnoreDefence) { return DAMAGE_COLORS.ignoreDefence }
    if (damage.dmgType.isExcellent) { return DAMAGE_COLORS.excellent }
    if (damage.dmgType.isCritical) { return DAMAGE_COLORS.critical }
    return DAMAGE_COLORS.other
}