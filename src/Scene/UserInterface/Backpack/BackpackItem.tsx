import * as THREE from 'three'
import { Box, Html, Plane } from "@react-three/drei"
import { RefObject, useEffect, useMemo, useRef } from "react"
import { useBackpackStore } from "store/backpackStore";
import { shallow } from 'zustand/shallow'
import { uiUnits } from 'Scene/utils/uiUnits';
import { useFrame } from '@react-three/fiber';
import { useUiStore } from 'store/uiStore';
import { useThree } from '@react-three/fiber';
import ReuseModel from 'Scene/components/ReuseModel';
import { useLoadAssets } from 'store/LoadAssetsContext';
import SlotModel from 'Scene/components/SlotModel'
import { memo } from 'react';

interface Props {
    slotsPointer: RefObject<{ x: number; y: number; } | null>
    item: { qty: number; itemHash: string; itemAttributes: any; slot: number }
}

const BackpackItem = memo(function BackpackItem({ item, slotsPointer }: Props) {
    console.log('----> Rerender Backpack Item')
    // For test
    const { gltf } = useLoadAssets()

    const itemPlaneRef = useRef<THREE.Mesh | null>(null)
    const itemRef = useRef<THREE.Mesh | null>(null)


    const [ cellSize, slots ] = useBackpackStore(
        state => [state.cellSize, state.slots], 
        shallow
    )
    const setCursor = useUiStore(state => state.setCursor)

    // Positioning
    const itemPlaneWidth = useMemo(() => cellSize * item.itemAttributes.itemWidth, [item])
    const itemPlaneHeight = useMemo(() => cellSize * item.itemAttributes.itemHeight, [item])

    const itemScale = useMemo(() => {
        return cellSize * .4  * item.itemAttributes.itemWidth
    }, [cellSize, item])

    const itemPlanePosition = useMemo(() => {
        if (!slots.current) { return new THREE.Vector3(0, 0, 0) }
        const slot = slots.current[item.slot]
        if (!slot) { return new THREE.Vector3(0, 0, 0) }
        const slotCell = slot.parent
        const slotRow = slotCell.parent
        const slotColumn = slotRow.parent
        const slotWrapper = slotColumn.parent

        // Calc position based on all parents
        let x = slot.position.x + slotCell.position.x + slotRow.position.x + slotColumn.position.x + slotWrapper.position.x
        let y = slot.position.y + slotCell.position.y + slotRow.position.y + slotColumn.position.y + slotWrapper.position.y
        let z = slot.position.z + slotCell.position.z + slotRow.position.z + slotColumn.position.z + slotWrapper.position.z

        // Take into account size of element
        x += (item.itemAttributes.itemWidth - 1) * uiUnits(cellSize) / 2
        y -= (item.itemAttributes.itemHeight - 1) * uiUnits(cellSize) / 2


        return new THREE.Vector3(x, y, z)
    }, [ item, slots.current ])


    // Mouse Intercations
    const isHovered = useRef<boolean>(false)
    const isDragging = useRef<boolean>(false)
    const pointer = useThree(state => state.pointer)

    // Draft for test
    const pointerDown = useRef<THREE.Vec2>()
    // 

    // Hover Effects
    const onPointerEnter = () => {
        isHovered.current = true
        setCursor('pointer')
        // @ts-expect-error
        itemPlaneRef.current.material.opacity = .2
    }
    const onPointerLeave = () => {
        isHovered.current = false
        setCursor('default')
        // @ts-expect-error
        itemPlaneRef.current.material.opacity = .1
        // Reset rotation
        itemRef.current.rotation.y = 0
    }
    // Draggable Effects
    const onPointerDown = () => {
        isDragging.current = true
        setCursor('grabbing')


    }
    const onPointerUp = () => {
        isDragging.current = false
        setCursor('default')
        // Reset position
        // itemPlaneRef.current.position.set(itemPlanePosition.x, itemPlanePosition.y, itemPlanePosition.z)
    }

    useFrame(({ raycaster }) => {
        if (itemRef.current && isHovered.current) {
            itemRef.current.rotation.y += 0.015
        }
        if (itemPlaneRef.current && isDragging.current) {
            // TODO: Thats works good, but
            // * 1. Need to subtract current UV
            // * 2. Add 1 invisible plane for movement, cuz now u cant move object out backpack slots
            // * 3. Provide calculated coordinates another way, which wont initiate Items rerender
            itemPlaneRef.current.position.x = slotsPointer.current.x
            // itemPlaneRef.current.position.y = slotsPointer.current.y
        }
    })


    return (
        <Plane 
            ref={itemPlaneRef}
            onPointerEnter={onPointerEnter}
            onPointerLeave={() => {onPointerLeave(); onPointerUp()}}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            position={itemPlanePosition} 
            args={[uiUnits(itemPlaneWidth), uiUnits(itemPlaneHeight)]}
        >
            <meshBasicMaterial color={'#FFC700'} transparent={true} opacity={.1} />
            {/* <Box ref={itemRef} position={[0,0,0]} args={[uiUnits(itemScale), uiUnits(itemScale), uiUnits(itemScale)]}>
                <meshBasicMaterial color={'red'} />
            </Box> */}
            <SlotModel position={[0, 0, 0]} ref={itemRef} scale={[uiUnits(itemScale), uiUnits(itemScale), uiUnits(itemScale)]} gltf={gltf.current.sword} />
        </Plane>

    )
})

export default BackpackItem