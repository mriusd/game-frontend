import React, { useCallback, useRef } from "react"
import { useUi } from "Scene/UserInterface3D/useUI"
import { useCloud } from 'EventCloud/useCloud'
import { useFighter } from 'Scene/Fighter/useFighter'
import { useCore } from "Scene/useCore"

import type { Fighter } from "interfaces/fighter.interface"
import { ThreeEvent } from "@react-three/fiber"


export const usePointerEvents = (npc: Fighter, model?: any) => {
    const nameColor = React.useRef<0xFFFFFF | 0xFF3300>(0xFFFFFF)
    const fighter = useFighter(state => state.fighter)
    const hovered = useRef(false)

    // Set target & hover
    const handlePointerEnter = useCallback((e) => {
        const $ui = useUi.getState()
        if ($ui.pressedKeys.includes('metaleft') || $ui.pressedKeys.includes('altleft')) { 
            return 
        }
        if (npc.isDead) { return }
        e.stopPropagation()
        nameColor.current = 0xFF3300
        $ui.setCursor('pointer')
        useCore.getState().setHoveredItems(npc, 'add')
        hovered.current = true
    }, [npc])

    const handlePointerLeave = useCallback(() => {
        const $ui = useUi.getState()
        const $core = useCore.getState()
        if (!$core.isItemHovered(npc)) { return } // To prevent extra leave events, what leads to mouse flickering
        nameColor.current = 0xFFFFFF
        $ui.setCursor('default')
        $core.setHoveredItems(npc, 'remove')
        hovered.current = false
    }, [npc])

    const handleLeftClick = useCallback((e) => {
        const $ui = useUi.getState()
        if ($ui.pressedKeys.includes('metaleft') || $ui.pressedKeys.includes('altleft')) { 
            handlePointerLeave()
            return 
        }
        if (npc.isDead) { return }
        e.stopPropagation()
        useCloud.getState().setTarget(npc, fighter.skills[0])
    }, [npc])
    const handleRightClick = useCallback((event: ThreeEvent<PointerEvent>) => {
        if (npc.isDead) { return }
        event.stopPropagation()
        useCloud.getState().setTarget(npc, fighter.skills[useCloud.getState().selectedSkill])
    }, [npc])


    return {
        nameColor,
        handlePointerEnter,
        handlePointerLeave,
        handleRightClick,
        handleLeftClick,
        hovered
    }
}