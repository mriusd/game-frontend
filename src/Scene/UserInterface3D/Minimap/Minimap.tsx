import * as THREE from 'three'
import { Plane, useTexture } from "@react-three/drei"
import { getMeshDimensions } from "Scene/utils/getMeshDimensions"
import { useFrame, useThree } from "@react-three/fiber"
import React, { useRef, useMemo, useEffect } from "react"
import { minimap_material } from "./minimap_material"

import { useCore } from 'Scene/useCore'
import { useFighter } from 'Scene/Fighter/useFighter'

const Minimap = ({ ...props }) => {

    const fighterNode = useFighter(state => state.fighterNode)
    const [worldSize, chunkSize] = useCore(state => [state.worldSize, state.chunkSize])

    const textures = useTexture({ map: '/worlds/lorencia/minimap/minimap.png' })
    const planeSize = useMemo(() => new THREE.Vector2(100, 100), [])

    const minimapMaterial = useMemo(() => minimap_material(), [])
    const material = useMemo(() => {
        minimapMaterial.uniforms.uBaseMap.value = textures.map
        return minimapMaterial
    }, [textures])

    // Update Player Position
    useFrame(() => {
        if (!fighterNode.current) { return }
        minimapMaterial.uniforms.uPlayerCoordinate.value = { 
            x: (fighterNode.current.position.x + worldSize / 2 + chunkSize / 2) / (worldSize + chunkSize),
            y: 0, 
            z: (fighterNode.current.position.z + worldSize / 2 + chunkSize / 2) / (worldSize + chunkSize)
        }
    })

    // Update Npc Position
    // useEffect(() => {
    //     if (!NpcList.current.length) { return }
    //     const npces = NpcList.current.slice(0, 100) // max 100 npc to render
    //     console.log(npces)
    //     npces.forEach((npc, i) => {
    //         const uniform = minimapMaterial.uniforms.uNpcCoordinates
    //         const position = matrixCoordToWorld(worldSize, npc.coordinates)
    //         uniform.value[i].x = (position.x + worldSize / 2 + chunkSize / 2) / (worldSize + chunkSize)
    //         uniform.value[i].z = (position.z + worldSize / 2 + chunkSize / 2) / (worldSize + chunkSize)
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
        minimapRef.current.position.y = - height / 2 + planeSize.y / 2 + marginTop
    })


    return (
        <group ref={minimapRef} position={[450, 300, -100]} name="minimap" {...props}>
            <Plane args={[planeSize.x, planeSize.y, 1]} material={material}></Plane>
        </group>

    )
}

export default Minimap