
import * as THREE from "three"
import { forwardRef, useEffect, useMemo, useRef } from "react"
import { useSceneContext } from "store/SceneContext"
import { memo } from "react"
import { Coordinate } from "interfaces/coordinate.interface"
import { makeNoise2D } from "open-simplex-noise"
import { clamp } from "three/src/math/MathUtils"

const Chunks = memo(forwardRef(function Chunks(props, ref: any) {
    const { chunkSize, currentWorldCoordinate } = useSceneContext()

    const segmentsSize = 1
    const segmentsX = chunkSize.current
    const segmentsY = chunkSize.current
    const sizeX = segmentsSize * segmentsX
    const sizeY = segmentsSize * segmentsY
    const geometry = useMemo(() => new THREE.PlaneGeometry(sizeX, sizeY, segmentsX, segmentsY), [])
    const material = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x6C6C6C, vertexColors: true }), [])

    const planeBufferSize = useRef([...new Array(4)])
    const planeBuffer = useRef<{ [key: number]: THREE.Mesh | null }>({})
    const gridHelper = useRef<THREE.GridHelper | null>(null)
    const isGenerated = useRef(false)

    useEffect(() => {
        if (!currentWorldCoordinate) { return }
        updatePlanePositions(currentWorldCoordinate)
    }, [currentWorldCoordinate, planeBuffer.current])

    function generateTerrainColors(geometry: THREE.BufferGeometry, offsetX: number, offsetY: number, noiseScale: number) {
        const noise2D = makeNoise2D(Date.now());
        const colors = [];
        // @ts-expect-error
        const positions = geometry.getAttribute('position').array;

        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const z = positions[i + 1];
            const heightValue = clamp(0, noise2D((x + offsetX) * noiseScale, (z + offsetY) * noiseScale), 1);
            colors.push(new THREE.Color(0x180A0A * heightValue));
        }

        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors.map(c => c.toArray()).flat(), 3));
    }
    function updatePlanePositions(characterPosition: Coordinate) {
        const { xIndex, zIndex } = getChunkIndices(characterPosition);

        for (let i = 0; i < planeBufferSize.current.length; i++) {
            const plane = planeBuffer.current[i];

            // Calculate the x and y offsets for each plane
            const xOffset = (i % 2) * chunkSize.current;
            const yOffset = Math.floor(i / 2) * chunkSize.current;

            const x = (xIndex * chunkSize.current) + xOffset;
            const z = (zIndex * chunkSize.current) + yOffset;
            if (plane.position.x === x && plane.position.z === z) { return }
            console.log('[Chunks]: chunks recalculated')

            // Set the plane position based on the current chunk index and offsets
            plane.position.set(x, 0, z);

            // Show grid for testing in chunk   
            updateGridHelperPosition(characterPosition)



            if (!isGenerated.current) {
                // Generate terrain colors for the plane
                const noiseScale = .05;
                generateTerrainColors(plane.geometry, x, z, noiseScale);
            }
        }
        isGenerated.current = true
    }
    function getChunkIndices(position: Coordinate) {
        const xIndex = Math.floor(position.x / chunkSize.current)
        const zIndex = Math.floor(position.z / chunkSize.current)
        return { xIndex, zIndex }
    }
    function updateGridHelperPosition(characterPosition: Coordinate) {
        const { xIndex, zIndex } = getChunkIndices(characterPosition)

        // Set the GridHelper position based on the current chunk index
        gridHelper.current.position.set(
            xIndex * chunkSize.current + chunkSize.current / 2,
            0.001,
            zIndex * chunkSize.current + chunkSize.current / 2
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
                        material={material}
                        geometry={geometry}
                    />
                ))}
            </group>
            <gridHelper ref={gridHelper} args={[chunkSize.current, chunkSize.current, 0x6B6B6B, 0x6B6B6B]} rotation={[0, 0, 0]} />
        </>
    )
}))

interface SwapChunkProps { geometry: THREE.PlaneGeometry, material: THREE.MeshStandardMaterial, index: number }
const SwapChunk = forwardRef(({ geometry, material, index }: SwapChunkProps, ref: any) => {
    return (
        <mesh
            ref={ref}
            name={`swap-chunk-${index}`}
            receiveShadow
            rotation={[Math.PI / -2, 0, 0]}
            material={material}
            geometry={geometry}
        ></mesh>
    )
})


export default Chunks