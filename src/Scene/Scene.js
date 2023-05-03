import { Canvas } from "@react-three/fiber"
import { Suspense, useRef, useContext, memo } from "react"
import { SceneContext } from "./store/SceneContextProvider"

import { CAMERA_POSITION } from "./config"

import Light from "./Light"
import World from "./World/World"
import Fighter from "./Fighter"
import Npc from "./Npc"

const Scene = memo(function Scene() {
    const store = useContext(SceneContext)
    const worldRef = useRef()
    return (
        <Suspense fallback={<span>loading...</span>}>
            {
                store.isLoaded ? 
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
                        <Light />
                        { store.NpcList.current.map(npc => <Npc key={npc?.id} npc={npc} />) }
                        <Fighter world={worldRef} />
                        <World ref={worldRef} />
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