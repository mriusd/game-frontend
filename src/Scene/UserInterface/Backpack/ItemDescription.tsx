import * as THREE from 'three'
import { Text } from "@react-three/drei"
import { createBillboardMaterial } from "Scene/helpers/createBillboardMaterial"
import { useMemo } from "react"
import { uiUnits } from 'Scene/utils/uiUnits'
import type { BackpackSlot } from 'interfaces/backpack.interface'
import { generateItemName } from 'helpers/generateItemName'

interface Props {
    item: BackpackSlot
    type: 'equipment' | 'backpack'
}
const ItemDescription = ({ item, type }: Props) => {

    const billboardMaterial = useMemo(() => createBillboardMaterial(new THREE.MeshBasicMaterial()), [])
    // TODO: Should i change this, instead using depthTest & renderOrder do smth different?
    const bgMaterial = useMemo(() => createBillboardMaterial(new THREE.MeshBasicMaterial({ color: 'black', transparent: true, depthTest: false })), [])
    const text = useMemo(() => generateItemName(item.itemAttributes, item.qty), [item])
    const bannerWidth = useMemo(() => Math.max(2.5, text.length * 0.15), [text]) 
    const offsetY = useMemo(() => {
        if (type === 'backpack') {
            return Number(item.itemAttributes.itemHeight) - .5 * (Number(item.itemAttributes.itemHeight) - 1) 
        }
        // Should store size of equipment slot in element
        return 2
    }, [])
    // bgMaterial.renderOrder = 900
    // 
    const height = useMemo(() => 1, [])

    return (
        <mesh
            visible={false}
            name='item-description'
            position={[ 
                0, 
                uiUnits(offsetY), 
                uiUnits(.0001) 
            ]} 
            material={bgMaterial}
        >
            <planeGeometry args={[uiUnits(bannerWidth), uiUnits(height)]} />
            <Text 
                position={[0, 0, .001]}
                color={0xFF8800} 
                fillOpacity={1}
                anchorX="center" 
                anchorY="middle" 
                fontSize={uiUnits(.25)}
                material={billboardMaterial}
            >
                { text }
            </Text>
        </mesh>
    )
}

export default ItemDescription