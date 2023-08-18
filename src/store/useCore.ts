import { create } from "zustand";
import type { OccupiedCoordinate } from "interfaces/occupied.interface";
import type { Coordinate } from "interfaces/coordinate.interface";

export interface CoreInterface {
    worldSize: number,
    chunkSize: number,
    chunksPerAxis: number,

    occupiedCoords: OccupiedCoordinate[]
    updateOccupiedCoord: (item: OccupiedCoordinate, action: 'add' | 'remove') => void

    matrixCoordToWorld: (coordinate: Coordinate) => Coordinate
    worldCoordToMatrix: (coordinate: Coordinate) => Coordinate
}

export const useCore = create<CoreInterface>((set, get) => ({
    worldSize: 120,
    chunkSize: 60,
    chunksPerAxis: 120 / 60,

    occupiedCoords: [],
    updateOccupiedCoord(item, action) {
        if (!item.coordinates || !item.id) { return console.warn("[useCore:updateOccupiedCoord]: invalid item") }
        
        const newState = get().occupiedCoords
        const itemIndex = newState.findIndex((occupiedCoord: OccupiedCoordinate) => occupiedCoord.id === item.id)
        
        if (action === 'remove') {
            if (itemIndex === -1) { return newState }
            return set({ occupiedCoords: [...newState.slice(0, itemIndex), ...newState.slice(itemIndex + 1)] })
        }
        
        if (itemIndex === -1) {
            newState.push(item)
            return set({ occupiedCoords: newState }) 
        }
        return set({ occupiedCoords: [...newState.slice(0, itemIndex), ...newState.slice(itemIndex + 1), item] }) 
    },
    
    matrixCoordToWorld: (coordinate: Coordinate) => {
        const sqsize = (get().worldSize - 1) / 2
        return {
            x: coordinate.x - sqsize,
            z: coordinate.z - sqsize,
        }
    },
    worldCoordToMatrix: (coordinate: Coordinate) => {
        const worldSize = get().worldSize
        const sqsize = (worldSize - 1) / 2
        return {
            x: Math.min(Math.max(Math.round(coordinate.x + sqsize), 0), worldSize-1),
            z: Math.min(Math.max(Math.round(coordinate.z + sqsize), 0), worldSize-1)
        }
    }
    
}))