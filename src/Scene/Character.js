import * as THREE from "three"
import { useContext, forwardRef, useEffect } from "react"
import { useThree } from "@react-three/fiber"
import { SceneContext } from "./store/SceneContextProvider"
import { CAMERA_POSITION } from "./config"
import { lerp } from "three/src/math/MathUtils"
import { matrixCoordToWorld } from "./utils/matrixCoordToWorld"
import { getNextPosition } from "./utils/getNextPosition"

const colors = {
    GRAY: 0x444444
}

const Character = forwardRef((props, ref) => {
    const cameraPosition = new THREE.Vector3(...CAMERA_POSITION)
    const { matrix, direction, getMatrixPosition, position } = useContext(SceneContext)
    const camera = useThree(state => state.camera)

    // character rotation
    useEffect(() => {
        if (!ref.current) { return }
        ref.current.rotation.y = direction
    }, [ direction ])

    // character movement
    useEffect(() => {
        if (!ref.current) { return }
        if (!position) { return }
        // skip Y position, bc we dont manipulate it with matrix
        ref.current.position.set(position.x, ref.current.position.y, position.z)
        camera.position.copy(ref.current.position).add(cameraPosition)
    }, [ position ])

    return (
        <mesh ref={ref} castShadow position={[0, .5, 0]}>
            <boxGeometry args={[1, 1]}/>
            <meshStandardMaterial color={colors.GRAY}/>
        </mesh>
    )
})

export default Character