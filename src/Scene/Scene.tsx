import * as THREE from "three"
import { Object3D } from "three"

import { Canvas } from "@react-three/fiber"
import { Suspense, useRef, memo } from "react"
import { useSceneContext } from "store/SceneContext"

import { CAMERA_POSITION } from "./config"

import Light from "./Light"
import World from "./World"
import Fighter from "./Fighter"
import Npc from "./Npc"
import Controller from "./Controller"

const Scene = memo(function Scene() {
    const store = useSceneContext()
    const worldRef = useRef<Object3D | null>(null)
    return (
        <Suspense fallback={<span>loading...</span>}>
            {
                store.isLoaded ? 
                (
                    <Canvas
                        shadows
                        camera={{
                            position: new THREE.Vector3(...CAMERA_POSITION),
                            near: 0.1,
                            far: 60,
                            fov: 45,
                        }}
                    >
                        {/* <color attach="background" args={[0x000000]} /> */}
                        {/* <fog attach="fog" color={0x000000} near={1} far={30} /> */}
                        <Light />
                        { store.NpcList.current!.map(npc => <Npc key={npc?.id} npc={npc} />) }
                        <Fighter  />
                        <World ref={worldRef} />
                        <Controller world={worldRef} />
                    </Canvas>
                ) 
                :
                (
                    <span style={{ 
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)', 
                    }}>Fetching data...</span>
                )
            }
        </Suspense>
    )
})

export default Scene