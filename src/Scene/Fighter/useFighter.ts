import * as THREE from 'three'
import { createWithEqualityFn } from 'zustand/traditional'
import { shallow } from 'zustand/shallow';
import { Fighter } from 'interfaces/fighter.interface';
import { RefObject, createRef } from 'react';
import type { Coordinate } from 'interfaces/coordinate.interface';
import { getMoveDuration } from 'Scene/utils/getMoveDuration';
import Tween from 'Scene/utils/tween/tween';
import { isEqualCoord } from 'Scene/utils/isEqualCoord';

import { useCore } from 'Scene/useCore';
import { useCloud } from 'EventCloud/useCloud';

import { getActionName } from './utils/getActionName';
import { getActionTimeScale } from './utils/getActionTimeScale';

export type AllActionsType =  'stand' | 'run' | 'attack' | 'die' | 'sword_attack' | 'sword_run' | 'sword_stand' | 'none'
export type ActionsType =  'stand' | 'run' | 'attack' | 'die' | 'none'

export interface UseFighterInterface {
    fighter: Fighter | null
    setFighter: (fighter: Fighter) => void
    fighterNode: RefObject<THREE.Mesh | null>
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

export const useFighter = createWithEqualityFn<UseFighterInterface>((set, get) => ({
    fighter: null,
    setFighter: (fighter) => set({ fighter }),
    fighterNode: createRef(),
    isMoving: false,
    setIsMoving: (isMoving) => set({ isMoving }),
    move: (to) => {
        const $core = useCore.getState()
        const $this = get()
        const ref = $this.fighterNode.current

        if ($this.isMoving) { return }
        if (isEqualCoord(ref.position, to)) { return }
        // console.log('move', ref.position, to)

        const nextMatrixPosition = $core.getNearestEmptySquareToTarget($this.fighter.coordinates, $core.worldCoordToMatrix(to))
        // console.log('nextMatrixPos', nextMatrixPosition)
        if (!nextMatrixPosition) { return }
        const next = $core.matrixCoordToWorld(nextMatrixPosition)

        $this.setIsMoving(true)
        clearTimeout($this.actionTimeout)
        $this.setAction('run')

        useCloud.getState().moveFighter(nextMatrixPosition)
        const current = { x: ref.position.x, z: ref.position.z }
        // console.log('current, next', current, next)
        Tween.to(current, next,
            {
                duration: getMoveDuration($this.fighter.movementSpeed, current, next),
                onChange: (state: { value: Coordinate }) => void $this.setPosition(state.value),
                onComplete: () => { 
                    $this.setIsMoving(false)
                    set({ actionTimeout: setTimeout(() => get().action.includes('run') && $this.setAction('stand'), 50)})
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
        const timeScale = getActionTimeScale(outerAction, $this.fighter)
        set({ action })

        // console.log($this.actions)
        if (oldAction !== action) {
            clearTimeout($this.actionTimeout)
            $this.actions?.[oldAction]?.stop()
            $this.actions?.[action]?.reset().setEffectiveTimeScale(timeScale).play()

            if (action.includes('die')) {
                $this.actions[action].clampWhenFinished = true
                $this.actions?.[action]?.setLoop(THREE.LoopOnce, 0)
            } else
            if (action.includes('attack')) {
                set({ actionTimeout: setTimeout(() => void $this.setAction('stand'), (($this.actions?.[action]?.getClip()?.duration / timeScale || 0)) * 1000) })
            }
        }
        // For Infinite Attack
        else if (oldAction === action && action.includes('attack')) {
            clearTimeout($this.actionTimeout)
            set({ actionTimeout: setTimeout(() => void $this.setAction('stand'), (($this.actions?.[action]?.getClip()?.duration / timeScale || 0)) * 1000) })
        }
    },
}), shallow)