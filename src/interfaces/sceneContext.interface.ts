import type { RefObject } from "react"
import type { Coordinate } from "./coordinate.interface" 
import type { Fighter } from "./fighter.interface"
import type { OccupiedCoordinate } from "./occupied.interface"

export interface ISceneContext {
    worldSize: RefObject<number>
    npcList: Fighter[]
    fighter: Fighter | null
    moveFighter: (coordinate: Coordinate) => void
    isLoaded: boolean,

    isMoving: boolean, setIsMoving: (boolean: boolean) => void,

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

    occupiedCoords: OccupiedCoordinate[], setOccupedCoords: (item: OccupiedCoordinate) => void
}
