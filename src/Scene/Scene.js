import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Suspense, useRef, useContext, useMemo, memo } from "react"
import { SceneContext } from "./store/SceneContextProvider"

import SceneContextProvider from "./store/SceneContextProvider"
import { CAMERA_POSITION } from "./config"

import Light from "./Light"
import World from "./World/World"
import Character from "./Character"
import Controller from "./Controller"

const Scene = memo(function Scene() {
    const store = useContext(SceneContext)
    const worldRef = useRef()
    const characterRef = useRef()
    return (
        <Suspense fallback={<span>loading...</span>}>
            {
                store.matrix.size && store.spawned ? 
                (
                    <Canvas
                        shadows
                        camera={{
                            position: CAMERA_POSITION,
                            near: 0.1,
                            far: 60,
                            fov: 45,
                        }}
                    >
                        {/* <color attach="background" args={[0x000000]} /> */}
                        {/* <fog attach="fog" color={0x000000} near={1} far={30} /> */}
                        {/* <OrbitControls /> */}
                        <Light />

                        <Character ref={characterRef} />
                        <World ref={worldRef} />
                        <Controller world={worldRef} character={characterRef} />
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