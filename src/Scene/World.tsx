
import * as THREE from "three"
import { RefObject, forwardRef } from "react"
import { useSceneContext } from "store/SceneContext"

const World = forwardRef((props, ref) => {
    const { worldSize } = useSceneContext()

    if (!worldSize.current) {
        return <></>
    }

    const segmentsSize = 1
    const segmentsX = worldSize.current
    const segmentsY = worldSize.current
    const sizeX = segmentsSize * segmentsX
    const sizeY = segmentsSize * segmentsY

    const geometry = new THREE.PlaneGeometry(sizeX, sizeY, segmentsX, segmentsY)
    const material = new THREE.MeshStandardMaterial({ color: 0x6C6C6C })

    return (
        <mesh 
            // @ts-expect-error
            ref={ref} 
            receiveShadow 
            rotation={[Math.PI / -2, 0, 0]}
            geometry={geometry}
            material={material}
        >
            <gridHelper args={[worldSize.current, worldSize.current, 0xFFFFFF, 0xFFFFFF]} position={[0, 0.001, 0]} rotation={[Math.PI / -2, 0, 0]} />
        </mesh>
    )
})

export default World