import React, { MutableRefObject, useCallback, useLayoutEffect, useMemo, useRef } from "react"
import type { InventorySlot } from "interfaces/inventory.interface"
import { ThreeEvent, useFrame, useThree } from "@react-three/fiber"
import { useUi } from "../../useUI"
import { useFighter } from "Scene/Fighter/useFighter"
import { getCoordInUISpace } from "Scene/utils/getCoordInUiSpace"
import { getMeshDimensions } from "Scene/utils/getMeshDimensions"
import { WorldCoordinate } from "interfaces/coordinate.interface"
import { Flex, Box } from "@react-three/flex"
import { Plane, Text } from "@react-three/drei"
import BackpackItem from "./components/BackpackItem"
import EquipmentItem from "./components/EquipmentItem"
import { getSlotModel } from "./utils/getSlotModel"

import type { Equipment } from "interfaces/equipment.interface"

import { useSlots } from "./useSlots"

export type CellType = 'equipment' | 'backpack'
export type eventType = 'update' | 'transferTo' | 'drop' | 'doubleClick'
interface EventsType {
    id: string, type: eventType, handler: any
}
interface SlotCoordinate { x: number, z: number }

function init(state: MutableRefObject<any>, key?: string, value?: any) {
    if (!state.current) {
        state.current = {}
    }
    if (key) {
        state.current[key] = value
    }
}

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
    id: string,
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

    // events?: {
    //     updateItemPosition?: { id: string, type: eventType, handler: (itemHash: string, slot: SlotCoordinate) => void }
    //     dropItem?: { id: string, handler: (itemHash: string, coordinate: WorldCoordinate) => void }
    //     equipItem?: { id: string, handler: (itemHash: string, slot: number) => void }
    //     unequipItem?: { id: string, handler: (itemHash: string, slot: SlotCoordinate) => void }
    // }
    events: EventsType[]
    // updateItemPosition?: (itemHash: string, slot: SlotCoordinate) => void
    // dropItem?: (itemHash: string, coordinate: WorldCoordinate) => void
    // equipItem?: (itemHash: string, slot: number) => void
    // unequipItem?: (itemHash: string, slot: SlotCoordinate) => void

    onPointerEnter?: (e: ThreeEvent<PointerEvent>) => void
    onPointerMove?: (e: ThreeEvent<PointerEvent>) => void
    onPointerLeave?: (e: ThreeEvent<PointerEvent>) => void

}
export const Slots = ({ 
    id,
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

    // updateItemPosition,
    // dropItem,
    // equipItem,
    // unequipItem,
    events: _events,

    onPointerEnter,
    onPointerLeave,
    onPointerMove,
}: Props) => {
    // Getting Non-reactive Scene data
    const get = useThree(state => state.get)

    // console.log('items', id, _items)

    // const isItemPinned = React.useRef<boolean>(false)
    // const pinnedItemEvent = React.useRef<ThreeEvent<PointerEvent> | null>(null)
    // const isItemHovered = React.useRef<boolean>(false)
    // const hoveredItemEvent = React.useRef<ThreeEvent<PointerEvent> | null>(null)
    // const hoveredItemModel = React.useRef<THREE.Object3D | null>(null)

    const pinnedItemEvent = useSlots(state => state.pinnedItemEvent)
    const isItemPinned = useSlots(state => state.isItemPinned)
    const isItemHovered = useSlots(state => state.isItemHovered)
    const hoveredItemEvent = useSlots(state => state.hoveredItemEvent)
    const hoveredItemModel = useSlots(state => state.hoveredItemModel)
    const pinnedSlotsId = useSlots(state => state.pinnedSlotsId)

    // // Cell collisions
    // const pointerCell = React.useRef<THREE.Mesh | null>(null)
    // const placeholderCells = React.useRef<THREE.Mesh[]>([])
    // const currentPointerCells = React.useRef<THREE.Mesh[]>([])
    // const lastPointerCells = React.useRef<THREE.Mesh[]>([])
    // // For Insert, if not null, means can be insert
    // const cellToInsert = React.useRef<{ type: CellType, ref: THREE.Mesh } | null>(null)

    const pointerCell = useSlots(state => state.pointerCell)
    const placeholderCells = useSlots(state => state.placeholderCells)
    const currentPointerCells = useSlots(state => state.currentPointerCells)
    const lastPointerCells = useSlots(state => state.lastPointerCells)
    const cellToInsert = useSlots(state => state.cellToInsert)
    useLayoutEffect(() => {
        init(pointerCell)
        init(placeholderCells, id, [])
        init(currentPointerCells, id, [])
        init(lastPointerCells, id, [])
        init(cellToInsert)
    }, [id])
    

    // TODO: Should be fixed in future?
    // Additionally rerender items after mount
    // used on backpack items to get 100% chance calc items position correctly based on backpack slots position
    const [mounted, mount] = React.useState<boolean>(false)
    React.useEffect(() => { setTimeout(() => mount(true), 1000) }, [])
    // 

    const events = useMemo(() => {
        const transferTo: EventsType[] = []
        const update: EventsType[] = []
        const drop: EventsType[] = []
        const doubleClick: EventsType[] = []
        _events.map(_ => {
            if (_.type === 'transferTo') {
                transferTo.push(_)
            }
            if (_.type === 'update') {
                update.push(_)
            }
            if (_.type === 'drop') {
                drop.push(_)
            }
            if (_.type === 'doubleClick') {
                doubleClick.push(_)
            }
        })
        return { transferTo, doubleClick, update, drop }
    }, [_events])

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

    const slotsRef =  React.useRef<{[key: number]: THREE.Mesh}>({})
    const setRef = React.useCallback((ref: any, x: number, y?: number) => {
        if (type === 'backpack') {
            return slotsRef.current[x+','+y] = ref
        }
        return slotsRef.current[x] = ref
    }, [slotsRef])

    // Events
    const onItemPointerMove = (e: ThreeEvent<PointerEvent>) => {
        if (!isOpened) { return }
        if (!e.object) { return } // in case if removed
        if (isItemHovered.current) { return }
        if (isItemPinned.current || pinnedItemEvent.current) { return }
        isItemHovered.current = true
        hoveredItemModel.current = getSlotModel(e)
        useUi.getState().setCursor('pointer')

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
        useUi.getState().setCursor('default')

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
        // console.log(pinnedItemEvent.current?.object, e.object)
        // If we Pinning already, we have to prevent click on another Item, otherwise -- error
        if (isItemPinned.current && e.object !== pinnedItemEvent.current.object) { return }
        // Dont let Move if no Move events
        if (!events.update.length && type !== 'equipment') { return }
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
                pinnedSlotsId.current = id
            } else {
                // TODO: fix setPlaceholderCells
                setPlaceholderCells(pinnedItemEvent.current, false)
                // @ts-expect-error
                hoveredItemEvent.current?.object?.parent?.material?.opacity && (hoveredItemEvent.current.object.parent.material.opacity = .2)
                placeItemToCell(pinnedItemEvent.current)
                // setObjectRenderLayer(pinnedItemEvent.current, 'default')
                pinnedItemEvent.current = null
                // TODO: fix clearing
                clearPointerCells()
                onItemPointerLeave(e)
                if (pinnedSlotsId.current === id) {
                    pinnedSlotsId.current = ''
                }
            }
        }, 0)
    }
    const onDoubleClick = (e: ThreeEvent<PointerEvent>) => {
        const itemHash = e.object.parent.userData.item.itemHash
        events.doubleClick.forEach(event => event.handler(itemHash))
    }
    // 

    // Events Methods
    const highlightPointerCell = React.useCallback((projectedPointer: {x:number;y:number}) => {        
        lastPointerCells.current[id] = currentPointerCells.current[id]
        currentPointerCells.current[id] = getPointerCells(projectedPointer)
        const isHoveredEquipmentSlot = currentPointerCells.current[id].length 
            ? currentPointerCells.current[id][0].userData.type === 'equipment'
            : false

        lastPointerCells.current[id].forEach(cell => {
            // If placeholder cell we dont touch it
            if (placeholderCells.current[id].find(_ => _ === cell)) { return }
            // @ts-expect-error
            cell.material.color.set(cell.userData.colors.common)
        })

        const itemWidth = pinnedItemEvent.current.object.parent.userData.item.itemAttributes.itemParameters.itemWidth
        const itemHeight = pinnedItemEvent.current.object.parent.userData.item.itemAttributes.itemParameters.itemHeight
        // Check if we can insert
        let availableCells = 0
        currentPointerCells.current[id].forEach(cell => {
            if (currentPointerCells.current[id].length < itemWidth * itemHeight && !isHoveredEquipmentSlot) {
                return
            }
            availableCells += isOccupied(cell, isHoveredEquipmentSlot) ? 0 : 1
        })

        // Logic for Equipment Slot
        if (isHoveredEquipmentSlot) {
            // TODO: detect if slote enabled
            const isAvailableCell = !items.find(_ => Number(_.slot) === Number(currentPointerCells.current[id][0].userData.slot))
            const isEnabledByType = +currentPointerCells.current[id][0].userData.slot === +pinnedItemEvent.current.object.parent.userData.item.itemAttributes.itemParameters.acceptableSlot1 || +currentPointerCells.current[id][0].userData.slot === +pinnedItemEvent.current.object.parent.userData.item.itemAttributes.itemParameters.acceptableSlot2
            if (isAvailableCell && isEnabledByType) {
                cellToInsert.current[id] = { ref: currentPointerCells.current[id][0], type: 'equipment' }
                // If placeholder cell we dont touch it
                if (placeholderCells.current[id].find(_ => _ === currentPointerCells.current[id][0])) { return }
                // @ts-expect-error
                currentPointerCells.current[id][0].material.color.set(currentPointerCells.current[id][0].userData.colors.insert_allowed)
            } else {
                cellToInsert.current[id] = null
                // If placeholder cell we dont touch it
                if (placeholderCells.current[id].find(_ => _ === currentPointerCells.current[id][0])) { return }
                // @ts-expect-error
                currentPointerCells.current[id][0].material.color.set(currentPointerCells.current[id][0].userData.colors.insert_disallowed)
            }
            return
        }

        // Logic for Backpack Slot
        // Then set insert availability based on <availableCells>
        if (availableCells === itemWidth * itemHeight) {
            cellToInsert.current[id] = { ref: pointerCell.current[id], type: 'backpack' }
            currentPointerCells.current[id].forEach(cell => {
                // If placeholder cell we dont touch it
                if (placeholderCells.current[id].find(_ => _ === cell)) { return }
                // @ts-expect-error
                cell.material.color.set(cell.userData.colors.insert_allowed)
            })
        } else {
            cellToInsert.current[id] = null
            currentPointerCells.current[id].forEach(cell => {
                // If placeholder cell we dont touch it
                if (placeholderCells.current[id].find(_ => _ === cell)) { return }
                // @ts-expect-error
                cell.material.color.set(cell.userData.colors.insert_disallowed)
            })
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
            pointerCell.current[id] = _backpackPointerCell || null
            if (!pointerCell.current[id]) return []
        
    
            // Calc all cells belongs to the Pointer, depending on Item size (like 1x1, 2x2) and Hovered cell type
            const cells = []
    
            // Depending on hovered cell type
            if ( type === 'equipment') {
                cells.push(pointerCell.current[id])
            } else {
                const { x, y } = pointerCell.current[id].userData.slot
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
            // Check if there is move event available
            if (!events.update.length) { return true }
            const { x, y } = cell.userData.slot
            // Allow paste to the same cell, or a little touching the same cell 
            if (placeholderCells.current[id].find(_ => _.userData.slot.x === x && _.userData.slot.y === y)) return false
            return grid[y][x]
        }
    }, [type, id, grid])

    const placeItemToCell = React.useCallback((pinnedItemEvent: ThreeEvent<PointerEvent>) => {
        const itemHash = pinnedItemEvent.object.parent.userData.item.itemHash
        const item = pinnedItemEvent.object.parent
        // console.log('place', itemHash, item, cellToInsert.current)


        // We look for the first appear, cuz situation with 2 together cannot be
        const backpackInsert = Object.values(cellToInsert.current).find(item => item?.type === 'backpack')
        const equipmentInsert = Object.values(cellToInsert.current).find(item => item?.type === 'equipment')

        if (!backpackInsert && !equipmentInsert) {
            // Drop if nothing hovered
            const isNotHovered = Object.values(pointerCell.current).every(_ => !_)
            if (isNotHovered && events.drop.length) {
                events.drop.forEach(event => event.handler(itemHash, useFighter.getState().fighter.coordinates))
                // dropItem(itemHash, useFighter.getState().fighter.coordinates)
                return
            }

            // Move to last position
            item.position.copy(item.userData.currentPosition)
            return
        }

        

        // If click on Backpack cell
        if (backpackInsert) {
            const slot = backpackInsert.ref.userData.slot
            const id = backpackInsert.ref.userData.id

            // [EVENTS]: Update position
            events.update.forEach(e => e.handler(itemHash, { x: slot.x, z: slot.y }))
            // [EVENTS]: Transfer To
            events.transferTo.filter(e => e.id === id).forEach(e => e.handler(itemHash, { x: slot.x, z: slot.y }))
        } 
        // If click on Equipment cell
        else if (equipmentInsert) {
            const slot = equipmentInsert.ref.userData.slot
            const id = equipmentInsert.ref.userData.id
            // [EVENTS]: Transfer To (BUT FOR EQUIPMENT TYPE SLOTS/provide inner data to handler)
            events.transferTo.filter(e => e.id === id).forEach(e => e.handler(itemHash, slot))
        }
    }, [events, id])

    const setPlaceholderCells = React.useCallback((pinnedItemEvent: ThreeEvent<PointerEvent>, show: boolean) => {
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

        placeholderCells.current[id] = show ? cells : []
    }, [id])

    const clearPointerCells = React.useCallback(() => {
        const cellArrays = Object.values(currentPointerCells.current)
        cellArrays.forEach(cells => {
            cells.forEach(cell => {
                // @ts-expect-error
                cell.material.color.set(cell.userData.colors.common)
            })
        })
    }, [])
    // 

    // Render All Highlights & Current Items
    useFrame(({ raycaster }) => {
        if (!isOpened) { return }

        // console.log('g', pointerCell.current)
        // Pin item
        if (pinnedItemEvent.current && isItemPinned.current) {
            const projectedPointer = getCoordInUISpace(raycaster)
            if (!projectedPointer || !backpackRef.current) { return }
            // <substract Backpack position>: Take backpack Items offset into the account
            projectedPointer.sub(backpackRef.current.position)
            projectedPointer.z += 100 // Make it Higher than other Inventory Objects
            // Detect collisions
            highlightPointerCell(projectedPointer)

            if (pinnedSlotsId.current === id) {
                pinnedItemEvent.current.object.parent.position.copy(projectedPointer)
            }
        }
        // Rotate pinned or hovered item
        if (hoveredItemModel.current && isItemHovered.current && pinnedSlotsId.current === id) {
            hoveredItemModel.current.rotation.y += 0.05
        }
    })

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
                                                        id,
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
                                { [...Object.values(equipmentSlots)].sort((a,b) => b.height - a.height).map((_, i) => (
                                    <Box name='row' key={i} margin={8} centerAnchor>
                                        <Plane 
                                            name='slot-equipment'
                                            ref={(r) => setRef(r, _.slot)}
                                            userData={{
                                                id,
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
                                        onDoubleClick={onDoubleClick}
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
                                        onDoubleClick={onDoubleClick}
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