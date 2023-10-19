import React from "react"

import * as THREE from 'three'
import { useFrame, useThree } from "@react-three/fiber"
import { PerspectiveCamera } from "@react-three/drei"
import { CAMERA_POSITION, CAMERA_ZOOMIN } from "./config"

import { useCore } from "Scene/useCore"
import { useFighter } from "./Fighter/useFighter"
import { useSpring } from "react-spring"

const Camera = () => {
    const devMode = useCore(state => state.devMode)
    return (<>
        <PerspectiveCamera makeDefault near={0.1} far={devMode ? 1000 : 60} fov={45} />
        <RenderCamera/>
    </>)
}

const position = new THREE.Vector3(...CAMERA_POSITION)


function RenderCamera() {
    const devMode = useCore(state => state.devMode)
    const fighterNode = useFighter(state => state.fighterNode)
    const camera = useThree(state => state.camera)
    const devMounted = React.useRef(false)
    // Zoom In Out
    const [data,api] = useSpring(() => ({
        zoom: 1,
        onChange: ({ value }) => {
            // // Help me with zoom
            // const fighterPosition = fighterNode.current.position
            // const x = (position.x - fighterPosition.x) * value.zoom
            // const y = (position.y - fighterPosition.y) * value.zoom
            // const z = (position.z - fighterPosition.z) * value.zoom
            // zoomedPosition.setX(x)
            // zoomedPosition.setY(y)
            // zoomedPosition.setZ(z)
            // console.log('zoom', zoomedPosition)
        }
    }))
    React.useEffect(() => {
        const handleWheel = (e: any) => {
            if (e.wheelDeltaY > 10) {
                api.start({ zoom: 1 })
            }
            if (e.wheelDeltaY < -10) {
                api.start({ zoom: Math.max(1 - CAMERA_ZOOMIN, 0) })
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
        camera.position.set(fighterNode.current.position.x, fighterNode.current.position.y, fighterNode.current.position.z).add(position).multiplyScalar(data.zoom.get())
        camera.lookAt(fighterNode.current.position.x, fighterNode.current.position.y, fighterNode.current.position.z)
    })
    return <></>
}

export default Camera