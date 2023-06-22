import * as THREE from 'three'
import { Box, Plane } from "@react-three/drei"
import { useMemo, useRef } from "react"
import { useBackpackStore } from "store/backpackStore";
import { shallow } from 'zustand/shallow'
import { uiUnits } from 'Scene/utils/uiUnits';
import { useFrame } from '@react-three/fiber';
import { useUiStore } from 'store/uiStore';
import { useThree } from '@react-three/fiber';
import ReuseModel from 'Scene/components/ReuseModel';
import { useLoadAssets } from 'store/LoadAssetsContext';
import { memo } from 'react';

interface Props {
    item: { qty: number; itemHash: string; itemAttributes: any; slot: number }
}

const BackpackItem = memo(function BackpackItem({ item }: Props) {

    // For test
    const { gltf } = useLoadAssets()

    const itemPlaneRef = useRef<THREE.Mesh | null>(null)
    const itemRef = useRef<THREE.Mesh | null>(null)


    const [ backpackWidth, backpackHeight, cellSize, slotsPlane, planeBoundingBox ] = useBackpackStore(
        state => [state.width, state.height, state.cellSize, state.slotsPlane, state.planeBoundingBox], 
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
        if (!slotsPlane) { return }

        // Calc position to set in (0,0)
        // const x0 = (slotsPlane.position.x) - (planeBoundingBox.width) - (planeBoundingBox.width * itemWidth / planeBoundingBox.width / size)
        // const y0 = (slotsPlane.position.y) + (planeBoundingBox.height / 2) + (planeBoundingBox.height * itemHeight / planeBoundingBox.height / size)
        const x0 = slotsPlane.position.x - backpackWidth/2
        const y0 = slotsPlane.position.y + backpackHeight/2
        const z0 = slotsPlane.position.z

        // Get item location
        const [posX, posY] = String(item.slot).split(',').map(item => Number(item))

        // Translate position based on provided location data
        const addX = item.itemAttributes.itemWidth % 2 === 0 ? 1 : .5
        const addY = item.itemAttributes.itemHeight % 2 === 0 ? 1 : .5

        const offsetX = ( posX + addX ) * cellSize
        const offsetY = ( posY + addY ) * cellSize

        const x = x0 + offsetX
        const y = y0 - offsetY
        const z = z0

        return new THREE.Vector3(uiUnits(x), uiUnits(y), uiUnits(z))
    }, [slotsPlane, item])


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
        itemPlaneRef.current.material.opacity = .3
        console.log(itemPlaneRef.current.position, {x: uiUnits(pointer.x), y: uiUnits(pointer.y)})
    }
    const onPointerLeave = () => {
        isHovered.current = false
        setCursor('default')
        // @ts-expect-error
        itemPlaneRef.current.material.opacity = 0
        // Reset rotation
        itemRef.current.rotation.y = 0
    }
    // Draggable Effects
    const onPointerDown = () => {
        isDragging.current = true
        setCursor('grabbing')

        pointerDown.current = {x: pointer.x, y: pointer.y}

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
            const pointerDeltaX = pointer.x - pointerDown.current.x
            const pointerDeltaY = pointer.y - pointerDown.current.y
            console.log(pointerDeltaX, pointerDeltaY)
            itemPlaneRef.current.position.x = itemPlanePosition.x + pointerDeltaX/10
            itemPlaneRef.current.position.y = itemPlanePosition.y + pointerDeltaY/10
        }
    })

    // Return nothing if no plane ref for placing item
    if (!slotsPlane) {
        return <></>
    }

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
            <meshBasicMaterial color={'#125408'} transparent={true} opacity={0} />
            {/* <Box ref={itemRef} position={[0,0,0]} args={[uiUnits(itemScale), uiUnits(itemScale), uiUnits(itemScale)]}>
                <meshBasicMaterial color={'red'} />
            </Box> */}
            <ReuseModel /*position={[uiUnits(-.1), 0, uiUnits(.2)]}*/ ref={itemRef} scale={[uiUnits(itemScale), uiUnits(itemScale), uiUnits(itemScale)]} gltf={gltf.current.sword} />
        </Plane>

    )
})

export default BackpackItem