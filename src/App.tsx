import { useState, useEffect, useRef } from 'react';
import { useEventCloud } from './EventCloudContext';

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



function App() {
  const { 
    PlayerID, 
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
  
  if (!fighter) {
    return (<div>Waiting for fighter object...</div>);
  }

  return (
    
    <DndProvider backend={HTML5Backend}>
    <div className="App">
      <div className='scene'>
        <SceneContextProvider>
          <Scene/>
        </SceneContextProvider>
      </div>
     

      {/* Top bar 
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '50px', backgroundColor: '#333', color: '#fff', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="logo.png" alt="Logo" style={{ height: '30px', marginRight: '10px' }} />
          <h3>My Fighting Game</h3>
        </div>
        <div>
          <button onClick={createFighter}>New Fighter</button>
          <button style={{ marginRight: '10px' }}>Settings</button>
          <button>Logout</button>
        </div>
      </div>
      */}
      {/* Main content */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>


        {/* Left section */}
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



        {/* Middle section */}
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

        {/* Right section */}
        <div style={{ width: '30%', padding: '0 10px' }}>

          <h4>{PlayerID} [{fighter?.level}]</h4>
          <img src="my-fighter.png" alt="My Fighter" style={{ width: '100%', marginBottom: '10px' }} />
           
            
          <div style={{ backgroundColor: '#ddd', padding: '10px', borderRadius: '5px' }}>
            <h5>Stats</h5>
            <div><FighterDash color="green" /></div>
            <div>Exp: {fighter?.experience}</div>
            <div>
              
            </div>
          </div>  
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ backgroundColor: '#333', color: '#fff', padding: '10px', marginTop: '50px' }}>
        <button style={{ marginRight: '10px' }}>Fight Again</button>
        <button>Choose Opponent</button>
      </div>

    </div>
  </DndProvider>
  
  );
}

export default App;
