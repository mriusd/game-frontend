import { useEffect, useState } from "react"
import { matrixCoordToWorld } from "../utils/matrixCoordToWorld"

const MATRIX_MOCK = [
    { x: 0, z: 0, av: true, eq: false },
    { x: 1, z: 0, av: true, eq: false },
    { x: 2, z: 0, av: true, eq: false },
    { x: 3, z: 0, av: true, eq: false },
    { x: 4, z: 0, av: true, eq: false },
    { x: 5, z: 0, av: true, eq: false },
    { x: 6, z: 0, av: true, eq: false },
    { x: 7, z: 0, av: true, eq: false },
    { x: 8, z: 0, av: true, eq: false },
    { x: 9, z: 0, av: true, eq: false },
    { x: 10, z: 0, av: true, eq: false },
    { x: 11, z: 0, av: true, eq: false },
    { x: 12, z: 0, av: true, eq: false },

    { x: 0, z: 1, av: true, eq: false },
    { x: 1, z: 1, av: true, eq: false },
    { x: 2, z: 1, av: true, eq: false },
    { x: 3, z: 1, av: true, eq: false },
    { x: 4, z: 1, av: true, eq: false },
    { x: 5, z: 1, av: true, eq: false },
    { x: 6, z: 1, av: true, eq: false },
    { x: 7, z: 1, av: true, eq: false },
    { x: 8, z: 1, av: true, eq: false },
    { x: 9, z: 1, av: true, eq: false },
    { x: 10, z: 1, av: true, eq: false },
    { x: 11, z: 1, av: true, eq: false },
    { x: 12, z: 1, av: true, eq: false },

    { x: 0, z: 2, av: true, eq: false },
    { x: 1, z: 2, av: true, eq: false },
    { x: 2, z: 2, av: true, eq: false },
    { x: 3, z: 2, av: true, eq: false },
    { x: 4, z: 2, av: true, eq: false },
    { x: 5, z: 2, av: true, eq: false },
    { x: 6, z: 2, av: true, eq: false },
    { x: 7, z: 2, av: true, eq: false },
    { x: 8, z: 2, av: true, eq: false },
    { x: 9, z: 2, av: true, eq: false },
    { x: 10, z: 2, av: true, eq: false },
    { x: 11, z: 2, av: true, eq: false },
    { x: 12, z: 2, av: true, eq: false },

    { x: 0, z: 3, av: true, eq: false },
    { x: 1, z: 3, av: true, eq: false },
    { x: 2, z: 3, av: true, eq: false },
    { x: 3, z: 3, av: true, eq: false },
    { x: 4, z: 3, av: true, eq: false },
    { x: 5, z: 3, av: true, eq: false },
    { x: 6, z: 3, av: true, eq: false },
    { x: 7, z: 3, av: true, eq: false },
    { x: 8, z: 3, av: true, eq: false },
    { x: 9, z: 3, av: true, eq: false },
    { x: 10, z: 3, av: true, eq: false },
    { x: 11, z: 3, av: true, eq: false },
    { x: 12, z: 3, av: true, eq: false },

    { x: 0, z: 4, av: true, eq: false },
    { x: 1, z: 4, av: true, eq: false },
    { x: 2, z: 4, av: true, eq: false },
    { x: 3, z: 4, av: true, eq: false },
    { x: 4, z: 4, av: true, eq: false },
    { x: 5, z: 4, av: true, eq: false },
    { x: 6, z: 4, av: true, eq: false },
    { x: 7, z: 4, av: true, eq: false },
    { x: 8, z: 4, av: true, eq: false },
    { x: 9, z: 4, av: true, eq: false },
    { x: 10, z: 4, av: true, eq: false },
    { x: 11, z: 4, av: true, eq: false },
    { x: 12, z: 4, av: true, eq: false },

    { x: 0, z: 5, av: true, eq: false },
    { x: 1, z: 5, av: true, eq: false },
    { x: 2, z: 5, av: true, eq: false },
    { x: 3, z: 5, av: true, eq: false },
    { x: 4, z: 5, av: true, eq: false },
    { x: 5, z: 5, av: true, eq: false },
    { x: 6, z: 5, av: true, eq: false },
    { x: 7, z: 5, av: true, eq: false },
    { x: 8, z: 5, av: true, eq: false },
    { x: 9, z: 5, av: true, eq: false },
    { x: 10, z: 5, av: true, eq: false },
    { x: 11, z: 5, av: true, eq: false },
    { x: 12, z: 5, av: true, eq: false },

    { x: 0, z: 6, av: true, eq: false },
    { x: 1, z: 6, av: true, eq: false },
    { x: 2, z: 6, av: true, eq: false },
    { x: 3, z: 6, av: true, eq: false },
    { x: 4, z: 6, av: true, eq: false },
    { x: 5, z: 6, av: true, eq: false },
    { x: 6, z: 6, av: true, eq: false },
    { x: 7, z: 6, av: true, eq: false },
    { x: 8, z: 6, av: true, eq: false },
    { x: 9, z: 6, av: true, eq: false },
    { x: 10, z: 6, av: true, eq: false },
    { x: 11, z: 6, av: true, eq: false },
    { x: 12, z: 6, av: true, eq: false },

    { x: 0, z: 7, av: true, eq: false },
    { x: 1, z: 7, av: true, eq: false },
    { x: 2, z: 7, av: true, eq: false },
    { x: 3, z: 7, av: true, eq: false },
    { x: 4, z: 7, av: true, eq: false },
    { x: 5, z: 7, av: true, eq: false },
    { x: 6, z: 7, av: true, eq: false },
    { x: 7, z: 7, av: true, eq: false },
    { x: 8, z: 7, av: true, eq: false },
    { x: 9, z: 7, av: true, eq: false },
    { x: 10, z: 7, av: true, eq: false },
    { x: 11, z: 7, av: true, eq: false },
    { x: 12, z: 7, av: true, eq: false },

    { x: 0, z: 8, av: true, eq: false },
    { x: 1, z: 8, av: true, eq: false },
    { x: 2, z: 8, av: true, eq: false },
    { x: 3, z: 8, av: true, eq: false },
    { x: 4, z: 8, av: true, eq: false },
    { x: 5, z: 8, av: true, eq: false },
    { x: 6, z: 8, av: true, eq: false },
    { x: 7, z: 8, av: true, eq: false },
    { x: 8, z: 8, av: true, eq: false },
    { x: 9, z: 8, av: true, eq: false },
    { x: 10, z: 8, av: true, eq: false },
    { x: 11, z: 8, av: true, eq: false },
    { x: 12, z: 8, av: true, eq: false },

    { x: 0, z: 9, av: true, eq: false },
    { x: 1, z: 9, av: true, eq: false },
    { x: 2, z: 9, av: true, eq: false },
    { x: 3, z: 9, av: true, eq: false },
    { x: 4, z: 9, av: true, eq: false },
    { x: 5, z: 9, av: true, eq: false },
    { x: 6, z: 9, av: true, eq: false },
    { x: 7, z: 9, av: true, eq: false },
    { x: 8, z: 9, av: true, eq: false },
    { x: 9, z: 9, av: true, eq: false },
    { x: 10, z: 9, av: true, eq: false },
    { x: 11, z: 9, av: true, eq: false },
    { x: 12, z: 9, av: true, eq: false },

    { x: 0, z: 10, av: true, eq: false },
    { x: 1, z: 10, av: true, eq: false },
    { x: 2, z: 10, av: true, eq: false },
    { x: 3, z: 10, av: true, eq: false },
    { x: 4, z: 10, av: true, eq: false },
    { x: 5, z: 10, av: true, eq: false },
    { x: 6, z: 10, av: true, eq: false },
    { x: 7, z: 10, av: true, eq: false },
    { x: 8, z: 10, av: true, eq: false },
    { x: 9, z: 10, av: true, eq: false },
    { x: 10, z: 10, av: true, eq: false },
    { x: 11, z: 10, av: true, eq: false },
    { x: 12, z: 10, av: true, eq: false },

    { x: 0, z: 11, av: true, eq: false },
    { x: 1, z: 11, av: true, eq: false },
    { x: 2, z: 11, av: true, eq: false },
    { x: 3, z: 11, av: true, eq: false },
    { x: 4, z: 11, av: true, eq: false },
    { x: 5, z: 11, av: true, eq: false },
    { x: 6, z: 11, av: true, eq: false },
    { x: 7, z: 11, av: true, eq: false },
    { x: 8, z: 11, av: true, eq: false },
    { x: 9, z: 11, av: true, eq: false },
    { x: 10, z: 11, av: true, eq: false },
    { x: 11, z: 11, av: true, eq: false },
    { x: 12, z: 11, av: true, eq: false },

    { x: 0, z: 12, av: true, eq: false },
    { x: 1, z: 12, av: true, eq: false },
    { x: 2, z: 12, av: true, eq: false },
    { x: 3, z: 12, av: true, eq: false },
    { x: 4, z: 12, av: true, eq: false },
    { x: 5, z: 12, av: true, eq: false },
    { x: 6, z: 12, av: true, eq: false },
    { x: 7, z: 12, av: true, eq: false },
    { x: 8, z: 12, av: true, eq: false },
    { x: 9, z: 12, av: true, eq: false },
    { x: 10, z: 12, av: true, eq: false },
    { x: 11, z: 12, av: true, eq: false },
    { x: 12, z: 12, av: true, eq: false },

]

export const useCoordinatesSystem = () => {
    const [ matrix, setMatrix ] = useState({})
    const [ position, setPosition ] = useState()
    useEffect(() => {
        setTimeout(() => {
            const matrix = {
                size: 13,
                value: MATRIX_MOCK,
            }
            setMatrix(matrix)
            // setPosition(matrixCoordToWorld(matrix, matrix.value.find(_ => _.eq)))
        }, 1000)
    }, [])
    return [ matrix, setMatrix, position, setPosition ]
}