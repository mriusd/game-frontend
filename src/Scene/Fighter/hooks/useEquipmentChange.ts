import React from 'react'

import type { Fighter } from "interfaces/fighter.interface";
import type { InventorySlot } from 'interfaces/inventory.interface';

export const useEquipmentChange = (fighter: Fighter, callback: (changes: ReturnType<typeof getChanges>) => void) => {
    const lastEquipment = React.useRef<Record<number, InventorySlot>>({})
    React.useEffect(() => {
        if (fighter?.equipment) {
            const changes = getChanges(lastEquipment.current, fighter.equipment)
            if (changes.addedSlots.length || changes.removedSlots.length || changes.addedEquipment.length) {
                callback(changes)
                lastEquipment.current = fighter.equipment
            }
        }
    }, [fighter])
}

function getChanges(
    lastEquipment: Record<number, InventorySlot>,
    currentEquipment: Record<number, InventorySlot>
) {
    const lastKeys = Object.keys(lastEquipment).map(Number);
    const currentKeys = Object.keys(currentEquipment).map(Number);

    const newAddedSlots = currentKeys.filter(key => !lastKeys.includes(key));
    const newRemovedSlots = lastKeys.filter(key => !currentKeys.includes(key));

    const addedEquipmentValues: { slot: number; value: InventorySlot }[] = [];
    for (const key of currentKeys) {
        if (!lastEquipment[key] || JSON.stringify(lastEquipment[key]) !== JSON.stringify(currentEquipment[key])) {
            addedEquipmentValues.push({
                slot: key,
                value: currentEquipment[key]
            });
        }
    }

    const removedEquipmentValues: { slot: number; value: InventorySlot }[] = newRemovedSlots.map(key => ({ slot: key, value: lastEquipment[key] }));

    return {
        changedSlots: [...newAddedSlots, ...newRemovedSlots],
        addedSlots: newAddedSlots,
        removedSlots: newRemovedSlots,
        addedEquipment: addedEquipmentValues,
        removedEquipment: removedEquipmentValues,
        currentSlots: currentKeys,
        currentEquipment: currentEquipment
    };
}
