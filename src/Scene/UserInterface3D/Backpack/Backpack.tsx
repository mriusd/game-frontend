import { useEffect, useState } from 'react'
import { memo } from 'react'
import { useBackpack } from 'Scene/UserInterface3D/Backpack/useBackpack'
import { shallow } from 'zustand/shallow'
import { useCloud } from 'EventCloud/useCloud'
import { Slots } from './Slots/Slots'
import { useCore } from 'Scene/useCore'


const Backpack = memo(function Backpack() {
    // console.log('[CPU CHECK]: Rerender <Backpack>')
    const [backpack, vault, equipmentSlots, equipment] = useCloud(state => [state.backpack, state.vault, state.equipmentSlots, state.equipment], shallow)
    const [shop] = useCloud(state => [state.shop], shallow)

    const [cellSize] = useBackpack(state => [state.cellSize])
    const [isOpened, isOpenedVault, isOpenedShop] = useBackpack(state => [state.isOpened, state.isOpenedVault, state.isOpenedShop])
    // TODO: change location for handler
    const [updateBackpackItemPosition, dropBackpackItem, unequipBackpackItem, equipBackpackItem] = useCloud(state => 
        [state.updateItemBackpackPosition, state.dropBackpackItem, state.unequipBackpackItem, state.equipBackpackItem]
    )
    // Vault Events
    const [updateItemVaultPosition, moveItemFromBackpackToVault, moveItemFromVaultToBackpack] = useCloud(state => [state.updateItemVaultPosition, state.moveItemFromBackpackToVault, state.moveItemFromVaultToBackpack])
    // Shop
    const [buyItemShop] = useCloud(state => [state.buyItemShop])

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
                {
                    vault ? 
                    (
                        <Slots
                            id='ID_VAULT'
                            type='backpack'
                            isOpened={isOpened && isOpenedVault}
                            cellSize={cellSize}
                            grid={vault.grid}
                            items={vault.items}
                            width={vault.grid.length}
                            height={vault.grid[0].length}
                            position={[-450, 333, 0]}
                            events={[
                                { id: 'ID_VAULT', type: 'update', handler: updateItemVaultPosition },
                                { id: 'ID_BACKPACK', type: 'transferTo', handler: moveItemFromVaultToBackpack },
                            ]}
                        />
                    ) : null
                }
                {
                    shop ? 
                    (
                        <Slots
                            id='ID_SHOP'
                            type='backpack'
                            isOpened={isOpenedShop}
                            cellSize={cellSize}
                            grid={shop.grid}
                            items={shop.items}
                            width={shop.grid.length}
                            height={shop.grid[0].length}
                            position={[-880, 333, 0]}
                            events={[
                                { id: '', type: 'doubleClick', handler: buyItemShop },
                            ]}
                        />
                    ) : null
                }
                <Slots
                    id='ID_BACKPACK'
                    type='backpack'
                    isOpened={isOpened}
                    cellSize={cellSize}
                    grid={backpack.grid}
                    items={backpack.items}
                    width={backpack.grid[0].length}
                    height={backpack.grid.length}
                    position={[-15, -50, 0]}
                    events={[
                        { id: 'ID_BACKPACK', type: 'update', handler: updateBackpackItemPosition },
                        { id: 'ID_EQUIPMENT', type: 'transferTo', handler: equipBackpackItem },
                        { id: 'ID_VAULT', type: 'transferTo', handler: moveItemFromBackpackToVault },
                        { id: '', type: 'drop', handler: dropBackpackItem },
                    ]}
                />
                <Slots
                    id='ID_EQUIPMENT'
                    type='equipment'
                    isOpened={isOpened}
                    cellSize={cellSize}
                    items={equipment}
                    equipmentSlots={equipmentSlots}
                    position={[0, 400, 0]}
                    maxWidth={450}
                    events={[
                        { id: 'ID_BACKPACK', type: 'transferTo', handler: unequipBackpackItem },
                    ]}
                />
            </group>
            
        </group>
    )
})

export default Backpack