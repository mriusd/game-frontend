import React, { useState } from "react";

const InventoryGrid = () => {
  const [dragging, setDragging] = useState(false);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  function handleMouseDown (e) {
    console.log('mouse down')
    setDragging(true);
    setX(e.clientX);
    setY(e.clientY);
  }

  return (
    <div
      style={{
        width: "320px",
        height: "320px",
        border: "1px solid black",
        position: "relative",
      }}
    >
      {/* Render the thumbnail */}
      <div
        style={{ position: "absolute", left: x, top: y }}
        onMouseDown={handleMouseDown}
        onMouseMove={(e) => {
          console.log('mouse down')
          if (dragging) {
            setX(e.clientX);
            setY(e.clientY);
          }
        }}
        onMouseUp={() => setDragging(false)}
      >
        <img src="https://via.placeholder.com/40" alt="thumbnail" />
      </div>

      {/* Render the grid */}
      {[...Array(64)].map((_, i) => (
        <div
          
          key={i}
          style={{
            width: "40px",
            height: "40px",
            border: "1px solid black",
            position: "absolute",
            left: (i % 8) * 40,
            top: Math.floor(i / 8) * 40,
          }}
        ></div>
      ))}
    </div>
  );
};

export default InventoryGrid;