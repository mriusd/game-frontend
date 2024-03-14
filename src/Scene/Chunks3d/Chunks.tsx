
import * as THREE from "three"
import { forwardRef, useEffect, useMemo, useRef, useState, RefObject } from "react"
import { memo } from "react"
import { Coordinate } from "interfaces/coordinate.interface"
// import { makeNoise2D } from "open-simplex-noise"
import { Detailed, useTexture } from "@react-three/drei"

import { useCore } from "Scene/useCore"
import { useFighter } from "../Fighter/useFighter"

import { Plane } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"

import { useLocationTextures } from "./useLocationTextures"
import { useGLTFLoaderStore } from "Scene/GLTFLoader/GLTFLoaderStore"

const Chunks = memo(function Chunks({}) {
    const fighterNode = useFighter(state => state.fighterNode)
    const [ worldSize, chunkSize, location ] = useCore(state => [state.worldSize, state.chunkSize, state.location])
    const groundObject = useCore(state => state.groundObject)

    const buffer = useMemo(() => new Array(worldSize / chunkSize), [worldSize, chunkSize])

    const gridHelper = useRef<THREE.GridHelper | null>(null)

    // For Dev
    const devMode = useCore(state => state.devMode)
    const mapPlaceholder = useTexture({ map: `/worlds/${location.toLowerCase()}/minimap/minimap.png` })

    const models = useGLTFLoaderStore(state => state.models)

    useFrame(() => {
        if (!fighterNode.current) { return }
        // Show Grid  
        devMode && updateGridHelperPosition(fighterNode.current.position)
    })

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
            <group name="chunks" ref={groundObject} position={[0, 0, 0]} rotation={[0, 0, 0]}>
                {[...buffer].map((_, i) => [...buffer].map((__, j) => { 

                    return (
                    // // @ts-expect-error
                    // <Detailed position={[i * chunkSize - worldSize / 2, 0, j * chunkSize - worldSize / 2]} key={i + '_' + j} distances={[0, chunkSize]}>
                    //     <primitive scale={[1, 1, 1]} object={models.current[`lorencia_${j}_${i}`].scene}/>
                    //     <mesh />
                    // </Detailed>
                    <primitive position={[i * chunkSize - worldSize / 2 + chunkSize/2, 0, j * chunkSize - worldSize / 2 + chunkSize/2]} scale={[1, 1, 1]} key={i + '_' + j} object={models.current[`lorencia_${j}_${i}`].scene}/>
                )}))}
            </group>
            { devMode ? (
                <group>
                    <Plane args={[worldSize, worldSize]} rotation={[Math.PI / -2, 0, 0]} position={[0,-0.1,0]}>
                        {/* <meshBasicMaterial color={'white'} {...mapPlaceholder} depthWrite={false} /> */}
                        <meshBasicMaterial color={'red'} transparent={true} opacity={.1} depthWrite={false} />
                    </Plane>
                    <gridHelper ref={gridHelper} args={[chunkSize, chunkSize, 'red', 'red']} rotation={[0, 0, 0]} />
                </group>
            ): <></> }
        </>
    )
})


export default Chunks