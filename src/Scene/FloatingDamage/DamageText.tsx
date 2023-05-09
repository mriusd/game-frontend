import * as THREE from "three"
import { Text } from "@react-three/drei"
import { createBillboardMaterial } from "../helpers/createBillboardMaterial"
import { useEffect, useMemo, useRef } from "react"
import Tween from "Scene/utils/tween/tween"
import { Coordinate } from "interfaces/coordinate.interface"

interface Props { color: number, value: string, position: Coordinate, onComplete: () => void }
const DamageText = ({ color, value, position, onComplete }: Props) => {
    const textRef = useRef<THREE.Mesh | null>(null)
    const textBillboardMaterial = useMemo(() => createBillboardMaterial(new THREE.MeshBasicMaterial()), [])

    useEffect(() => {
        if (!textRef.current) { return }
        const from = { opacity: 1, offsetY: 1 }
        const to = { opacity: 1, offsetY: 1.5 }
        console.log('DAMAGE')
        Tween.to(from, to, {
            duration: 500,
            onChange(state) {
                textRef.current!.position.y = state.value.offsetY
                // textRef.current!.material.opacity = state.value.opacity
            },
            onComplete() {
                onComplete()
            }
        })
    }, [])
    
    return (
        <Text 
            ref={textRef}
            position={[position.x, 0, position.z]}
            color={color} 
            fillOpacity={1}
            anchorX="center" 
            anchorY="middle" 
            fontSize={.2}
            material={textBillboardMaterial}
        >
            { value }
        </Text>
    )
}

export default DamageText