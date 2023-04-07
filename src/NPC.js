import React, { useState, useEffect } from "react";
import "./NPC.css";

const NPC = ({ npc, currentTime, initiateBattle }) => {
  const [currentNpc, setCurrentNpc] = useState(npc);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    setCurrentNpc(npc);
  }, [npc]);

  useEffect(() => {
    if (currentNpc.isDead) {
      setTimeLeft(currentNpc.timeOfDeath + currentNpc.respawnDelay - currentTime);
    }
  }, [currentNpc, currentTime]);

  const handleClick = () => {
    initiateBattle(npc.id);
  };

  return (
    <div className="npc"  onClick={handleClick}>
      <div className="npc-name">{currentNpc.name}</div>
      <div className="npc-health-bar">
        <div
          className="npc-health"
          style={{ width: `${(currentNpc.health / 100) * 100}%` }}
        />
      </div>
      {currentNpc.isDead && (
        <div className="npc-respawn-pie" style={{ animationDuration: `${currentNpc.respawnDelay}s` }}>
          <div className="pie-spinner" style={{ animationDuration: `${currentNpc.respawnDelay}s` }}></div>
        </div>
      )}
    </div>
  );
};

export default NPC;
