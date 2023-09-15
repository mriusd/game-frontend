import React from "react"

import * as THREE from 'three'
import { useFrame } from "@react-three/fiber"
import { PerspectiveCamera } from "@react-three/drei"
import { CAMERA_POSITION } from "./config"

import { useCore } from "Scene/useCore"
import { useFighter } from "./Fighter/useFighter"

const Camera = () => {
    const devMode = useCore(state => state.devMode)
    return (<>
        <PerspectiveCamera makeDefault near={0.1} far={devMode ? 1000 : 60} fov={45} />
        <RenderCamera/>
    </>)
}

function RenderCamera() {
    const position = React.useMemo(() => new THREE.Vector3(...CAMERA_POSITION), [])
    const fighterNode = useFighter(state => state.fighterNode)
    useFrame(({ camera }) => {
        if (!fighterNode.current) { return }
        camera.position.set(fighterNode.current.position.x, fighterNode.current.position.y, fighterNode.current.position.z).add(position)
        camera.lookAt(fighterNode.current.position.x, fighterNode.current.position.y, fighterNode.current.position.z)
    })
    return <></>
}

export default Camera