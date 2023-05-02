
import * as THREE from "three"
import { forwardRef, useContext } from "react"
import { SceneContext } from "../store/SceneContextProvider"

const World = forwardRef((props, ref) => {
    const { worldSize } = useContext(SceneContext) 

    const colors = {
        GRAY: 0x6C6C6C
    }

    const segmentsSize = 1
    const segmentsX = worldSize.current+1
    const segmentsY = worldSize.current+1
    const sizeX = segmentsSize * segmentsX
    const sizeY = segmentsSize * segmentsY

    const geometry = new THREE.PlaneGeometry(sizeX, sizeY, segmentsX, segmentsY)
    const material = new THREE.MeshStandardMaterial({ color: colors.GRAY })

    return (
        <mesh 
            ref={ref} 
            receiveShadow 
            rotation={[Math.PI / -2, 0, 0]}
            geometry={geometry}
            material={material}
        >
            <gridHelper args={[worldSize.current+1, worldSize.current+1, 0xFFFFFF, 0xFFFFFF]} position={[0, 0.001, 0]} rotation={[Math.PI / -2, 0, 0]} />
        </mesh>
    )
})

export default World