/**
 * @fileoverview Scene Fighters Heatbox
 * Not used anymore, only for test purpose
 * Now heatbox is included in gltf & configured in 3d tool
 */

import React from "react"
import { useFrame } from "@react-three/fiber"
import { Box } from "@react-three/drei"
import { getMeshDimensions } from "Scene/utils/getMeshDimensions"

const HeatBox = ({ target }) => {
    const ref = React.useRef<THREE.Mesh>()

    const textBoundingBox = React.useRef<ReturnType<typeof getMeshDimensions> | null>(null)
    useFrame(() => {
        if (!ref.current) { return }
        if (!target.current) { return }
        if (!textBoundingBox.current) {
            textBoundingBox.current = getMeshDimensions(target.current)
            return
        }
        const { width, height, depth } = textBoundingBox.current
        ref.current.scale.set(width / 1.5, depth / 1.5, height / 1.5)
        ref.current.position.y = height / 2
    })

    return (
        <Box ref={ref} args={[1, 1, 1]} visible={true}>
            <meshBasicMaterial color={'red'} opacity={.2} transparent={true} />
        </Box>
    )
}

export default HeatBox