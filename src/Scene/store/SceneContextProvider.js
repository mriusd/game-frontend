import * as THREE from "three"
import { createContext, useState } from "react"
import { useWorldMatrix } from "../hooks/useWorldMatrix"
import { matrixCoordToWorld } from "../utils/matrixCoordToWorld"

export const SceneContext = createContext()

const SceneContextProvider = ({ children }) => {
    const [ matrix, setMatrix ] = useWorldMatrix()
    const [ direction, setDirection ] = useState(0)
    const getPosition = () => {
        if (!matrix.size) { return }
        const pos = matrix.value.find(_ => _.eq)
        return matrixCoordToWorld(matrix, pos)
    }
    const setPosition = ({ x, y, z }) => {
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

    const value = {
        matrix,
        getPosition,
        setPosition,
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