import styles from './Scene.module.scss'

import * as THREE from "three"
import { Object3D } from "three"

import { Canvas } from "@react-three/fiber"
import { useRef, memo, useEffect } from "react"
import { useSceneContext } from "store/SceneContext"
import LoadAssetsContextProvider from "store/LoadAssetsContext"
import { OrbitControls, Stats } from "@react-three/drei"

import { CAMERA_POSITION } from "./config"

import Light from "./Light"
import Chunks from "./Chunks"
import Fighter from "./Fighter/Fighter"
import Npc from "./Npc"
import Controller from "./Controller"
import DroppedItem from "./DroppedItem"
import FloatingDamage from "./FloatingDamage/FloatingDamage"
import Decor from "./Decor"
import UserInterface from './UserInterface/UserInterface'
import GLTFLoader from './GLTFLoader/GLTFLoader'

import { useUiStore } from 'store/uiStore'

import { Leva } from 'leva'
import { useBackpackStore } from 'store/backpackStore'

const Scene = memo(function Scene() {
    const store = useSceneContext()
    const worldRef = useRef<Object3D | null>(null)
    const eventsNode = useUiStore(state => state.eventsNode)
    const isBackpackOpened = useBackpackStore(state => state.isOpened)

    return (
        <div ref={eventsNode} id="scene" className={styles.scene}>
            <Canvas
                shadows
                camera={{
                    position: new THREE.Vector3(...CAMERA_POSITION),
                    near: 0.1,
                    far: 60,
                    fov: 45,
                }}
            >
                <GLTFLoader/>
                <LoadAssetsContextProvider>
                    <color attach="background" args={[0x000000]} />
                    {/* <fog attach="fog" color={0x000000} near={20} far={60} /> */}
                    {/* <OrbitControls/> */}
                    <Light />
                    {store.NpcList.current.map(npc => <Npc key={npc?.id} npc={npc} />)}
                    {store.DroppedItems.current.map(item => <DroppedItem key={item?.itemHash} item={item} />)}
                    {store.VisibleDecor.current.map((data, i) => <Decor key={i} objectData={data} />)}
                    <Fighter />
                    <Chunks ref={worldRef} />
                    <Controller world={worldRef} />
                    <FloatingDamage />
                    <UserInterface />
                </LoadAssetsContextProvider>
                <Stats className='stats'/>
            </Canvas>
            <div className={styles.coordinates}>
                <div>World size [{store.worldSize.current}x{store.worldSize.current}]</div>
                <div>Server coordinate [ X: {store.currentMatrixCoordinate?.x} Z: {store.currentMatrixCoordinate?.z} ]</div>
                <div>World coordinate [ X: {store.currentWorldCoordinate?.x.toFixed(0)} Z: {store.currentWorldCoordinate?.z.toFixed(0)} ]</div>
            </div>
            <Leva
                hidden={!isBackpackOpened}
                flat
            />

        </div>
    )
})

export default Scene