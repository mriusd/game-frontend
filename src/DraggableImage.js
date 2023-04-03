import React from 'react';
import { useDrag } from 'react-dnd';

const DraggableImage = ({ id, imgSrc, width, height }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'image',
    item: { id, width, height },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <img
      ref={drag}
      src={imgSrc}
      alt={`Draggable ${id}`}
      width={width * 40}
      height={height * 40}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    />
  );
};

export default DraggableImage;
