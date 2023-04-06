import React from 'react';

const Inventory = ({ items, setItems, equipItem }) => {
  const handleEquipClick = (itemId, slot) => {
    equipItem(itemId, slot);
  };

  return (
    <div>
      <h2>Inventory</h2>
      <ul>
        {items.map((item) => (
          <li key={item.tokenId}>
            <strong>{item.name}</strong>
            <button
              onClick={() => handleEquipClick(item.id, 3)}
              style={{ marginLeft: '1rem' }}
            >
              Equip
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Inventory;
