import * as THREE from 'three'
import { createWithEqualityFn } from 'zustand/traditional'
import { shallow } from 'zustand/shallow';
import { Fighter } from 'interfaces/fighter.interface';
import { RefObject, createRef } from 'react';
import type { Coordinate } from 'interfaces/coordinate.interface';
import { getMoveDuration } from 'Scene/utils/getMoveDuration';
import Tween from 'Scene/utils/tween/tween';
import { isEqualCoord } from 'Scene/utils/isEqualCoord';

import { calcDirection } from 'Scene/utils/calcDirection';

import { useCore } from 'Scene/useCore';
import { useCloud } from 'EventCloud/useCloud';
import { useControls } from 'Scene/Controls/useControls';

import { getActionName } from './utils/getActionName';
import { getActionTimeScale } from './utils/getActionTimeScale';

import type { WorldCoordinate } from 'interfaces/coordinate.interface';

export type AllActionsType =  'stand' | 'run' | 'attack' | 'die' | 'sword_attack' | 'sword_run' | 'sword_stand' | 'none'
export type ActionsType =  'stand' | 'run' | 'attack' | 'die' | 'none'

export interface UseFighterInterface {
    fighter: Fighter | null
    setFighter: (fighter: Fighter) => void
    fighterNode: RefObject<THREE.Mesh | null>
    isMoving: boolean
    setIsMoving: (isMoving: boolean) => void
    targetCoordinate: WorldCoordinate | null
    move: (to: WorldCoordinate, saveTarget?: boolean) => void
    setPosition: (to: WorldCoordinate) => void

    // Actions
    actions: { [key: string]: THREE.AnimationAction}
    setAllActions: (actions: { [key: string]: THREE.AnimationAction}) => void
    action: AllActionsType
    setAction: (action: ActionsType) => void
}

const moveTimeout = { value: null }
const actionTimeout = { value: null }
export const useFighter = createWithEqualityFn<UseFighterInterface>((set, get) => ({
    fighter: null,
    setFighter: (fighter) => set({ fighter }),
    fighterNode: createRef(),
    isMoving: false,
    setIsMoving: (isMoving) => set({ isMoving }),
    targetCoordinate: null,
    move: (outerTo, saveTarget = true) => {
        if (saveTarget) { set({ targetCoordinate: {...outerTo} }) }

        const $core = useCore.getState()
        const $controls = useControls.getState()
        const $cloud = useCloud.getState()
        const $this = get()
        const ref = $this.fighterNode.current
        const to = $this.targetCoordinate

        if ($this.isMoving) { return }
        if (isEqualCoord(ref.position, to)) { return }

        const serverTo = $core.worldCoordToMatrix(to)
        const nextServerPosition = $core.getNearestEmptySquareToTarget($this.fighter.coordinates, serverTo)
        if (!nextServerPosition) { return }
        const next = $core.matrixCoordToWorld(nextServerPosition)

        // Update Direction
        const moveDirection = calcDirection($this.fighter.coordinates, nextServerPosition)
        $controls.setDirection(Math.atan2(moveDirection.dx, moveDirection.dz))
        $cloud.updateFighterDirection(moveDirection)
        // 

        $this.setIsMoving(true)
        clearTimeout(moveTimeout.value)
        !$this.action.includes('run') && $this.setAction('run')

        $cloud.moveFighter(nextServerPosition)
        const current = { x: ref.position.x, z: ref.position.z }
        Tween.to(current, next,
            {
                duration: getMoveDuration($this.fighter.movementSpeed, current, next),
                onChange: (state: { value: Coordinate }) => void $this.setPosition(state.value),
                onComplete: () => { 
                    $this.setIsMoving(false)
                    moveTimeout.value = setTimeout(() => get().action.includes('run') && $this.setAction('stand'), 50)
                    $this.move($this.targetCoordinate, false)
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
    setAction: (outerAction) => {
        const $this = get()

        const oldAction = $this.action
        const action = getActionName(outerAction, $this.fighter)
        const timeScale = getActionTimeScale(outerAction, $this.fighter)
        set({ action })

        // console.log($this.actions)
        if (oldAction !== action) {
            clearTimeout(actionTimeout.value)
            $this.actions?.[oldAction]?.stop()
            $this.actions?.[action]?.reset().setEffectiveTimeScale(timeScale).play()

            if (action.includes('die')) {
                $this.actions[action].clampWhenFinished = true
                $this.actions?.[action]?.setLoop(THREE.LoopOnce, 0)
            } else
            if (action.includes('attack')) {
                actionTimeout.value = setTimeout(() => void $this.setAction('stand'), ((($this.actions?.[action]?.getClip()?.duration + .1) / timeScale || 0)) * 1000)
            }
        }
        // For Infinite Attack
        else if (oldAction === action && action.includes('attack')) {
            clearTimeout(actionTimeout.value)
            actionTimeout.value = setTimeout(() => void $this.setAction('stand'), ((($this.actions?.[action]?.getClip()?.duration + .1) / timeScale || 0)) * 1000)
        }
    },
}), shallow)