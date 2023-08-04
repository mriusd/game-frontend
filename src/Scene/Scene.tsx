import styles from './Scene.module.scss'

import * as THREE from "three"
import { Object3D } from "three"

import { Canvas } from "@react-three/fiber"
import { useRef, memo, Suspense, useEffect } from "react"
import { useSceneContext } from "store/SceneContext"
import { Loader, Stats } from "@react-three/drei"

import { CAMERA_POSITION } from "./config"

import Light from "./Light"
import Chunks from "./Chunks"
import Fighter from "./Fighter/Fighter"
import Npc from "./Npc"
import Controller from "./Controller"
import DroppedItem from "./DroppedItem"
import FloatingDamage from "./FloatingDamage/FloatingDamage"
import Decor from "./Decor"
import UserInterface3D from './UserInterface3D/UserInterface3D'
import GLTFLoader from './GLTFLoader/GLTFLoader'
import OtherFighter from './Fighter/OtherFighter'

import { useUiStore } from 'store/uiStore'

import { Leva } from 'leva'
import { useBackpackStore } from 'store/backpackStore'

import Postprocessing from './Postprocessing'
import { Environment } from '@react-three/drei'

import { shallow } from 'zustand/shallow'
import UserInterface2D from './UserInterface2D/UserInterface2D'
import { useCommandLine } from './UserInterface2D/CommandLine/useCommandLine'

const Scene = memo(function Scene() {
    const store = useSceneContext()
    const worldRef = useRef<Object3D | null>(null)
    const eventsNode = useUiStore(state => state.eventsNode)
    const isBackpackOpened = useBackpackStore(state => state.isOpened)

    const [subscribe, unsubscribe] = useCommandLine(state => [state.subscribeCommandLine, state.unsubscribeCommandLine], shallow)
    useEffect(() => {
        if (eventsNode.current) { subscribe(eventsNode.current) }
        return () => unsubscribe()
    }, [eventsNode.current])
    
    return (
        <div tabIndex={0} ref={eventsNode} id="scene" className={styles.scene}>
            <Canvas
                shadows
                camera={{
                    position: new THREE.Vector3(...CAMERA_POSITION),
                    near: 0.1,
                    far: 60,
                    fov: 45,
                }}
                gl={{
                    powerPreference: "high-performance",
                    alpha: false,
                    antialias: false,
                }}
            >
                <color attach="background" args={[0x000000]} />
                <fog attach="fog" args={['black', 5, 25]}></fog>
                <Stats className='stats'/>
                {/* <Environment preset='forest' /> */}

                <Suspense fallback={null}>
                    <GLTFLoader>
                        {store.NpcList.current.map(npc => <Npc key={npc?.id} npc={npc} />)}
                        {store.DroppedItems.current.map(item => <DroppedItem key={item?.itemHash} item={item} />)}
                        {store.VisibleDecor.current.map((data, i) => <Decor key={i} objectData={data} />)}
                        {store.PlayerList.current.map(fighter => <OtherFighter key={fighter?.id} fighter={fighter} />)}
                        <Fighter />
                        <Chunks ref={worldRef} />
                        <Controller world={worldRef} />
                        <FloatingDamage />
                        <UserInterface3D />
                        <Light />
                    </GLTFLoader>
                </Suspense>

                {/* <Postprocessing/> */}
            </Canvas>
            <UserInterface2D/>
            <Loader/>
            {
                store.PlayerList.current.length && (
                    <div className={styles.players}>
                        <p>Close Players({store.PlayerList.current.length}):</p>
                        { store.PlayerList.current.map(_ => (<p key={_.id}>{ `${Fighter.name}, Coordinate: (${_.coordinates.x}, ${_.coordinates.z})` }<span></span></p>)) }
                    </div>
                )
            }
            <div className={styles.coordinates}>
                <div>World size [{store.worldSize.current}x{store.worldSize.current}]</div>
                {/* <div>Server coordinate [ X: {store.currentMatrixCoordinate?.x} Z: {store.currentMatrixCoordinate?.z} ]</div> */}
                <div>Coordinate [ X: {store.currentWorldCoordinate?.x.toFixed(0)} Z: {store.currentWorldCoordinate?.z.toFixed(0)} ]</div>
            </div>
            <Leva
                hidden={!isBackpackOpened}
                flat
            />
        </div>
    )
})

export default Scene