import type { RefObject } from "react"
import type { Coordinate } from "./coordinate.interface" 
import type { Fighter } from "./fighter.interface"
import type { OccupiedCoordinate } from "./occupied.interface"
import type { Skill } from "./skill.interface"
import { ItemDroppedEvent } from "./item.interface"

export interface ISceneContext {
    html: HTMLElement | null
    worldSize: RefObject<number>
    npcList: Fighter[]
    NpcList: RefObject<Fighter[]>
    DroppedItems: RefObject<any[]>
    fighter: Fighter | null
    moveFighter: (coordinate: Coordinate) => void
    isLoaded: boolean,

    isMoving: boolean, setIsMoving: (value: boolean) => void,
    hoveredItems: Fighter[], setHoveredItems: (item: Fighter, action: 'add' | 'remove') => void,


    currentMatrixCoordinate: Coordinate | null, setCurrentMatrixCoordinate: (coordinate: Coordinate) => void,
    currentWorldCoordinate: Coordinate | null, setCurrentWorldCoordinate: (coordinate: Coordinate) => void,
    nextMatrixCoordinate: Coordinate | null, setNextMatrixCoordinate: (coordinate: Coordinate) => void,
    nextWorldCoordinate: Coordinate | null, setNextWorldCoordinate: (coordinate: Coordinate) => void,

    direction: RefObject<number>,

    controller: {
        direction: number, setDirection: (direction: number) => void,
        focusedMatrixCoordinate: Coordinate | null, setFocusedMatrixCoordinate: (coordinate: Coordinate) => void,
        focusedWorldCoordinate: Coordinate | null, setFocusedWorldCoordinate: (coordinate: Coordinate) => void,
        pointerWorldCoordinate: Coordinate | null, setPointerWorldCoordinate: (coordinate: Coordinate) => void
    },

    occupiedCoords: OccupiedCoordinate[], setOccupedCoords: (item: OccupiedCoordinate) => void,

    target: { target: Fighter, skill: Skill } | null, setTarget: (target: Fighter | null, skill: Skill | null) => void,
    itemTarget: ItemDroppedEvent, setItemTarget: (item: ItemDroppedEvent) => void
}
