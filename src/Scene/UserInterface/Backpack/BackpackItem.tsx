import * as THREE from 'three'
import { Plane } from "@react-three/drei"
import { RefObject, useMemo, useRef } from "react"
import { useBackpackStore } from "store/backpackStore";
import { shallow } from 'zustand/shallow'
import { uiUnits, fromUiUnits } from 'Scene/utils/uiUnits';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { useUiStore } from 'store/uiStore';
import { useThree } from '@react-three/fiber';
import { useLoadAssets } from 'store/LoadAssetsContext';
import SlotModel from 'Scene/components/SlotModel'
import { memo } from 'react';

interface Props {
    item: { qty: number; itemHash: string; itemAttributes: any; slot: number }
}

const BackpackItem = memo(function BackpackItem({ item }: Props) {
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

    const pointerStart = useRef<{ x: number; y: number; }>(null)
    const positionStart = useRef<{ x: number; y: number; }>(null)

    // Hover Effects
    const onPointerEnter = () => {
        if (isDragging.current) { return }
        isHovered.current = true
        // @ts-expect-error
        itemPlaneRef.current.material.opacity = .2
        setCursor('pointer')
    }
    const onPointerLeave = () => {
        if (isDragging.current) { return }
        isHovered.current = false
        // @ts-expect-error
        itemPlaneRef.current.material.opacity = .1
        // Reset rotation
        itemRef.current.rotation.y = 0
        setCursor('default')
    }

    // Draggable Effects
    const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
        isDragging.current = true
        // TODO: FIXME: When u click on model u hook wrong object, prevent hooking on model
        positionStart.current = { x: e.object.position.x, y: e.object.position.y }
        pointerStart.current = { x: pointer.x, y: pointer.y }
        setCursor('grabbing')

        console.log(e.object)
        console.log('pointer.x', pointer.x * 0.1)
        console.log('pointerStart.x', pointerStart.current.x * 0.1)
        console.log('uv.x', positionStart.current.x)
    }

    const onPointerUp = () => {
        isDragging.current = false
        positionStart.current = null
        pointerStart.current = null
        setCursor('default')

        // Reset position
        itemPlaneRef.current.position.set(itemPlanePosition.x, itemPlanePosition.y, itemPlanePosition.z)
    }

    useFrame(() => {
        if (itemRef.current && isHovered.current) {
            itemRef.current.rotation.y += 0.015
        }
        if (itemPlaneRef.current && isDragging.current && positionStart.current && pointerStart.current) {
            if (positionStart.current.x === 0 && pointerStart.current.x !== 0) { return }
            if (positionStart.current.y === 0 && pointerStart.current.y !== 0) { return }
            // TODO: Thats works good, but we have problem cuz PerspectiveCamera
            // * I shouldnt directly use POINTER coordinates, get them another way via intersaction
            // * Then i wouldnt need to calc edge (pointerStart - positionStart) and just use intersected directly
            itemPlaneRef.current.position.x = (pointer.x * 0.1) - (pointerStart.current.x * 0.1 - positionStart.current.x)
            itemPlaneRef.current.position.y = (pointer.y * 0.1) - (pointerStart.current.y * 0.1 - positionStart.current.y)
        
            getCellsCollision()
        }
    })

    function getCellsCollision() {
        // TODO: DRAFT
        // console.log(itemPlaneRef.current.position.y)
        // console.log(Math.round(fromUiUnits(itemPlaneRef.current.position.x)))
        // console.log(Math.abs(Math.round(fromUiUnits(itemPlaneRef.current.position.y)) - 4))
    }


    return (
        <Plane 
            ref={itemPlaneRef}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            position={itemPlanePosition} 
            args={[uiUnits(itemPlaneWidth), uiUnits(itemPlaneHeight)]}
        >
            <meshBasicMaterial color={'#FFC700'} transparent={true} opacity={.1} />
            <SlotModel position={[0, 0, 0]} ref={itemRef} scale={[uiUnits(itemScale), uiUnits(itemScale), uiUnits(itemScale)]} gltf={gltf.current.sword} />
        </Plane>

    )
})

export default BackpackItem