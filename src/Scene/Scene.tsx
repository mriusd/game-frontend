import styles from './Scene.module.scss'

import * as THREE from "three"
import { Object3D } from "three"

import { Canvas } from "@react-three/fiber"
import { useRef, memo, Suspense, useEffect } from "react"
import { useSceneContext } from "store/SceneContext"
import { Loader, Stats, OrbitControls } from "@react-three/drei"

import { CAMERA_POSITION } from "./config"

import Light from "./Light"
import Chunks from "./Chunks/Chunks"
import Fighter from "./Fighter/Fighter"
import Npc from "./Npc/Npc"
import Controller from "./Controls/Controls"
import DroppedItem from "./DroppedItem"
import FloatingDamage from "./FloatingDamage/FloatingDamage"
import Decor from "./Decor/Decor"
import DecorTest from './Decor/DecorTest'
import UserInterface3D from './UserInterface3D/UserInterface3D'
import GLTFLoader from './GLTFLoader/GLTFLoader'
import OtherFighter from './Fighter/OtherFighter'
import NpcList from './Npc/NpcList'
import Camera from './Camera'

import { useUi } from 'store/useUI'

import Postprocessing from './Postprocessing'
import { Environment } from '@react-three/drei'

import { shallow } from 'zustand/shallow'
import UserInterface2D from './UserInterface2D/UserInterface2D'
import { useCommandLine } from './UserInterface2D/CommandLine/useCommandLine'

import { useCore } from 'store/useCore'

import { AdaptiveDpr } from '@react-three/drei'
import { useControls } from 'leva'

const Scene = memo(function Scene() {
    const store = useSceneContext()
    const worldRef = useRef<Object3D | null>(null)
    const eventsNode = useUi(state => state.eventsNode)
    const [devMode, setDevMode] = useCore(state => [state.devMode, state.setDevMode], shallow)

    const [subscribe, unsubscribe] = useCommandLine(state => [state.subscribeCommandLine, state.unsubscribeCommandLine], shallow)
    useEffect(() => {
        if (eventsNode.current) { subscribe(eventsNode.current) }
        return () => unsubscribe()
    }, [eventsNode.current])
    

    return (
        <div id="scene" tabIndex={0} ref={eventsNode} className={styles.scene}>
            <Canvas
                shadows
                gl={{
                    powerPreference: "high-performance",
                    alpha: false,
                    antialias: false,
                }}
            >
                <color attach="background" args={[0x000000]} />
                { !devMode ? <fog attach="fog" args={['black', 5, 25]}></fog> : <></> }
                { devMode ? <OrbitControls/> : <></> }
                <Camera/>
                <Stats className='stats' />
                <Suspense fallback={null}>
                    <GLTFLoader>
                        <NpcList/>
                        {store.DroppedItems.current.map(item => <DroppedItem key={item?.itemHash} item={item} />)}
                        {store.VisibleDecor.current.map((data, i) => <Decor key={i} objectData={data} />)}
                        {/* <DecorTest/> */}
                        {store.PlayerList.current.map(fighter => <OtherFighter key={fighter?.id} fighter={fighter} />)}
                        <Fighter />
                        <Chunks ref={worldRef} />
                        { !devMode ? <Controller world={worldRef} /> : <></> }
                        <FloatingDamage />
                        <UserInterface3D />
                        <Light />
                    </GLTFLoader>
                </Suspense>
                {/* <Postprocessing/> */}
                {/* <AdaptiveDpr/> */}
            </Canvas>
            <UserInterface2D/>
            <Loader/>
        </div>
    )
})

export default Scene