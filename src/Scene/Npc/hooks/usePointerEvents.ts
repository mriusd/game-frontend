import React, { useCallback } from "react"
import { useUi } from "Scene/UserInterface3D/useUI"
import { useCloud } from 'EventCloud/useCloud'
import { useFighter } from 'Scene/Fighter/useFighter'
import { useCore } from "Scene/useCore"
import { getHeatbox } from "Scene/utils/getHeatbox"

import type { Fighter } from "interfaces/fighter.interface"
import { ThreeEvent } from "@react-three/fiber"


export const usePointerEvents = (npc: Fighter, model?: any) => {
    const nameColor = React.useRef<0xFFFFFF | 0xFF3300>(0xFFFFFF)
    const fighter = useFighter(state => state.fighter)

    // Set target & hover
    const handlePointerEnter = useCallback((e) => {
        const $ui = useUi.getState()
        if ($ui.pressedKeys.includes('metaleft') || $ui.pressedKeys.includes('altleft')) { 
            handlePointerLeave()
            return 
        }
        if (npc.isDead) { return }
        e.stopPropagation()
        nameColor.current = 0xFF3300
        $ui.setCursor('pointer')
        useCore.getState().setHoveredItems(npc, 'add')
        const heatbox = getHeatbox(model)
        heatbox && (heatbox.visible = true)
    }, [npc, model])

    const handlePointerLeave = useCallback(() => {
        const $ui = useUi.getState()
        const $core = useCore.getState()
        if (!$core.isItemHovered(npc)) { return } // To prevent extra leave events, what leads to mouse flickering
        nameColor.current = 0xFFFFFF
        $ui.setCursor('default')
        $core.setHoveredItems(npc, 'remove')
        const heatbox = getHeatbox(model)
        heatbox && (heatbox.visible = false)
    }, [npc, model])

    const handleLeftClick = useCallback((e) => {
        const $ui = useUi.getState()
        if ($ui.pressedKeys.includes('metaleft') || $ui.pressedKeys.includes('altleft')) { 
            handlePointerLeave()
            return 
        }
        if (npc.isDead) { return }
        e.stopPropagation()
        useCloud.getState().setTarget(npc, fighter.skills[0])
    }, [npc, model])
    const handleRightClick = useCallback((event: ThreeEvent<PointerEvent>) => {
        if (npc.isDead) { return }
        event.stopPropagation()
        useCloud.getState().setTarget(npc, fighter.skills[useCloud.getState().selectedSkill])
    }, [])


    return {
        nameColor,
        handlePointerEnter,
        handlePointerLeave,
        handleRightClick,
        handleLeftClick
    }
}