import { createContext, useEffect, useState } from "react"
import { useCoordinatesSystem } from "../hooks/useCoordinatesSystem"
import { getNextPosition } from "../utils/getNextPosition"

import { CHARACTER_SETTINGS } from "../config"
import { matrixCoordToWorld } from "../utils/matrixCoordToWorld"

import Tween from "../utils/tween/tween"

export const SceneContext = createContext()

const SceneContextProvider = ({ children }) => {
    const [ matrix, setMatrix, position, setPosition ] = useCoordinatesSystem() //position in matrix & world
    const [ targetPosition, setTargetPosition ] = useState()
    const [ direction, setDirection ] = useState(0)

    const getMatrixPosition = () => {
        if (!matrix.size) { return }
        const pos = matrix.value.find(_ => _.eq)
        return { x: pos.x, z: pos.z }
    }
    const setMatrixPosition = ({ x, y, z }) => {
        if (!matrix.size) { return }
        setMatrix(prev => {
            const newMatrix = { ...prev }
            const currentPosition = newMatrix.value.find(_ => _.eq)
            const newPosition = newMatrix.value.find(_ => _.x === x && _.z === z /*&& _.y === y*/)
            
            if (!newPosition) {
                console.warn('[STORE]: Matrix point not found')
                return newMatrix
            }

            currentPosition.eq = false
            currentPosition.av = true

            newPosition.av = false
            newPosition.eq = true

            return newMatrix
        }) 
    }

    useEffect(() => {
        if (!matrix.size) { return }
        const currentPosition = getMatrixPosition()
        if (!currentPosition || !targetPosition) { return }

        // prevent infinite loop if clicked on position which no in matrix
        const targetMatrixPosition = matrix.value.find(_ => _.x === targetPosition.x && _.z === targetPosition.z /*&& _.y === y*/)
        if (!targetMatrixPosition) { return }
        // 

        if ( targetPosition.x === currentPosition.x && targetPosition.z === currentPosition.z ) { return }
        console.log('[STORE]:move:step')
        const nextPosition = getNextPosition(currentPosition, targetPosition)
        const currentWorldPosition = matrixCoordToWorld(matrix, currentPosition)
        const nextWorldPosition = matrixCoordToWorld(matrix, nextPosition)
        Tween.to(currentWorldPosition, nextWorldPosition,
            {
                duration: 200 / CHARACTER_SETTINGS.speed,
                onChange(state) {
                    console.log(state.value)
                    setPosition(state.value)
                },
                onComplete() {
                    setPosition(nextWorldPosition)
                    setMatrixPosition(nextPosition)
                },
            }
        )
    }, [ targetPosition, matrix ]) 

    const value = {
        matrix,
        getMatrixPosition,
        targetPosition,
        position,
        setMatrixPosition,
        setTargetPosition,
        direction,
        setDirection
    } 

    return (
        <SceneContext.Provider value={value}>
            { children }
        </SceneContext.Provider>
    )
}

export default SceneContextProvider