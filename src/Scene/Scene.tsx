import styles from './Scene.module.scss'

import * as THREE from "three"
import { Object3D } from "three"

import { Canvas } from "@react-three/fiber"
import { useRef, memo, Suspense } from "react"
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
import UserInterface from './UserInterface/UserInterface'
import GLTFLoader from './GLTFLoader/GLTFLoader'
import OtherFighter from './Fighter/OtherFighter'

import { useUiStore } from 'store/uiStore'

import { Leva } from 'leva'
import { useBackpackStore } from 'store/backpackStore'

// Postprocessing
import { EffectComposer, DepthOfField, Bloom, Noise, Vignette } from '@react-three/postprocessing'
import { BlurPass, Resizer, KernelSize, Resolution } from 'postprocessing'
import { ToneMapping } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { SelectiveBloom } from '@react-three/postprocessing'


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
                <color attach="background" args={[0x000000]} />
                <Stats className='stats'/>

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
                        <UserInterface />
                        <Light />
                    </GLTFLoader>
                </Suspense>
                {/* <EffectComposer> */}
                    {/* <Bloom kernelSize={KernelSize.LARGE} luminanceThreshold={0} luminanceSmoothing={0.9} height={300} /> */}
                    {/* <SelectiveBloom
                        // lights={[lightRef1, lightRef2]} // ⚠️ REQUIRED! all relevant lights
                        selection={[worldRef]} // selection of objects that will have bloom effect
                        selectionLayer={10} // selection layer
                        intensity={1.0} // The bloom intensity.
                        kernelSize={KernelSize.LARGE} // blur kernel size
                        luminanceThreshold={0.9} // luminance threshold. Raise this value to mask out darker elements in the scene.
                        luminanceSmoothing={0.025} // smoothness of the luminance threshold. Range is [0, 1]
                    /> */}
                {/* </EffectComposer> */}
            </Canvas>
            <Loader/>
            {
                store.PlayerList.current.length && (
                    <div className={styles.players}>
                        <p>Close Players({store.PlayerList.current.length}):</p>
                        { store.PlayerList.current.map(_ => (<p key={_.id}>{ `Player_${_.id}, matrixCoord: (${_.coordinates.x}, ${_.coordinates.z})` }<span></span></p>)) }
                    </div>
                )
            }
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