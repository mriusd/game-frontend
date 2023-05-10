import * as THREE from "three"
import { Object3D } from "three"

import { Canvas } from "@react-three/fiber"
import { useRef, memo } from "react"
import { useSceneContext } from "store/SceneContext"
import LoadAssetsContextProvider from "store/LoadAssetsContext"
import { OrbitControls, Stats } from "@react-three/drei"

import { CAMERA_POSITION } from "./config"

import Light from "./Light"
import Chunks from "./Chunks"
import Fighter from "./Fighter"
import Npc from "./Npc"
import Controller from "./Controller"
import DroppedItem from "./DroppedItem"
import FloatingDamage from "./FloatingDamage/FloatingDamage"

const Scene = memo(function Scene() {
    const store = useSceneContext()
    const worldRef = useRef<Object3D | null>(null)
    return (
        <>
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
                    <Fighter />
                    <Chunks ref={worldRef} />
                    <Controller world={worldRef} />
                    <FloatingDamage />
                </LoadAssetsContextProvider>
                <Stats/>
            </Canvas>
            <div style={{
                position: 'absolute',
                top: '30px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '20px',
                color: 'white',
                userSelect: 'none'
            }}>
                <div>World size [{store.worldSize.current}x{store.worldSize.current}]</div>
                <div>Server coordinate [ X: {store.currentMatrixCoordinate?.x} Z: {store.currentMatrixCoordinate?.z} ]</div>
                <div>World coordinate [ X: {store.currentWorldCoordinate?.x.toFixed(0)} Z: {store.currentWorldCoordinate?.z.toFixed(0)} ]</div>
            </div>
        </>
    )
})

export default Scene