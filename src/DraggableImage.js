import React from 'react';
import { useDrag } from 'react-dnd';

const DraggableImage = ({ id, imgSrc, width, height, style }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'image',
    item: { id, imgSrc, width, height, x: style.left / 40, y: style.top / 40 },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <img
      ref={drag}
      src={imgSrc}
      width={width * 40}
      height={height * 40}
      alt=""
      style={{
        ...style,
        opacity: isDragging ? 0 : 1,
      }}
    />
  );
};

export default DraggableImage;
