import { useEffect, useState } from 'react'
import { memo } from 'react'
import { useBackpack } from 'Scene/UserInterface3D/Backpack/useBackpack'
import { shallow } from 'zustand/shallow'
import { useCloud } from 'EventCloud/useCloud'
import { Slots } from './Slots/Slots'
import { useCore } from 'Scene/useCore'


const Backpack = memo(function Backpack() {
    // console.log('[CPU CHECK]: Rerender <Backpack>')
    const [backpack, equipmentSlots, equipment] = useCloud(state => [state.backpack, state.equipmentSlots, state.equipment], shallow)
    const [backpackWidth, backpackHeight, isOpened, cellSize] = useBackpack(state => 
        [state.width, state.height, state.isOpened, state.cellSize], 
        shallow
    )
    // TODO: change location for handler
    const [updateBackpackItemPosition, dropBackpackItem, unequipBackpackItem, equipBackpackItem] = useCloud(state => 
        [state.updateItemBackpackPosition, state.dropBackpackItem, state.unequipBackpackItem, state.equipBackpackItem], 
        shallow
    )

    const handlePointerEnter = () => {
        if (useBackpack.getState().isOpened) {
            // @ts-expect-error
            useCore.getState().setHoveredItems({ id: 'backpack' }, 'add')
        }
    }
    const handlePointerLeave = () => {
        // @ts-expect-error
        useCore.getState().setHoveredItems({ id: 'backpack' }, 'remove')
    }

    return (
        <group name='slots'>
            <group 
                name='slots-backpack'
                onPointerEnter={handlePointerEnter}
                onPointerLeave={handlePointerLeave}
            >
                <Slots
                    id='backpack'
                    type='backpack'
                    isOpened={isOpened}
                    cellSize={cellSize}
                    grid={backpack.grid}
                    items={backpack.items}
                    width={backpackWidth}
                    height={backpackHeight}
                    position={[32, -50, 0]}
                    updateItemPosition={updateBackpackItemPosition}
                    equipItem={equipBackpackItem}
                    unequipItem={unequipBackpackItem}
                    dropItem={dropBackpackItem}
                />
                <Slots
                    id='equipment'
                    type='equipment'
                    isOpened={isOpened}
                    cellSize={cellSize}
                    items={equipment}
                    equipmentSlots={equipmentSlots}
                    position={[0, 400, 0]}
                    maxWidth={450}
                    unequipItem={unequipBackpackItem}
                    dropItem={dropBackpackItem}
                />
            </group>
            
        </group>
    )
})

export default Backpack