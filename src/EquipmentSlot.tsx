import React, { useEffect } from 'react';
import { EquipmentSlots, equipmentSlots } from 'interfaces/equipment.interface';
import { useEventCloud } from './EventCloudContext';
import './EquipmentSlot.css';
import ItemRectangle from './ItemRectangle';

interface EquipmentSlotProps {
  onDropItem: (slot: number, itemHash: string) => void;
}

const EquipmentSlot: React.FC<EquipmentSlotProps> = ({ onDropItem }) => {

  const { equipment, generateItemName, dropBackpackItem, unequipBackpackItem } = useEventCloud();

  useEffect(() => {
    console.log("equipment updated", equipment)

  }, [equipment])

  if (!equipment) {
    return (<div>Waiting for equipment pbject</div>)
  }

  const handleDrop = (itemHash) => {
      console.log("Drop item:", itemHash);
      // Perform desired action here
      unequipBackpackItem(itemHash, {x: 0, z: 0});
    };

  const renderSlots = () => {
    

    return Object.entries(equipmentSlots).map(([key, slotType]) => (
      <div
        key={key}
        className="equipmentSlot"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          console.log("onDrop ", e);
          e.preventDefault();
          const itemHash = e.dataTransfer.getData('text/plain');
          onDropItem(parseInt(key), itemHash);
        }}
      >
        <div>{slotType}: </div>
        {equipment[key] && (
          <div>
            {/* denis: Error */}
            {/* {generateItemName(equipment[key].itemAttributes)} */}
            <button
              onClick={() => {handleDrop(equipment[key].itemHash)}}
            >
            Unequip
            </button> 
          </div>

        )}
      </div>
    ));
  };

  return <div className="equipmentSlots">{renderSlots()}</div>;
};

export default EquipmentSlot;