import React from 'react';

const GridBoard = ({ grid, isHighlighted, style }) => {
  return (
    <div style={{ ...style, position: 'absolute', width: '100%', height: '100%' }}>
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} style={{ display: 'flex' }}>
          {row.map((_, colIndex) => (
            <div
              key={colIndex}
              style={{
                width: '40px',
                height: '40px',
                border: '1px solid black',
                backgroundColor: isHighlighted(colIndex, rowIndex)
                  ? 'rgba(0, 255, 0, 0.5)'
                  : 'transparent',
                zIndex: 0,
                boxSizing: 'border-box',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default GridBoard;
