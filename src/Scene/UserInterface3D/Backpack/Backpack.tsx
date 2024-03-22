import { useEffect, useState } from 'react'
import { memo } from 'react'
import { useBackpack } from 'Scene/UserInterface3D/Backpack/useBackpack'
import { shallow } from 'zustand/shallow'
import { useCloud } from 'EventCloud/useCloud'
import { UltimateSlots } from './UtlimateSlots'
import { useCore } from 'Scene/useCore'


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
                <UltimateSlots
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
                <UltimateSlots
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