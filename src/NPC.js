import React, { useState, useEffect } from "react";
import FloatingDamage from "./FloatingDamage";
import "./NPC.css";

const NPC = ({ npcs, currentTime, getNpcHealth, target, setTarget, damageData }) => {
  const [npcState, setNpcState] = useState(npcs);

  const [floatingDamages, setFloatingDamages] = useState({});

  useEffect(() => {
    console.log(`damageData `, damageData);
    if (damageData) {
      // Check if the current NPC's ID matches the ID in damageData
      const npc = npcState.find((npc) => npc.id === damageData.npcId);

      if (npc) {
        // Trigger the floating damage animation for this NPC
        console.log(`NPC with ID ${npc.id} received ${damageData.damage} damage.`);
        triggerFloatingDamage(damageData.npcId, damageData.damage);
      }
    }
  }, [damageData]);

  const triggerFloatingDamage = (npcId, damage) => {
    setFloatingDamages((prevDamages) => ({
      ...prevDamages,
      [npcId]: { damage, key: Math.random() },
    }));
  };

  const handleFloatingDamageEnd = (npcId) => {
    setFloatingDamages((prevDamages) => {
      const newDamages = { ...prevDamages };
      delete newDamages[npcId];
      return newDamages;
    });
  };

  useEffect(() => {
    setNpcState(npcs);
  }, [npcs]);

  const handleClick = (npc) => {
    if (getNpcHealth(npc.id) < npc.maxHealth) {
      console.log('Mob unavailable')
      
    } else {
      setNpcState((prevState) =>
        prevState.map((n) =>
          n.id === npc.id ? { ...n, inBattle: true } : n
        )
      );
      //initiateBattle(npc.id);
    }    
  };

  const handleCheckmark = (npcId) => {
    setTarget(npcId);
  };


  return (
    <div className="npc-container">
      {npcState.map((npc) => {
        const isDead = npc.isDead;
        const timeLeft = npc.lastDmgTimestamp + 5000 - currentTime;
        const progress = (timeLeft / 5000) * 100;
        // console.log('getNpcHealth(npc.id)', npc.id, getNpcHealth(npc.id))
        // console.log('getNpcHealth NPC', npc)
        return (
          <div
            key={npc.id}
            className="npc"
            onClick={() => handleClick(npc)}
            style={{
              width: "100px",
              height: "50px",
              border: "1px solid black",
              position: "relative",
            }}
          >
            <input
              type="checkbox"
              checked={target === npc.id}
              onChange={() => handleCheckmark(npc.id)}
              style={{ position: "absolute", top: "2px", left: "2px" }}
            />
            <div className="npc-name">{npc.name}</div>
            <div className="npc-healthbar" style={{ width: '100%', height: '5px', backgroundColor: 'lightgray' }}>
              <div className="npc-current-health" style={{ width: `${(getNpcHealth(npc.id)/npc.maxHealth) * 100}%`, height: '100%', backgroundColor: 'green' }}></div>
            </div>
            {isDead && (
              <div className="npc-respawn-progress" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: '50%', clipPath: `inset(0 ${progress}% 0 0)` }}></div>
            )}

             {floatingDamages[npc.id] && (
              <FloatingDamage
                key={floatingDamages[npc.id].key}
                damage={floatingDamages[npc.id].damage}
                onAnimationEnd={() => handleFloatingDamageEnd(npc.id)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default NPC;
