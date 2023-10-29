import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

import type { ItemDroppedEvent } from "interfaces/item.interface";

export interface DroppedItemInterface {
    droppedItemsArray: ItemDroppedEvent[]
    droppedItems: Record<string, ItemDroppedEvent>
    setDroppedItems: (droppedItems: Record<string, ItemDroppedEvent>) => void
}

export const useDroppedItem = createWithEqualityFn<DroppedItemInterface>((set, get) => ({
    droppedItemsArray: [],
    droppedItems: {},
    setDroppedItems: (droppedItems) => set({ droppedItems, droppedItemsArray: Object.values(droppedItems) }),
}), shallow)