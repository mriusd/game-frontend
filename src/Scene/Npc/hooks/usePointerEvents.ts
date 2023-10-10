import React, { useCallback } from "react"
import { useUi } from "Scene/UserInterface3D/useUI"
import { useCloud } from 'EventCloud/useCloud'
import { useFighter } from 'Scene/Fighter/useFighter'
import { useCore } from "Scene/useCore"

import type { Fighter } from "interfaces/fighter.interface"

export const usePointerEvents = (npc: Fighter) => {
    const nameColor = React.useRef<0xFFFFFF | 0xFF3300>(0xFFFFFF)
    const setTarget = useCloud(state => state.setTarget)
    const fighter = useFighter(state => state.fighter)
    const setCursor = useUi(state => state.setCursor)
    const [setHoveredItems, isItemHovered] = useCore(state => [state.setHoveredItems, state.isItemHovered])


    // Set target & hover
    const handlePointerEnter = useCallback((e) => {
        if (npc.isDead) { return }
        e.stopPropagation()
        nameColor.current = 0xFF3300
        setCursor('pointer')
        setHoveredItems(npc, 'add')
    }, [npc])

    const handlePointerLeave = useCallback(() => {
        if (!isItemHovered(npc)) { return } // To prevent extra leave events, what leads to mouse flickering
        nameColor.current = 0xFFFFFF
        setCursor('default')
        setHoveredItems(npc, 'remove')
    }, [npc])

    const handleLeftClick = useCallback((e) => {
        if (npc.isDead) { return }
        e.stopPropagation()
        setTarget(npc, fighter.skills[0])
    }, [npc])
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