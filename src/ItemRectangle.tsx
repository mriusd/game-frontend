// ItemRectangle.tsx
import React from 'react';
import { ItemAttributes } from 'interfaces/item.interface'; // Import the ItemAttributes type from your interface file
import { useEventCloud } from './EventCloudContext';

interface ItemRectangleProps {
  itemAttributes: ItemAttributes;
  itemHash: string;
  coordKey: string;
  onDropItem: (itemHash: string, position: { x: number; z: number }) => void;
  setDraggedItem: (draggedItem: {
    itemHash: string;
    x: number;
    y: number;
  }) => void;
}

const ItemRectangle: React.FC<ItemRectangleProps> = ({
  itemAttributes,
  itemHash,
  coordKey,
  onDropItem,
  setDraggedItem
}) => {
  // ...
  // Move the content of renderItemRectangle function here.
  // Replace the `handleDrop` function with the `onDropItem` prop.
  // ...
    const { backpack } = useEventCloud();
    if (!itemAttributes) {
      return null;
    }



    const [x, y] = coordKey.split(',').map(Number);

    const width = Number(itemAttributes.itemWidth) * 12.5; // Multiply by the percentage of each grid cell
    const height = Number(itemAttributes.itemHeight) * 12.5;
    const left = x * 12.5;
    const top = y * 12.5;

    const handleClick = () => {
      onDropItem(itemHash, { x: 0, z: 0 });
    };

    return (
      <div
        className="itemRectangle"
        key={"backpack_item_" + itemHash}
        draggable="true"
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", itemHash);
        setDraggedItem({ // Use the setDraggedItem from props
          itemHash,
          x: Number(coordKey.split(",")[0]),
          y: Number(coordKey.split(",")[1]),
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
        onClick={handleClick}
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

export default ItemRectangle;