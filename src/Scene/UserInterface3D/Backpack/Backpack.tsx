import { useEffect, useState } from 'react'
import { memo } from 'react'
import { useBackpack } from 'Scene/UserInterface3D/Backpack/useBackpack'
import { shallow } from 'zustand/shallow'
import { useCloud } from 'EventCloud/useCloud'
import { Slots } from './Slots/Slots'
import { useCore } from 'Scene/useCore'


const Backpack = memo(function Backpack() {
    // console.log('[CPU CHECK]: Rerender <Backpack>')
    const [backpack, vault, equipment] = useCloud(state => [state.backpack, state.vault, state.equipment], shallow)
    const [shop] = useCloud(state => [state.shop], shallow)

    const [cellSize] = useBackpack(state => [state.cellSize])
    const [isOpened, isOpenedVault, isOpenedShop] = useBackpack(state => [state.isOpened, state.isOpenedVault, state.isOpenedShop])
    // TODO: change location for handler
    const [updateBackpackItemPosition, dropBackpackItem, unequipBackpackItem, equipBackpackItem] = useCloud(state => 
        [state.updateItemBackpackPosition, state.dropBackpackItem, state.unequipBackpackItem, state.equipBackpackItem]
    )

    // Equipment Events
    const [dropEquippedItem] = useCloud(state => [state.dropEquippedItem])

    // Vault Events
    const [updateItemVaultPosition, moveItemFromBackpackToVault, moveItemFromVaultToBackpack, dropVaultItem] = useCloud(state => [state.updateItemVaultPosition, state.moveItemFromBackpackToVault, state.moveItemFromVaultToBackpack, state.dropVaultItem])
    const [equipVaultItem, unequipVaultItem] = useCloud(state => [state.equipVaultItem, state.unequipVaultItem])

    // Shop
    const [buyItemShop] = useCloud(state => [state.buyItemShop])

    return (
        <group name='slots'>
            <group 
                name='slots-backpack'
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
                                { id: 'ID_EQUIPMENT', type: 'transferTo', handler: equipVaultItem },
                                { id: '', type: 'drop', handler: dropVaultItem },
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
                            position={[-450, 333, 0]}
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
                {
                    equipment ? (
                        <Slots
                            id='ID_EQUIPMENT'
                            type='equipment'
                            isOpened={isOpened}
                            cellSize={cellSize}
                            items={equipment.items}
                            equipmentSlots={equipment.is_equipped}
                            position={[0, 400, 0]}
                            maxWidth={450}
                            events={[
                                { id: 'ID_BACKPACK', type: 'transferTo', handler: unequipBackpackItem },
                                { id: 'ID_VAULT', type: 'transferTo', handler: unequipVaultItem },
                                { id: '', type: 'drop', handler: dropEquippedItem },
                            ]}
                        />
                    ) : null
                }

            </group>
            
        </group>
    )
})

export default Backpack