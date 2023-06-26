import * as THREE from 'three'
import { Plane } from "@react-three/drei"
import { useMemo, useRef } from "react"
import { useBackpackStore } from "store/backpackStore";
import { shallow } from 'zustand/shallow'
import { uiUnits } from 'Scene/utils/uiUnits';
import { ThreeEvent } from '@react-three/fiber';
import SlotModel from 'Scene/components/SlotModel'
import { memo } from 'react';
import { useLoadAssets } from 'store/LoadAssetsContext';

interface Props {
    item: { qty: number; itemHash: string; itemAttributes: any; slot: number }
    onClick?: (e: ThreeEvent<PointerEvent>) => void
    onPointerEnter?: (e: ThreeEvent<PointerEvent>) => void
    onPointerMove?: (e: ThreeEvent<PointerEvent>) => void
    onPointerLeave?: (e: ThreeEvent<PointerEvent>) => void
}

const EquipmentItem = memo(function BackpackItem({ item, onClick, onPointerEnter, onPointerMove, onPointerLeave }: Props) {
    // console.log('[CPU CHECK]: Rerender <Backpack Item>')
    // For test
    // FIXME: Rerenders lots of time, cuz app.tsx (eventCloud) has rerendering hole
    const { gltf } = useLoadAssets()

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
    }, [item])

    // Positioning
    const itemPlaneWidth = useMemo(() => cellSize * (slotUserData?.itemWidth || 0), [item])
    const itemPlaneHeight = useMemo(() => cellSize * (slotUserData?.itemHeight || 0), [item])

    const itemScale = useMemo(() => {
        return cellSize * .4 * (slotUserData?.itemHeight || 0)
    }, [cellSize, item])

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
    }, [ item, slots.current ])

    if (!slotUserData) {
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
            }}
            args={[uiUnits(itemPlaneWidth), uiUnits(itemPlaneHeight)]}
        >
            <meshBasicMaterial color={'#FFC700'} transparent={true} opacity={.1} />
            <Plane 
                name='equipment-item-events' 
                args={[uiUnits(itemPlaneWidth), uiUnits(itemPlaneHeight)]} 
                visible={false} 
                onClick={onClick}
                onPointerMove={onPointerMove}
                onPointerEnter={onPointerEnter}
                onPointerLeave={onPointerLeave}
            />
            <SlotModel position={[0, 0, 0]} ref={itemRef} scale={[uiUnits(itemScale), uiUnits(itemScale), uiUnits(itemScale)]} gltf={gltf.current.sword} />
        </Plane>

    )
})

export default EquipmentItem