import * as THREE from 'three'
import { Plane, useTexture } from "@react-three/drei"
import { getMeshDimensions } from "Scene/utils/getMeshDimensions"
import { useThree } from "@react-three/fiber"
import React, { useRef, useMemo, useEffect } from "react"
import { minimap_material } from "./minimap_material"
import { useSceneContext } from 'store/SceneContext'
import { matrixCoordToWorld } from 'Scene/utils/matrixCoordToWorld'

const Minimap = ({ ...props }) => {
    const { worldSize, chunkSize, currentWorldCoordinate, NpcList } = useSceneContext()

    const textures = useTexture({ map: '/worlds/alex_ground/minimap/minimap.png' })
    const planeSize = useMemo(() => new THREE.Vector2(200, 200), [])

    const minimapMaterial = useMemo(() => minimap_material(), [])
    const material = useMemo(() => {
        minimapMaterial.uniforms.uBaseMap.value = textures.map
        return minimapMaterial
    }, [textures])

    // Update Player Position
    useEffect(() => {
        if (!currentWorldCoordinate) { return }
        minimapMaterial.uniforms.uPlayerCoordinate.value = { 
            x: (currentWorldCoordinate.x + worldSize.current / 2 + chunkSize.current / 2) / (worldSize.current + chunkSize.current),
            y: 0, 
            z: (currentWorldCoordinate.z + worldSize.current / 2 + chunkSize.current / 2) / (worldSize.current + chunkSize.current)
        }
    }, [currentWorldCoordinate])

    // Update Npc Position
    // useEffect(() => {
    //     if (!NpcList.current.length) { return }
    //     const npces = NpcList.current.slice(0, 100) // max 100 npc to render
    //     console.log(npces)
    //     npces.forEach((npc, i) => {
    //         const uniform = minimapMaterial.uniforms.uNpcCoordinates
    //         const position = matrixCoordToWorld(worldSize.current, npc.coordinates)
    //         uniform.value[i].x = (position.x + worldSize.current / 2 + chunkSize.current / 2) / (worldSize.current + chunkSize.current)
    //         uniform.value[i].z = (position.z + worldSize.current / 2 + chunkSize.current / 2) / (worldSize.current + chunkSize.current)
    //         uniform.value[i].y = 0
    //     })
    // }, [NpcList.current])

    // Triggers before paint, draw Minimap on the right
    // TODO: Should i move it to useFrame or to ResizeHandler?
    // Getting Non-reactive Scene data
    const get = useThree(state => state.get)
    const minimapRef = useRef<THREE.Group | null>(null)
    const marginRight = 32
    const marginTop = 32
    React.useLayoutEffect(() => {
        if (!minimapRef.current) { return }
        const { width, height } = get().size
        minimapRef.current.position.x = width / 2 - planeSize.x / 2 - marginRight
        minimapRef.current.position.y = height / 2 - planeSize.y / 2 - marginTop
    })


    return (
        <group ref={minimapRef} position={[450, 300, -100]} name="minimap" {...props}>
            <Plane args={[planeSize.x, planeSize.y, 1]} material={material}></Plane>
        </group>

    )
}

export default Minimap