import type { ItemDroppedEvent } from "interfaces/item.interface"

export const isException = (item: ItemDroppedEvent) => {
    return ( item.item.name.toLowerCase().includes('box') || item.item.name.toLowerCase().includes('gold') )
}