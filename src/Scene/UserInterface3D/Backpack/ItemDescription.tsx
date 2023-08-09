import * as THREE from 'three'
import { Text } from "@react-three/drei"
import { createBillboardMaterial } from "Scene/helpers/createBillboardMaterial"
import { useMemo } from "react"
import type { BackpackSlot } from 'interfaces/backpack.interface'
import { generateItemName } from 'helpers/generateItemName'

interface Props {
    item: BackpackSlot
    type: 'equipment' | 'backpack'
}
const ItemDescription = ({ item, type }: Props) => {

    const billboardMaterial = useMemo(() => createBillboardMaterial(new THREE.MeshBasicMaterial({ transparent: true, depthTest: false })), [])
    // TODO: Should i change this, instead using depthTest & renderOrder do smth different?
    const bgMaterial = useMemo(() => createBillboardMaterial(new THREE.MeshBasicMaterial({ color: 'black', opacity: .9, transparent: true, depthTest: false })), [])
    const text = useMemo(() => generateItemName(item.itemAttributes, item.qty), [item])
    const bannerWidth = useMemo(() => Math.max(100, text.length * 12), [text]) 
    const offsetY = useMemo(() => {
        if (type === 'backpack') {
            return (Number(item.itemAttributes.itemParameters.itemHeight) - .5 * (Number(item.itemAttributes.itemParameters.itemHeight) - 1)) * 48
        }
        // Should store size of equipment slot in element
        return 80
    }, [])
    // bgMaterial.renderOrder = 900
    // 
    const height = useMemo(() => 30, [])

    return (
        <mesh
            visible={false}
            name='item-description'
            position={[ 
                0, 
                offsetY, 
                .0001 
            ]} 
            material={bgMaterial}
        >
            <planeGeometry args={[bannerWidth, height]} />
            <Text 
                position={[0, 0, .001]}
                color={0xFF8800} 
                fillOpacity={1}
                anchorX="center" 
                anchorY="middle" 
                fontSize={16}
                material={billboardMaterial}
            >
                { text }
            </Text>
        </mesh>
    )
}

export default ItemDescription