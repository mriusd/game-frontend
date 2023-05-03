import React from 'react';
import { useDragLayer } from 'react-dnd';

const layerStyles = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
};

function getItemStyles(initialOffset, currentOffset, item) {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none',
    };
  }

  const { x, y } = currentOffset;
  const squareSize = 30;
  const imageTopLeftX = x - squareSize;
  const imageTopLeftY = y - squareSize;
  const dropX = Math.floor(imageTopLeftX / squareSize) * squareSize;
  const dropY = Math.floor(imageTopLeftY / squareSize) * squareSize;

  const transform = `translate(${dropX}px, ${dropY}px)`;

  return {
    transform,
    WebkitTransform: transform,
    width: item.width,
    height: item.height,
  };
}

const DragLayer = () => {
  const { itemType, isDragging, item, initialOffset, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  function renderItem() {
    if (itemType !== 'image') {
      return null;
    }

    return (
      <img
        src={item.src}
        alt={item.alt}
        style={{ opacity: isDragging ? 0.5 : 1 }}
      />
    );
  }

  if (!isDragging) {
    return null;
  }

  return (
    <div style={layerStyles}>
      <div style={getItemStyles(initialOffset, currentOffset, item)}>{renderItem()}</div>
    </div>
  );
};

export default DragLayer;
