import React from "react";

const LargeImage = ({ drag, imagePosition, isDragging }) => (
  <img
    src="https://via.placeholder.com/60x90"
    alt="Large"
    ref={drag}
    width="60"
    height="90"
    style={{
      left: isDragging ? -1000 : imagePosition.x * 30,
      top: isDragging ? -1000 : imagePosition.y * 30,
      position: "absolute",
      zIndex: isDragging ? 10 : 1,
      opacity: isDragging ? 0.5 : 1,
    }}
  />
);

export default LargeImage;
