import type { RefObject } from "react"
import type { Coordinate } from "./coordinate.interface" 
import type { Fighter } from "./fighter.interface"
import type { OccupiedCoordinate } from "./occupied.interface"
import type { Skill } from "./skill.interface"
import type { ItemDroppedEvent } from "./item.interface"
import type { Group, Mesh } from "three"
import type { ObjectData } from "./sceneData.interface"

export interface ISceneContext {
    html: HTMLElement | null

    worldSize: RefObject<number>
    chunkSize: RefObject<number>
    chunksPerAxis: RefObject<number>

    NpcList: RefObject<Fighter[]>
    setSceneObject: (id: string, object: Mesh | Group, action: 'add' | 'remove') => void, getSceneObject: (id: string) => ObjectData | null,
    DroppedItems: RefObject<any[]>
    fighter: Fighter | null
    moveFighter: (coordinate: Coordinate) => void
    isLoaded: boolean

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
    VisibleDecor: RefObject<any[]>,

    target: { target: Fighter, skill: Skill } | null, setTarget: (target: Fighter | null, skill: Skill | null) => void,
    itemTarget: ItemDroppedEvent, setItemTarget: (item: ItemDroppedEvent) => void

    PlayerList: RefObject<Fighter[]>
}
