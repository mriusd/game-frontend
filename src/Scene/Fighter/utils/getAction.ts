import * as THREE from 'three'
import type { Fighter } from 'interfaces/fighter.interface'
import type { Skill } from 'interfaces/skill.interface'

export const getAttackAction = (actions: {[key: string]: THREE.AnimationAction}, fighter: Fighter, skill: Skill) => {
    const isUseSkill = skill.skillId > 0
    const isEmptyHand = !Object.keys(fighter.equipment).find(slotKey => (+slotKey === 6 || +slotKey === 7))
    if (!isUseSkill) {
        if (isEmptyHand) return actions['punch']
        return actions['sword_attack']
    }
    return null
}

export const getRunAction = (actions: {[key: string]: THREE.AnimationAction}, fighter: Fighter) => {
    const isEmptyHand = !Object.keys(fighter.equipment).find(slotKey => (+slotKey === 6 || +slotKey === 7))
    if (!isEmptyHand) return { action: actions['sword_run'], lastAction: actions['run'] }
    return { action: actions['run'], lastAction: actions['sword_run'] } 
}

export const getStandAction = (actions: {[key: string]: THREE.AnimationAction}, fighter: Fighter) => {
    const isEmptyHand = !Object.keys(fighter.equipment).find(slotKey => (+slotKey === 6 || +slotKey === 7))
    if (!isEmptyHand) return { action: actions['sword_stand'], lastAction: actions['stand'] }
    return { action: actions['stand'], lastAction: actions['sword_stand'] }
}