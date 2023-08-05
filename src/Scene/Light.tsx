import * as THREE from "three"
import { useEffect, useMemo, useRef, memo } from "react"
import { useSceneContext } from "store/SceneContext"
// import { useHelper } from "@react-three/drei"

// TODO: Optimise TargetObject
const Light = memo(function Light() {
    const { currentWorldCoordinate } = useSceneContext()
    const shadowlightRef = useRef<THREE.DirectionalLight | null>(null)
    const shadowlightPosition = useMemo(() => new THREE.Vector3(0, 10, 5), [])
    
    // Set shadow light target
    const targetObject = useRef()
    useEffect(() => {
        if (!targetObject.current || !shadowlightRef.current) { return }
        shadowlightRef.current.target = targetObject.current
    }, [targetObject.current, shadowlightRef.current])

    // Move shadow light shadow
    useEffect(() => {
        if (!currentWorldCoordinate) { return }
        if (!shadowlightRef.current) { return }
        shadowlightRef.current.position.set(currentWorldCoordinate.x, 0, currentWorldCoordinate.z).add(shadowlightPosition)
    }, [currentWorldCoordinate])

    // Helper
    // useHelper(shadowlightRef, THREE.DirectionalLightHelper, 0x000000)

    return (
        <group name="light">
            <hemisphereLight args={[0xEEF3FF, 0x300B14]} intensity={.3} />
            {/* <ambientLight color={0xFFFFFF} intensity={.1} /> */}
            <mesh ref={targetObject} position={[currentWorldCoordinate?.x, 0, currentWorldCoordinate?.z]}></mesh>
            <directionalLight 
                intensity={.5}
                color={0xFFFADE} 
                ref={shadowlightRef}
                position={shadowlightPosition} 
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
        </group>
    )
})

export default Light