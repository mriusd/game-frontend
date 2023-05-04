import React from 'react';
import { useEventCloud } from './EventCloudContext';

import './Backpack.css';

const Backpack = () => {
  const { backpack } = useEventCloud();

  const renderGridItems = () => {
    if (backpack === null) {
      return <p>No backpack data available</p>;
    }

    const gridItems = [];
    for (let y = 0; y < backpack.grid.length; y++) {
      for (let x = 0; x < backpack.grid[y].length; x++) {
        const isOccupied = backpack.grid[y][x];
        gridItems.push(
          <div
            key={`${x},${y}`}
            className={`gridItem ${isOccupied ? 'occupied' : ''}`}
          >
            <div className="square"></div>
          </div>
        );
      }
    }
    return gridItems;
  };

  return (
    <div>
      <h2>Backpack</h2>
      <div className="grid">{renderGridItems()}</div>
    </div>
  );
};

export default Backpack;
