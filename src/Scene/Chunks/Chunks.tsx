
import * as THREE from "three"
import { forwardRef, useEffect, useMemo, useRef, useState, RefObject } from "react"
import { memo } from "react"
import { Coordinate } from "interfaces/coordinate.interface"
// import { makeNoise2D } from "open-simplex-noise"
import { useTexture } from "@react-three/drei"

import { useCore } from "Scene/useCore"
import { useFighter } from "../Fighter/useFighter"

import { Plane } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"

import { useLocationTextures } from "./useLocationTextures"

const Chunks = memo(function Chunks({}) {
    const fighterNode = useFighter(state => state.fighterNode)
    const [ worldSize, chunkSize, chunksPerAxis ] = useCore(state => [state.worldSize, state.chunkSize, state.chunksPerAxis])
    const groundObject = useCore(state => state.groundObject)

    const segmentsSize = 1
    const segmentsX = chunkSize
    const segmentsY = chunkSize
    const sizeX = useMemo(() => segmentsSize * segmentsX, [])
    const sizeY = useMemo(() => segmentsSize * segmentsY, [])
    const geometry = useMemo(() => new THREE.PlaneGeometry(sizeX, sizeY, segmentsX, segmentsY), [])

    const planeBufferSize = useRef([...new Array(4)])
    const planeBuffer = useRef<{ [key: number]: THREE.Mesh | null }>({})
    const planeTextureUrlBuffer = useRef<{ [key: number]: {} }>({})
    const gridHelper = useRef<THREE.GridHelper | null>(null)

    const textures = useLocationTextures()

    // For Dev
    const devMode = useCore(state => state.devMode)
    const mapPlaceholder = useTexture({ map: '/worlds/lorencia/minimap/minimap.png' })

    useFrame(() => {
        if (!fighterNode.current) { return }
        updatePlanePositions(fighterNode.current.position)
        // Show Grid  
        devMode && updateGridHelperPosition(fighterNode.current.position)
    })

    function updatePlanePositions(characterPosition: Coordinate) {
        const { xIndex, zIndex } = getChunkIndices(characterPosition);

        for (let i = 0; i < planeBufferSize.current.length; i++) {
            const plane = planeBuffer.current[i]

            // Calculate the x and y offsets for each plane
            const xOffset = (i % 2) * chunkSize
            const yOffset = Math.floor(i / 2) * chunkSize

            const x = (xIndex * chunkSize) + xOffset;
            const z = (zIndex * chunkSize) + yOffset;

            if (plane.position.x === x && plane.position.z === z) { return }
            console.log('[Chunks]: chunks recalculated')

            // CALC THIS CORRECTLY
            const textureX = zIndex + 1 + yOffset/chunkSize
            const textureZ = xIndex + 1 + xOffset/chunkSize
            
            if (textureX >= 0 && textureZ >= 0 && textureX < chunksPerAxis+1 && textureZ < chunksPerAxis+1) {
                plane.material['map'] = textures[`${textureX}_${textureZ}/map`]
                plane.material['normalMap'] = textures[`${textureX}_${textureZ}/normalMap`]
                plane.material['roughnessMap'] = textures[`${textureX}_${textureZ}/roughnessMap`]
                plane.material['metalnessMap'] = textures[`${textureX}_${textureZ}/metalnessMap`]
            }
            
            plane.position.set(x, 0, z)
        }
    }
    function getChunkIndices(position: Coordinate) {
        const xIndex = Math.floor(position.x / chunkSize)
        const zIndex = Math.floor(position.z / chunkSize)
        return { xIndex, zIndex }
    }
    // Different cuz we put the plain with offset
    function getChunkIndicesForHelper(position: Coordinate) {
        const xIndex = Math.floor((position.x + chunkSize / 2) / chunkSize)
        const zIndex = Math.floor((position.z + chunkSize / 2) / chunkSize)
        return { xIndex, zIndex }
    }
    function updateGridHelperPosition(characterPosition: Coordinate) {
        const { xIndex, zIndex } = getChunkIndicesForHelper(characterPosition)
        // console.log('xIndex, zIndex', xIndex, zIndex)

        // Set the GridHelper position based on the current chunk index
        gridHelper.current.position.set(
            xIndex * chunkSize,
            0.001,
            zIndex * chunkSize
        );
    }

    if (!chunkSize) {
        return <></>
    }
    return (
        <>
            <group name="chunks" ref={groundObject} rotation={[0, 0, 0]}>
                {planeBufferSize.current.map((chunk, i) => (
                    <SwapChunk
                        key={i}
                        index={i}
                        // @ts-expect-error
                        ref={(ref) => planeBuffer.current[i] = ref}
                        geometry={geometry}
                    />
                ))}
            </group>
            { devMode ? (
                <group>
                    <Plane args={[worldSize+chunkSize, worldSize+chunkSize]} rotation={[Math.PI / -2, 0, 0]} position={[0,-0.1,0]}>
                        <meshBasicMaterial color={'white'} {...mapPlaceholder} depthWrite={false} />
                    </Plane>
                    <gridHelper ref={gridHelper} args={[sizeX, sizeY, 'red', 'red']} rotation={[0, 0, 0]} />
                </group>
            ): <></> }
        </>
    )
})

interface SwapChunkProps { geometry: THREE.PlaneGeometry, index: number }
const SwapChunk = forwardRef(({ geometry, index }: SwapChunkProps, ref: any) => {

    return (
        <mesh
            ref={ref}
            name={`swap-chunk-${index}`}
            receiveShadow
            rotation={[Math.PI / -2, 0, 0]}
            geometry={geometry}
        >
            <meshStandardMaterial/>
        </mesh>
    )
})


export default Chunks