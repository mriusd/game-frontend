import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableImage from './DraggableImage';
import GridBoard from './GridBoard';
import DragLayer from './DragLayer';

const Grid = ({isDraggable = true, onClick}) => {
  const [images, setImages] = useState([
    { id: 1, imgSrc: 'https://via.placeholder.com/80x120', width: 2, height: 3, x: 0, y: 0 },
    { id: 2, imgSrc: 'https://via.placeholder.com/80x80', width: 2, height: 2, x: 4, y: 0 },
    { id: 3, imgSrc: 'https://via.placeholder.com/40x40', width: 1, height: 1, x: 0, y: 4 },
    { id: 4, imgSrc: 'https://via.placeholder.com/40x80', width: 1, height: 2, x: 3, y: 4 },
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

  const canMove = useCallback(
    (x, y, width, height, imgArray, imgId) => {
      // Check if the image is within the grid's boundaries
      if (x < 0 || x + width > 8 || y < 0 || y + height > 8) {
        return false;
      }

      // Check for overlapping with other images
      for (const img of imgArray) {
        if (
          img.id !== imgId && // Exclude the image's own position
          img.x < x + width &&
          img.x + img.width > x &&
          img.y < y + height &&
          img.y + img.height > y
        ) {
          return false;
        }
      }

      return true;
    },
    []
  );



  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'image',
    drop: (item, monitor) => handleDrop(item, monitor),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));


  const handleDrop = useCallback(
    (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();

      setImages((prevImages) => {
        const currentImage = prevImages.find((img) => img.id === item.id);
        const newX = Math.round((currentImage.x * 40 + delta.x) / 40);
        const newY = Math.round((currentImage.y * 40 + delta.y) / 40);

        if (!canMove(newX, newY, item.width, item.height, prevImages, item.id)) {
          return prevImages;
        }


        const newImages = prevImages.map((img) => {
          if (img.id === item.id) {
            return { ...img, x: newX, y: newY };
          }
          return img;
        });

        return newImages;
      });
    },
    [canMove]
  );




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
      <GridBoard grid={grid} isHighlighted={isHighlighted} style={{ zIndex: -1 }} />
      {images.map((img) => (
        <DraggableImage
          key={img.id}
          id={img.id}
          imgSrc={img.imgSrc}
          width={img.width}
          height={img.height}
          isDraggable={isDraggable}
          onClick={onClick}
          style={{
            position: 'absolute',
            left: img.x * 40,
            top: img.y * 40,
            zIndex: 1,
          }}
        />
      ))}
      <DragLayer />
    </div>
  );
}

export default Grid;
