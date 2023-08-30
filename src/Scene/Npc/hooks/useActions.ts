import * as THREE from 'three'
import React from "react";
import { useAnimations } from '@react-three/drei';

const FADE_DUR = .3

export const useActions = (animations: THREE.AnimationClip[], ref: React.RefObject<THREE.Mesh>) => {
    const { actions } = useAnimations(animations, ref)
    const actionTimeout = React.useRef<any>(0)
    const npcAction = React.useRef<'stand' | 'run' | 'attack' | 'die' | 'none'>('none')
    const setAction = React.useCallback((action: 'stand' | 'run' | 'attack' | 'die' | 'none') => {
        // console.log('setAction', action)
        const oldAction = npcAction.current
        npcAction.current = action

        if (oldAction !== action) {
            clearTimeout(actionTimeout.current)
            actions?.[action]?.reset().fadeIn(FADE_DUR).play()
            actions?.[oldAction]?.fadeOut(FADE_DUR).stop()
            if (action === 'die') {
                actions[action].clampWhenFinished = true
                actions?.[action]?.setLoop(THREE.LoopOnce, 0)
            } else
            if (action === 'attack') {
                actionTimeout.current = setTimeout(() => void setAction('stand'), ((actions?.[action]?.getClip()?.duration || 0)) * 1000)
            }
        }
        // For Infinite Attack
        else if (oldAction === action && action === 'attack') {
            clearTimeout(actionTimeout.current)
            actionTimeout.current = setTimeout(() => void setAction('stand'), ((actions?.[action]?.getClip()?.duration || 0)) * 1000)
        }
    }, [])

    return { setAction, action: npcAction }
}