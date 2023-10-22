import * as THREE from "three"
import React from "react"
// import { useHelper } from "@react-three/drei"
import { Environment } from "@react-three/drei"
import { useFighter } from "./Fighter/useFighter"
import { useFrame } from "@react-three/fiber"

import { usePost } from "./Postprocessing/usePost"


import { useControls } from "leva"

const Light = React.memo(function Light() {
    const updateLights = usePost(state => state.updateLights)

    const fighterNode = useFighter(state => state.fighterNode)
    const shadowlightRef = React.useRef<THREE.DirectionalLight | null>(null)
    const directionallightRef = React.useRef<THREE.DirectionalLight | null>(null)
    const lightPosition = React.useMemo(() => new THREE.Vector3(0, 10, 5), [])
    React.useLayoutEffect(() => updateLights(shadowlightRef.current, 'add'), [shadowlightRef.current])
    React.useLayoutEffect(() => updateLights(directionallightRef.current, 'add'), [directionallightRef.current])

    // const lightPosition = useMemo(() => new THREE.Vector3(0, 0.5, 0.866), []) // ~60º

    React.useEffect(() => {
        if (!fighterNode.current || !shadowlightRef.current) { return }
        shadowlightRef.current.target = fighterNode.current 
    }, [fighterNode.current, shadowlightRef.current])
    // Move shadow light shadow
    useFrame(() => {
        if (!fighterNode.current || !shadowlightRef.current) { return }
        shadowlightRef.current.position.set(fighterNode.current.position.x, fighterNode.current.position.y, fighterNode.current.position.z).add(lightPositionTest)
    })
    // Helper
    // useHelper(shadowlightRef, THREE.DirectionalLightHelper, 0x000000)

    const data = useControls('Lights', {
        colorHemi: { value: '#FFFFFF' },
        intenHemi: { value: .95, min: 0, max: 2 },

        colorDirectional: { value: '#FFFFFF' },
        intenDirectional: { value: 2.4, min: 0, max: 5 },
        posDirectional: { value: { x: 1, y: 0, z: 0.866 } },

        colorShadow: { value: '#FFFFFF' },
        intenShadow: { value: 1, min: 0, max: 5 },
        posShadow: { value: { x: 0, y: 10, z: 2 } },

        shadows: { value: false }
    })
    const lightPositionTest = React.useMemo(() => new THREE.Vector3(data.posShadow.x, data.posShadow.y, data.posShadow.z), [data])

    return (
        <group name="light">
            {/* <hemisphereLight args={[data.colorGround, data.colorSky]} intensity={data.intenHemi} /> */}
            <ambientLight color={data.colorHemi} intensity={data.intenHemi} />
            <directionalLight ref={directionallightRef} color={data.colorDirectional} intensity={data.intenDirectional} position={[data.posDirectional.x,data.posDirectional.y,data.posDirectional.z]}/>
            <directionalLight 
                intensity={data.intenShadow}
                color={data.colorShadow} 
                ref={shadowlightRef}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-near={0.1}
                shadow-camera-far={500}
                shadow-camera-left={-20}
                shadow-camera-right={20}
                shadow-camera-top={20}
                shadow-camera-bottom={-20}
            />
            {/* <Environment files="/assets/autumn_forest.hdr"/> */}
        </group>
    )
})

export default Light