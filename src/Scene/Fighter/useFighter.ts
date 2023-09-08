import * as THREE from 'three'
import { createWithEqualityFn } from 'zustand/traditional'
import { shallow } from 'zustand/shallow';
import { Fighter } from 'interfaces/fighter.interface';
import { RefObject, createRef } from 'react';
import type { Coordinate } from 'interfaces/coordinate.interface';
import { getMoveDuration } from 'Scene/utils/getMoveDuration';
import Tween from 'Scene/utils/tween/tween';
import { isEqualCoord } from 'Scene/utils/isEqualCoord';
import { getNearestEmptySquareToTarget } from 'Scene/utils/getNextPosition';

import { useCore } from 'store/useCore';
import { useEvents } from 'store/EventStore';

export type AllActionsType =  'stand' | 'run' | 'attack' | 'die' | 'sword_attack' | 'sword_run' | 'sword_stand' | 'none'
export type ActionsType =  'stand' | 'run' | 'attack' | 'die' | 'none'


export interface UseFighterInterface {
    fighter: Fighter | null
    setFighter: (fighter: Fighter) => void
    fighterNode: RefObject<THREE.Mesh | null>
    otherFightersNode: RefObject<THREE.Mesh | null>[]
    setOtherFightersNode: (node: THREE.Mesh, action: 'add' | 'remove') => void
    isMoving: boolean
    setIsMoving: (isMoving: boolean) => void
    move: (to: Coordinate) => void
    setPosition: (to: Coordinate) => void

    // Actions
    actions: { [key: string]: THREE.AnimationAction}
    setAllActions: (actions: { [key: string]: THREE.AnimationAction}) => void
    action: AllActionsType
    setAction: (action: ActionsType) => void
    actionTimeout: any
}

const FADE_DUR = .3

export const useFighter = createWithEqualityFn<UseFighterInterface>((set, get) => ({
    fighter: null,
    setFighter: (fighter) => set({ fighter }),
    fighterNode: createRef(),
    otherFightersNode: [],
    // TODO: Add other fighters node manager system
    setOtherFightersNode: (node, action) => { },
    isMoving: false,
    setIsMoving: (isMoving) => set({ isMoving }),
    move: (to) => {
        const $core = useCore.getState()
        const $this = get()
        const ref = $this.fighterNode.current

        if ($this.isMoving) { return }
        if (isEqualCoord(ref.position, to)) { return }
        // console.log('move', ref.position, to)

        const nextMatrixPosition = getNearestEmptySquareToTarget($core.occupiedCoords, $this.fighter.coordinates, $core.worldCoordToMatrix(to))
        // console.log('nextMatrixPos', nextMatrixPosition)
        if (!nextMatrixPosition) { return }
        const next = $core.matrixCoordToWorld(nextMatrixPosition)

        $this.setIsMoving(true)
        clearTimeout($this.actionTimeout)
        $this.setAction('run')

        useEvents.getState().moveFighter(nextMatrixPosition)
        const current = { x: ref.position.x, z: ref.position.z }
        // console.log('current, next', current, next)
        Tween.to(current, next,
            {
                duration: getMoveDuration($this.fighter.movementSpeed, current, next),
                onChange: (state: { value: Coordinate }) => void $this.setPosition(state.value),
                onComplete: () => { 
                    $this.setIsMoving(false)
                    set({ actionTimeout: setTimeout(() => get().action === 'run' && $this.setAction('stand'), 50)})
                },
            }
        )
    },
    setPosition: (to: Coordinate) => {
        const ref = get().fighterNode.current
        ref.position.x = to.x
        ref.position.z = to.z
    },

    setAllActions: (actions) => set({ actions }),
    actions: {},
    action: 'none',
    actionTimeout: 0,
    setAction: (outerAction) => {
        const $this = get()
        const oldAction = $this.action
        const action = getActionName(outerAction, $this.fighter)
        console.log(oldAction, action)
        set({ action })

        // console.log($this.actions)
        if (oldAction !== action) {
            clearTimeout($this.actionTimeout)
            $this.actions?.[oldAction]?.fadeOut(FADE_DUR).stop()
            $this.actions?.[action]?.reset().fadeIn(FADE_DUR).play()
            if (action.includes('die')) {
                $this.actions[action].clampWhenFinished = true
                $this.actions?.[action]?.setLoop(THREE.LoopOnce, 0)
            } else
            if (action.includes('attack')) {
                set({ actionTimeout: setTimeout(() => void $this.setAction('stand'), (($this.actions?.[action]?.getClip()?.duration || 0)) * 1000) })
            }
        }
        // For Infinite Attack
        else if (oldAction === action && action.includes('attack')) {
            clearTimeout($this.actionTimeout)
            set({ actionTimeout: setTimeout(() => void $this.setAction('stand'), (($this.actions?.[action]?.getClip()?.duration || 0)) * 1000) })
        }
    },
}), shallow)

function getActionName(action: ActionsType, fighter: Fighter) {
    const isEmptyHand = !Object.keys(fighter.equipment).find(slotKey => (+slotKey === 6 || +slotKey === 7))

    if (action === 'run') {
        if (!isEmptyHand) return 'sword_run'
        return 'run'
    } else 
    if (action === 'attack') {
        // const isUseSkill = skill.skillId > 0
        if (!isEmptyHand) return 'sword_attack'
        return 'attack'
    } else 
    if (action === 'stand') {
        if (!isEmptyHand) return 'sword_stand'
        return 'stand'
    } else {
        return action
    }
}