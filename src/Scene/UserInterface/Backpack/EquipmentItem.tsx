import * as THREE from 'three'
import { Plane } from "@react-three/drei"
import { useMemo, useRef } from "react"
import { useBackpackStore } from "store/backpackStore";
import { shallow } from 'zustand/shallow'
import { ThreeEvent } from '@react-three/fiber';
import SlotModel from 'Scene/UserInterface/Backpack/SlotModel'
import { memo } from 'react';
import ItemDescription from './ItemDescription';

interface Props {
    item: { qty: number; itemHash: string; itemAttributes: any; slot: number }
    onClick?: (e: ThreeEvent<PointerEvent>) => void
    onPointerEnter?: (e: ThreeEvent<PointerEvent>) => void
    onPointerMove?: (e: ThreeEvent<PointerEvent>) => void
    onPointerLeave?: (e: ThreeEvent<PointerEvent>) => void
    mounted: boolean
}

const EquipmentItem = memo(function BackpackItem({ item, onClick, onPointerEnter, onPointerMove, onPointerLeave, mounted }: Props) {
    // console.log('[CPU CHECK]: Rerender <Backpack Item>')

    const itemPlaneRef = useRef<THREE.Mesh | null>(null)
    const itemRef = useRef<THREE.Mesh | null>(null)

    const [ cellSize, slots ] = useBackpackStore(
        state => [state.cellSize, state.equipmentSlots], 
        shallow
    )

    const slotUserData = useMemo(() => {
        if (!slots.current) { return }
        if (!slots.current[item.slot]) { return null }
        return slots.current[item.slot].userData
    }, [item, slots.current])

    // Positioning
    const itemPlaneWidth = useMemo(() => cellSize * (slotUserData?.itemWidth || 0), [slotUserData])
    const itemPlaneHeight = useMemo(() => cellSize * (slotUserData?.itemHeight || 0), [slotUserData])

    const itemScale = useMemo(() => {
        return cellSize * .9 * (slotUserData?.itemHeight || 0)
    }, [cellSize, slotUserData])

    const itemPlanePosition = useMemo(() => {
        if (!slots.current) { return new THREE.Vector3(0, 0, 0) }
        const slotCell = slots.current[item.slot]
        if (!slotCell) { return new THREE.Vector3(0, 0, 0) }
        const slotRow = slotCell.parent
        const slotWrapper = slotRow.parent

        // Calc position based on all parents
        let x = slotCell.position.x + slotRow.position.x + slotWrapper.position.x
        let y = slotCell.position.y + slotRow.position.y + slotWrapper.position.y
        let z = slotCell.position.z + slotRow.position.z + slotWrapper.position.z

        return new THREE.Vector3(x, y, z)
    }, [ item, slots.current, mounted ])

    if (!slotUserData || !mounted) {
        return <></>
    }

    return (
        <Plane 
            name='equipment-item'
            ref={itemPlaneRef}
            position={itemPlanePosition} 
            userData={{ 
                currentPosition: itemPlanePosition, 
                item: item,
                type: 'equipment'
            }}
            args={[itemPlaneWidth, itemPlaneHeight]}
        >
            <meshBasicMaterial color={'#FFC700'} transparent={true} opacity={.1} />
            <Plane 
                name='equipment-item-events' 
                args={[itemPlaneWidth, itemPlaneHeight]} 
                visible={false} 
                onClick={onClick}
                onPointerMove={onPointerMove}
                onPointerEnter={onPointerEnter}
                onPointerLeave={onPointerLeave}
            />
            <ItemDescription item={item} type="equipment" />
            <SlotModel position={[0, 0, 100]} ref={itemRef} scale={[itemScale, itemScale, itemScale]} item={item} />
        </Plane>

    )
})

export default EquipmentItem