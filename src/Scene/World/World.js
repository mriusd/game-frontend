import { forwardRef } from "react"

const World = forwardRef((props, ref) => {
    const colors = {
        GRAY: 0x6C6C6C
    }
    return (
        <mesh ref={ref} receiveShadow rotation={[Math.PI / -2, 0, 0]}>
            <planeGeometry args={[20, 20]}/>
            <meshStandardMaterial color={colors.GRAY}/>
        </mesh>
    )
})

export default World