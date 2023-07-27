import { useTexture } from "@react-three/drei"
import { useEffect, useMemo, useRef } from "react";

export const TwistingSword = ({ progress, radius, settings, duration }: {progress: number, radius: number, settings: any, duration: number}) => {
    const { map } = useTexture({ map: '/skills/sword.png' })
    const angle = useMemo(() => progress * 2 * Math.PI + settings.rotCircleZ, [settings])
    const positionX = useMemo(() => -radius * Math.cos(angle), [])
    const positionZ = useMemo(() => -radius * Math.sin(angle), [])
    

    // TODO: Just for test
    const ref = useRef<THREE.Group | null>(null)
    useEffect(() => {
        setTimeout(() => {
            if (ref.current) {
                ref.current.visible = false
            }
        }, duration * settings.removeDelay)
    }, [])

    return (
        <group ref={ref} name="twisting-sword" rotation={[0, 0, 0]} position={[positionX, settings.posY, positionZ]}>
            <mesh rotation={[settings.rotX, settings.rotY, settings.rotZ - progress*settings.rotCoefZ]} >
                <meshBasicMaterial map={map} transparent={true} depthWrite={false} depthTest={true} />
                <planeGeometry args={[settings.size, settings.size]}/>
            </mesh>
        </group>
    )
}