import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { Flex, Box } from '@react-three/flex'
import { Plane } from '@react-three/drei'
import { uiUnits } from 'Scene/utils/uiUnits'
import { memo } from 'react'
import BackpackItem from './BackpackItem'
import { useBackpackStore } from 'store/backpackStore'
import { shallow } from 'zustand/shallow'
import { useEventStore } from 'store/EventStore'
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber'
import { useUiStore } from 'store/uiStore'
import { getCoordInUISpace } from 'Scene/utils/getCoordInUiSpace'
import { useHTMLEvents } from 'store/htmlEvents'
import { Coordinate } from 'interfaces/coordinate.interface'

const colors = {
    DARK: '#131313',
    LIGHT: '#202020',
    RED: '#512727'
}

const Backpack = memo(function Backpack() {
    console.log('[CPU CHECK]: Rerender <Backpack>')
    const backpack = useEventStore(state => state.backpack)
    const [backpackWidth, backpackHeight, isOpened, slots] = useBackpackStore(state => 
        [state.width, state.height, state.isOpened, state.slots], 
        shallow
    )    
    // Transform items to Array for rendering
    const items = useMemo(() => {
        if (!backpack) { return }
        return Object.keys(backpack.items).map(slot => ({ ...backpack.items[slot], slot }))
    }, [backpack])

    const setCursor = useUiStore(state => state.setCursor)

    const isItemPinned = useRef<boolean>(false)
    const pinnedItemEvent = useRef<ThreeEvent<PointerEvent> | null>(null)

    const isItemHovered = useRef<boolean>(false)
    const hoveredItemEvent = useRef<ThreeEvent<PointerEvent> | null>(null)
    const hoveredItemModel = useRef<THREE.Object3D | null>(null)

    const setRef = (ref: any, x: number, y: number) => {
        if (!slots.current) {
            // @ts-expect-error
            slots.current = {}
        }
        return slots.current[x+','+y] = ref
    }

    // Hover Effects
    const onPointerEnter = (e: ThreeEvent<PointerEvent>) => {
        if (isItemPinned.current || pinnedItemEvent.current) { return }
        isItemHovered.current = true
        hoveredItemModel.current = getSlotModel(e)
        setCursor('pointer')

        hoveredItemEvent.current = e
        // @ts-expect-error
        hoveredItemEvent.current.object.parent.material.opacity = .2
    }
    function getSlotModel(e: ThreeEvent<PointerEvent>) {
        const name = 'slot-model'
        const model = e.object.parent.children.find(object => object.name === name)
        return model || null
    }
    const onPointerLeave = (e: ThreeEvent<PointerEvent>) => {
        if (isItemPinned.current || pinnedItemEvent.current) { return }
        isItemHovered.current = false
        hoveredItemModel.current && (hoveredItemModel.current.rotation.y = 0)
        hoveredItemModel.current = null
        setCursor('default')

        if (hoveredItemEvent.current) {
            // @ts-expect-error
            hoveredItemEvent.current.object.parent.material.opacity = .1
            hoveredItemEvent.current = null
        }
    }
    const onClick = (e: ThreeEvent<PointerEvent>) => {
        // If we Pinning already, we have to prevent click on another Item, otherwise -- error
        if (isItemPinned.current && e.object !== pinnedItemEvent.current.object) { return }
        // 
        isItemPinned.current = !isItemPinned.current
        if (isItemPinned.current) {
            pinnedItemEvent.current = e
            // @ts-expect-error
            hoveredItemEvent.current.object.parent.material.opacity = 0 // TODO: sometimes get error over here
            // Display previous cell
            setPrevCellColor(pinnedItemEvent.current, true)
        } else {
            setPrevCellColor(pinnedItemEvent.current, false)
            // @ts-expect-error
            hoveredItemEvent.current.object.parent.material.opacity = .2
            pinnedItemEvent.current = null
        }
    }
    function setPrevCellColor(pinnedItemEvent: ThreeEvent<PointerEvent>, show: boolean) {
        const cellCoordinate = pinnedItemEvent.object.parent.userData.item.slot.split(',').map((_:string)=>Number(_))
        const itemWidth = pinnedItemEvent.object.parent.userData.item.itemAttributes.itemWidth
        const itemHeight = pinnedItemEvent.object.parent.userData.item.itemAttributes.itemHeight

        for (let i = 0; i < itemHeight; i++) {
            for (let j = 0; j < itemWidth; j++) {
                const cell = slots.current[`${cellCoordinate[0]+j},${cellCoordinate[1]+i}`]
                if (!cell) { return console.error('[Backpack]: Cell not found') }

                if (show) {
                    cell.material.color = new THREE.Color(colors.RED)
                } else {
                    cell.material.color = new THREE.Color(cell.userData.color)
                }
            }
        }
    }
    useFrame(({ raycaster }) => {
        // Pin item
        if (pinnedItemEvent.current && isItemPinned.current) {
            const projectedPointer = getCoordInUISpace(raycaster)
            if (!projectedPointer) { return }
            pinnedItemEvent.current.object.parent.position.copy(projectedPointer)
        }
        // Rotate pinned or hovered item
        if (hoveredItemModel.current && isItemHovered.current) {
            hoveredItemModel.current.rotation.y += 0.05
        }
    })

    if (!items) {
        return <></>
    }

    return (
        <group visible={isOpened}>
            <Plane name='background-plane' position={[0,0,0]} args={[uiUnits(40), uiUnits(40), 1]}>
                <meshBasicMaterial color={'black'} transparent={true} opacity={.8} />
            </Plane>

            {/* Backpack slots */}
            <Flex name='backpack' position={[uiUnits(1), uiUnits(4), uiUnits(1)]} flexDir="column" >
                { [...new Array(backpackWidth)].map((_, i) => (
                    <Box name='column' key={i} flexDir="row">
                        { [...new Array(backpackHeight)].map((_, j) => (
                            <Box name='row' key={'_'+j}>
                                <Plane 
                                    name='slot-cell' 
                                    ref={(r) => setRef(r, j, i)} 
                                    args={[uiUnits(1), uiUnits(1), 1]}
                                    userData={{slot: { x: j, y: i }, color: (i + j) % 2 === 0 ? colors.DARK : colors.LIGHT,  type: 'backpack'}}
                                >
                                    <meshBasicMaterial color={(i + j) % 2 === 0 ? colors.DARK : colors.LIGHT} />
                                </Plane>
                            </Box>
                        ))}
                    </Box>
                )) }
            </Flex>

            {/* Equiped on character items slots */}
            <Plane
                name='backpack-equiped-items'
                position={[uiUnits(-5), uiUnits(0), uiUnits(1)]} 
                args={[uiUnits(4), uiUnits(8)]} 
            >
                <meshBasicMaterial color={'black'}/>
            </Plane>
                
            <group name='backpack-items'>
                {items?.length && items.map(item => 
                    <BackpackItem 
                        onClick={onClick}
                        onPointerEnter={onPointerEnter}
                        onPointerLeave={onPointerLeave}
                        key={item.itemHash} 
                        item={item} 
                    />) 
                }
            </group>
        </group>

    )
})

export default Backpack