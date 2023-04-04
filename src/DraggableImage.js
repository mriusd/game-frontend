import React from 'react';
import { useDrag } from 'react-dnd';

const DraggableImage = ({ id, imgSrc, width, height, style, isDraggable = true, onClick }) => {

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'image',
    item: { id, imgSrc, width, height, x: style.left / 40, y: style.top / 40 },
    canDrag: isDraggable,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  function handleDragStart (e) {
    if (!isDraggable) {
      e.preventDefault();
    }
  }

  return (
    <img
      ref={drag}
      src={imgSrc}
      width={width * 40}
      height={height * 40}
      onClick={() => onClick(id)}
      onDragStart={handleDragStart}
      alt=""
      style={{
        ...style,
        opacity: isDragging ? 0 : 1,
      }}
    />
  );
};

export default DraggableImage;
