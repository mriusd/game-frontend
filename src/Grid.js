import React, { useState, useEffect } from 'react';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableImage from './DraggableImage';
import GridBoard from './GridBoard';

const Grid = () => {
  const [images, setImages] = useState([
    { id: 1, imgSrc: 'https://via.placeholder.com/80x120', width: 2, height: 3, x: 0, y: 0 },
    { id: 2, imgSrc: 'https://via.placeholder.com/80x80', width: 2, height: 2, x: 4, y: 0 },
  ]);

  const emptyGrid = new Array(8).fill(null).map(() => new Array(8).fill(null));
  const [grid, setGrid] = useState(emptyGrid);
  const [draggedImage, setDraggedImage] = useState(null);

  useEffect(() => {
    placeImagesOnGrid();
  }, []);

  const placeImagesOnGrid = () => {
    let newGrid = [...grid];
    images.forEach((img) => {
      for (let row = img.y; row < img.y + img.height; row++) {
        for (let col = img.x; col < img.x + img.width; col++) {
          newGrid[row][col] = img;
        }
      }
    });
    setGrid(newGrid);
  };

  const moveImage = (img, x, y) => {
    setImages((prevState) =>
      prevState.map((image) => (image.id === img.id ? { ...image, x, y } : image))
    );
  };

  const [, drop] = useDrop(() => ({
    accept: 'image',
    drop: (item, monitor) => {
      const offset = monitor.getSourceClientOffset();
      const x = Math.floor(offset.x / 40);
      const y = Math.floor(offset.y / 40);
      if (isValidMove(item, x, y)) {
        moveImage(item, x, y);
        setGrid(emptyGrid);
        placeImagesOnGrid();
      }
    },
  }));

  const isValidMove = (img, x, y) => {
    if (x < 0 || y < 0 || x + img.width > 8 || y + img.height > 8) return false;

    for (let row = y; row < y + img.height; row++) {
      for (let col = x; col < x + img.width; col++) {
        if (grid[row][col] && grid[row][col].id !== img.id) {
          return false;
        }
      }
    }

    return true;
  };

  const isHighlighted = (x, y) => {
    if (!draggedImage) return false;
    if (x < draggedImage.x || y < draggedImage.y) return false;
    if (x >= draggedImage.x + draggedImage.width || y >= draggedImage.y + draggedImage.height) return false;
    return true;
  };

  return (
    <div ref={drop} style={{ position: 'relative', width: '320px', height: '320px' }}>
      <GridBoard grid={grid} isHighlighted={isHighlighted} images={images} />
    </div>
  );
}

export default Grid;
