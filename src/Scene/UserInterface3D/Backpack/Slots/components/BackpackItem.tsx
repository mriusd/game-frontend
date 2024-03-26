import * as THREE from 'three'
import { Plane } from "@react-three/drei"
import { RefObject, useMemo, useRef } from "react"
import { ThreeEvent } from '@react-three/fiber';
import SlotModel from 'Scene/UserInterface3D/Backpack/Slots/components/SlotModel'
import { memo } from 'react';
import ItemDescription from './ItemDescription';

interface Props {
    item: { qty: number; itemHash: string; itemAttributes: any; slot: number }
    onClick?: (e: ThreeEvent<PointerEvent>) => void
    onPointerEnter?: (e: ThreeEvent<PointerEvent>) => void
    onPointerMove?: (e: ThreeEvent<PointerEvent>) => void
    onPointerLeave?: (e: ThreeEvent<PointerEvent>) => void
    onDoubleClick?: (e: ThreeEvent<PointerEvent>) => void
    mounted: boolean,
    cellSize: number,
    slots: RefObject<{[key: number]: THREE.Mesh}>
}

const BackpackItem = memo(function BackpackItem({ 
    item, 
    onClick, 
    onPointerEnter, 
    onPointerMove, 
    onPointerLeave, 
    onDoubleClick,
    mounted,
    cellSize,
    slots
}: Props) {
    // console.log('[CPU CHECK]: Rerender <Backpack Item>')

    const itemPlaneRef = useRef<THREE.Mesh | null>(null)
    const itemRef = useRef<THREE.Mesh | null>(null)

    // Positioning
    const itemPlaneWidth = useMemo(() => cellSize * item.itemAttributes.itemParameters.itemWidth, [item, mounted, cellSize])
    const itemPlaneHeight = useMemo(() => cellSize * item.itemAttributes.itemParameters.itemHeight, [item, mounted, cellSize])

    const itemScale = useMemo(() => {
        return cellSize * .8 * Math.max(item.itemAttributes.itemParameters.itemWidth, item.itemAttributes.itemParameters.itemHeight)
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
        x += (item.itemAttributes.itemParameters.itemWidth - 1) * cellSize / 2
        y -= (item.itemAttributes.itemParameters.itemHeight - 1) * cellSize / 2

        return new THREE.Vector3(x, y, z)
    }, [ item, slots.current, mounted, slots ])

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
                onDoubleClick={onDoubleClick}
            >
            </Plane>
            <ItemDescription item={item} type="backpack" />
            <SlotModel position={[0, 0, 100]} ref={itemRef} scale={[itemScale, itemScale, itemScale]} item={item} />
        </Plane>
    )
})

export default BackpackItem