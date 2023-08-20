
import * as THREE from "three"
import { forwardRef, useEffect, useMemo, useRef, useState } from "react"
import { useSceneContext } from "store/SceneContext"
import { memo } from "react"
import { Coordinate } from "interfaces/coordinate.interface"
// import { makeNoise2D } from "open-simplex-noise"
import { useTexture } from "@react-three/drei"

import { useCore } from "store/useCore"
import { shallow } from "zustand/shallow"

import { Plane } from "@react-three/drei"

const Chunks = memo(forwardRef(function Chunks(props, ref: any) {
    const { currentWorldCoordinate } = useSceneContext()

    const [ worldSize, chunkSize, chunksPerAxis ] = useCore(state => [state.worldSize, state.chunkSize, state.chunksPerAxis], shallow)

    const segmentsSize = 1
    const segmentsX = chunkSize
    const segmentsY = chunkSize
    const sizeX = segmentsSize * segmentsX
    const sizeY = segmentsSize * segmentsY
    const geometry = useMemo(() => new THREE.PlaneGeometry(sizeX, sizeY, segmentsX, segmentsY), [])

    const planeBufferSize = useRef([...new Array(4)])
    const planeBuffer = useRef<{ [key: number]: THREE.Mesh | null }>({})
    const planeTextureUrlBuffer = useRef<{ [key: number]: {} }>({})
    const gridHelper = useRef<THREE.GridHelper | null>(null)


    // For Dev
    const devMode = useCore(state => state.devMode)
    const mapPlaceholder = useTexture({ map: '/worlds/alex_ground/minimap/minimap.png' })

    useEffect(() => {
        if (!currentWorldCoordinate) { return }
        updatePlanePositions(currentWorldCoordinate)
        // Show grid for testing in chunk   
        if (devMode) {
            updateGridHelperPosition(currentWorldCoordinate)
        }
    }, [currentWorldCoordinate, planeBuffer.current])

    function updatePlanePositions(characterPosition: Coordinate) {
        const { xIndex, zIndex } = getChunkIndices(characterPosition);

        for (let i = 0; i < planeBufferSize.current.length; i++) {
            const plane = planeBuffer.current[i]

            // Calculate the x and y offsets for each plane
            const xOffset = (i % 2) * chunkSize
            const yOffset = Math.floor(i / 2) * chunkSize

            const x = (xIndex * chunkSize) + xOffset;
            const z = (zIndex * chunkSize) + yOffset;
            if (plane.position.x === x && plane.position.z === z && planeTextureUrlBuffer.current[i]) { return }
            console.log('[Chunks]: chunks recalculated')

            // Set new texture to chunk
            // TODO: Remove Clamp, FIXME: fix error index chunk calculation

            // CALC THIS CORRECTLY
            const textureX = zIndex + 1 + yOffset/chunkSize
            const textureZ = xIndex + 1 + xOffset/chunkSize
            
            // Set the plane position based on the current chunk index and offsets
            // console.log(textureX, textureZ)
            if (textureX >= 0 && textureZ >= 0 && textureX < chunksPerAxis+1 && textureZ < chunksPerAxis+1) {
                planeTextureUrlBuffer.current[i] =  { 
                    map: `worlds/alex_ground/map/${textureX}_${textureZ}.png`,
                    normalMap: `worlds/alex_ground/normalMap/${textureX}_${textureZ}.png`,
                    roughnessMap: `worlds/alex_ground/roughnessMap/${textureX}_${textureZ}.png`,
                    metalnessMap: `worlds/alex_ground/metalnessMap/${textureX}_${textureZ}.png`,
                }
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
            <group name="chunks" ref={ref} rotation={[0, 0, 0]}>
                {planeBufferSize.current.map((chunk, i) => (
                    <SwapChunk
                        key={i}
                        index={i}
                        // @ts-expect-error
                        ref={(ref) => planeBuffer.current[i] = ref}
                        textureUrls={planeTextureUrlBuffer.current[i] || ''}
                        geometry={geometry}
                    />
                ))}
            </group>
            { devMode ? (
                <group>
                    <Plane args={[worldSize+chunkSize, worldSize+chunkSize]} rotation={[Math.PI / -2, 0, 0]}>
                        <meshBasicMaterial color={'white'} {...mapPlaceholder} depthWrite={false} />
                    </Plane>
                    <gridHelper ref={gridHelper} args={[sizeX, sizeY, 'red', 'red']} rotation={[0, 0, 0]} />
                </group>
            ): <></> }
        </>
    )
}))

interface SwapChunkProps { geometry: THREE.PlaneGeometry, textureUrls: {}, index: number }
const SwapChunk = forwardRef(({ geometry, textureUrls, index }: SwapChunkProps, ref: any) => {

    return (
        <mesh
            ref={ref}
            name={`swap-chunk-${index}`}
            receiveShadow
            rotation={[Math.PI / -2, 0, 0]}
            geometry={geometry}
        >
            { 
                textureUrls ? <ChunkMaterial textureUrls={textureUrls} /> : <meshStandardMaterial color={0x000000}/>
            }
        </mesh>
    )
})

interface ChunkMaterialProps { textureUrls: {}, opacity?: number, transparent?: boolean }
const ChunkMaterial = ({ textureUrls, ...props }: ChunkMaterialProps) => {
    const textures = useTexture({ ...textureUrls })
    return <meshStandardMaterial {...textures} {...props} />
}


export default Chunks