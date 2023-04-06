import React from 'react';

const Inventory = ({ items, setItems, equipItem }) => {
  const handleEquipClick = (itemId, slot1, slot2) => {
    equipItem(itemId, slot1, slot2);
  };

  return (
    <div>
      <h2>Inventory</h2>
      <ul>
        {items.map((item) => (
          <li key={item.tokenId}>
            <strong>{item.name}</strong>
            <button
              onClick={() => handleEquipClick(item.tokenId, item.acceptableSlot1, item.acceptableSlot2)}
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
