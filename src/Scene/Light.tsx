import * as THREE from "three"
import React from "react"

import { useFighter } from "./Fighter/useFighter"
import { useFrame, useThree } from "@react-three/fiber"

import { useControls } from "leva"
import { useSettings } from "./UserInterface2D/Settings/useSettings"
import { Environment } from "@react-three/drei"

const Light = React.memo(function Light() {
    const fighterNode = useFighter(state => state.fighterNode)
    const shadowlightRef = React.useRef<THREE.DirectionalLight | null>(null)
    const lightPosition = React.useMemo(() => new THREE.Vector3(0, 10, 5), [])

    const get = useThree(state => state.get)
    // Set Shadows Mode
    React.useEffect(() => {
        const enableDynamicShadows = useSettings.getState().enableShadows
        const gl = get().gl
        if (!enableDynamicShadows) {
            gl.shadowMap.autoUpdate = false
        }
    }, [])

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
        colorHemi: { value: '#8588ad' },
        intenHemi: { value: 0, min: 0, max: 5 },

        colorDirectional: { value: '#FFFFFF' },
        intenDirectional: { value: 3, min: 0, max: 5 },
        posDirectional: { value: { x: 1, y: 0, z: 0.866 } },

        colorFill: { value: '#FFFFFF' },
        intenFill: { value: 0, min: 0, max: 5 },
        posFill: { value: { x: -50, y: 0, z: -5 } },

        colorShadow: { value: '#FFFFFF' },
        intenShadow: { value: 1.5, min: 0, max: 5 },
        posShadow: { value: { x: 0, y: 10, z: 2 } },
    })
    const lightPositionTest = React.useMemo(() => new THREE.Vector3(data.posShadow.x, data.posShadow.y, data.posShadow.z), [data])

    return (
        <group name="light">
            <ambientLight color={data.colorHemi} intensity={data.intenHemi} />
            <directionalLight color={data.colorDirectional} intensity={data.intenDirectional} position={[data.posDirectional.x,data.posDirectional.y,data.posDirectional.z]}/>
            <directionalLight color={data.colorFill} intensity={data.intenFill} position={[data.posFill.x,data.posFill.y,data.posFill.z]}/>
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
            <Environment files='worlds/small/environment/orlando_stadium_1k.hdr' />
        </group>
    )
})

export default Light