import * as THREE from "three"
import { Object3D } from "three"

import { Canvas } from "@react-three/fiber"
import { useRef, memo } from "react"
import { useSceneContext } from "store/SceneContext"
import LoadAssetsContextProvider from "store/LoadAssetsContext"
import { OrbitControls } from "@react-three/drei"

import { CAMERA_POSITION } from "./config"

import Light from "./Light"
import World from "./World"
import Fighter from "./Fighter"
import Npc from "./Npc"
import Controller from "./Controller"
import DroppedItem from "./DroppedItem"
import FloatingDamage from "./FloatingDamage/FloatingDamage"

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
                    {/* <OrbitControls/> */}
                    <Light />
                    {store.NpcList.current.map(npc => <Npc key={npc?.id} npc={npc} />)}
                    {store.DroppedItems.current.map(item => <DroppedItem key={item?.itemHash} item={item} />)}
                    <Fighter/>
                    <World ref={worldRef} />
                    <Controller world={worldRef} />
                    <FloatingDamage/>
                </LoadAssetsContextProvider>
            </Canvas>
    )
})

export default Scene