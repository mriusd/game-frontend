import { useRef, forwardRef } from "react"

const Character = forwardRef((props, ref) => {
    const colors = {
        GRAY: 0x444444
    }
    return (
        <mesh ref={ref} castShadow position={[0, .5, 0]}>
            <boxGeometry args={[1, 1]}/>
            <meshStandardMaterial color={colors.GRAY}/>
        </mesh>
    )
})

export default Character