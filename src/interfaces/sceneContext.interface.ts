import type { RefObject } from "react"
import type { Coordinate } from "./coordinate.interface" 
import type { Fighter } from "./fighter.interface"

export interface ISceneContext {
    worldSize: RefObject<number>
    NpcList: RefObject<Fighter[]>
    Fighter: RefObject<Fighter | null>
    moveFighter: (coordinate: Coordinate) => void
    isLoaded: boolean,

    currentMatrixCoordinate: Coordinate | null, setCurrentMatrixCoordinate: (value: Coordinate) => void,
    currentWorldCoordinate: Coordinate | null, setCurrentWorldCoordinate: (value: Coordinate) => void,

    controller: {
        direction: RefObject<number>,
        focusedMatrixCoordinate: RefObject<Coordinate | null>,
        focusedWorldCoordinate: RefObject<Coordinate | null>,
        pointerWorldCoordinate: RefObject<Coordinate | null>,
    }
}
