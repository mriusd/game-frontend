import type { ActionsType } from "../useFighter"
import type { Fighter } from "interfaces/fighter.interface"

export const getActionTimeScale = (action: ActionsType, fighter: Fighter) => {
    if (action === 'run') {
        return 60 / fighter.movementSpeed * 4
    } else
    if (action === 'attack') {
        return fighter.attackSpeed || 3
    }
    return 1
}