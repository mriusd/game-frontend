import type { RefObject } from "react"
import type { Coordinate } from "./coordinate.interface" 
import type { Fighter } from "./fighter.interface"
import type { OccupiedCoordinate } from "./occupied.interface"

export interface ISceneContext {
    worldSize: RefObject<number>
    NpcList: RefObject<Fighter[]>
    Fighter: RefObject<Fighter | null>
    moveFighter: (coordinate: Coordinate) => void
    isLoaded: boolean,

    currentMatrixCoordinate: Coordinate | null, setCurrentMatrixCoordinate: (value: Coordinate) => void,
    currentWorldCoordinate: Coordinate | null, setCurrentWorldCoordinate: (value: Coordinate) => void,

    direction: RefObject<number>,

    controller: {
        direction: number, setDirection: (value: number) => void,
        focusedMatrixCoordinate: Coordinate | null, setFocusedMatrixCoordinate: (coordinate: Coordinate) => void,
        focusedWorldCoordinate: Coordinate | null, setFocusedWorldCoordinate: (coordinate: Coordinate) => void,
        pointerWorldCoordinate: Coordinate | null, setPointerWorldCoordinate: (coordinate: Coordinate) => void
    },

    occupiedCoords: OccupiedCoordinate[], setOccupedCoords: (item: OccupiedCoordinate) => void
}
