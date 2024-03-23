import { create } from "zustand";
import { MutableRefObject, createRef } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { CellType } from "./Slots";

export interface UseSlots {
    // Used in Slots for shared state
    pinnedItemEvent: MutableRefObject<ThreeEvent<PointerEvent> | null>
    pinnedSlotsId: MutableRefObject<string>
    isItemPinned: MutableRefObject<Boolean>
    isItemHovered: MutableRefObject<Boolean>
    hoveredItemEvent: MutableRefObject<ThreeEvent<PointerEvent> | null>
    hoveredItemModel: MutableRefObject<THREE.Object3D | null>

    pointerCell: MutableRefObject<THREE.Mesh | null>
    placeholderCells: MutableRefObject<THREE.Mesh[]>
    currentPointerCells: MutableRefObject<THREE.Mesh[]>
    lastPointerCells: MutableRefObject<THREE.Mesh[]>
    cellToInsert: MutableRefObject<{ type: CellType, ref: THREE.Mesh } | null>
}

export const useSlots = create<UseSlots>((set, get) => ({
    pinnedItemEvent: createRef(),
    pinnedSlotsId: createRef(),
    isItemPinned: createRef(),
    isItemHovered: createRef(),
    hoveredItemEvent: createRef(),
    hoveredItemModel: createRef(),

    pointerCell: createRef(),
    placeholderCells: createRef(),
    currentPointerCells: createRef(),
    lastPointerCells: createRef(),
    cellToInsert: createRef(),
}))