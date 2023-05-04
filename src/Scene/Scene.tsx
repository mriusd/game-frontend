import * as THREE from "three"
import { Object3D } from "three"

import { Canvas } from "@react-three/fiber"
import { useRef, memo } from "react"
import { useSceneContext } from "store/SceneContext"
import LoadAssetsContextProvider from "store/LoadAssetsContext"

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
            <Canvas
                shadows
                camera={{
                    position: new THREE.Vector3(...CAMERA_POSITION),
                    near: 0.1,
                    far: 60,
                    fov: 45,
                }}
            >
                <LoadAssetsContextProvider>
                    {/* <color attach="background" args={[0x000000]} /> */}
                    {/* <fog attach="fog" color={0x000000} near={1} far={30} /> */}
                    <Light />
                    {store.npcList.map(npc => <Npc key={npc?.id} npc={npc} />)}
                    <Fighter/>
                    <World ref={worldRef} />
                    <Controller world={worldRef} />
                </LoadAssetsContextProvider>
            </Canvas>
    )
})

export default Scene