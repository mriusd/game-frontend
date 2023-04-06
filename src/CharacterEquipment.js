import React, { useState, useEffect } from 'react';
import './CharacterEquipment.css';

const CharacterEquipment = ({fighter, unequipItem}) => {
  const [helmet, setHelmet] = useState(null);
  const [armour, setArmour] = useState(null);
  const [pants, setPants] = useState(null);
  const [gloves, setGloves] = useState(null);
  const [boots, setBoots] = useState(null);
  const [leftHand, setLeftHand] = useState(null);
  const [rightHand, setRightHand] = useState(null);
  const [leftRing, setLeftRing] = useState(null);
  const [rightRing, setRightRing] = useState(null);
  const [pendant, setPendant] = useState(null);
  const [wings, setWings] = useState(null);

  useEffect(() => {
    console.log("CharacterEquipment", fighter);
    if (fighter.TokenID) {
      setHelmet(fighter.helmSlot);
      setArmour(fighter.armourSlot);
      setPants(fighter.pantsSlot);
      setGloves(fighter.glovesSlot);
      setBoots(fighter.bootsSlot);
      setLeftHand(fighter.leftHandSlot);
      setRightHand(fighter.rightHandSlot);
      setLeftRing(fighter.leftRingSlot);
      setRightRing(fighter.rightRingSlot);
      setPendant(fighter.pendSlot);
      setWings(fighter.wingsSlot);
    }
  }, [fighter]);


  const renderSlot = (slotName, slotItem, setSlotItem) => {
    return (
      <div className="slot">
        <h4>{slotName}</h4>
        {slotItem ? (
        <>
          <div className="item">{slotName}({slotItem})</div>
           <button onClick={() => unequipItem(slotItem)}>Unequip</button>
        </>
        ) : (
          <div className="empty">Empty</div>
        )}
      </div>
    );
  };

  return (
    <div className="character-equipment">
      {renderSlot('Helmet', helmet, setHelmet)}
      {renderSlot('Armour', armour, setArmour)}
      {renderSlot('Pants', pants, setPants)}
      {renderSlot('Gloves', gloves, setGloves)}
      {renderSlot('Boots', boots, setBoots)}
      {renderSlot('Left Hand', leftHand, setLeftHand)}
      {renderSlot('Right Hand', rightHand, setRightHand)}
      {renderSlot('Left Ring', leftRing, setLeftRing)}
      {renderSlot('Right Ring', rightRing, setRightRing)}
      {renderSlot('Pendant', pendant, setPendant)}
      {renderSlot('Wings', wings, setWings)}
    </div>
  );
};

export default CharacterEquipment;
