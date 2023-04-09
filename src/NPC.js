import React, { useState, useEffect } from "react";
import "./NPC.css";

const NPC = ({ npcs, currentTime, initiateBattle, getHealth }) => {
  const [npcState, setNpcState] = useState(npcs);

  useEffect(() => {
    setNpcState(npcs);
  }, [npcs]);

  const handleClick = (npc) => {
    if (getHealth(npc) < npc.maxHealth) {
      console.log('Mob unavailable')
    } else {
      initiateBattle(npc.id);
    }    
  };

  return (
    <div className="npc-container">
      {npcState.map((npc) => {
        const isDead = npc.timeOfDeath + npc.respawnDelay * 1000 > currentTime;
        const timeLeft = npc.timeOfDeath + npc.respawnDelay - currentTime;
        const progress = (timeLeft / npc.respawnDelay) * 100;

        return (
          <div key={npc.id} className="npc" onClick={() => handleClick(npc)} style={{ width: '100px', height: '50px', border: '1px solid black', position: 'relative' }}>
            <div className="npc-name">{npc.name}</div>
            <div className="npc-healthbar" style={{ width: '100%', height: '5px', backgroundColor: 'lightgray' }}>
              <div className="npc-current-health" style={{ width: `${(getHealth(npc)/npc.maxHealth) * 100}%`, height: '100%', backgroundColor: 'green' }}></div>
            </div>
            {isDead && (
              <div className="npc-respawn-progress" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: '50%', clipPath: `inset(0 ${progress}% 0 0)` }}></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default NPC;
