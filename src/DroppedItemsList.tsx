import React, { useState, useEffect } from 'react';
import { useEventCloud } from './EventCloudContext';
import type { ItemAttributes, ItemDroppedEvent } from './interfaces/item.interface'

const DroppedItemsList = () => {
  const { droppedItems, generateItemName, pickupDroppedItem } = useEventCloud();
  
  const handlePickClick = (droppedItemEvent) => {
    pickupDroppedItem(droppedItemEvent)
  };

  if (droppedItems == null) {
    return (<div>No dropped items</div>);
  }
  
  return (
    <div>
      <h2>Dropped Items</h2>
      <ul>
        {Object.entries(droppedItems).map(([key, droppedItemEvent]: [string, ItemDroppedEvent]) => (
          <li key={key}>
            {generateItemName(droppedItemEvent.item, droppedItemEvent.qty)}
            <button onClick={() => handlePickClick(droppedItemEvent)}>Pick</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DroppedItemsList;
