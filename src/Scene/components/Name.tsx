import * as THREE from "three"
import { RefObject, useEffect, useMemo, useRef } from "react"
import type { Mesh, Group } from "three"
import { useFrame } from "@react-three/fiber"
import { Text } from "@react-three/drei"
import { createBillboardMaterial } from "../helpers/createBillboardMaterial"
import { getMeshDimensions } from "Scene/utils/getMeshDimensions"

interface Props {
    value: string
    target: RefObject<Mesh | Group>
    offset?: number
}
const Name = function Name({ value, target, offset = .4 }: Props) {
    const textRef = useRef<Mesh | null>(null)
    const textBillboardMaterial = useMemo(() => createBillboardMaterial(new THREE.MeshBasicMaterial()), [])
    const textBoundingBox = useRef<ReturnType<typeof getMeshDimensions> | null>(null)
    useEffect(() => {
        if (!target.current) { return }
        setTimeout(() => {
            textBoundingBox.current = getMeshDimensions(target.current)
        }, 30)
    }, [target.current])

    useFrame(() => {
        if (!textRef.current) { return }
        if (!value) { return }
        if (!target.current) { return }
        if (!textBoundingBox.current) { return }
        const { x, y, z } = target.current.position
        textRef.current.position.set(x, y + textBoundingBox.current.height + offset, z)
    })

    return (
        <Text 
            ref={textRef}
            color={0xFFFFFF} 
            fillOpacity={1}
            anchorX="center" 
            anchorY="middle" 
            fontSize={.2}
            material={textBillboardMaterial}
        >
            {
                value && target.current && textBoundingBox.current ? value : ''
            }
        </Text>
    )
}

export default Name