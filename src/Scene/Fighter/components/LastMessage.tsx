import * as THREE from "three"
import { RefObject, useEffect, useMemo, useRef } from "react"
import type { Mesh, Group } from "three"
import { useFrame } from "@react-three/fiber"
import { Text } from "@react-three/drei"
import { createBillboardMaterial } from "Scene/materials/createBillboardMaterial"
import { getMeshDimensions } from "Scene/utils/getMeshDimensions"
import { Fighter } from "interfaces/fighter.interface"
import { fonts } from "Scene/core/fonts"

interface Props {
    fighter: Fighter
    target: RefObject<Mesh | Group>
    offset?: number
    color?: number
}
const LastMessage = function LastMessage({ fighter, target, offset = .4, color = 0xFF8800 }: Props) {
    const textRef = useRef<Mesh | null>(null)
    const textBillboardMaterial = useMemo(() => createBillboardMaterial(new THREE.MeshBasicMaterial()), [])
    const textBoundingBox = useRef<ReturnType<typeof getMeshDimensions> | null>(null)

    useFrame(() => {
        if (!textRef.current) { return }
        if (!target.current) { return }
        if (!textBoundingBox.current) { 
            textBoundingBox.current = getMeshDimensions(target.current)
            return
        }
        const { x, y, z } = target.current.position
        textRef.current.position.set(x, y + textBoundingBox.current.height + offset, z)
    })

    return (
        <Text 
            visible={!!fighter.lastChatMessage}
            font={fonts["Roboto Slab"]}
            ref={textRef}
            color={color} 
            fillOpacity={1}
            anchorX="center" 
            anchorY="middle" 
            fontSize={.15}
            material={textBillboardMaterial}
        >
            {
                fighter.lastChatMessage && target.current && textBoundingBox.current ? fighter.lastChatMessage : ''
            }
        </Text>
    )
}

export default LastMessage