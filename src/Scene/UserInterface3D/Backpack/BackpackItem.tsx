import * as THREE from 'three'
import { Plane } from "@react-three/drei"
import { useMemo, useRef } from "react"
import { useBackpackStore } from "store/backpackStore";
import { shallow } from 'zustand/shallow'
import { ThreeEvent } from '@react-three/fiber';
import SlotModel from 'Scene/UserInterface3D/Backpack/SlotModel'
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

const BackpackItem = memo(function BackpackItem({ item, onClick, onPointerEnter, onPointerMove, onPointerLeave, mounted }: Props) {
    // console.log('[CPU CHECK]: Rerender <Backpack Item>')

    const itemPlaneRef = useRef<THREE.Mesh | null>(null)
    const itemRef = useRef<THREE.Mesh | null>(null)

    const [ cellSize, slots ] = useBackpackStore(
        state => [state.cellSize, state.slots], 
        shallow
    )

    // Positioning
    const itemPlaneWidth = useMemo(() => cellSize * item.itemAttributes.itemWidth, [item, mounted])
    const itemPlaneHeight = useMemo(() => cellSize * item.itemAttributes.itemHeight, [item, mounted])

    const itemScale = useMemo(() => {
        return cellSize * .8 * Math.max(item.itemAttributes.itemWidth, item.itemAttributes.itemHeight)
    }, [cellSize, item, mounted])

    const itemPlanePosition = useMemo(() => {
        if (!slots.current) { return new THREE.Vector3(0, 0, 0) }
        const slotCell = slots.current[item.slot]
        if (!slotCell) { return new THREE.Vector3(0, 0, 0) }
        const slotRow = slotCell.parent
        const slotColumn = slotRow.parent
        const slotWrapper = slotColumn.parent
        

        // Calc position based on all parents
        let x = slotCell.position.x + slotRow.position.x + slotColumn.position.x + slotWrapper.position.x
        let y = slotCell.position.y + slotRow.position.y + slotColumn.position.y + slotWrapper.position.y
        let z = slotCell.position.z + slotRow.position.z + slotColumn.position.z + slotWrapper.position.z

        // Take into the account size of the element
        x += (item.itemAttributes.itemWidth - 1) * cellSize / 2
        y -= (item.itemAttributes.itemHeight - 1) * cellSize / 2

        return new THREE.Vector3(x, y, z)
    }, [ item, slots.current, mounted ])

    if (!mounted) {
        return <></>
    }

    return (
        <Plane 
            name='backpack-item'
            ref={itemPlaneRef}
            position={itemPlanePosition} 
            userData={{ 
                currentPosition: itemPlanePosition, 
                item: item,
                type: 'backpack'
            }}
            args={[itemPlaneWidth, itemPlaneHeight]}
        >
            <meshBasicMaterial color={'#FFC700'} transparent={true} opacity={.1} />
            <Plane 
                name='backpack-item-events' 
                args={[itemPlaneWidth, itemPlaneHeight]} 
                visible={false} 
                onClick={onClick}
                onPointerMove={onPointerMove}
                onPointerEnter={onPointerEnter}
                onPointerLeave={onPointerLeave}
            >
            </Plane>
            <ItemDescription item={item} type="backpack" />
            <SlotModel position={[0, 0, 100]} ref={itemRef} scale={[itemScale, itemScale, itemScale]} item={item} />
        </Plane>

    )
})

export default BackpackItem