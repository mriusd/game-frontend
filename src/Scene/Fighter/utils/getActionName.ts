import type { ActionsType } from "../useFighter"
import type { Fighter } from "interfaces/fighter.interface"

export const getActionName = (action: ActionsType, fighter: Fighter) => {
    const isEmptyHand = !Object.keys(fighter.equipment).find(slotKey => (+slotKey === 6 || +slotKey === 7))

    if (action === 'run') {
        if (!isEmptyHand) return 'run'
        return 'run'
    } else 
    if (action === 'attack') {
        // const isUseSkill = skill.skillId > 0
        if (!isEmptyHand) return 'sword_attack'
        return 'attack'
    } else 
    if (action === 'stand') {
        if (!isEmptyHand) return 'stand'
        return 'stand'
    } else {
        return action
    }
}