import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import useWebSocket from 'react-use-websocket';
import Web3 from 'web3';
import FighterNFTAbi from './abi/FighterNFT.json';
import ItemNFTAbi from './abi/ItemNFT.json';
import Stat from "./FighterStat";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Grid from "./Grid";
import Shop from './Shop';
import ShopModal from './ShopModal';
import { Dialog, DialogTitle } from '@material-ui/core';
import "./App.css";
import Inventory from './Inventory';
import CharacterEquipment from './CharacterEquipment';
import Fighter from './Fighter';
import DamageTicker from './DamageTicker';
import LoadingButton from './LoadingButton';
import NPC from './NPC';

const FighterNFTContractAddress = "0x1f3B499720eeDfe4B3a59478c2ab3cA7a3c2F45c";
const ItemsNFTContractAddress = "0x5a6b2CAfF4a9019E56917Ee5d8A1918a66183e08";
var FIGHTER_STATS = {
    Strength: [0, 0],
    Agility: [0, 0],
    Energy: [0, 0],
    Vitality: [0, 0],
};




const ITEM_SIZE = 40;
const INVENTORY_SIZE = 8;

function App() {

  const [images, setImages] = useState([]);

  // WebSocket
  const socketUrl = 'ws://localhost:8080/ws';
  const socketOptions = {
    onOpen: (event) => { console.log('WebSocket connected!:', event); refreshFigterItems(); },
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
  const [playerAttackSpeed, setPlayerAttackSpeed] = useState(0);
  const [playerAgilityPointsPerSpeed, setPlayerAgilityPointsPerSpeed] = useState(0);



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
  const [inventoryItems, setInventoryItems] = useState([]);

  const [fighter, setFighter] = useState([]);
  const [stats, setStats] = useState([]);
  const [equipment, setEquipment] = useState({});
  const [playerItemsDefence, setPlayerItemsDefence] = useState(0);

  const [damages, setDamages] = useState([]);
  const [hits, setHits] = useState([]);

  const [isBattle, setIsBattle] = useState(false);
  const [town, setTown] = useState("lorencia")
  const [location, setLocation] = useState(0)
  const [npcList, setNpcList] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);


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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(prevTime => prevTime + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      updateHealth();
    }, 1000);

    return () => clearInterval(interval);
  }, [fighter]);

  function updateHealth() {
    var health = getHealth(fighter);
    setPlayerHealth(health.toFixed(0));
  }

  function getHealth(fighter) {
    const maxHealth = fighter.maxHealth;
    const lastDmgTimestamp = fighter.lastDmgTimestamp;
    const healthAfterLastDmg = fighter.healthAfterLastDmg;

    const healthRegenRate = fighter.hpRegenerationRate;
    const currentTime = Date.now();

    const health = healthAfterLastDmg + (Math.floor(((currentTime - lastDmgTimestamp)) / 5) * healthRegenRate);

    console.log("[getHealth] maxHealth=", maxHealth, " lastDmgTimestamp=", lastDmgTimestamp, " healthAfterLastDmg=", healthAfterLastDmg, " healthRegenRate=", healthRegenRate, " health=", health);

    return Math.min(maxHealth, health);
  }

  function processDmgDealt(batlleId, damage, opponent, player, opponentHealth, lastDmgTimestamp)   {
    console.log("[processDmgDealt] batlleId=", batlleId, " damage=", damage ," opponentId=", opponent, " player=", player, " opponentHealth=", opponentHealth);

    if (player == localStorage.getItem('playerID'))
    {
      setOpponentHealth(opponentHealth);
      setDamages(prev => [...prev, damage])
    }
    else
    {
      setPlayerHealth(opponentHealth);

      var fit = fighter;
      fighter.lastDmgTimestamp = lastDmgTimestamp;
      setFighter(fighter);
      setHits(prev => [...prev, damage])
    }
  }

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

      refreshFigterItems();
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
      refreshFigterItems();
    } catch (error) {
      console.error(error);
    }
  };

  const buyShopItem = async (itemId) => {
    if (!web3) {
      console.error("Web3 not initialized");
      return;
    }
    try {
      console.log('buyShopItem', itemId)
      // Call the smart contract method using web3
      const accounts = await web3.eth.getAccounts();
      console.log(`Connected to MetaMask with account ${accounts[0]}`);
      const myContract = new web3.eth.Contract(ItemNFTAbi, ItemsNFTContractAddress);
      const result = await myContract.methods.buyItemFromShop(itemId, localStorage.getItem("playerID")).send({ from: accounts[0] });
      const id = result.events.ItemBoughtFromShop.returnValues.itemId;
      refreshFigterItems();
      console.log(result);
      console.log("itemId", id);
    } catch (error) {
      console.error(error);
    }
  };

  const equipItem = async (itemId, slot1, slot2) => {
    if (!web3) {
      console.error("Web3 not initialized");
      return;
    }
    try {
      console.log('equipItem', itemId, "slot1", slot1, "slot2", slot2)
      // Call the smart contract method using web3
      const accounts = await web3.eth.getAccounts();
      console.log(`Connected to MetaMask with account ${accounts[0]}`);
      const myContract = new web3.eth.Contract(FighterNFTAbi, FighterNFTContractAddress);
      const result = await myContract.methods.equipItem(localStorage.getItem("playerID"), itemId, slot1).send({ from: accounts[0] });
      const id = result.events.ItemEquiped.returnValues.itemId;
     
      console.log(result);
      console.log("itemId", id);
      refreshFigterItems();
    } catch (error) {
      console.error(error);
    }
  };

  const unequipItem = async (slot) => {
    if (!web3) {
      console.error("Web3 not initialized");
      return;
    }
    try {
      console.log("[unequipItem] slot", slot)
      // Call the smart contract method using web3
      const accounts = await web3.eth.getAccounts();
      console.log(`Connected to MetaMask with account ${accounts[0]}`);
      const myContract = new web3.eth.Contract(FighterNFTAbi, FighterNFTContractAddress);
      const result = await myContract.methods.equipItem(localStorage.getItem("playerID"), 0, slot).send({ from: accounts[0] });
      const id = result.events.ItemEquiped.returnValues.itemId;
     
      console.log(result);
      console.log("itemId", id);
      refreshFigterItems();
    } catch (error) {
      console.error(error);
    }
  };

  function refreshFigterItems() {
    var response = sendJsonMessage({
        type: "getFighterItems",
        data: {
            userAddress: "0xDf228A720E6B9472c5559a68551bE5ca2e400FD8",
            fighterId: parseInt(localStorage.getItem('playerID')),
        }

      });
  }

  // !!!!  
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
          

          //processMoves(msg.move1, msg.move2)
          generateBattleReceipt(msg);
         break;

        case "fighter_items":
          updateFighterItems(msg.items, msg.attributes, msg.equipment, msg.stats, msg.npcs, msg.fighter);
        break;

        case "damage_dealt":
          processDmgDealt(msg.battleID, msg.damage, msg.opponent, msg.player, msg.opponentHealth, msg.lastDmgTimestamp)
        break;

        
      }
  }

  function updateFighterItems(items, attributes, equipment, stats, npcs, fighter) {
    
    
    var attributes = JSON.parse(attributes);
    var fighter = JSON.parse(fighter);
    var npcs = JSON.parse(npcs);
    var equipment = JSON.parse(equipment);
    
    var newItems = [];
    var itemDefence = 0;
    if (items != '') {
      var itemList = JSON.parse(items);
      for (var i = 0; i < itemList.length; i++) {
        console.log("updateFighterItems", itemList[i])

        // check if item is equipped
        if (!isEquiped(itemList[i].tokenId, attributes))
        {
          newItems.push(itemList[i]);
        } else {
          itemDefence += parseInt(itemList[i].defense);
        }     
      }
    }
    
    setPlayerItemsDefence(itemDefence);

    setInventoryItems(newItems);
    setEquipment(equipment);
    setNpcList(npcs);

     var stats = JSON.parse(stats);

    console.log("attributes", attributes)

    setFighter(fighter);
    setPlayerHealth(getHealth(fighter).toFixed(0));
    setPlayerStrength(attributes.Strength);
    setPlayerAgility(attributes.Agility);
    setPlayerEnergy(attributes.Energy);
    setPlayerVitality(attributes.Vitality);
    setPlayerMaxStats(attributes.maxStatPoints);
    setPlayerExperience(attributes.Experience);
    setPlayerAttackSpeed(attributes.attackSpeed);
    setPlayerAgilityPointsPerSpeed(attributes.agilityPointsPerSpeed);

    console.log("[updateFighterItems] ", attributes);

    FIGHTER_STATS = {
        Strength: [attributes.Strength, 0],
        Agility: [attributes.Agility, 0],
        Energy: [attributes.Energy, 0],
        Vitality: [attributes.Vitality, 0],
    };

    setAvailablePoints(parseInt(stats.maxStatPoints) - parseInt(stats.totalStatPoints));
    setAttributes(FIGHTER_STATS);

    setPlayerDamage(stats.damage);
    setPlayerDefence(stats.defence);
    setPlayerMaxHP(fighter.maxHealth);
    setPlayerMaxMana(stats.maxMana);
    setPlayerMana(stats.currentMana);
    setPlayerLevel(stats.level);
    
  }

  function isEquiped(tokenId, fighter) {
    console.log("isEquiped", tokenId, fighter)
    if (fighter.helmSlot      == tokenId) return true;
    if (fighter.armourSlot    == tokenId) return true;
    if (fighter.pantsSlot     == tokenId) return true;
    if (fighter.glovesSlot    == tokenId) return true;
    if (fighter.bootsSlot     == tokenId) return true;
    if (fighter.leftHandSlot  == tokenId) return true;
    if (fighter.rightHandSlot == tokenId) return true;
    if (fighter.leftRingSlot  == tokenId) return true;
    if (fighter.rightRingSlot == tokenId) return true;
    if (fighter.pendantSlot   == tokenId) return true;
    if (fighter.wingsSlot     == tokenId) return true;

    return false;
  }

  function startNewBattle(msg) {
      setFightLog([]); 
      setDamages([]);
      setHits([]);
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

      setPlayerHealth(stats.currentHealth)
      setPlayerMaxHP(stats.maxHealth);

      setOpponentHealth(opStats.currentHealth);
      setOpponentStrength(opponent.Strength);
      setOpponentAgility(opponent.Agility);
      setOpponentEnergy(opponent.Energy);
      setOpponentVitality(opponent.Vitality);
      setOpponentLevel(opStats.level);
      setOpponentMaxHP(opStats.maxHealth);

      localStorage.setItem("opponentID", opponent.TokenID)

      setIsBattle(true);
      console.log("isBattle: ", isBattle);
  }

  function generateBattleReceipt(msg) {
    var winner = msg.winner;
    console.log("WINNER: ", winner);
    setIsBattle(false);
    console.log("isBattle: ", isBattle);
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

  async function handleNewBattleButton() {
    var response = sendJsonMessage({
      type: "startNewBattle",
      data: {
          playerID: parseInt(localStorage.getItem('playerID')),
          opponentID: parseInt(2)
      }

    });
  }

  async function initiateBattle(userId) {
    var response = sendJsonMessage({
      type: "startNewBattle",
      data: {
          playerID: parseInt(localStorage.getItem('playerID')),
          opponentID: parseInt(userId)
      }

    });
  }

  async function handleMoveSubmission() {
      var response = sendJsonMessage({
        type: "recordMove",
        data: {
            battleID: localStorage.getItem('battleID'),
            playerID: parseInt(localStorage.getItem('playerID')),
            skill: 0
        }

      });

      // send opponent move random
      const parts = ["head", "body", "legs"];
      var response = sendJsonMessage({
        type: "recordMove",
        data: {
            battleID: localStorage.getItem('battleID'),
            playerID: parseInt(localStorage.getItem('opponentID')),
            skill: 0
        }

      });
  }

  const handleShopButtonClick = () => {
    setIsShopOpen(true);
  }; 

  //refreshFigterItems();

  return (
    <DndProvider backend={HTML5Backend}>
    <div className="App" style={appStyle}>

      <ShopModal
        isOpen={isShopOpen}
        onClose={() => { setIsShopOpen(false); setAppStyle({}); }}
        onClick={buyShopItem}
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
            <DamageTicker color="green" damages={damages} />
            <DamageTicker color="red" damages={hits} />

          </div>
          <div>
              
              <Inventory items={inventoryItems} setItems={setInventoryItems} equipItem={equipItem} />
            
              
          </div>
        </div>









        {/* Middle section */}
        <div style={{ width: '40%', padding: '0 10px' }}>
          <h4>Game Chat</h4>
          <div>
            <button onClick={handleNewBattleButton}>New Battle</button>

            <button onClick={() => { setIsShopOpen(true); setAppStyle({ pointerEvents: "none" }); }}>Shop</button>

            <button onClick={refreshFigterItems}>Refresh</button>
          </div>
          {npcList.map((npc) => (
            <NPC key={npc.id} npc={npc} currentTime={currentTime} initiateBattle={initiateBattle} />
          ))}
          <div style={{ backgroundColor: '#ddd', padding: '10px', borderRadius: '5px', height: '400px', overflowY: 'auto' }}>
            
          </div>
        </div>








        {/* Right section */}
        <div style={{ width: '30%', padding: '0 10px' }}>
           


          <h4>{localStorage.getItem("playerID")} [{playerLevel}]</h4>
          <img src="my-fighter.png" alt="My Fighter" style={{ width: '100%', marginBottom: '10px' }} />
           
            
          <div style={{ backgroundColor: '#ddd', padding: '10px', borderRadius: '5px' }}>
            <h5>Stats</h5>
            <div><Fighter currentHealth={playerHealth} health={playerMaxHP} color="green" /></div>
            <div>Exp: {playerExperience}</div>
            <div>
              <CharacterEquipment equipment={equipment} unequipItem={unequipItem}/>
            </div>
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
                  <p>Defence: {parseInt(playerAgility/4+playerItemsDefence)}</p>
                  <p>Attack: {parseInt(playerStrength/4 + playerEnergy/4)}</p>
                  <p>Speed: {parseInt(playerAttackSpeed + playerAgility/playerAgilityPointsPerSpeed)}</p>
              </div>
            </div>

          </div>
          <div className="button-container">
            <LoadingButton onClick={handleMoveSubmission} isBattle={isBattle} playerSpeed={playerAttackSpeed + playerAgility/playerAgilityPointsPerSpeed}>Submit Move</LoadingButton>
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
