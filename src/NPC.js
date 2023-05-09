import React, { useState, useEffect } from "react";
import FloatingDamage from "./FloatingDamage";
import "./NPC.css";
import { useEventCloud } from './EventCloudContext.tsx';

const NPC = ({ npcs, currentTime, target, setTarget }) => {
  const [latestDamageEvent, setLatestDamageEvent] = useState(null);

  const { events, setEvents } = useEventCloud();
  const { removeEvent } = useEventCloud();
  const [npcState, setNpcState] = useState(npcs);

  const [floatingDamages, setFloatingDamages] = useState({});

   useEffect(() => {
    const damageEvents = events.filter((event) => event.type === 'damage');

    if (damageEvents.length > 0) {
      damageEvents.forEach((damageEvent) => {
        console.log(`NPC with ID ${damageEvent.npcId} received ${damageEvent.damage} damage.`);
        triggerFloatingDamage(damageEvent.npcId, damageEvent.damage);
        // removeEvent(damageEvent); // denis: i remove it in scene
      });
      
    }
  }, [events]);




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
    setNpcState((prevState) =>
      prevState.map((n) =>
        n.id === npc.id ? { ...n, inBattle: true } : n
      )
    );
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
        return (
          <div
            key={npc.id}
            className="npc"
            onClick={() => handleClick(npc)}
            style={{
              width: "130px",
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
            <div className="npc-name">{npc.id} ({npc.coordinates.x}, {npc.coordinates.z})</div>
            <div className="npc-healthbar" style={{ width: '100%', height: '5px', backgroundColor: 'lightgray' }}>
              <div className="npc-current-health" style={{ width: `${(npc.currentHealth/npc.maxHealth) * 100}%`, height: '100%', backgroundColor: 'green' }}></div>
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
