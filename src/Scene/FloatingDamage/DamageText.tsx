import * as THREE from "three"
import { Text, Instances, Instance } from "@react-three/drei"
import { createBillboardMaterial } from "../materials/createBillboardMaterial"
import { useEffect, useMemo, useRef } from "react"
import Tween from "Scene/utils/tween/tween"
import type { ObjectData } from "interfaces/sceneData.interface"

interface Props { color: number, value: string, target: ObjectData, onComplete: () => void }
const DamageText = ({ color, value, target, onComplete }: Props) => {
    const textRef = useRef<THREE.Mesh | null>(null)
    const textBillboardMaterial = useMemo(() => createBillboardMaterial(new THREE.MeshBasicMaterial({ transparent: true })), [])

    useEffect(() => {
        if (!textRef.current) { return }
        // Rm if no object found, it means for example that npc dead
        if (!target) { return onComplete() }

        const { x, z } = target.ref.position
        const { height } = target.dimensions
        const from = { opacity: 1.5, offsetY: .5 }
        const to = { opacity: 0, offsetY: 1.3 }

        textRef.current!.position.set(x, height+from.offsetY, z)
        // console.log(textRef.current.material)

        Tween.to(from, to, {
            duration: 700,
            onChange(state) {
                textRef.current.position.y = height + state.value.offsetY
                // @ts-expect-error
                textRef.current.material.uniforms['customAlpha'].value = state.value.opacity
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

    // return (
    //     <Instances
    //     limit={1000}
    //     range={1000}
    //     >
    //     <boxGeometry />
    //     <meshStandardMaterial />
    //     <Instance
    //         color="red"
    //         scale={2}
    //         position={[1, 2, 3]}
    //         rotation={[Math.PI / 3, 0, 0]}
    //     </Instances>
    // )
}

export default DamageText