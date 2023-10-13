import styles from './Scene.module.scss'

import React from "react"

import * as THREE from "three"
import { Object3D } from "three"

import { Canvas } from "@react-three/fiber"
import { Loader, Stats, OrbitControls } from "@react-three/drei"

import Light from "./Light"
import Chunks from "./Chunks/Chunks"
import Fighter from "./Fighter/Fighter"
import Controls from "./Controls/Controls"
import FloatingDamage from "./FloatingDamage/FloatingDamage"
import Decor from "./Decor/Decor"
import DecorTest from './Decor/DecorTest'
import UserInterface3D from './UserInterface3D/UserInterface3D'
import GLTFLoader from './GLTFLoader/GLTFLoader'
import OtherFighterList from './Fighter/OtherFighter/OtherFighterList'
import NpcList from './Npc/NpcList'
import Camera from './Camera'
import DroppedItemList from './DroppedItem/DroppedItemList'

import { useUi } from './UserInterface3D/useUI'

import Postprocessing from './Postprocessing/Postprocessing2'

import { shallow } from 'zustand/shallow'
import UserInterface2D from './UserInterface2D/UserInterface2D'
import { useCommandLine } from './UserInterface2D/CommandLine/useCommandLine'

import { useCore } from 'Scene/useCore'

import { AdaptiveDpr } from '@react-three/drei'
import { useControls } from 'leva'
import { useFighter } from './Fighter/useFighter'

const Scene = React.memo(function Scene() {
    const eventsNode = useUi(state => state.eventsNode)
    const [devMode, setDevMode] = useCore(state => [state.devMode, state.setDevMode], shallow)
    const fighterNode = useFighter(state => state.fighterNode)
    const [subscribe, unsubscribe] = useCommandLine(state => [state.subscribeCommandLine, state.unsubscribeCommandLine], shallow)
    React.useEffect(() => {
        if (eventsNode.current) { subscribe(eventsNode.current) }
        return () => unsubscribe()
    }, [eventsNode.current])

    const data = useControls('GL', {
        exposure: { value: 0.9, min: 0, max: 10 },
        toneMapping: {
            options: {
                'filmic': THREE.ACESFilmicToneMapping,
                'notone': THREE.NoToneMapping,
                'linear': THREE.LinearToneMapping,
                'reinhard': THREE.ReinhardToneMapping,
                'cineon': THREE.CineonToneMapping
            },
        },
        legacyLights: { value: true },
        encoding: {
            options: {
                'rgb': THREE.sRGBEncoding,
                'linear': THREE.LinearEncoding,
            }
        }
    })

    const dev = useControls('Camera', {
        freeCamera: false
    })
    React.useEffect(() => {
        setDevMode(dev.freeCamera)
    }, [dev])
    

    return (
        <div id="scene" tabIndex={0} ref={eventsNode} className={styles.scene}>
            <Canvas
                shadows
                gl={{
                    powerPreference: "high-performance",
                    alpha: false,
                    antialias: true,
                    toneMappingExposure: data.exposure,
                    // toneMapping: THREE.LinearToneMapping,
                    toneMapping: data.toneMapping,
                    useLegacyLights: data.legacyLights,
                    outputEncoding: data.encoding,
                    
                }}
            >
                <color attach="background" args={[0x000000]} />
                { !devMode ? <fog attach="fog" args={['black', 5, 25]}></fog> : <></> }
                { devMode ? <OrbitControls target={fighterNode.current?.position || new THREE.Vector3(0, 0, 0)} /> : <></> }
                <Camera/>
                <Stats className='stats' />
                <React.Suspense fallback={null}>
                    <GLTFLoader>
                        <NpcList/>
                        <DroppedItemList/>
                        <OtherFighterList/>
                        {/* {store.VisibleDecor.current.map((data, i) => <Decor key={i} objectData={data} />)} */}
                        <DecorTest/>
                        <Fighter />
                        <Chunks />
                        <Controls />
                        <FloatingDamage />
                        <UserInterface3D />
                        <Light />
                    </GLTFLoader>
                </React.Suspense>
                <Postprocessing/>
                {/* <AdaptiveDpr/> */}
            </Canvas>
            <UserInterface2D/>
            <Loader/>
        </div>
    )
})

export default Scene