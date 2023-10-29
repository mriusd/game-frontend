import React from "react"

import * as THREE from 'three'
import { clamp } from "three/src/math/MathUtils"
import { useFrame, useThree } from "@react-three/fiber"
import { PerspectiveCamera } from "@react-three/drei"
import { CAMERA_POSITION, CAMERA_ZOOMIN } from "./config"

import { useCore } from "Scene/useCore"
import { useFighter } from "./Fighter/useFighter"
import { useSpring } from "react-spring"

const Camera = () => {
    const devMode = useCore(state => state.devMode)
    const cameraRef = React.useRef<THREE.PerspectiveCamera>()
    const size = useThree(({ size }) => size)
    // Render Camera Aspect
    React.useLayoutEffect(() => {
        // cameraRef.current.aspect = size.width / size.height
        // cameraRef.current.aspect = 1920 / 1080
        // cameraRef.current.fov = size.height / size.width * 100
    }, [size])
    // React.useLayoutEffect(() => void cameraRef.current.updateProjectionMatrix())
    return (<>
        <PerspectiveCamera ref={cameraRef} makeDefault near={0.1} far={devMode ? 1000 : 60} fov={45} />
        <RenderCamera/>
    </>)
}

const position = new THREE.Vector3(...CAMERA_POSITION)
const zoomedPos = new THREE.Vector3(...CAMERA_POSITION)
function RenderCamera() {
    const devMode = useCore(state => state.devMode)
    const fighterNode = useFighter(state => state.fighterNode)
    const camera = useThree(state => state.camera)
    const devMounted = React.useRef(false)
    // Zoom In Out
    const [{zoom},api] = useSpring(() => ({
        zoom: 1,
        onChange: ({ value }) => {zoomedPos.copy(position).multiplyScalar(value.zoom)}
    }))
    React.useEffect(() => {
        const handleWheel = (e: any) => {
            const currentZoom = zoom.get()
            if (e.wheelDeltaY > 10 && currentZoom < 1) {
                api.start({ zoom: 1 })
            }
            if (e.wheelDeltaY < -10 && currentZoom > 1-CAMERA_ZOOMIN) {
                api.start({ zoom: 1 - CAMERA_ZOOMIN })
            }
        }
        document.addEventListener('wheel', handleWheel)
        return () => document.removeEventListener('wheel', handleWheel)
    }, [])
    // Follow Fighter
    useFrame(() => {
        if (!fighterNode.current) { return }
        if (devMode && !devMounted.current) {
            camera.position.set(fighterNode.current.position.x, fighterNode.current.position.y, fighterNode.current.position.z).add(position).add(new THREE.Vector3(20, 10, 20))
            camera.lookAt(fighterNode.current.position.x, fighterNode.current.position.y, fighterNode.current.position.z)
            devMounted.current = true
        }
        if (devMode) { return }
        camera.position.set(fighterNode.current.position.x, fighterNode.current.position.y, fighterNode.current.position.z).add(zoomedPos)
        camera.lookAt(fighterNode.current.position.x, fighterNode.current.position.y, fighterNode.current.position.z)
    })
    return <></>
}

export default Camera