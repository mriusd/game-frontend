import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { Flex, Box } from '@react-three/flex'
import { Plane } from '@react-three/drei'
import { uiUnits } from 'Scene/utils/uiUnits'
import { memo } from 'react'
import BackpackItem from './BackpackItem'
import { useBackpackStore } from 'store/backpackStore'
import { shallow } from 'zustand/shallow'
import { useEventStore } from 'store/EventStore'
import { ThreeEvent, useFrame } from '@react-three/fiber'
import { useUiStore } from 'store/uiStore'
import { getCoordInUISpace } from 'Scene/utils/getCoordInUiSpace'

const colors = {
    COMMON_DARK: '#131313',
    COMMON_LIGHT: '#202020',

    INSERT_ALLOWED_DARK: '#183419',
    INSERT_ALLOWED_LIGHT: '#1F3D20',

    INSERT_DISALLOWED_DARK: '#351B1B',
    INSERT_DISALLOWED_LIGHT: '#442323',

    LAST_PLACEHOLDER_DARK: '#342F00', 
    LAST_PLACEHOLDER_LIGHT: '#393400', 
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
    // Cell collisions
    const pointerCell = useRef<THREE.Mesh | null>(null)
    const placeholderCells = useRef<THREE.Mesh[]>([])
    const currentPointerCells = useRef<THREE.Mesh[]>([])
    const lastPointerCells = useRef<THREE.Mesh[]>([])
    // For Insert, if not null, means can be insert
    const cellToInsert = useRef<THREE.Mesh | null>(null)

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
            setPlaceholderCells(pinnedItemEvent.current, true)
        } else {
            setPlaceholderCells(pinnedItemEvent.current, false)
            // @ts-expect-error
            hoveredItemEvent.current.object.parent.material.opacity = .2
            pinnedItemEvent.current = null
            clearPointerCells()
        }
    }
    function setPlaceholderCells(pinnedItemEvent: ThreeEvent<PointerEvent>, show: boolean) {
        const cellCoordinate = pinnedItemEvent.object.parent.userData.item.slot.split(',').map((_:string)=>Number(_))
        const itemWidth = pinnedItemEvent.object.parent.userData.item.itemAttributes.itemWidth
        const itemHeight = pinnedItemEvent.object.parent.userData.item.itemAttributes.itemHeight

        const cells = []
        for (let i = 0; i < itemHeight; i++) {
            for (let j = 0; j < itemWidth; j++) {
                const cell = slots.current[`${cellCoordinate[0]+j},${cellCoordinate[1]+i}`]
                if (!cell) { return console.error('[Backpack]: Cell not found') }

                if (show) {
                    cell.material.color = new THREE.Color(cell.userData.colors.last_placeholder)
                    cells.push(cell)
                } else {
                    cell.material.color = new THREE.Color(cell.userData.colors.common)
                }
            }
        }

        placeholderCells.current = cells
    }

    useFrame(({ raycaster }) => {
        if (!isOpened) { return }
        // Pin item
        if (pinnedItemEvent.current && isItemPinned.current) {
            const projectedPointer = getCoordInUISpace(raycaster)
            if (!projectedPointer) { return }
            pinnedItemEvent.current.object.parent.position.copy(projectedPointer)
            // Detect collisions
            highlightPointerCell(projectedPointer)
        }
        // Rotate pinned or hovered item
        if (hoveredItemModel.current && isItemHovered.current) {
            hoveredItemModel.current.rotation.y += 0.05
        }
    })
    function highlightPointerCell(projectedPointer: {x:number;y:number}) {        
        lastPointerCells.current = currentPointerCells.current
        currentPointerCells.current = getPointerCells(projectedPointer)

        lastPointerCells.current.forEach(cell => {
            // If placeholder cell we dont touch it
            if (placeholderCells.current.find(_ => _ === cell)) { return }
            // @ts-expect-error
            cell.material.color = new THREE.Color(cell.userData.colors.common)
        })

        const itemWidth = pinnedItemEvent.current.object.parent.userData.item.itemAttributes.itemWidth
        const itemHeight = pinnedItemEvent.current.object.parent.userData.item.itemAttributes.itemHeight
        // Check if we can insert
        let availableCells = 0
        currentPointerCells.current.forEach(cell => {
            if (currentPointerCells.current.length < itemWidth * itemHeight) {
                return
            }
            availableCells += isOccupied(cell) ? 0 : 1
        })

        // Then set insert availability based on <availableCells>
        if (availableCells === itemWidth * itemHeight) {
            cellToInsert.current = pointerCell.current
            currentPointerCells.current.forEach(cell => {
                // If placeholder cell we dont touch it
                if (placeholderCells.current.find(_ => _ === cell)) { return }
                // @ts-expect-error
                cell.material.color = new THREE.Color(cell.userData.colors.insert_allowed)
            })
        } else {
            cellToInsert.current = null
            currentPointerCells.current.forEach(cell => {
                // If placeholder cell we dont touch it
                if (placeholderCells.current.find(_ => _ === cell)) { return }
                // @ts-expect-error
                cell.material.color = new THREE.Color(cell.userData.colors.insert_disallowed)
            })
        }

        function getPointerCells(projectedPointer: {x:number;y:number}) {
            const _pointerCell = Object.values(slots.current).find(slotCell => {
                const slotRow = slotCell.parent
                const slotColumn = slotRow.parent
                const slotWrapper = slotColumn.parent
                const x = slotRow.position.x + slotColumn.position.x + slotWrapper.position.x
                const y = slotRow.position.y + slotColumn.position.y + slotWrapper.position.y
                return Math.abs(x - projectedPointer.x) < uiUnits(0.5) && Math.abs(y - projectedPointer.y) < uiUnits(0.5)
            })
    
            if (!_pointerCell) return []
            pointerCell.current = _pointerCell
        
    
            const cells = []
            const { x, y } = _pointerCell.userData.slot
            const itemWidth = pinnedItemEvent.current.object.parent.userData.item.itemAttributes.itemWidth
            const itemHeight = pinnedItemEvent.current.object.parent.userData.item.itemAttributes.itemHeight
            for (let i = 0; i < itemHeight; i++) {
                for (let j = 0; j < itemWidth; j++) {
                    const cell = slots.current[`${x+i},${y+j}`]
                    if (cell) {
                        cells.push(cell)
                    }
                }
            }
    
            return cells
        }

        function isOccupied(cell: THREE.Mesh) {
            const { x, y } = cell.userData.slot
            return backpack.grid[y][x]
        }
    }

    function clearPointerCells() {
        currentPointerCells.current.forEach(cell => {
            // @ts-expect-error
            cell.material.color = new THREE.Color(cell.userData.colors.common)
        })
    }

    if (!items) {
        return <></>
    }

    return (
        <group visible={isOpened}>
            <Plane name='background-plane' position={[0,0,0]} args={[uiUnits(40), uiUnits(40), 1]}>
                <meshBasicMaterial color={'black'} transparent={true} opacity={.8} />
            </Plane>

            {/* Backpack Slots */}
            <Flex name='backpack' position={[uiUnits(1), uiUnits(4), uiUnits(1)]} flexDir="column" >
                { [...new Array(backpackWidth)].map((_, i) => (
                    <Box name='column' key={i} flexDir="row">
                        { [...new Array(backpackHeight)].map((_, j) => (
                            <Box name='row' key={'_'+j}>
                                <Plane 
                                    name='slot-cell' 
                                    ref={(r) => setRef(r, j, i)} 
                                    args={[uiUnits(1), uiUnits(1), 1]}
                                    userData={{
                                        slot: { x: j, y: i }, 
                                        colors: {
                                            common: (i + j) % 2 === 0 ? colors.COMMON_DARK : colors.COMMON_LIGHT,
                                            insert_allowed: (i + j) % 2 === 0 ? colors.INSERT_ALLOWED_DARK : colors.INSERT_ALLOWED_LIGHT,
                                            insert_disallowed: (i + j) % 2 === 0 ? colors.INSERT_DISALLOWED_DARK : colors.INSERT_DISALLOWED_LIGHT,
                                            last_placeholder: (i + j) % 2 === 0 ? colors.LAST_PLACEHOLDER_DARK : colors.LAST_PLACEHOLDER_LIGHT,
                                        },
                                        type: 'backpack'
                                    }}
                                >
                                    <meshBasicMaterial color={(i + j) % 2 === 0 ? colors.COMMON_DARK : colors.COMMON_LIGHT} />
                                </Plane>
                            </Box>
                        ))}
                    </Box>
                )) }
            </Flex>

            {/* Fighter Slots */}
            <Plane
                name='backpack-equiped-items'
                position={[uiUnits(-5), uiUnits(0), uiUnits(1)]} 
                args={[uiUnits(4), uiUnits(8)]} 
            >
                <meshBasicMaterial color={'black'}/>
            </Plane>
                
            {/* Backpack Items */}
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