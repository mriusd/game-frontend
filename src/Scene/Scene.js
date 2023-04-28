import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Suspense, useRef } from "react"

import Light from "./Light"
import World from "./World/World"
import Character from "./Character"
import Controller from "./Controller"

import { useWorldMatrix } from "./hooks/useWorldMatrix"

export const CAMERA_POSITION = [ -8, 8, 8 ] // used for camera, to save distance to object

const Scene = () => {
    const [ matrix, setMatrix ] = useWorldMatrix()

    const worldRef = useRef()
    const characterRef = useRef()
    return (
        <Suspense fallback={<span>loading...</span>}>
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
                <Light/>

                <Character ref={characterRef} />
                <World ref={worldRef} matrix={matrix}/>
                <Controller world={worldRef} matrix={matrix} character={characterRef} />
            </Canvas>
        </Suspense>
    )
}

export default Scene