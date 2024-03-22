import React from "react"
import type { InventorySlot } from "interfaces/inventory.interface"
import { ThreeEvent, useFrame, useThree } from "@react-three/fiber"
import { useUi } from "../useUI"
import { useFighter } from "Scene/Fighter/useFighter"
import { getCoordInUISpace } from "Scene/utils/getCoordInUiSpace"
import { getMeshDimensions } from "Scene/utils/getMeshDimensions"
import { WorldCoordinate } from "interfaces/coordinate.interface"
import { Flex, Box } from "@react-three/flex"
import { Plane, Text } from "@react-three/drei"
import BackpackItem from "./BackpackItem"
import EquipmentItem from "./EquipmentItem"

import type { Equipment } from "interfaces/equipment.interface"

type CellType = 'equipment' | 'backpack'
interface SlotCoordinate { x: number, z: number }

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

interface Props {
    type: CellType
    isOpened: boolean
    cellSize: number

    width?: number
    height?: number
    position?: number[]
    maxWidth?: number

    grid?: boolean[][]
    items: Map<string, InventorySlot> | Record<number, InventorySlot>
    equipmentSlots?: Record<number, Equipment>

    updateItemPosition?: (itemHash: string, slot: SlotCoordinate) => void
    dropItem?: (itemHash: string, coordinate: WorldCoordinate) => void
    equipItem?: (itemHash: string, slot: number) => void
    unequipItem?: (itemHash: string, slot: SlotCoordinate) => void

    onPointerEnter?: (e: ThreeEvent<PointerEvent>) => void
    onPointerMove?: (e: ThreeEvent<PointerEvent>) => void
    onPointerLeave?: (e: ThreeEvent<PointerEvent>) => void

}
export const UltimateSlots = ({ 
    type,
    isOpened,
    cellSize,

    grid,
    items: _items,
    equipmentSlots,

    width,
    height,
    position = [0, 0, 0],
    maxWidth = 1920,

    updateItemPosition,
    dropItem,
    equipItem,
    unequipItem,

    onPointerEnter,
    onPointerLeave,
    onPointerMove,
}: Props) => {

     // TODO: Should be fixed in future?
    // Additionally rerender items after mount
    // used on backpack items to get 100% chance calc items position correctly based on backpack slots position
    const [mounted, mount] = React.useState<boolean>(false)
    React.useEffect(() => { setTimeout(() => mount(true), 1000) }, [])
    // 


    // Getting Non-reactive Scene data
    const get = useThree(state => state.get)
    // Used for boundingBox
    const backpackRef = React.useRef<THREE.Group | null>(null)
    const InventorySlotsContainerRef = React.useRef<THREE.Group | null>(null)
    // Triggers before paint, draw backpack on the right
    // TODO: Should i move it to useFrame or to ResizeHandler?
    const marginRight = 64
    React.useLayoutEffect(() => {
        if (!backpackRef.current || !InventorySlotsContainerRef.current) { return }
        const canvasWidth = get().size.width
        const backpackWidth = getMeshDimensions(InventorySlotsContainerRef.current).width
        backpackRef.current.position.x = canvasWidth / 2 - backpackWidth - marginRight
    })
    
    // Transform items to Array for rendering
    const items = React.useMemo(() => {
        if (!_items) { return }
        return Object.keys(_items).map(slot => ({ ..._items[slot], slot }))
    }, [_items])

    const setCursor = useUi(state => state.setCursor)

    const slotsRef =  React.useRef<{[key: number]: THREE.Mesh}>({})

    const isItemPinned = React.useRef<boolean>(false)
    const pinnedItemEvent = React.useRef<ThreeEvent<PointerEvent> | null>(null)

    const isItemHovered = React.useRef<boolean>(false)
    const hoveredItemEvent = React.useRef<ThreeEvent<PointerEvent> | null>(null)
    const hoveredItemModel = React.useRef<THREE.Object3D | null>(null)
    // Cell collisions
    const pointerCell = React.useRef<THREE.Mesh | null>(null)
    const placeholderCells = React.useRef<THREE.Mesh[]>([])
    const currentPointerCells = React.useRef<THREE.Mesh[]>([])
    const lastPointerCells = React.useRef<THREE.Mesh[]>([])
    // For Insert, if not null, means can be insert
    const cellToInsert = React.useRef<{ type: CellType, ref: THREE.Mesh } | null>(null)

    const setRef = (ref: any, x: number, y?: number) => {
        if (type === 'backpack') {
            return slotsRef.current[x+','+y] = ref
        }
        return slotsRef.current[x] = ref
    }
    // Hover Effects

    // Events
    const onItemPointerMove = (e: ThreeEvent<PointerEvent>) => {
        if (!isOpened) { return }
        if (!e.object) { return } // in case if removed
        if (isItemHovered.current) { return }
        if (isItemPinned.current || pinnedItemEvent.current) { return }
        isItemHovered.current = true
        hoveredItemModel.current = getSlotModel(e)
        setCursor('pointer')

        hoveredItemEvent.current = e
        // @ts-expect-error
        hoveredItemEvent.current.object.parent.material.opacity = .2
        hoveredItemModel.current.userData.positionZ = hoveredItemModel.current.position.z
        hoveredItemModel.current.position.z = 300
        // Toggle Item Description
        const itemDescription = hoveredItemEvent.current.object.parent.children.find(_ => _.name === 'item-description')
        itemDescription && ( itemDescription.visible = true )
    }
    const onItemPointerLeave = (e: ThreeEvent<PointerEvent>) => {
        if (!isOpened) { return }
        if (!e.object) { return } // in case if removed
        if (isItemPinned.current || pinnedItemEvent.current) { return }
        isItemHovered.current = false
        hoveredItemModel.current?.userData?.positionZ && (hoveredItemModel.current.position.z = hoveredItemModel.current.userData.positionZ)
        hoveredItemModel.current && (hoveredItemModel.current.rotation.y = 0)
        hoveredItemModel.current = null
        setCursor('default')

        if (hoveredItemEvent.current) {
            // TODO: figure out why we have such situation when no parent 
            if (!hoveredItemEvent.current.object?.parent) { return }
            // @ts-expect-error
            hoveredItemEvent.current.object?.parent && ( hoveredItemEvent.current.object.parent.material.opacity = .1 )
            // Toggle Item Description
            const itemDescription = hoveredItemEvent.current.object.parent.children.find(_ => _.name === 'item-description')
            itemDescription && ( itemDescription.visible = false )
            hoveredItemEvent.current = null
        }
    }
    const onClick = (e: ThreeEvent<PointerEvent>) => {
        if (!isOpened) { return }
        if (!e.object) { return } // in case if removed
        // If we Pinning already, we have to prevent click on another Item, otherwise -- error
        if (isItemPinned.current && e.object !== pinnedItemEvent.current.object) { return }
        // 
        
        onItemPointerMove(e)
        setTimeout(() => {
            if (!hoveredItemEvent.current) { return } // Try fix issue, test required
            isItemPinned.current = !isItemPinned.current
            if (isItemPinned.current) {
                pinnedItemEvent.current = e
                // @ts-expect-error
                hoveredItemEvent.current?.object?.parent?.material?.opacity && (hoveredItemEvent.current.object.parent.material.opacity = 0) // TODO: sometimes get error over here
                // Display previous cell
                setPlaceholderCells(pinnedItemEvent.current, true)
                // setObjectRenderLayer(pinnedItemEvent.current, 'highest')
            } else {
                setPlaceholderCells(pinnedItemEvent.current, false)
                // @ts-expect-error
                hoveredItemEvent.current?.object?.parent?.material?.opacity && (hoveredItemEvent.current.object.parent.material.opacity = .2)
                placeItemToCell(pinnedItemEvent.current)
                // setObjectRenderLayer(pinnedItemEvent.current, 'default')
                pinnedItemEvent.current = null
                clearPointerCells()
                onItemPointerLeave(e)
            }
        }, 0)
    }
    // 

    function getSlotModel(e: ThreeEvent<PointerEvent>) {
        const name = 'slot-model'
        const model = e.object.parent.children.find(object => object.name === name)
        return model || null
    }
    function placeItemToCell(pinnedItemEvent: ThreeEvent<PointerEvent>) {
        const itemHash = pinnedItemEvent.object.parent.userData.item.itemHash
        const item = pinnedItemEvent.object.parent

        if (!cellToInsert.current) {
            // Drop if nothing hovered
            if (!pointerCell.current) {
                item.visible = false
                dropItem(itemHash, useFighter.getState().fighter.coordinates)
                return
            }

            // Move to last position
            item.position.copy(item.userData.currentPosition)
            return
        }

        // If click on Backpack cell
        if (cellToInsert.current.type === 'backpack') {
            const slot = cellToInsert.current.ref.userData.slot
            const isBackpackItem = pinnedItemEvent.object.parent.userData.type === 'backpack'
            if (isBackpackItem) {
                updateItemPosition(itemHash, { x: slot.x, z: slot.y })
            } else {
                unequipItem(itemHash, { x: slot.x, z: slot.y })
            }
        } 
        // If click on Equipment cell
        else if (cellToInsert.current.type === 'equipment') {
            const slot = cellToInsert.current.ref.userData.slot
            equipItem(itemHash, slot)
        }
    }
    function setPlaceholderCells(pinnedItemEvent: ThreeEvent<PointerEvent>, show: boolean) {
        const cellCoordinate = pinnedItemEvent.object.parent.userData.item.slot.split(',').map((_:string)=>Number(_))
        const itemWidth = pinnedItemEvent.object.parent.userData.item.itemAttributes.itemParameters.itemWidth
        const itemHeight = pinnedItemEvent.object.parent.userData.item.itemAttributes.itemParameters.itemHeight
        const cellType: CellType = pinnedItemEvent.object.parent.userData.type
        const cells = []

        // Placeholder for pinned Equipment Item
        if (cellType === 'equipment') {
            const xy = pinnedItemEvent.object.parent.userData.item.slot
            const cell = slotsRef.current[xy]
            if (!cell) { return console.warn('[Backpack: setPlaceholderCells]: Cell not found') }
            cells.push(cell)
        // Placeholder for pinned Backpack Item 
        } else {
            for (let i = 0; i < itemHeight; i++) {
                for (let j = 0; j < itemWidth; j++) {
                    const cell = slotsRef.current[`${cellCoordinate[0]+j},${cellCoordinate[1]+i}`]
                    if (!cell) { return console.warn('[Backpack: setPlaceholderCells]: Cell not found') }
                    cells.push(cell)
                }
            }
        }

        cells.forEach(cell => {
            if (show) {
                cell.material.color.set(cell.userData.colors.last_placeholder)
            } else {
                cell.material.color.set(cell.userData.colors.common)
            }
        })

        placeholderCells.current = show ? cells : []
    }

    useFrame(({ raycaster }) => {
        if (!isOpened) { return }
        // Pin item
        if (pinnedItemEvent.current && isItemPinned.current) {
            const projectedPointer = getCoordInUISpace(raycaster)
            if (!projectedPointer || !backpackRef.current) { return }
            // <substract Backpack position>: Take backpack Items offset into the account
            projectedPointer.sub(backpackRef.current.position)
            projectedPointer.z += 100 // Make it Higher than other Inventory Objects
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
        const isHoveredEquipmentSlot = currentPointerCells.current.length 
            ? currentPointerCells.current[0].userData.type === 'equipment'
            : false

        lastPointerCells.current.forEach(cell => {
            // If placeholder cell we dont touch it
            if (placeholderCells.current.find(_ => _ === cell)) { return }
            // @ts-expect-error
            cell.material.color.set(cell.userData.colors.common)
        })

        const itemWidth = pinnedItemEvent.current.object.parent.userData.item.itemAttributes.itemParameters.itemWidth
        const itemHeight = pinnedItemEvent.current.object.parent.userData.item.itemAttributes.itemParameters.itemHeight
        // Check if we can insert
        let availableCells = 0
        currentPointerCells.current.forEach(cell => {
            if (currentPointerCells.current.length < itemWidth * itemHeight && !isHoveredEquipmentSlot) {
                return
            }
            availableCells += isOccupied(cell, isHoveredEquipmentSlot) ? 0 : 1
        })

        // Logic for Equipment Slot
        if (isHoveredEquipmentSlot) {
            // TODO: detect if slote enabled
            const isAvailableCell = !items.find(_ => Number(_.slot) === Number(currentPointerCells.current[0].userData.slot))
            const isEnabledByType = +currentPointerCells.current[0].userData.slot === +pinnedItemEvent.current.object.parent.userData.item.itemAttributes.itemParameters.acceptableSlot1 || +currentPointerCells.current[0].userData.slot === +pinnedItemEvent.current.object.parent.userData.item.itemAttributes.itemParameters.acceptableSlot2
            if (isAvailableCell && isEnabledByType) {
                cellToInsert.current = { ref: currentPointerCells.current[0], type: 'equipment' }
                // If placeholder cell we dont touch it
                if (placeholderCells.current.find(_ => _ === currentPointerCells.current[0])) { return }
                // @ts-expect-error
                currentPointerCells.current[0].material.color.set(currentPointerCells.current[0].userData.colors.insert_allowed)
            } else {
                cellToInsert.current = null
                // If placeholder cell we dont touch it
                if (placeholderCells.current.find(_ => _ === currentPointerCells.current[0])) { return }
                // @ts-expect-error
                currentPointerCells.current[0].material.color.set(currentPointerCells.current[0].userData.colors.insert_disallowed)
            }
            return
        }

        // Logic for Backpack Slot
        // Then set insert availability based on <availableCells>
        if (availableCells === itemWidth * itemHeight) {
            cellToInsert.current = { ref: pointerCell.current, type: 'backpack' }
            currentPointerCells.current.forEach(cell => {
                // If placeholder cell we dont touch it
                if (placeholderCells.current.find(_ => _ === cell)) { return }
                // @ts-expect-error
                cell.material.color.set(cell.userData.colors.insert_allowed)
            })
        } else {
            cellToInsert.current = null
            currentPointerCells.current.forEach(cell => {
                // If placeholder cell we dont touch it
                if (placeholderCells.current.find(_ => _ === cell)) { return }
                // @ts-expect-error
                cell.material.color.set(cell.userData.colors.insert_disallowed)
            })
        }
    }

    function getPointerCells(projectedPointer: {x:number;y:number}) {
        const itemWidth = pinnedItemEvent.current.object.parent.userData.item.itemAttributes.itemParameters.itemWidth
        const itemHeight = pinnedItemEvent.current.object.parent.userData.item.itemAttributes.itemParameters.itemHeight

        // Find Cell under Pointer (for Backpack Item)
        const _backpackPointerCell = Object.values(slotsRef.current).find(slotCell => {
            const slotRow = slotCell.parent
            const slotColumn = slotRow.parent
            const slotWrapper = slotColumn.parent

            const x = slotRow.position.x + slotColumn.position.x + slotWrapper.position.x
            const y = slotRow.position.y + slotColumn.position.y + slotWrapper.position.y

            // Multiply by itemWidth & itemHeight to always position model in the center of highlighted square, no matter 1x1 or 2x2 or even 1x3
            if (type === 'equipment') {
                // Multiply by itemWidth & itemHeight to always position model in the center of highlighted square, no matter 1x1 or 2x2 or even 1x3
                // TODO: Change "100" to cell size
                return Math.abs(x - projectedPointer.x) < .5 * slotCell.userData.itemWidth * cellSize && Math.abs(y - projectedPointer.y) < .5 * slotCell.userData.itemHeight * cellSize
            }
            return Math.abs(x - projectedPointer.x) < .5 * itemWidth * cellSize && Math.abs(y - projectedPointer.y) < .5 * itemHeight * cellSize
        })

        // Could be only one typ at the same time
        // console.log(isHoveredEquipmentSlot, _equipmentPointerCell, _backpackPointerCell)
        pointerCell.current = _backpackPointerCell || null
        if (!pointerCell.current) return []
    

        // Calc all cells belongs to the Pointer, depending on Item size (like 1x1, 2x2) and Hovered cell type
        const cells = []

        // Depending on hovered cell type
        if ( type === 'equipment') {
            cells.push(pointerCell.current)
        } else {
            const { x, y } = pointerCell.current.userData.slot
            for (let i = 0; i < itemWidth; i++) {
                for (let j = 0; j < itemHeight; j++) {
                    const cell = slotsRef.current[`${x+i},${y+j}`]
                    if (cell) {
                        cells.push(cell)
                    }
                }
            }
        }

        return cells
    }

    function isOccupied(cell: THREE.Mesh, isEquipmentSlot: boolean) {
        // TODO: Think about this way to handle slot type
        // It works perfect and with current solution
        // But i guess there is another more ease to understand way
        if (isEquipmentSlot) {
            // TODO: temporary
            return false
        }
        const { x, y } = cell.userData.slot
        // Allow paste to the same cell, or a little touching the same cell 
        if (placeholderCells.current.find(_ => _.userData.slot.x === x && _.userData.slot.y === y)) return false
        return grid[y][x]
    }

    function clearPointerCells() {
        currentPointerCells.current.forEach(cell => {
            // @ts-expect-error
            cell.material.color.set(cell.userData.colors.common)
        })
    }

    // if (!grid || !equipmentSlots) {
    //     return <></>
    // }

    return (
        <group 
            visible={isOpened} 
            onPointerEnter={(e) => onPointerEnter && onPointerEnter(e)} 
            onPointerMove={(e) => onPointerMove && onPointerMove(e)} 
            onPointerLeave={(e) => onPointerLeave && onPointerLeave(e)}
        >

            <group ref={backpackRef} /*position={Position is changing based on viewport size}*/>

                <group 
                    name='backpack-slots-container' 
                    // Used for backpack boundingBox calculation
                    ref={InventorySlotsContainerRef}
                >
                    {
                        type === 'backpack' ? 
                        (
                            <Flex name='backpack' position={position as any} flexDir="column" >
                                { [...new Array(width)].map((_, i) => (
                                    <Box name='column' key={i} flexDir="row">
                                        { [...new Array(height)].map((_, j) => (
                                            <Box name='row' key={'_'+j}>
                                                <Plane
                                                    name='slot-cell' 
                                                    ref={(r) => setRef(r, j, i)} 
                                                    args={[cellSize, cellSize, 1]}
                                                    userData={{
                                                        type: 'backpack',
                                                        slot: { x: j, y: i }, 
                                                        colors: {
                                                            common: (i + j) % 2 === 0 ? colors.COMMON_DARK : colors.COMMON_LIGHT,
                                                            insert_allowed: (i + j) % 2 === 0 ? colors.INSERT_ALLOWED_DARK : colors.INSERT_ALLOWED_LIGHT,
                                                            insert_disallowed: (i + j) % 2 === 0 ? colors.INSERT_DISALLOWED_DARK : colors.INSERT_DISALLOWED_LIGHT,
                                                            last_placeholder: (i + j) % 2 === 0 ? colors.LAST_PLACEHOLDER_DARK : colors.LAST_PLACEHOLDER_LIGHT,
                                                        },
                                                    }}
                                                >
                                                    <meshBasicMaterial color={(i + j) % 2 === 0 ? colors.COMMON_DARK : colors.COMMON_LIGHT} />
                                                </Plane>
                                            </Box>
                                        ))}
                                    </Box>
                                )) }
                            </Flex>
                        ) :
                        (
                            <Flex name='equipment' position={position as any} maxWidth={maxWidth} flexDir="row" flexWrap="wrap">
                                { equipmentSlots && [...Object.values(equipmentSlots)].sort((a,b) => b.height - a.height).map((_, i) => (
                                    <Box name='row' key={i} margin={8} centerAnchor>
                                        <Plane 
                                            name='slot-equipment'
                                            ref={(r) => setRef(r, _.slot)}
                                            userData={{
                                                type: 'equipment',
                                                slot: _.slot,
                                                colors: {
                                                    common: i % 2 === 0 ? colors.COMMON_DARK : colors.COMMON_LIGHT,
                                                    insert_allowed: i % 2 === 0 ? colors.INSERT_ALLOWED_DARK : colors.INSERT_ALLOWED_LIGHT,
                                                    insert_disallowed: i % 2 === 0 ? colors.INSERT_DISALLOWED_DARK : colors.INSERT_DISALLOWED_LIGHT,
                                                    last_placeholder: i % 2 === 0 ? colors.LAST_PLACEHOLDER_DARK : colors.LAST_PLACEHOLDER_LIGHT,
                                                },
                                                allowedItemType: _.type,
                                                itemWidth: _.width,
                                                itemHeight: _.height
                                            }}
                                            args={[cellSize * _.width, cellSize * _.height, 1]}
                                        >
                                            <meshBasicMaterial color={i % 2 === 0 ? colors.COMMON_DARK : colors.COMMON_LIGHT} />
                                            <Text
                                                // TODO: mb temporary 
                                                visible={ !items.find(__ => +__.slot === +_.slot)  } 
                                                fontSize={4 * _.height}
                                            >{ _.type.toUpperCase() }</Text>
                                        </Plane>
                                    </Box>
                                )) }
                            </Flex>
                        )
                    }

                    {/* <Flex name='gold' position={[32, -500, 0]} flexDir="column" >
                        <Text
                            position={[0, 0, 0]} // Adjust this position based on your layout
                            color="gold" // Set the color of the text
                            fontSize={18} // Adjust the size as needed
                            maxWidth={200} // Optional: Adjust max width to keep text contained if necessary
                            anchorX="center" // Center the text horizontally
                            anchorY="middle" // Center the text vertically
                        >
                            Gold {backpack.gold}
                        </Text>
                    </Flex> */}
                </group>

                {
                    type === 'backpack' ? 
                    (
                        <group name='backpack-items'>
                            {items?.length 
                                ? items.map(item => 
                                    <BackpackItem 
                                        onClick={onClick}
                                        onPointerMove={onItemPointerMove}
                                        onPointerLeave={onItemPointerLeave}
                                        key={item.itemHash} 
                                        item={item} 
                                        mounted={mounted}
                                        slots={slotsRef}
                                        cellSize={cellSize}
                                    />) 
                                : <></>
                            }
                        </group>
                    ) :
                    (
                        <group name='equipment-items'>
                            {items?.length 
                                ? items.map(item => 
                                    <EquipmentItem
                                        onClick={onClick}
                                        onPointerMove={onItemPointerMove}
                                        onPointerLeave={onItemPointerLeave}
                                        key={item.itemHash} 
                                        item={item} 
                                        mounted={mounted}
                                        cellSize={cellSize}
                                        slots={slotsRef}
                                    />)
                                : <></>
                            }
                        </group>
                    )
                }

            </group>

        </group>
    )
}