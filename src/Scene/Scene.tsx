import styles from './Scene.module.scss'

import React, { useEffect } from "react"

import * as THREE from "three"

import { Canvas } from "@react-three/fiber"
import { Loader, Stats, OrbitControls } from "@react-three/drei"

import Light from "./Light"
import Chunks from "./ChunkSimple/Chunks"
import Fighter from "./Fighter/Fighter"
import Controls from "./Controls/Controls"
import FloatingDamage from "./FloatingDamage/FloatingDamage"
// import Decor from "./Decor/Decor"
import DecorTest from './Decor/DecorTest'
import UserInterface3D from './UserInterface3D/UserInterface3D'
import GLTFLoader from './GLTFLoader/GLTFLoader'
import OtherFighterList from './Fighter/OtherFighter/OtherFighterList'
import NpcList from './Npc/NpcList'
import Camera from './Camera'
import DroppedItemList from './DroppedItem/DroppedItemList'
import { DevHelpers } from './devHelpers/DevHelpers'

import { useUi } from './UserInterface3D/useUI'

import Postprocessing from './Postprocessing/Postprocessing'

import { shallow } from 'zustand/shallow'
import UserInterface2D from './UserInterface2D/UserInterface2D'
import { useCommandLine } from './UserInterface2D/CommandLine/useCommandLine'

import { useCore } from 'Scene/useCore'

import { useControls } from 'leva'
import { useFighter } from './Fighter/useFighter'

// import FPSLimiter from './UserInterface2D/Settings/FPSLimiter'
import FPSLimiter from './UserInterface2D/Settings/FPSLimiter2'
import { DPRLimiter } from './UserInterface2D/Settings/DPRLimiter'
import { useBackpack } from './UserInterface3D/Backpack/useBackpack'

import { subscribeDisableContextMenu, unsubscribeDisableContextMenu } from './utils/contextMenu'


const Scene = React.memo(function Scene() {
    const eventsNode = useUi(state => state.eventsNode)
    const [devMode, setDevMode] = useCore(state => [state.devMode, state.setDevMode], shallow)
    const fighterNode = useFighter(state => state.fighterNode)

    React.useEffect(() => {
        if (eventsNode.current) { 
            // TODO: use global node instead providing one
            useCommandLine.getState().subscribeCommandLine(eventsNode.current)
            // 
            useBackpack.getState().subscribeBackpack()
            useUi.getState().subscribePressedKeys()
            subscribeDisableContextMenu()
        }
        return () => {
            useCommandLine.getState().unsubscribeCommandLine()
            useBackpack.getState().unsubscribeBackpack()
            useUi.getState().unsubscribePressedKeys()
            unsubscribeDisableContextMenu()
        }
    }, [eventsNode.current])

    const data = useControls('GL', {
        exposure: { value: 0, min: -5, max: 5 },
        toneMapping: {
            options: {
                'linear': THREE.LinearToneMapping,
                'filmic': THREE.ACESFilmicToneMapping,
                'notone': THREE.NoToneMapping,
                'reinhard': THREE.ReinhardToneMapping,
                'cineon': THREE.CineonToneMapping
            },
        },
        legacyLights: { value: false },
        encoding: {
            options: {
                'rgb': THREE.sRGBEncoding,
                'linear': THREE.LinearEncoding,
            }
        },
    })

    const dev = useControls('Camera', { freeCamera: false })
    React.useEffect(() => void setDevMode(dev.freeCamera), [dev])

    // const occupied = useCore(state => state.occupiedCoords)
    // useEffect(() => {console.log('/occupied', occupied)}, [occupied])

    return (
        <div id="scene" tabIndex={0} ref={eventsNode} className={styles.scene}>
            <Canvas
                frameloop='demand' // Required 'demand' for fps clipping
                performance={{ min: 0.1 }}
                shadows={{
                    enabled: true, // Always Enabled, but in Lights.tsx control render mode
                    // type: THREE.PCFSoftShadowMap
                }}
                gl={{
                    powerPreference: "high-performance",
                    alpha: false,
                    antialias: true,
                    toneMappingExposure: Math.pow(2, data.exposure),
                    toneMapping: data.toneMapping,
                    useLegacyLights: data.legacyLights,
                    outputEncoding: data.encoding,
                }}
            >
                <color attach="background" args={[0x000000]} />
                {!devMode ? <fog attach="fog" args={['black', 10, 25]}></fog> : <></>}
                <FPSLimiter>
                    {devMode ? <OrbitControls target={fighterNode.current?.position || new THREE.Vector3(0, 0, 0)} /> : <></>}
                    <Camera />
                    <Stats className='stats' />
                    <Postprocessing />
                    <React.Suspense fallback={null}>
                        <GLTFLoader>
                            {/* <DPRLimiter/> */}
                            <NpcList />
                            <DroppedItemList />
                            <OtherFighterList />
                            <DecorTest />
                            <Fighter />
                            <Chunks />
                            <Controls />
                            <FloatingDamage />
                            <UserInterface3D />
                            <Light />
                            <DevHelpers />
                        </GLTFLoader>
                    </React.Suspense>
                </FPSLimiter>
            </Canvas>
            <UserInterface2D />
            <Loader />
        </div>
    )
})

export default Scene