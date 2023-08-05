import { useState, useEffect, useRef } from 'react';
import { useEventCloud } from './EventCloudContext';
import { useSceneContext } from './store/SceneContext';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import "./App.css";
import FighterDash from './FighterDash';
import LoadingButton from './LoadingButton';
import DroppedItemsList from './DroppedItemsList';
import NPC from './NPC';
import Backpack from './Backpack';
import ToggleSkillButton from './ToggleSkillButton';


import Scene from './Scene/Scene';
import SceneContextProvider from './store/SceneContext';

import MetamaskDialog from './MetamaskDialog';


// Commandments
//
// FOR PLAYERS
// /move <map name> - teleport map 
// /trade - initiate trade (point at other player)
// /party - join/initiate party (point at other player)
// <text> - local chat
// ~<text> - party chat
// @<text> - guild chat
//
// FOR DEVS
// /slide <x: int> <z: int> - move char to coords
// /spawn <npcName: string> - spawn an NPC (eg: spider, bull)
// /make <itemName: string> [+<lvl>] [+<add points>] [l] [exc]  - make item (eg: /make brass armour +9 +8 l exc  | /make nodachi)
// /makeset <setName: string> [+<lvl>] - make item (eg: /makeset legendary +15)
//

function App() {
  const { 
    addDamageEvent, 
    fighter, 
    npcList, 
    droppedItems, 
    money, 
    equipment,
    moveFighter,
    target,
    setTarget,
    refreshFighterItems 
  } = useEventCloud();
  
  return (
  <DndProvider backend={HTML5Backend}>
    <div className="App">
      <MetamaskDialog />
      {fighter ? (
        <>
        <SceneContextProvider>
          <div className='Game'>
            <Scene/>
          </div>
        </SceneContextProvider>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>

          <div style={{ width: '30%', padding: '0 10px' }}>
            <img src="opponent.png" alt="Opponent" style={{ width: '100%', marginBottom: '10px' }} />
            <div style={{ backgroundColor: '#ddd', padding: '10px', borderRadius: '5px' }}>
              <NPC target={target} setTarget={setTarget} npcs={npcList}/>
            </div>
            <div>Money: {money}</div>
            <div>
              <DroppedItemsList />
            </div>
          </div>

          <div style={{ width: '40%', padding: '0 10px' }}>
            <h4>Game Controls</h4>
            <div>
              <button onClick={refreshFighterItems}>Refresh</button>
            </div>
            <div style={{ backgroundColor: '#ddd', padding: '10px', borderRadius: '5px', height: '50px', overflowY: 'auto' }}>
              <div className="button-container">
                <LoadingButton>Submit Move</LoadingButton>
              </div>
              <div>
                <ToggleSkillButton/>
              </div>
            </div>
            <div>
              <Backpack />
            </div>
          </div>

          <div style={{ width: '30%', padding: '0 10px' }}>
            <h4>{fighter?.tokenId} [{fighter?.level}]</h4>
            <img src="my-fighter.png" alt="My Fighter" style={{ width: '100%', marginBottom: '10px' }} />
            <div style={{ backgroundColor: '#ddd', padding: '10px', borderRadius: '5px' }}>
              <h5>Stats</h5>
              <div><FighterDash color="green" /></div>
              <div>Exp: {fighter?.experience}</div>
              <div>
              </div>
            </div>  
          </div>

          <div style={{ backgroundColor: '#333', color: '#fff', padding: '10px', marginTop: '50px' }}>
            <button style={{ marginRight: '10px' }}>Fight Again</button>
            <button>Choose Opponent</button>
          </div>
        </div>
        </>
      ) : (
        <div>Waiting for fighter object...</div>
      )}
    </div>
  </DndProvider>
);

}

export default App;
