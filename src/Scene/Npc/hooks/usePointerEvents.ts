import React, { useCallback } from "react"
import { useUi } from "Scene/UserInterface3D/useUI"
import { useCloud } from 'EventCloud/useCloud'
import { useFighter } from 'Scene/Fighter/useFighter'
import { useCore } from "Scene/useCore"
import { getHeatbox } from "Scene/utils/getHeatbox"

import type { Fighter } from "interfaces/fighter.interface"


export const usePointerEvents = (npc: Fighter, model?: any) => {
    const nameColor = React.useRef<0xFFFFFF | 0xFF3300>(0xFFFFFF)
    const setTarget = useCloud(state => state.setTarget)
    const fighter = useFighter(state => state.fighter)
    const [setHoveredItems, isItemHovered] = useCore(state => [state.setHoveredItems, state.isItemHovered])


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
        setHoveredItems(npc, 'add')
        const heatbox = getHeatbox(model)
        heatbox && (heatbox.visible = true)
    }, [npc, model])

    const handlePointerLeave = useCallback(() => {
        const $ui = useUi.getState()
        if (!isItemHovered(npc)) { return } // To prevent extra leave events, what leads to mouse flickering
        nameColor.current = 0xFFFFFF
        $ui.setCursor('default')
        setHoveredItems(npc, 'remove')
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
        setTarget(npc, fighter.skills[useCloud.getState().selectedSkill])
    }, [npc, model])
    // const handleRightClick = (event: ThreeEvent<PointerEvent>) => {
        // if (npc.isDead) { return }
    //     // onContextMenu
    //     console.log('Right CLick', event)
    //     setTarget(npc, fighter.skills[1])
    // }


    return {
        nameColor,
        handlePointerEnter,
        handlePointerLeave,
        handleLeftClick
    }
}