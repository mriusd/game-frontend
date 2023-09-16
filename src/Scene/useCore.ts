import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

import React from "react";

import type { OccupiedCoordinate } from "interfaces/occupied.interface";
import type { ServerCoordinate, WorldCoordinate } from "interfaces/coordinate.interface";
import type { Fighter } from "interfaces/fighter.interface";

import { euclideanDistance } from "Scene/utils/euclideanDistance";
import { getMeshDimensions } from "Scene/utils/getMeshDimensions";

export interface CoreInterface {
    location: string
    worldSize: number
    chunkSize: number
    chunksPerAxis: number
    groundObject: React.RefObject<THREE.Group>

    occupiedCoords: OccupiedCoordinate[]
    updateOccupiedCoord: (item: OccupiedCoordinate, action: 'add' | 'remove') => void
    isOccupiedCoordinate: (coordinate: ServerCoordinate) => boolean

    matrixCoordToWorld: (coordinate: ServerCoordinate) => WorldCoordinate
    worldCoordToMatrix: (coordinate: WorldCoordinate) => ServerCoordinate

    hoveredItems: Fighter[],
    setHoveredItems: (item: Fighter, action: 'add' | 'remove') => void

    _getAvailableNearestSquares: (coordinate: ServerCoordinate) => ServerCoordinate[]
    getNearestEmptySquareToTarget: (currentCoordinate: ServerCoordinate, targetCoordinate: ServerCoordinate) => ServerCoordinate
    getTargetSquareWithAttackDistance: (currentCoordinate: ServerCoordinate, targetCoordinate: ServerCoordinate, minDistance: number) => ServerCoordinate


    sceneObjects: {[key: string]: {id: string; ref: THREE.Mesh | THREE.Group; dimensions: ReturnType<typeof getMeshDimensions>}}
    setSceneObject: (id: string, object: THREE.Mesh | THREE.Group, action: 'add' | 'remove') => void
    getSceneObject: (id: string) => {id: string; ref: THREE.Mesh | THREE.Group; dimensions: ReturnType<typeof getMeshDimensions>} | null

    // For Develop
    devMode: boolean
    setDevMode: (value: boolean) => void
}

export const useCore = createWithEqualityFn<CoreInterface>((set, get) => ({
    location: 'Lorencia',
    
    worldSize: 120,
    chunkSize: 60,
    chunksPerAxis: 120 / 60,
    groundObject: React.createRef(),

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
    isOccupiedCoordinate: (coordinate) => {
        const occupiedCoordinates = get().occupiedCoords
        return occupiedCoordinates.findIndex(occupied => occupied.coordinates.x === coordinate.x && occupied.coordinates.z === coordinate.z) !== -1
    },
    
    matrixCoordToWorld: (coordinate) => {
        const sqsize = (get().worldSize - 1) / 2
        return {
            x: coordinate.x - sqsize,
            z: coordinate.z - sqsize,
        }
    },
    worldCoordToMatrix: (coordinate) => {
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

    _getAvailableNearestSquares: (coordinate) => {
        const nearestSquares = [
            { x: coordinate.x - 1, z: coordinate.z + 0 },
            { x: coordinate.x + 1, z: coordinate.z + 0 },
            { x: coordinate.x + 0, z: coordinate.z - 1 },
            { x: coordinate.x + 0, z: coordinate.z + 1 },
            { x: coordinate.x - 1, z: coordinate.z - 1 },
            { x: coordinate.x - 1, z: coordinate.z + 1 },
            { x: coordinate.x + 1, z: coordinate.z - 1 },
            { x: coordinate.x + 1, z: coordinate.z + 1 }
          ]
          return nearestSquares.filter(coordinate => !get().isOccupiedCoordinate(coordinate))
    },
    getNearestEmptySquareToTarget: (currentCoordinate, targetCoordinate) => {
        const $this = get()

        if (targetCoordinate.x === currentCoordinate.x && targetCoordinate.z === currentCoordinate.z) { return null }

        const currentDistance = euclideanDistance(currentCoordinate, targetCoordinate)
        const availableNearestSquares = $this._getAvailableNearestSquares(currentCoordinate)
        const sortedSquares = availableNearestSquares.map(square => ({
          square,
          distance: euclideanDistance(square, targetCoordinate)
        })).sort((a, b) => a.distance - b.distance)
        
      
        if (currentDistance <= sortedSquares[0].distance) { return null }
      
        const data = {
          distance: sortedSquares[0].distance,
          square: sortedSquares[0].square
        }
      
        return data.square
    },
    getTargetSquareWithAttackDistance: (currentCoordinate, targetCoordinate, minDistance) => {
        const $this = get()

        const currentDistance = euclideanDistance(currentCoordinate, targetCoordinate)
  
        if (currentDistance <= minDistance) { return null }
        
        const availableNearestSquares = $this._getAvailableNearestSquares(currentCoordinate)
        const sortedSquares = availableNearestSquares.map(square => ({
          square,
          distance: euclideanDistance(square, targetCoordinate)
        })).sort((a, b) => a.distance - b.distance)
      
        if (currentDistance <= sortedSquares[0].distance) { return null }
      
        if (sortedSquares[0].distance > minDistance) { 
          return $this.getTargetSquareWithAttackDistance(sortedSquares[0].square, targetCoordinate, minDistance)
        }
      
        const data = {
          distance: sortedSquares[0].distance,
          square: sortedSquares[0].square
        }
      
        return data.square
    },

    sceneObjects: {},
    setSceneObject: (id, object, action) => {
        const $this = get()
        if (action === 'add') {
            set({
                sceneObjects: {
                    ...$this.sceneObjects,
                    [id]: {
                        id,
                        ref: object,
                        dimensions: getMeshDimensions(object)
                    }
                }
            })
            return
        }
        delete $this.sceneObjects[id]
    },
    getSceneObject: (id) => {
        return get().sceneObjects[id] || null
    },

    devMode: false,
    setDevMode: (value) => set({ devMode: value }),
    
}), shallow)