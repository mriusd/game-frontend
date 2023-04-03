import React from 'react';

const GridSquare = ({ highlight, children }) => {
  return (
    <div
      style={{
        width: '40px',
        height: '40px',
        border: '1px solid #ccc',
        backgroundColor: highlight ? 'rgba(0, 255, 0, 0.5)' : 'transparent',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {children}
    </div>
  );
};

export default GridSquare;
