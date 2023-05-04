import React, { useState } from 'react';
import DraggableImage from './DraggableImage';
import DroppableSquare from './DroppableSquare';

const DraggableGrid = () => {
  const [images, setImages] = useState([
    { id: 1, src: 'https://via.placeholder.com/60x90', width: 2, height: 3, x: 0, y: 0 },
    { id: 2, src: 'https://via.placeholder.com/60x60', width: 2, height: 2, x: 3, y: 3 },
  ]);

  const handleDrop = (imageId, targetId) => {
    const targetX = targetId % 8;
    const targetY = Math.floor(targetId / 8);
    setImages(
      images.map((image) => (image.id === imageId ? { ...image, x: targetX, y: targetY } : image))
    );
  };

  const renderSquares = () => {
    const squares = [];

    for (let i = 0; i < 64; i++) {
      squares.push(<DroppableSquare key={i} id={i} />);
    }

    return squares;
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 30px)',
          gridTemplateRows: 'repeat(8, 30px)',
          margin: '-1px',
        }}
      >
        {renderSquares()}
      </div>
      {images.map((image) => (
        <DraggableImage
          key={image.id}
          id={image.id}
          src={image.src}
          alt={`Image ${image.id}`}
          width={image.width * 30}
          height={image.height * 30}
          style={{
            position: 'absolute',
            top: image.y * 30,
            left: image.x * 30,
            zIndex: 1,
          }}
          onDrop={handleDrop}
          positions={images.map((img) => ({ x: img.x, y: img.y }))}
        />
      ))}
    </div>
  );
};

export default DraggableGrid;
