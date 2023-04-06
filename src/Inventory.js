import React from 'react';

const Inventory = ({ items, setItems }) => {
  return (
    <div>
      <h2>Inventory</h2>
      <ul>
        {items.map((item) => (
          <li key={item.tokenId}>
            <strong>{item.name}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Inventory;
