import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import useWebSocket from 'react-use-websocket';
import Web3 from 'web3';
import FighterNFTAbi from './abi/FighterNFT.json';
import Stat from "./FighterStat";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Grid from "./Grid";
import Shop from './Shop';
import ShopModal from './ShopModal';
import { Dialog, DialogTitle } from '@material-ui/core';
import "./App.css";

const FighterNFTContractAddress = "0x46296eC931cc34B0F24cdd82b2C0003B10e941C2";
var FIGHTER_STATS = {
    Strength: [0, 0],
    Agility: [0, 0],
    Energy: [0, 0],
    Vitality: [0, 0],
};


const Fighter = ({ name, health, color, currentHealth }) => {
  //const [currentHealth, setCurrentHealth] = useState(health);

  const healthBarStyles = {
    width: '100%',
    height: '20px',
    backgroundColor: 'gray',
    borderRadius: '10px'
  };

  const currentHealthBarStyles = {
    width: `${(currentHealth / health) * 100}%`,
    height: '20px',
    backgroundColor: color,
    borderRadius: '10px'
  };

  const healthTextStyles = {
    textAlign: 'center',
    fontWeight: 'bold'
  };

  const decreaseHealth = (amount) => {
    const newHealth = currentHealth - amount;
    //setCurrentHealth(newHealth < 0 ? 0 : newHealth);
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <h2>{name}</h2>
      <div style={healthBarStyles}>
        <div style={currentHealthBarStyles}></div>
      </div>
      <p style={healthTextStyles}>{currentHealth} / {health}</p>
    </div>
  );
};

const ITEM_SIZE = 40;
const INVENTORY_SIZE = 8;

function App() {

  // WebSocket
  const socketUrl = 'ws://localhost:8080/ws';
  const socketOptions = {
    onError: (event) => console.error('WebSocket error:', event),
    onClose: (event) => console.log('WebSocket closed:', event),
    onMessage: (event) => processIncomingMessage(event)
  };
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(socketUrl, socketOptions);
  const [isShopOpen, setIsShopOpen] = useState(false);  

  var [attackOption, setAttackOption] = useState('');
  var [blockOption, setBlockOption] = useState('');

  const [fightLog, setFightLog] = useState([]);
  const [playerHealth, setPlayerHealth] = useState(0);
  const [playerStrength, setPlayerStrength] = useState(0);
  const [playerAgility, setPlayerAgility] = useState(0);
  const [playerEnergy, setPlayerEnergy] = useState(0);
  const [playerVitality, setPlayerVitality] = useState(0);

  const [playerDamage, setPlayerDamage] = useState(0);
  const [playerDefence, setPlayerDefence] = useState(0);
  const [playerMaxHP, setPlayerMaxHP] = useState(0);
  const [playerMaxMana, setPlayerMaxMana] = useState(0);
  const [playerLevel, setPlayerLevel] = useState(0);
  const [playerMana, setPlayerMana] = useState(0);
  const [playerMaxStats, setPlayerMaxStats] = useState(0);
  const [playerExperience, setPlayerExperience] = useState(0);


  const [opponentHealth, setOpponentHealth] = useState(0);
  const [opponentStrength, setOpponentStrength] = useState(0);
  const [opponentAgility, setOpponentAgility] = useState(0);
  const [opponentEnergy, setOpponentEnergy] = useState(0);
  const [opponentVitality, setOpponentVitality] = useState(0);
  const [opponentLevel, setOpponentLevel] = useState(0);
  const [opponentMaxHP, setOpponentMaxHP] = useState(0);

  const [attributes, setAttributes] = useState(FIGHTER_STATS);
  const [availablePoints, setAvailablePoints] = useState(0);

  const [web3, setWeb3] = useState(null);
  const [appStyle, setAppStyle] = useState({});


  localStorage.setItem('playerID',1);

  useEffect(() => {
    const connectToMetaMask = async () => {
      if (window.ethereum) {
        try {
          // Request account access if needed
          await window.ethereum.request({ method: "eth_requestAccounts" });
          // Instantiate Web3 with MetaMask provider
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);
        } catch (error) {
          console.error(error);
        }
      } else {
        console.error("MetaMask not detected");
      }
    };

   connectToMetaMask();
  }, []);

  const updateStats = async () => {
    if (!web3) {
      console.error("Web3 not initialized");
      return;
    }
    try {
      // Call the smart contract method using web3
      const accounts = await web3.eth.getAccounts();
      console.log(`Connected to MetaMask with account ${accounts[0]}`);
      const myContract = new web3.eth.Contract(FighterNFTAbi, FighterNFTContractAddress);
      const result = await myContract.methods.updateFighterStats(
        localStorage.getItem("playerID"),
        attributes.Strength[0],
        attributes.Agility[0],
        attributes.Energy[0],
        attributes.Vitality[0]

      ).send({ from: accounts[0] });
      const ev = result.events.StatsUpdated.returnValues;
      console.log("[updateStats] Event", ev);
      console.log("[updateStats] Stats updated", result);
    } catch (error) {
      console.error(error);
    }
  };

  const createFighter = async () => {
    if (!web3) {
      console.error("Web3 not initialized");
      return;
    }
    try {
      // Call the smart contract method using web3
      const accounts = await web3.eth.getAccounts();
      console.log(`Connected to MetaMask with account ${accounts[0]}`);
      const myContract = new web3.eth.Contract(FighterNFTAbi, FighterNFTContractAddress);
      const result = await myContract.methods.createFighter(1).send({ from: accounts[0] });
      const playerID = result.events.FighterCreated.returnValues.tokenId;
      localStorage.setItem("playerID", playerID);
      console.log(result);
      console.log("playerID", playerID);
    } catch (error) {
      console.error(error);
    }
  };

  function processIncomingMessage(event) {
      var msg = JSON.parse(event.data);
      console.log("New message", msg);

      switch (msg.action) {
        case "new_battle_started":

          startNewBattle(msg);
          

          console.log("new_battle_started", msg)
         break;
       case "move_accepted":
          // print move to battle log
          console.log("move_accepted", msg)
         break;

        case "next_round_started":
          // print move to battle log
          console.log("next_round_started", msg)
          localStorage.setItem('currentRound', msg.newround);

          processMoves(msg.move1, msg.move2)
         break;

        case "battle_closed":
          localStorage.setItem('battleClosed', true);
          console.log("battle_closed", msg)
          

          processMoves(msg.move1, msg.move2)
          generateBattleReceipt(msg);
         break;
      }
  }

  function startNewBattle(msg) {
      setFightLog([]); 
      localStorage.setItem('battleClosed', false);
      localStorage.setItem('battleID', msg.battleID);
      localStorage.setItem('currentRound', 1);


      var opp1 = JSON.parse(msg.opponent1);
      var opp2 = JSON.parse(msg.opponent2);
      

      

      let player, opponent, stats, opStats;

      


      if (opp1.TokenID == localStorage.getItem('playerID'))
      {
          localStorage.setItem('player', opp1);
          localStorage.setItem('opponent', opp2);

          player = opp1;
          opponent = opp2;
          stats = JSON.parse(msg.fighterStats1);
          opStats = JSON.parse(msg.fighterStats2);
      } else if (opp2.TokenID == localStorage.getItem('playerID')) {
          localStorage.setItem('player', opp2);
          localStorage.setItem('opponent', opp1);

          player = opp2;
          opponent = opp1;
          stats = JSON.parse(msg.fighterStats2);
          opStats = JSON.parse(msg.fighterStats1);
      }       
      

      setPlayerHealth(stats.currentHealth);
      setPlayerStrength(player.Strength);
      setPlayerAgility(player.Agility);
      setPlayerEnergy(player.Energy);
      setPlayerVitality(player.Vitality);
      setPlayerMaxStats(stats.maxStatPoints);
      setPlayerExperience(player.Experience);

      FIGHTER_STATS = {
          Strength: [player.Strength, 0],
          Agility: [player.Agility, 0],
          Energy: [player.Energy, 0],
          Vitality: [player.Vitality, 0],
      };

      setAvailablePoints(parseInt(stats.maxStatPoints) - parseInt(stats.totalStatPoints));
      setAttributes(FIGHTER_STATS);

      setPlayerDamage(stats.damage);
      setPlayerDefence(stats.defence);
      setPlayerMaxHP(stats.maxHealth);
      setPlayerMaxMana(stats.maxMana);
      setPlayerMana(stats.currentMana);
      setPlayerLevel(stats.level);

      setOpponentHealth(opStats.currentHealth);
      setOpponentStrength(opponent.Strength);
      setOpponentAgility(opponent.Agility);
      setOpponentEnergy(opponent.Energy);
      setOpponentVitality(opponent.Vitality);
      setOpponentLevel(opStats.level);
      setOpponentMaxHP(opStats.maxHealth);

      localStorage.setItem("opponentID", opponent.TokenID)
  }

  function generateBattleReceipt(msg) {
    var winner = msg.winner;
    console.log("WINNER: ", winner);
  }

  function processMoves(move1, move2) {
      var move1 = JSON.parse(move1);
      var move2 = JSON.parse(move2);

      console.log("move1", move1);
      console.log("move2", move2);


      if (move1.PlayerID == localStorage.getItem('playerID')) {
        setPlayerHealth(move1.NewHealth);
        setOpponentHealth(move2.NewHealth);   

      } else {
        setPlayerHealth(move2.NewHealth);
        setOpponentHealth(move1.NewHealth);
      }

      setFightLog(prevMoves => [...prevMoves, move1]); 
      setFightLog(prevMoves => [...prevMoves, move2]); 
  }

  function handleAttributeChange(name, value) {
    // setAttributes((prev) => ({
    //   ...prev,
    //   [name]: value,
    // }));
    // setAvailablePoints((prev) =>
    //   value > attributes[name] ? parseInt(prev) - 1 : parseInt(prev) + 1
    // );
    attributes[name] = value;

    console.log("FIGHTER_STATS ", FIGHTER_STATS);
    setAvailablePoints(
      parseInt(playerMaxStats)
      -parseInt(playerStrength)
      -parseInt(playerAgility)
      -parseInt(playerEnergy)
      -parseInt(playerVitality)
      -parseInt(attributes.Strength[1])
      -parseInt(attributes.Agility[1])
      -parseInt(attributes.Energy[1])
      -parseInt(attributes.Vitality[1])

    );

  }

  function resetAttributes() {
    attributes.Strength[0] -= attributes.Strength[1];
    attributes.Agility[0] -= attributes.Agility[1];
    attributes.Energy[0] -= attributes.Energy[1];
    attributes.Vitality[0] -= attributes.Vitality[1];

    attributes.Strength[1] = 0;
    attributes.Agility[1] = 0;
    attributes.Energy[1] = 0;
    attributes.Vitality[1] = 0;

    setAvailablePoints(parseInt(playerMaxStats)-parseInt(playerStrength)-parseInt(playerAgility)-parseInt(playerEnergy)-parseInt(playerVitality));
  }

  function handleAttackSelection(attack) {
    setAttackOption(attack);
    attackOption = attack;
    console.log('Attack:', attack);
  }

  function handleBlockSelection(block) {
    setBlockOption(block);
    blockOption = block;
    console.log('Block:', block);
    
  }

  
  async function handleNewBattleButton() {
    var response = sendJsonMessage({
      type: "startNewBattle",
      data: {
          playerID: parseInt(localStorage.getItem('playerID')),
          opponentID: parseInt(2)
      }

    });
  }

  async function handleMoveSubmission() {
      var response = sendJsonMessage({
        type: "recordMove",
        data: {
            battleID: localStorage.getItem('battleID'),
            playerID: parseInt(localStorage.getItem('playerID')),
            attack: attackOption,
            block: blockOption,
            round: parseInt(localStorage.getItem('currentRound'))
        }

      });

      // send opponent move random
      const parts = ["head", "body", "legs"];
      var response = sendJsonMessage({
        type: "recordMove",
        data: {
            battleID: localStorage.getItem('battleID'),
            playerID: parseInt(localStorage.getItem('opponentID')),
            attack: parts[Math.floor(Math.random() * parts.length)],
            block: parts[Math.floor(Math.random() * parts.length)],
            round: parseInt(localStorage.getItem('currentRound'))
        }

      });
  }

  const handleShopButtonClick = () => {
    setIsShopOpen(true);
  }; 


  return (
    <DndProvider backend={HTML5Backend}>
    <div className="App" style={appStyle}>

      <ShopModal
        isOpen={isShopOpen}
        onClose={() => { setIsShopOpen(false); setAppStyle({}); }}
        images={[]}
      />


      {/* Top bar */}
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

      {/* Main content */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>





        {/* Left section */}
        <div style={{ width: '30%', padding: '0 10px' }}>
           <h4>Opponent [{opponentLevel}]</h4>
          <img src="opponent.png" alt="Opponent" style={{ width: '100%', marginBottom: '10px' }} />
          <div style={{ backgroundColor: '#ddd', padding: '10px', borderRadius: '5px' }}>
            <h5>Stats</h5>
            <div><Fighter name="Player 2" currentHealth={opponentHealth} health={opponentMaxHP} color="red" /></div>
            
            </div>
          <div>
            
              <Grid />
            
              
          </div>
        </div>









        {/* Middle section */}
        <div style={{ width: '40%', padding: '0 10px' }}>
          <h4>Fight Moves Logs</h4>
          <div>
            <button onClick={handleNewBattleButton}>New Battle</button>

            <button onClick={() => { setIsShopOpen(true); setAppStyle({ pointerEvents: "none" }); }}>Shop</button>

          </div>

          <div style={{ backgroundColor: '#ddd', padding: '10px', borderRadius: '5px', height: '400px', overflowY: 'auto' }}>
            {fightLog.map((move, index) => 
              <p key={index}> 
              <b>[Round {move.Round}]</b>: 
                {move.PlayerID == localStorage.getItem("playerID") ? ' You hit your opponent ' : ' Opponent hit you '} 
                 on the <b>{move.Atack} </b> 
                 <i><u>{move.WasBlocked ? ' but met a block ' : ''}</u></i>
                  causing <b style={{ color: move.PlayerID == localStorage.getItem("playerID") ? 'green' : 'red'}}>
                  {move.Damage}</b> damage!
              </p>
            )}
          </div>
        </div>








        {/* Right section */}
        <div style={{ width: '30%', padding: '0 10px' }}>
         


          <h4>My Fighter [{playerLevel}]</h4>
          <img src="my-fighter.png" alt="My Fighter" style={{ width: '100%', marginBottom: '10px' }} />
          <div style={{ backgroundColor: '#ddd', padding: '10px', borderRadius: '5px' }}>
            <h5>Stats</h5>
            <div><Fighter name="Player 1" currentHealth={playerHealth} health={playerMaxHP} color="green" /></div>
            <div>Exp: {playerExperience}</div>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <div style={{ flex: 1, padding: '10px', backgroundColor: '#f0f0f0' }}>
                <Stat
                  name="Strength"
                  value={attributes.Strength}
                  onChange={handleAttributeChange}
                  availablePoints={availablePoints}
                />
                <Stat
                  name="Agility"
                  value={attributes.Agility}
                  onChange={handleAttributeChange}
                  availablePoints={availablePoints}
                />
                <Stat
                  name="Energy"
                  value={attributes.Energy}
                  onChange={handleAttributeChange}
                  availablePoints={availablePoints}
                />
                <Stat
                  name="Vitality"
                  value={attributes.Vitality}
                  onChange={handleAttributeChange}
                  availablePoints={availablePoints}
                />
                <div>
                  Available points: {availablePoints}{" "}
                  <button onClick={resetAttributes}>Reset</button>
                </div>
                <button
                  onClick={updateStats}
                >
                  Submit Stats
                </button>
              </div>
              <div style={{ flex: 1, padding: '10px', backgroundColor: '#d9d9d9' }}>
                  <p>Defence: {parseInt(playerAgility/4)}</p>
                  <p>Attack: {parseInt(playerStrength/4 + playerEnergy/4)}</p>
              </div>
            </div>

          </div>
          <div className="button-container">
            <div className="button-column">
              <button style={{ backgroundColor: attackOption === "head" ? 'yellow' : 'white' }} onClick={() => handleAttackSelection("head")}>Head</button>
              <button style={{ backgroundColor: attackOption === "body" ? 'yellow' : 'white' }} onClick={() => handleAttackSelection("body")}>Body</button>
              <button style={{ backgroundColor: attackOption === "legs" ? 'yellow' : 'white' }} onClick={() => handleAttackSelection("legs")}>Legs</button>
            </div>
            <div className="button-column">
              <button style={{ backgroundColor: blockOption === "head" ? 'green' : 'white' }} onClick={() => handleBlockSelection("head")}>Head</button>
              <button style={{ backgroundColor: blockOption === "body" ? 'green' : 'white' }} onClick={() => handleBlockSelection("body")}>Body</button>
              <button style={{ backgroundColor: blockOption === "legs" ? 'green' : 'white' }} onClick={() => handleBlockSelection("legs")}>Legs</button>
            </div>
            <button onClick={handleMoveSubmission}>Submit Move</button>
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
