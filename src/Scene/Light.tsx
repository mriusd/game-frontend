import * as THREE from "three"
import { useEffect, useMemo, useRef } from "react"
import { useSceneContext } from "store/SceneContext"

const Light = () => {
    const { currentWorldCoordinate } = useSceneContext()
    const shadowlightRef = useRef<THREE.DirectionalLight | null>(null)
    const shadowlightPosition = useMemo(() => new THREE.Vector3(0, 100, 80), [])

    // TODO: Fix shadowlight position
    // useEffect(() => {
    //     // if (!currentWorldCoordinate) { return }
    //     // if (!shadowlightRef.current) { return }
    //     // dirlightRef.current.position.set(currentWorldCoordinate.x, 0, currentWorldCoordinate.z).add(dirlightPosition)
    //     // shadowlightRef.current.position.set(currentWorldCoordinate.x, 0, currentWorldCoordinate.z).add(shadowlightPosition)
    //     // shadowlightRef.current.lookAt(currentWorldCoordinate.x, 0, currentWorldCoordinate.z)
    // }, [currentWorldCoordinate])
    // useEffect(() => {
    //     if (!shadowlightRef.current) { return }
    //     // shadowlightRef.current.shadow.mapSize.width = 1024
    //     // shadowlightRef.current.shadow.mapSize.height = 1024
    //     // shadowlightRef.current.shadow.camera.near = 0.1
    //     // shadowlightRef.current.shadow.camera.far = 1000
    //     // shadowlightRef.current.shadow.camera.left = -100
    //     // shadowlightRef.current.shadow.camera.right = 100
    //     // shadowlightRef.current.shadow.camera.top = -100
    //     // shadowlightRef.current.shadow.camera.bottom = 100
    // }, [shadowlightRef.current])




    return (
        <>
            <ambientLight color={0xFFFFFF} intensity={0.3} />
            <directionalLight 
                ref={shadowlightRef}
                color={0xFFFFFF} 
                position={shadowlightPosition} 
                castShadow={true}
            />
        </>
    )
}

export default Light