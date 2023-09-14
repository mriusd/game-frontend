import * as THREE from 'three'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Flex, Box } from '@react-three/flex'
import { Center, Plane } from '@react-three/drei'
import { memo } from 'react'
import BackpackItem from './BackpackItem'
import { useBackpack } from 'Scene/UserInterface3D/Backpack/useBackpack'
import { shallow } from 'zustand/shallow'
import { useEvents } from 'store/EventStore'
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber'
import { useUi } from '../useUI'
import { getCoordInUISpace } from 'Scene/utils/getCoordInUiSpace'
import { Text } from '@react-three/drei'
import EquipmentItem from './EquipmentItem'
import { getMeshDimensions } from 'Scene/utils/getMeshDimensions'
import { useFighter } from 'Scene/Fighter/useFighter'

type CellType = 'equipment' | 'backpack'

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
    // TODO: Should be fixed in future?
    // Additionally rerender items after mount
    // used on backpack items to get 100% chance calc items position correctly based on backpack slots position
    const [mounted, mount] = useState<boolean>(false)
    useEffect(() => { setTimeout(() => mount(true), 1000) }, [])
    // 

    // console.log('[CPU CHECK]: Rerender <Backpack>')
    const [backpack, equipmentSlots, equipment] = useEvents(state => [state.backpack, state.equipmentSlots, state.equipment], shallow)
    const [backpackWidth, backpackHeight, isOpened, slotsRef, equipmentSlotsRef, cellSize] = useBackpack(state => 
        [state.width, state.height, state.isOpened, state.slots, state.equipmentSlots, state.cellSize], 
        shallow
    )
    // TODO: change location for handler
    const [updateBackpackItemPosition, dropBackpackItem, unequipBackpackItem, equipBackpackItem] = useEvents(state => 
        [state.updateItemBackpackPosition, state.dropBackpackItem, state.unequipBackpackItem, state.equipBackpackItem], 
        shallow
    )

    // Getting Non-reactive Scene data
    const get = useThree(state => state.get)
    // Used for boundingBox
    const backpackRef = useRef<THREE.Group | null>(null)
    const InventorySlotsContainerRef = useRef<THREE.Group | null>(null)
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
    const items = useMemo(() => {
        if (!backpack) { return }
        return Object.keys(backpack.items).map(slot => ({ ...backpack.items[slot], slot }))
    }, [backpack])
    const equipmentItems = useMemo(() => {
        if (!equipment) { return }
        // console.log('Equipment Items: ', equipment)
        return Object.keys(equipment).map(slot => ({ ...equipment[slot], slot }))
    }, [equipment])

    const setCursor = useUi(state => state.setCursor)

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
    const cellToInsert = useRef<{ type: CellType, ref: THREE.Mesh } | null>(null)

    const setRef = (ref: any, x: number, y: number) => {
        if (!slotsRef.current) {
            // @ts-expect-error
            slotsRef.current = {}
        }
        return slotsRef.current[x+','+y] = ref
    }
    const setEquipmentRef = (ref: any, xy: number) => {
        if (!equipmentSlotsRef.current) {
            // @ts-expect-error
            equipmentSlotsRef.current = {}
        }
        return equipmentSlotsRef.current[xy] = ref
    }

    // Hover Effects

    // Events
    const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
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
    const onPointerLeave = (e: ThreeEvent<PointerEvent>) => {
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
        
        onPointerMove(e)
        setTimeout(() => {
            isItemPinned.current = !isItemPinned.current
            if (isItemPinned.current) {
                pinnedItemEvent.current = e
                // @ts-expect-error
                hoveredItemEvent.current.object.parent.material.opacity = 0 // TODO: sometimes get error over here
                // Display previous cell
                setPlaceholderCells(pinnedItemEvent.current, true)
                // setObjectRenderLayer(pinnedItemEvent.current, 'highest')
            } else {
                setPlaceholderCells(pinnedItemEvent.current, false)
                // @ts-expect-error
                hoveredItemEvent.current.object.parent.material.opacity = .2
                placeItemToCell(pinnedItemEvent.current)
                // setObjectRenderLayer(pinnedItemEvent.current, 'default')
                pinnedItemEvent.current = null
                clearPointerCells()
                onPointerLeave(e)
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
                dropBackpackItem(itemHash, useFighter.getState().fighter.coordinates)
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
                updateBackpackItemPosition(itemHash, { x: slot.x, z: slot.y })
            } else {
                unequipBackpackItem(itemHash, { x: slot.x, z: slot.y })
            }
        } 
        // If click on Equipment cell
        else if (cellToInsert.current.type === 'equipment') {
            const slot = cellToInsert.current.ref.userData.slot
            equipBackpackItem(itemHash, slot)
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
            const cell = equipmentSlotsRef.current[xy]
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
            const isAvailableCell = !equipmentItems.find(_ => Number(_.slot) === Number(currentPointerCells.current[0].userData.slot))
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
            return Math.abs(x - projectedPointer.x) < .5 * itemWidth * cellSize && Math.abs(y - projectedPointer.y) < .5 * itemHeight * cellSize
        })
        const _equipmentPointerCell = Object.values(equipmentSlotsRef.current).find(slotCell => {
            const slotRow = slotCell.parent
            const slotColumn = slotRow.parent
            const slotWrapper = slotColumn.parent

            const x = slotRow.position.x + slotColumn.position.x + slotWrapper.position.x
            const y = slotRow.position.y + slotColumn.position.y + slotWrapper.position.y

            // Multiply by itemWidth & itemHeight to always position model in the center of highlighted square, no matter 1x1 or 2x2 or even 1x3
            // TODO: Change "100" to cell size
            return Math.abs(x - projectedPointer.x) < .5 * slotCell.userData.itemWidth * cellSize && Math.abs(y - projectedPointer.y) < .5 * slotCell.userData.itemHeight * cellSize
        })

        // Could be only one typ at the same time
        const isHoveredEquipmentSlot = !!_equipmentPointerCell
        // console.log(isHoveredEquipmentSlot, _equipmentPointerCell, _backpackPointerCell)
        pointerCell.current = _backpackPointerCell || _equipmentPointerCell || null
        if (!pointerCell.current) return []
    

        // Calc all cells belongs to the Pointer, depending on Item size (like 1x1, 2x2) and Hovered cell type
        const cells = []

        // Depending on hovered cell type
        if (isHoveredEquipmentSlot) {
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
        return backpack.grid[y][x]
    }

    function clearPointerCells() {
        currentPointerCells.current.forEach(cell => {
            // @ts-expect-error
            cell.material.color.set(cell.userData.colors.common)
        })
    }

    if (!items) {
        return <></>
    }

    return (
        <group visible={isOpened}>

            <group ref={backpackRef} /*position={Position is changing based on viewport size}*/>

                <group 
                    name='backpack-slots-container' 
                    // Used for backpack boundingBox calculation
                    ref={InventorySlotsContainerRef}
                >

                    {/* Backpack Slots */}
                    <Flex name='backpack' position={[32, -50, 0]} flexDir="column" >
                        { [...new Array(backpackWidth)].map((_, i) => (
                            <Box name='column' key={i} flexDir="row">
                                { [...new Array(backpackHeight)].map((_, j) => (
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

                    {/* Equipment Slots */}
                    <Flex name='equipment' position={[0, 400, 0]} maxWidth={450} flexDir="row" flexWrap="wrap">
                        { equipmentSlots && [...Object.values(equipmentSlots)].sort((a,b) => b.height - a.height).map((_, i) => (
                            <Box name='row' key={i} margin={8} centerAnchor>
                                <Plane
                                    name='slot-equipment'
                                    ref={(r) => setEquipmentRef(r, _.slot)}
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
                                        visible={ !equipmentItems.find(__ => +__.slot === +_.slot)  } 
                                        fontSize={4 * _.height}
                                    >{ _.type.toUpperCase() }</Text>
                                </Plane>
                            </Box>
                        )) }
                    </Flex>
                </group>



                {/* Backpack Items */}
                <group name='backpack-items'>
                    {items?.length 
                    ? items.map(item => 
                        <BackpackItem 
                            onClick={onClick}
                            onPointerMove={onPointerMove}
                            onPointerLeave={onPointerLeave}
                            key={item.itemHash} 
                            item={item} 
                            mounted={mounted}
                        />) 
                    : <></>
                    }
                </group>

                {/* Equipment Items */}
                <group name='equipment-items'>
                    {equipmentItems?.length 
                    ? equipmentItems.map(item => 
                        <EquipmentItem
                            onClick={onClick}
                            onPointerMove={onPointerMove}
                            onPointerLeave={onPointerLeave}
                            key={item.itemHash} 
                            item={item} 
                            mounted={mounted}
                        />)
                    : <></>
                    }
                </group>
            
            </group>

        </group>
    )
})

export default Backpack