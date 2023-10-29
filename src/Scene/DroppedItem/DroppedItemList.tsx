import React from "react"
import DroppedItem from "./DroppedItem"

import { useDroppedItem } from "./useDroppedItem"

const DroppedItemList = React.memo(function DroppedItemList() {
    const list = useDroppedItem(state => state.droppedItemsArray)
    return <>{ list.map(item => <DroppedItem key={item?.itemHash} item={item} />) }</>
})

export default DroppedItemList