import * as THREE from "three"
import { useContext, forwardRef, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { SceneContext } from "./store/SceneContextProvider"
import { CAMERA_POSITION } from "./config"
import { lerp } from "three/src/math/MathUtils"

const colors = {
    GRAY: 0x444444
}

const Character = forwardRef((props, ref) => {
    const cameraPosition = new THREE.Vector3(...CAMERA_POSITION)
    const { matrix, direction, getPosition } = useContext(SceneContext)
    const camera = useThree(state => state.camera)

    useFrame(() => {
        if (!ref.current) { return }

        // Move towards aim
        // if (ref.current.position.x !== locationAim.x && ref.current.position.z !== locationAim.z) {
        //     ref.current.position.x = lerp(ref.current.position.x, locationAim.x, EASE)
        //     ref.current.position.z = lerp(ref.current.position.z, locationAim.z, EASE)

        //     // Make camera follow the character
        //     camera.position.copy(ref.current.position).add(cameraPosition)

        //     calcPointerWorldLocation()
        // }
    })


    // character rotation
    useEffect(() => {
        if (!ref.current) { return }
        ref.current.rotation.y = direction
    }, [ direction ])

    // character movement
    useEffect(() => {
        if (!ref.current) { return }
        const position = getPosition()
        // skip Y position, bc we dont manipulate it with matrix
        ref.current.position.set(position.x, ref.current.position.y, position.z)
        camera.position.copy(ref.current.position).add(cameraPosition)
    }, [ matrix ])

    return (
        <mesh ref={ref} castShadow position={[0, .5, 0]}>
            <boxGeometry args={[1, 1]}/>
            <meshStandardMaterial color={colors.GRAY}/>
        </mesh>
    )
})

export default Character