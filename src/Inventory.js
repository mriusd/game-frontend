import React from 'react';

const Inventory = ({ items, setItems, equipItem, generateItemName}) => {
  const handleEquipClick = (itemId, slot1, slot2) => {
    equipItem(itemId, slot1, slot2);
  };

  function isExcellent(item) {
    if (item.lifeAfterMonsterIncrease == 1 || 
        item.manaAfterMonsterIncrease == 1 || 
        item.excellentDamageProbabilityIncrease == 1 || 
        item.attackSpeedIncrease == 1 ||
        item.damageIncrease == 1 ||

        item.defenseSuccessRateIncrease == 1 ||
        item.goldAfterMonsterIncrease == 1 ||
        item.reflectDamage == 1 ||
        item.maxLifeIncrease == 1 ||
        item.maxManaIncrease == 1 ||
        item.hpRecoveryRateIncrease == 1 ||
        item.mpRecoveryRateIncrease == 1 ||
        item.decreaseDamageRateIncrease == 1
    ) {
      return true;
    }

    return false;
  }

  return (
    <div>
      <h2>Inventory</h2>
      <ul>
        {items.map((item) => (
          <li key={item.tokenId} align="left">
            <strong>{generateItemName(item)}</strong>
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
