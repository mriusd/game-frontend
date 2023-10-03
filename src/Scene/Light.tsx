import * as THREE from "three"
import { useMemo, useRef, memo, useEffect } from "react"
// import { useHelper } from "@react-three/drei"
import { Environment } from "@react-three/drei"

import { useFighter } from "./Fighter/useFighter"
import { useFrame } from "@react-three/fiber"

const Light = memo(function Light() {
    const fighterNode = useFighter(state => state.fighterNode)
    const shadowlightRef = useRef<THREE.DirectionalLight | null>(null)
    const lightPosition = useMemo(() => new THREE.Vector3(0, 10, 5), [])
    useEffect(() => {
        if (!fighterNode.current || !shadowlightRef.current) { return }
        shadowlightRef.current.target = fighterNode.current 
    }, [fighterNode.current, shadowlightRef.current])
    // Move shadow light shadow
    useFrame(() => {
        if (!fighterNode.current || !shadowlightRef.current) { return }
        shadowlightRef.current.position.set(fighterNode.current.position.x, fighterNode.current.position.y, fighterNode.current.position.z).add(lightPosition)
    })
    // Helper
    // useHelper(shadowlightRef, THREE.DirectionalLightHelper, 0x000000)

    return (
        <group name="light">
            <hemisphereLight args={[0xEEF3FF, 0x300B14]} intensity={.8} />
            <directionalLight 
                intensity={1}
                color={0xFFFADE} 
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
            <Environment files="/assets/sandsloot_1k.hdr"/>
        </group>
    )
})

export default Light