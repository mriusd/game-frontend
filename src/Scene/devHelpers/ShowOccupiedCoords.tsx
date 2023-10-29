import { useCore } from "Scene/useCore"
import { Box } from "@react-three/drei"
import React from "react"
export const ShowOccupiedCoords = () => {
    const [occupiedCoords,matrixCoordToWorld] = useCore(state => [state.occupiedCoords, state.matrixCoordToWorld])
    return <>{occupiedCoords.map((_, i) => (
        <Box args={[1, .01, 1]} key={i} position={[matrixCoordToWorld(_.coordinates).x, 0, matrixCoordToWorld(_.coordinates).z]}>
            <meshBasicMaterial color={0xEE0000} />
        </Box>
    ))}</>
}