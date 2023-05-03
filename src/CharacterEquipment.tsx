import React, { useState, useEffect } from 'react';
import { FighterEquipment } from './models/FighterEquipment';
import { ItemAttributes } from './models/Items';
import './CharacterEquipment.css';

import { useEventCloud } from './EventCloudContext.tsx';

const CharacterEquipment = () => {

  const { 
    equipment,
    unequipItem
  } = useEventCloud();
  
  const [isPop, setPop] = useState(false);

  const [helmet, setHelmet] = useState<ItemAttributes | null>(null);
  const [armour, setArmour] = useState<ItemAttributes | null>(null);
  const [pants, setPants] = useState<ItemAttributes | null>(null);
  const [gloves, setGloves] = useState<ItemAttributes | null>(null);
  const [boots, setBoots] = useState<ItemAttributes | null>(null);
  const [leftHand, setLeftHand] = useState<ItemAttributes | null>(null);
  const [rightHand, setRightHand] = useState<ItemAttributes | null>(null);
  const [leftRing, setLeftRing] = useState<ItemAttributes | null>(null);
  const [rightRing, setRightRing] = useState<ItemAttributes | null>(null);
  const [pendant, setPendant] = useState<ItemAttributes | null>(null);
  const [wings, setWings] = useState<ItemAttributes | null>(null);

  useEffect(() => {
    console.log("CharacterEquipment", equipment);
    if (!equipment) { return }
    setHelmet(equipment.helmSlot);
    setArmour(equipment.armourSlot);
    setPants(equipment.pantsSlot);
    setGloves(equipment.glovesSlot);
    setBoots(equipment.bootsSlot);
    setLeftHand(equipment.leftHandSlot);
    setRightHand(equipment.rightHandSlot);
    setLeftRing(equipment.leftRingSlot);
    setRightRing(equipment.rightRingSlot);
    setPendant(equipment.pendSlot);
    setWings(equipment.wingsSlot);

    setPop(true);
    
      
  }, [equipment]);

  if (!equipment) {
    return (<div>Waiting for equipment object...</div>);
  }
  return (
    <div className="character-equipment">
      <div className="slot">
        <h4>Helmet</h4>
        {isPop && helmet.name != "" ? (
          <>
            <div className="item">{helmet.name}</div>
            { helmet.name != "" ? <button onClick={() => unequipItem(1)}>Unequip</button> : ''}
          </>
        ) : (
          <div className="empty">Empty</div>
        )}
      </div>
      <div className="slot">
        <h4>Armour</h4>
        {isPop && armour.name != "" ? (
          <>
            <div className="item">{armour.name}</div>
            { armour.name != "" ? <button onClick={() => unequipItem(2)}>Unequip</button> : ''}
          </>
        ) : (
          <div className="empty">Empty</div>
        )}
      </div>
      <div className="slot">
        <h4>Pants</h4>
        {isPop && pants.name != "" ? (
          <>
            <div className="item">{pants.name}</div>
            { pants.name != "" ? <button onClick={() => unequipItem(3)}>Unequip</button> : ''}
          </>
        ) : (
          <div className="empty">Empty</div>
        )}
      </div>
      <div className="slot">
        <h4>Gloves</h4>
        {isPop && gloves.name != "" ? (
          <>
            <div className="item">{gloves.name}</div>
            { gloves.name != "" ? <button onClick={() => unequipItem(4)}>Unequip</button> : ''}
          </>
        ) : (
          <div className="empty">Empty</div>
        )}
      </div>
      <div className="slot">
        <h4>Boots</h4>
        {isPop && boots.name != "" ? (
          <>
            <div className="item">{boots.name}</div>
            { boots.name != "" ? <button onClick={() => unequipItem(5)}>Unequip</button> : ''}
          </>
        ) : (
          <div className="empty">Empty</div>
        )}
      </div>
      <div className="slot">
        <h4>Left Hand</h4>
        {isPop && leftHand.name != "" ? (
          <>
            <div className="item">{leftHand.name}</div>
            { leftHand.name != "" ? <button onClick={() => unequipItem(6)}>Unequip</button> : ''}
          </>
        ) : (
          <div className="empty">Empty</div>
        )}
      </div>
      <div className="slot">
        <h4>Right Hand</h4>
        {isPop && rightHand.name != "" ? (
          <>
            <div className="item">{rightHand.name}</div>
            { rightHand.name != "" ? <button onClick={() => unequipItem(7)}>Unequip</button> : ''}
          </>
        ) : (
          <div className="empty">Empty</div>
        )}
      </div>
      <div className="slot">
        <h4>Left Ring</h4>
        {isPop && leftRing.name != "" ? (
          <>
            <div className="item">{leftRing.name}</div>
            { leftRing.name != "" ? <button onClick={() => unequipItem(8)}>Unequip</button> : ''}
          </>
        ) : (
          <div className="empty">Empty</div>
        )}
      </div>
      <div className="slot">
        <h4>Right Ring</h4>
        {isPop && rightRing.name != "" ? (
          <>
            <div className="item">{rightRing.name}</div>
            { rightRing.name != "" ? <button onClick={() => unequipItem(9)}>Unequip</button> : ''}
          </>
        ) : (
          <div className="empty">Empty</div>
        )}
      </div>
      <div className="slot">
        <h4>Pendant</h4>
        {isPop && pendant.name != "" ? (
          <>
            <div className="item">{pendant.name}</div>
            { pendant.name != "" ? <button onClick={() => unequipItem(10)}>Unequip</button> : ''}
          </>
        ) : (
          <div className="empty">Empty</div>
        )}
      </div>
      <div className="slot">
        <h4>Wings</h4>
        {isPop && wings.name != "" ? (
          <>
            <div className="item">{wings.name}</div>
            { wings.name != "" ? <button onClick={() => unequipItem(11)}>Unequip</button> : ''}
          </>
        ) : (
          <div className="empty">Empty</div>
        )}
      </div>

      
    </div>
  );
};

export default CharacterEquipment;
