
import * as THREE from "three"
import { forwardRef, useEffect, useMemo, useRef, useState } from "react"
import { useSceneContext } from "store/SceneContext"
import { memo } from "react"
import { Coordinate } from "interfaces/coordinate.interface"
// import { makeNoise2D } from "open-simplex-noise"
// import { clamp } from "three/src/math/MathUtils"
import { useTexture } from "@react-three/drei"
import { clamp } from "three/src/math/MathUtils"

const Chunks = memo(forwardRef(function Chunks(props, ref: any) {
    const { chunkSize, chunksPerAxis, worldSize, currentWorldCoordinate } = useSceneContext()

    const segmentsSize = 1
    const segmentsX = chunkSize.current
    const segmentsY = chunkSize.current
    const sizeX = segmentsSize * segmentsX
    const sizeY = segmentsSize * segmentsY
    const geometry = useMemo(() => new THREE.PlaneGeometry(sizeX, sizeY, segmentsX, segmentsY), [])

    const planeBufferSize = useRef([...new Array(4)])
    const planeBuffer = useRef<{ [key: number]: THREE.Mesh | null }>({})
    const planeTextureUrlBuffer = useRef<{ [key: number]: string }>({})
    const gridHelper = useRef<THREE.GridHelper | null>(null)

    useEffect(() => {
        if (!currentWorldCoordinate) { return }
        updatePlanePositions(currentWorldCoordinate)
        // Show grid for testing in chunk   
        updateGridHelperPosition(currentWorldCoordinate)
    }, [currentWorldCoordinate, planeBuffer.current])

    function updatePlanePositions(characterPosition: Coordinate) {
        const { xIndex, zIndex } = getChunkIndices(characterPosition);

        for (let i = 0; i < planeBufferSize.current.length; i++) {
            const plane = planeBuffer.current[i]

            // Calculate the x and y offsets for each plane
            const xOffset = (i % 2) * chunkSize.current
            const yOffset = Math.floor(i / 2) * chunkSize.current

            const x = (xIndex * chunkSize.current) + xOffset;
            const z = (zIndex * chunkSize.current) + yOffset;
            if (plane.position.x === x && plane.position.z === z) { return }
            console.log('[Chunks]: chunks recalculated')

            // Set new texture to chunk
            // TODO: Remove Clamp, FIXME: fix error index chunk calculation
            const textureZ = clamp(0, 5, (x + worldSize.current / 2) / chunksPerAxis.current / 10)
            const textureX = clamp(0, 5, (z + worldSize.current / 2) / chunksPerAxis.current / 10)
            planeTextureUrlBuffer.current[i] = `worlds/lorencia_ground/${textureX}_${textureZ}.png`
            if (textureX < 0 || textureZ < 0 || textureX > chunksPerAxis.current || textureZ > chunksPerAxis.current) {
                planeTextureUrlBuffer.current[i] = ''
            }
            // Set the plane position based on the current chunk index and offsets
            plane.position.set(x, 0, z);
        }
    }
    function getChunkIndices(position: Coordinate) {
        const xIndex = Math.floor(position.x / chunkSize.current)
        const zIndex = Math.floor(position.z / chunkSize.current)
        return { xIndex, zIndex }
    }
    // Different cuz we put the plain with offset
    function getChunkIndicesForHelper(position: Coordinate) {
        const xIndex = Math.floor((position.x + chunkSize.current / 2) / chunkSize.current)
        const zIndex = Math.floor((position.z + chunkSize.current / 2) / chunkSize.current)
        return { xIndex, zIndex }
    }
    function updateGridHelperPosition(characterPosition: Coordinate) {
        const { xIndex, zIndex } = getChunkIndicesForHelper(characterPosition)
        // console.log('xIndex, zIndex', xIndex, zIndex)

        // Set the GridHelper position based on the current chunk index
        gridHelper.current.position.set(
            xIndex * chunkSize.current,
            0.001,
            zIndex * chunkSize.current
        );
    }

    if (!chunkSize.current) {
        return <></>
    }
    return (
        <>
            <group name="chunks" ref={ref}>
                {planeBufferSize.current.map((chunk, i) => (
                    <SwapChunk
                        key={i}
                        index={i}
                        // @ts-expect-error
                        ref={(ref) => planeBuffer.current[i] = ref}
                        textureUrl={planeTextureUrlBuffer.current[i] || ''}
                        geometry={geometry}
                    />
                ))}
            </group>
            <gridHelper ref={gridHelper} args={[sizeX, sizeY, 0x4B4B4B, 0x4B4B4B]} rotation={[0, 0, 0]} />
        </>
    )
}))

interface SwapChunkProps { geometry: THREE.PlaneGeometry, textureUrl: string, index: number }
const SwapChunk = forwardRef(({ geometry, textureUrl, index }: SwapChunkProps, ref: any) => {
    const isHovered = useRef(false)

    return (
        <mesh
            ref={ref}
            name={`swap-chunk-${index}`}
            receiveShadow
            rotation={[Math.PI / -2, 0, 0]}
            geometry={geometry}
            onPointerMove={() => isHovered.current = true}
            onPointerLeave={() => isHovered.current = false}
        >
            { 
                isHovered.current && textureUrl ? <ChunkMaterial textureUrl={textureUrl} /> :
                textureUrl ? <ChunkMaterial textureUrl={textureUrl} /> : <meshStandardMaterial color={0x000000}/>
            }
        </mesh>
    )
})

interface ChunkMaterialProps { textureUrl: string, opacity?: number, transparent?: boolean }
const ChunkMaterial = ({ textureUrl, ...props }: ChunkMaterialProps) => {
    const textures = useTexture({ map: textureUrl })
    return <meshStandardMaterial {...textures} {...props} />
}


export default Chunks