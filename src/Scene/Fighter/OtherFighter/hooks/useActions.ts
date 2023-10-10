import React from "react";

import * as THREE from 'three'
import { useAnimations } from '@react-three/drei';

import { getActionName } from 'Scene/Fighter/utils/getActionName';
import { getActionTimeScale } from 'Scene/Fighter/utils/getActionTimeScale';

import type { Fighter } from 'interfaces/fighter.interface';
import type { AllActionsType } from "Scene/Fighter/useFighter";
import type { ActionsType } from "Scene/Fighter/useFighter";


export const useActions = (animations: THREE.AnimationClip[], ref: React.RefObject<THREE.Mesh>) => {
    const { actions } = useAnimations(animations, ref)
    const actionTimeout = React.useRef<any>(0)
    const action = React.useRef<AllActionsType>('none')

    const setAction = React.useCallback((outerAction: ActionsType, fighter: Fighter) => {
        const oldAction = action.current
        const timeScale = getActionTimeScale(outerAction, fighter)
        action.current = getActionName(outerAction, fighter)

        if (oldAction !== action.current) {
            clearTimeout(actionTimeout.current)
            actions?.[oldAction]?.stop()
            actions?.[action.current]?.reset().setEffectiveTimeScale(timeScale).play()
            if (action.current.includes('die')) {
                actions[action.current].clampWhenFinished = true
                actions?.[action.current]?.setLoop(THREE.LoopOnce, 0)
            } else
            if (action.current.includes('attack')) {
                actionTimeout.current = setTimeout(() => void setAction('stand', fighter), (((actions?.[action.current]?.getClip()?.duration + .1) / timeScale || 0)) * 1000)
            }
        }
        // For Infinite Attack
        else if (oldAction === action.current && action.current.includes('attack')) {
            clearTimeout(actionTimeout.current)
            actionTimeout.current = setTimeout(() => void setAction('stand', fighter), (((actions?.[action.current]?.getClip()?.duration + .1) / timeScale || 0)) * 1000)
        }
    }, [])

    return { setAction, action }
}