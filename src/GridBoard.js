import React from 'react';
import DraggableImage from './DraggableImage';

const GridBoard = ({ grid, isHighlighted, images }) => {
  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} style={{ display: 'flex' }}>
          {row.map((_, colIndex) => (
            <div
              key={colIndex}
              style={{
                width: '40px',
                height: '40px',
                border: '1px solid black',
                backgroundColor: isHighlighted(colIndex, rowIndex) ? 'rgba(0, 255, 0, 0.5)' : 'transparent',
              }}
            />
          ))}
        </div>
      ))}
      {images.map((img) => (
        <DraggableImage
          key={img.id}
          id={img.id}
          imgSrc={img.imgSrc}
          width={img.width}
          height={img.height}
          style={{
            position: 'absolute',
            left: img.x * 40,
            top: img.y * 40,
          }}
        />
      ))}
    </div>
  );
};

export default GridBoard;
