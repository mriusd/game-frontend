import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";
import type { OccupiedCoordinate } from "interfaces/occupied.interface";
import type { Coordinate } from "interfaces/coordinate.interface";
import { RefObject, createRef } from "react";
import type { Fighter } from "interfaces/fighter.interface";

export interface CoreInterface {
    location: string
    worldSize: number
    chunkSize: number
    chunksPerAxis: number
    groundObject: RefObject<THREE.Group>

    occupiedCoords: OccupiedCoordinate[]
    updateOccupiedCoord: (item: OccupiedCoordinate, action: 'add' | 'remove') => void
    isOccupiedCoordinate: (coordinate: Coordinate) => boolean

    matrixCoordToWorld: (coordinate: Coordinate) => Coordinate
    worldCoordToMatrix: (coordinate: Coordinate) => Coordinate

    hoveredItems: Fighter[],
    setHoveredItems: (item: Fighter, action: 'add' | 'remove') => void

    // For Develop
    devMode: boolean
    setDevMode: (value: boolean) => void
}

export const useCore = createWithEqualityFn<CoreInterface>((set, get) => ({
    location: 'Lorencia',
    
    worldSize: 120,
    chunkSize: 60,
    chunksPerAxis: 120 / 60,
    groundObject: createRef(),

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
    isOccupiedCoordinate: (coordinate: Coordinate) => {
        const occupiedCoordinates = get().occupiedCoords
        return occupiedCoordinates.findIndex(occupied => occupied.coordinates.x === coordinate.x && occupied.coordinates.z === coordinate.z) !== -1
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
    },

    hoveredItems: [],
    setHoveredItems: (item, action) => {
        const hoveredItems = get().hoveredItems
        const itemIndex = hoveredItems.findIndex((hoveredItem: Fighter) => hoveredItem.id === item.id)

        if (action === 'add') {
            if (itemIndex === -1) {
                hoveredItems.push(item)
                return set({ hoveredItems })
            }
            return
        }

        if (itemIndex === -1) { return }
        return set({ hoveredItems: [...hoveredItems.slice(0, itemIndex), ...hoveredItems.slice(itemIndex + 1)]})
    },

    devMode: false,
    setDevMode: (value) => set({ devMode: value }),
    
}), shallow)
