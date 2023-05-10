import * as THREE from "three"
import { Text } from "@react-three/drei"
import { createBillboardMaterial } from "../helpers/createBillboardMaterial"
import { useEffect, useMemo, useRef } from "react"
import Tween from "Scene/utils/tween/tween"
import type { ObjectData } from "interfaces/sceneData.interface"

interface Props { color: number, value: string, target: ObjectData, onComplete: () => void }
const DamageText = ({ color, value, target, onComplete }: Props) => {
    const textRef = useRef<THREE.Mesh | null>(null)
    const textBillboardMaterial = useMemo(() => createBillboardMaterial(new THREE.MeshBasicMaterial()), [])

    useEffect(() => {
        if (!textRef.current) { return }
        // Rm if no object found, it means for example that npc dead
        if (!target) { return onComplete() }

        const { x, z } = target.ref.position
        const { height } = target.dimensions
        const from = { opacity: 1, offsetY: .5 }
        const to = { opacity: 1, offsetY: 1 }

        textRef.current!.position.set(x, height+from.offsetY, z)

        Tween.to(from, to, {
            duration: 700,
            onChange(state) {
                textRef.current!.position.y = height + state.value.offsetY
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