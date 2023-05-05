import React from 'react';
import { useEventCloud } from './EventCloudContext';
import type { ItemAttributes } from 'interfaces/item.interface';
import type { BackpackSlot } from 'interfaces/backpack.interface';
import type { Coordinate } from 'interfaces/coordinate.interface';
import EquipmentSlot from './EquipmentSlot'; // Import the EquipmentSlot component


import './Backpack.css';

const Backpack = () => {

  const { backpack, updateItemBackpackPosition, dropBackpackItem, equipBackpackItem } = useEventCloud();
  const [draggedItem, setDraggedItem] = React.useState({ itemHash: '', x: 0, y: 0 });

  const handleDropItemToEquipmentSlot = (slot: number, itemHash: string) => {
    console.log('Dropped item:', itemHash, 'to slot:', slot);

    // Perform the desired action here, such as equipping the item to the slot
    equipBackpackItem(itemHash, slot)
  };

  const renderItemRectangle = (itemAttributes: ItemAttributes, itemHash: string, key: string) => {
	  if (!itemAttributes) {
	    return null;
	  }

	  const [x, y] = key.split(',').map(Number);

	  const width = Number(itemAttributes.itemWidth) * 12.5; // Multiply by the percentage of each grid cell
	  const height = Number(itemAttributes.itemHeight) * 12.5;
	  const left = x * 12.5;
	  const top = y * 12.5;

	  const handleDrop = () => {
	    console.log("Drop item:", itemHash);
	    // Perform desired action here
	    dropBackpackItem(itemHash, {x: 0, z: 0});
	  };


	  return (
	    <div
	      className="itemRectangle"
	      key={"backpack_item_" + itemHash}
	      draggable="true"
			onDragStart={(e) => {
			  e.dataTransfer.setData("text/plain", itemHash);
			  setDraggedItem({
			    itemHash,
			    x: Number(key.split(",")[0]),
			    y: Number(key.split(",")[1]),
			  });

			  // Create a custom drag image
			  const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
			  dragImage.style.backgroundColor = "rgba(0, 255, 0, 0.5)"; // Set the background color
			  dragImage.style.position = "fixed";
			  dragImage.style.top = "-1000px"; // Move it off-screen
			  document.body.appendChild(dragImage);

			  // Set the width and height of the drag image based on the original element's computed style
			  const originalStyle = window.getComputedStyle(e.currentTarget);
			  dragImage.style.width = originalStyle.width;
			  dragImage.style.height = originalStyle.height;

			  // Calculate the dimensions of a single grid cell in pixels
			  const gridContainer = document.querySelector(".grid");
			  const gridWidth = gridContainer.clientWidth;
			  const columns = backpack.grid[0].length;
			  const gridCellSize = gridWidth / columns;

			  // Calculate half the size of a grid cell in pixels
			  const halfGridCellSize = gridCellSize / 2;

			  // Set the dragging hotspot
			  e.dataTransfer.setDragImage(dragImage, halfGridCellSize, halfGridCellSize);
			}}




	      style={{
	        width: `${width}%`,
	        height: `${height}%`,
	        left: `${left}%`,
	        top: `${top}%`,
	        backgroundColor: 'rgba(0, 255, 0, 0.5)',
	        position: 'absolute',
	        zIndex: 10,
	      }}
	    >
	      <button
        className="itemRectangleButton"

        onClick={handleDrop}
        style={{
          position: "absolute",
          bottom: "3px",
          right: "3px",
        }}
      >
        DR
      </button>
	    </div>
	  );
	};


const renderItemRectangles = () => {
  return Object.entries(backpack.items).map(([key, slot]: [string, BackpackSlot]) => {
    const { itemAttributes, itemHash } = slot;
    return renderItemRectangle(itemAttributes, itemHash, key);
  });
};

const isTargetPositionAvailable = (draggedItemDimensions, targetCoords, currentCoords) => {
  const { x: toX, z: toY } = targetCoords;
  const { x: fromX, y: fromY } = currentCoords;
  const { width, height } = draggedItemDimensions;

  for (let row = toY; row < toY + height; row++) {
    for (let col = toX; col < toX + width; col++) {
      if (
        (row < fromY || row >= fromY + height || col < fromX || col >= fromX + width) &&
        (backpack.grid[row] === undefined || backpack.grid[row][col])
      ) {
        return false;
      }
    }
  }
  return true;
};




const updateOccupiedSquares = (itemHash: string, targetCoords: { x: number; z: number }) => {
  console.log('updateOccupiedSquares called'); // Add console log here

  const { x: fromX, y: fromY } = draggedItem;
  const { x: toX, z: toY } = targetCoords;

  console.log("updateOccupiedSquares", targetCoords, itemHash);

  // Get the dimensions of the dragged item
  const draggedItemDimensions = {
    width: backpack.items[`${fromX},${fromY}`].itemAttributes.itemWidth,
    height: backpack.items[`${fromX},${fromY}`].itemAttributes.itemHeight,
  };

  console.log("updateOccupiedSquares isTargetPositionAvailable", isTargetPositionAvailable(draggedItemDimensions, targetCoords, draggedItem))

  // Check if the target position is available
  if (isTargetPositionAvailable(draggedItemDimensions, targetCoords, draggedItem)) {
    updateItemBackpackPosition(itemHash, targetCoords);

    // Update the backpack state in the context to reflect the new item position and occupied squares.
    // You can create a function in the context to handle this update.

    // Reset the dragged item state.
    setDraggedItem({ itemHash: '', x: 0, y: 0 });
  }
};





const renderGridItems = () => {
  if (backpack === null) {
    return <p>No backpack data available</p>;
  }

  const gridItems = [];
  for (let y = 0; y < backpack.grid.length; y++) {
    for (let x = 0; x < backpack.grid[y].length; x++) {
      const isOccupied = backpack.grid[y][x];
      gridItems.push(
        <div
          key={`${x},${y}`}
          className={`gridItem ${isOccupied ? 'occupied' : ''}`}
          onDragOver={(e) => {
            console.log('onDragOver:', x, y);
            e.preventDefault();
          }}
          onDrop={(e) => {
			  e.preventDefault();
			  const targetCoords = { x: x, z: y };
			  const itemDimensions = backpack.items[`${draggedItem.x},${draggedItem.y}`].itemAttributes;
			  if (isTargetPositionAvailable(itemDimensions, targetCoords, { x: draggedItem.x, y: draggedItem.y })) {
			    updateOccupiedSquares(draggedItem.itemHash, targetCoords);
			  }
			}}


        >
          <div className="square"></div>
        </div>
      );
    }
  }
  return gridItems.concat(renderItemRectangles());
};




  return (
    <div>
      <h2>Backpack</h2>
      <div className="grid">{renderGridItems()}</div>

      <h2>Equipment Slots</h2>
      <EquipmentSlot onDropItem={handleDropItemToEquipmentSlot} />

    </div>

  );
};

export default Backpack;
