import React, { useState, useEffect, useRef } from 'react';
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
import FloatingDamage from "./FloatingDamage";
import ChatWindow from './ChatWindow';
import MoveFighterForm from './MoveFighterForm';

import Scene from './Scene/Scene';
import SceneContextProvider from './Scene/store/SceneContextProvider';

const FighterNFTContractAddress = "0x1f3B499720eeDfe4B3a59478c2ab3cA7a3c2F45c";
const ItemsNFTContractAddress = "0x5a6b2CAfF4a9019E56917Ee5d8A1918a66183e08";
const UserAddress = "0xC1FcD8e0e55499D25811FAEFd0418FEabd5e4E1e";
const PlayerID = "1";

var FIGHTER_STATS = {
    Strength: [0, 0],
    Agility: [0, 0],
    Energy: [0, 0],
    Vitality: [0, 0],
};

const ITEM_SIZE = 40;
const INVENTORY_SIZE = 8;

function App() {
  const chatWindowRef = useRef();

  const [images, setImages] = useState([]);

  // WebSocket
  const socketUrl = 'ws://localhost:8080/ws';
  const socketOptions = {
    onOpen: (event) => { 
      console.log('WebSocket connected!:', event); 
      //chatWindowRef.current.writeMessageToLog('Connected to server');
      sendAuth(); 
    },
    onError: (event) => {
      console.error('WebSocket error:', event)
      //chatWindowRef.current.writeMessageToLog('Connection error');
    },
    onClose: (event) => {
      console.log('WebSocket closed:', event);
      //chatWindowRef.current.writeMessageToLog('Connection closed');
    },
    onMessage: (event) => processIncomingMessage(event)
  };
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(socketUrl, socketOptions);
  //const sendJsonMessage = () => {}
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
  const [battles, setBattles] = useState([]);
  const [target, setTarget] = useState(0);
  const [damageData, setDamageData] = useState(null);

  const [money, setMoney] = useState(0);
  const [coords, setCoords] = useState({x:0, z:0});
  const [droppedItems, setDroppedItems] = useState([]);
  const [playerDamage, setPlayerDamage] = useState(0);



  useEffect(() => {
    refreshFigterItems();
  }, []);

  async function sendAuth(target) {
    //chatWindowRef.current.writeMessageToLog('Authenticated');
    var response = sendJsonMessage({
      type: "auth",
      data: {
          playerID: parseInt(PlayerID),
          userAddress: UserAddress,
          locationHash: "lorencia_0_0"
      }
    });
  }

  const handleDamageReceived = (npcId, damage) => {
    // Set the damage data, which will trigger the floating damage animation
    setDamageData({ npcId, damage });
  };

  useEffect(() => {
    if (damageData) {
      // Reset damageData after a short delay to prevent continuous triggering
      setTimeout(() => setDamageData(null), 500);
    }
  }, [damageData]);

  // useEffect(() => {
  //   const connectToMetaMask = async () => {
  //     if (window.ethereum) {
  //       try {
  //         // Request account access if needed
  //         await window.ethereum.request({ method: "eth_requestAccounts" });
  //         // Instantiate Web3 with MetaMask provider
  //         const web3Instance = new Web3(window.ethereum);
  //         setWeb3(web3Instance);
  //       } catch (error) {
  //         console.error(error);
  //       }
  //     } else {
  //       console.error("MetaMask not detected");
  //     }
  //   };

  //  connectToMetaMask();
  // }, []);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentTime(prevTime => prevTime + 1);
  //   }, 1000);

  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, []);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     updateHealth();      
  //   }, 5000);

  //   return () => clearInterval(interval);
  // }, [fighter]);

  // useEffect(() => {
    
  //   if (target !== 0) {
  //     sendMove(target);
  //   } else {
  //     setTarget(getRandomAliveNpc());
  //   }
  // }, [target]);

  // useEffect(() => {   
  //   if (target == null) {
  //       setTarget(getRandomAliveNpc());
  //   }
    
  // }, [npcList]);

  function isExcellent(item) {
    if (item.lifeAfterMonsterIncrease == 1 || 
        item.manaAfterMonsterIncrease == 1 || 
        item.excellentDamageProbabilityIncrease == 1 || 
        item.attackSpeedIncrease == 1 ||
        item.damageIncrease == 1 ||

        item.defenseSuccessRateIncrease == 1 ||
        item.goldAfterMonsterIncrease == 1 ||
        item.reflectDamage == 1 ||
        item.maxLifeIncrease == 1 ||
        item.maxManaIncrease == 1 ||
        item.hpRecoveryRateIncrease == 1 ||
        item.mpRecoveryRateIncrease == 1 ||
        item.decreaseDamageRateIncrease == 1
    ) {
      return true;
    }

    return false;
  }

  function generateItemName(item, qty) {
    //console.log("[generateItemName] ", item.name);
    var itemName = item.name;
    
    if (item.itemLevel > 0) {
      itemName += " +"+item.itemLevel;
    }

    if (item.luck) {
      itemName += " +Luck";
    }

    if (item.skill) {
      itemName += " +Skill";
    }

    if (isExcellent(item)) {
      itemName = "Exc "+itemName;
    }

    if (item.additionalDamage > 0) {
      itemName += " +"+item.additionalDamage;
    } 

    if (item.additionalDefense > 0) {
      itemName += " +"+item.additionalDefense;
    } 

    if (item.itemAttributesId == 1) {
      itemName = qty + ' ' + itemName;
    } 

    return itemName;
  }

  function getRandomAliveNpc() {
    const aliveNpcs = npcList.filter((npc) => !npc.isDead);

    if (aliveNpcs.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * aliveNpcs.length);
    return aliveNpcs[randomIndex].id;
  }

  function isNpc(id) {
    for (var i=0; i<npcList.length; i++) {
      if (parseInt(npcList[i].id) == parseInt(id)) {
        return true;
      } else {
        return false;
      }
    } 
  }

  function getNpcIndex(id) {
    for (var i=0; i<npcList.length; i++) {
      if (parseInt(npcList[i].id) == parseInt(id)) {
        return i;
      } 
    } 
  }

  function updateHealth() {
    var health = getHealth(fighter);
    setPlayerHealth(health);
  }

  function getHealth(fighter) {
    //console.log("getHealth fighter", fighter);
    const maxHealth = fighter.maxHealth;
    const lastDmgTimestamp = fighter.lastDmgTimestamp;
    const healthAfterLastDmg = fighter.healthAfterLastDmg;

    const healthRegenRate = fighter.hpRegenerationRate;
    const currentTime = Date.now();

    var health;

    health = parseInt(healthAfterLastDmg) + (Math.floor(((currentTime - lastDmgTimestamp)) / 5) * healthRegenRate);
  
    //console.log("[getHealth] fighter=", fighter.id," isDead=", fighter.isDead," maxHealth=", maxHealth, " lastDmgTimestamp=", lastDmgTimestamp, " healthAfterLastDmg=", healthAfterLastDmg, " healthRegenRate=", healthRegenRate, " health=", health);

    return Math.min(maxHealth, health).toFixed(0);
  }

  function getNpcHealth(npcId) {
    const npc = npcList.find((npc) => npc.id === npcId);

    if (!npc) {
      console.error(`NPC with ID ${npcId} not found in npcList`);
      return 0; // Return a default value or handle it as per your requirement
    }

    return getHealth(npc);
  }

  function updateNpcHealth(npcId, newHealth, lastDmgTimestamp) {
    for (var i = 0; i < npcList.length; i++)
    {
      if (npcList[i].id == npcId)
      {
        setNpcList((prevNpcList) =>
          prevNpcList.map((npc) => {
            if (npc.id === npcId) {
              return {
                ...npc,
                healthAfterLastDmg: newHealth,
                lastDmgTimestamp: lastDmgTimestamp,
              };
            }
            return npc;
          })
        );
      }
    }
  }

  function processDmgDealt(damage, opponent, player, opponentHealth, lastDmgTimestamp)   {
    //console.log("[processDmgDealt]  damage=", damage ," opponentId=", opponent, " player=", player, " opponentHealth=", opponentHealth);

    if (player == PlayerID)
    {

      updateNpcHealth(opponent, opponentHealth, lastDmgTimestamp)
      if (parseInt(opponentHealth) == 0)
      {
        setNpcDead(opponent, true);
      }

      setDamageData({ npcId: opponent, damage });
      
      setDamages(prev => [...prev, damage])
    }
    else
    {
      setPlayerHealth(opponentHealth);

      setPlayerDamage(damage);
      var fit = fighter;
      fighter.lastDmgTimestamp = lastDmgTimestamp;
      fighter.healthAfterLastDmg = opponentHealth;
      setFighter(fighter);
      setHits(prev => [...prev, damage])
    }
  }

  function setNpcDead(npcId, val) {
    setNpcList((prevNpcList) =>
      prevNpcList.map((npc) => {
        if (npc.id === npcId) {
          return {
            ...npc,
            isDead: val
          };
        }
        return npc;
      })
    );
  }

  function isNpcDead(npcId) {
    const npc = npcList.find((npc) => npc.id === npcId);
    if (npc) {
      return npc.isDead;
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
        PlayerID,
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
      PlayerID = playerID;
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
      const result = await myContract.methods.buyItemFromShop(itemId, PlayerID).send({ from: accounts[0] });
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
      const result = await myContract.methods.equipItem(PlayerID, itemId, slot1).send({ from: accounts[0] });
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
      const result = await myContract.methods.equipItem(PlayerID, 0, slot).send({ from: accounts[0] });
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
        type: "get_fighter_items",
        data: {
            fighterId: parseInt(PlayerID),
        }

      });
  }

  function spawnNpc(npc) {
    console.log("Spawn NPC ", npc);
    updateNpcHealth(npc.id, npc.maxHealth, npc.lastDmgTimestamp)
    setNpcDead(npc.id, false);
  }

  function handleDroppedItems(event) {
    // var item = event.Item;
    // var itemHash = event.ItemHash;
    // var qty = event.Qty;

    //chatWindowRef.current.writeMessageToLog('Dropped '+generateItemName(item, qty),  () => { pickupDroppedItem(event) }, 'Pick up');
    console.log("[handleDroppedItems] items=", event.droppedItems)
    setDroppedItems(event.droppedItems);
  }

  function handleItemPickedEvent(item, fighter, qty) {
    if (item.tokenId == 1 && fighter.tokenId == PlayerID) {
      setMoney(money + parseInt(qty));
    } else {
      refreshFigterItems();
    }
    //chatWindowRef.current.writeMessageToLog('Picked '+generateItemName(item, qty));
  }

  function pickupDroppedItem (event) {
    console.log("Pickup ", event.ItemHash, event.Item);

    var response = sendJsonMessage({
      type: "pickup_dropped_item",
      data: {
          itemHash: event.ItemHash,
      }

    });
  }

  function handlePing(fighter) {
    setFighter(fighter);
    console.log("Ping fighter: ", fighter);
  }

  function handleUpdateNpc(npc) {
    setNpcList((prevNpcList) => {
      const index = prevNpcList.findIndex((item) => item.id === npc.id);
      if (index !== -1) {
        // Replace the NPC with the same ID in the list
        return [
          ...prevNpcList.slice(0, index),
          npc,
          ...prevNpcList.slice(index + 1),
        ];
      } else {
        // If the NPC is not found in the list, add it to the list
        return [...prevNpcList, npc];
      }
    });
  }


  // !!!!  
  function processIncomingMessage(event) {
      var msg = JSON.parse(event.data);
      console.log("New message", msg);

      switch (msg.action) {
        case "item_picked":
          handleItemPickedEvent(msg.item, msg.fighter, msg.qty);
        break;

        case "dropped_items":
          handleDroppedItems(msg.eventData);
        break;

        case "spawn_npc":
          handleUpdateNpc(msg.npc);
        break;

        case "fighter_items":
          updateFighterItems(msg.items, msg.attributes, msg.equipment, msg.stats, msg.npcs, msg.fighter, msg.money, msg.droppedItems);
        break;

        case "damage_dealt":
          processDmgDealt(msg.damage, msg.opponent, msg.player, msg.opponentHealth, msg.lastDmgTimestamp)
        break;

        case "ping":
          handlePing(msg.fighter);
        break;

      case "update_npc":
          handleUpdateNpc(msg.npc);
        break;
      }
  }
  // !!!!!!
  function updateFighterItems(items, attributes, equipment, stats, npcs, fighter, money, droppedItems) {
    
    
    var attributes = JSON.parse(attributes);
    var fighter = JSON.parse(fighter);
    var npcs = JSON.parse(npcs);
    var equipment = JSON.parse(equipment);
    
    var newItems = [];
    var itemDefence = 0;
    if (items != '') {
      var itemList = JSON.parse(items);
      for (var i = 0; i < itemList.length; i++) {
        //console.log("updateFighterItems", itemList[i])

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
    setDroppedItems(droppedItems);
    setCoords(fighter.coordinates);

     var stats = JSON.parse(stats);

    //console.log("attributes", attributes)

    setFighter(fighter);
    setPlayerHealth(getHealth(fighter));
    setPlayerStrength(attributes.Strength);
    setPlayerAgility(attributes.Agility);
    setPlayerEnergy(attributes.Energy);
    setPlayerVitality(attributes.Vitality);
    setPlayerMaxStats(stats.maxStatPoints);
    setPlayerExperience(attributes.Experience);
    setPlayerAttackSpeed(attributes.attackSpeed);
    setPlayerAgilityPointsPerSpeed(attributes.agilityPointsPerSpeed);

    //console.log("[updateFighterItems] ", attributes);

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

    setMoney(money);
    
  }

  function isEquiped(tokenId, fighter) {
    //console.log("isEquiped", tokenId, fighter)
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

  function generateBattleReceipt(msg) {
    var winner = msg.winner;

    var battle = JSON.parse(msg.battle);
    var opp1 = battle.Opponent1;
    var opp2 = battle.Opponent2;

    if (isNpc(opp1)) {
      var npcs = npcList;
      npcs[getNpcIndex(opp1)].inBattle = false;
      setNpcList(npcs);
    }

    if (isNpc(opp2)) {
      var npcs = npcList;
      npcs[getNpcIndex(opp2)].inBattle = false;
      setNpcList(npcs);
    }


    console.log("WINNER: ", winner);
    //setIsBattle(false);
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

    // console.log("FIGHTER_STATS ", FIGHTER_STATS);
    // console.log("playerMaxStats ", playerMaxStats);
    // console.log("playerStrength ", playerStrength);
    // console.log("playerAgility ", playerAgility);
    // console.log("playerEnergy ", playerEnergy);
    // console.log("playerVitality ", playerVitality);
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

  function getNpcMaxHealth(npcId) {
    const npc = npcList.find((npc) => npc.id === npcId);
    if (npc) {
      return npc.maxHealth;
    }
    return null;
  }
  
  async function handleMoveSubmission() {
    if (target == 0) return;
    if (isNpcDead(target) && getNpcHealth(target) < getNpcMaxHealth(target)) {
      console.log("NPC Dead, finding new target");
      var newTarget = getRandomAliveNpc();

      if (newTarget != null) {
        setTarget(newTarget);

      } else {
        console.log("No live mobs");
        return;
      }
      
    } else {
      sendMove(target);
    }    
  }

  async function sendMove(target) {
    var response = sendJsonMessage({
      type: "record_move",
      data: {
          opponentID: target,
          playerID: PlayerID,
          skill: 0
      }

    });
  }

  async function moveFighter({x, z}) {
    console.log("Move fighter",x ,z);
    var response = sendJsonMessage({
      type: "move_fighter",
      data: {
          x: x,
          z: z,
      }

    });
  }

  const handleShopButtonClick = () => {
    setIsShopOpen(true);
  }; 


  return (

    // <DndProvider backend={HTML5Backend}>
    // <div className="App" style={appStyle}>
    //  <div style={{height: 800}}>
        <SceneContextProvider 
          fighter={fighter} 
          moveFighter={moveFighter} 
          npcList={npcList} 
          droppedItems={droppedItems} 
          damageData={damageData} 
          playerDamage={playerDamage
        >
          <Scene/>
        </SceneContextProvider>
    //  </div>
    //   <ShopModal
    //     isOpen={isShopOpen}
    //     onClose={() => { setIsShopOpen(false); setAppStyle({}); }}
    //     onClick={buyShopItem}
    //   />


    //   {/* Top bar */}
    //   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '50px', backgroundColor: '#333', color: '#fff', padding: '0 20px' }}>
    //     <div style={{ display: 'flex', alignItems: 'center' }}>
    //       <img src="logo.png" alt="Logo" style={{ height: '30px', marginRight: '10px' }} />
    //       <h3>My Fighting Game</h3>
    //     </div>
    //     <div>
    //       <button onClick={createFighter}>New Fighter</button>
    //       <button style={{ marginRight: '10px' }}>Settings</button>
    //       <button>Logout</button>
    //     </div>
    //   </div>

    //   {/* Main content */}
    //   <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>






    //     {/* Left section */}
    //     <div style={{ width: '30%', padding: '0 10px' }}>
    //       <img src="opponent.png" alt="Opponent" style={{ width: '100%', marginBottom: '10px' }} />
    //       <div style={{ backgroundColor: '#ddd', padding: '10px', borderRadius: '5px' }}>
    //         <NPC target={target} setTarget={setTarget} damageData={damageData} npcs={npcList} currentTime={currentTime} getNpcHealth={getNpcHealth}/>
    //       </div>
    //       <div> 
    //         <DamageTicker color="red" damages={hits} />

    //       </div>
    //       <div>Money: {money}</div>
    //       <div>
              
    //           <Inventory items={inventoryItems} setItems={setInventoryItems} equipItem={equipItem} generateItemName={generateItemName}/>

            
              
    //       </div>
    //     </div>









    //     {/* Middle section */}
    //     <div style={{ width: '40%', padding: '0 10px' }}>
    //       <h4>Game Chat</h4>
    //       <div>

    //         <button onClick={() => { setIsShopOpen(true); setAppStyle({ pointerEvents: "none" }); }}>Shop</button>

    //         <button onClick={refreshFigterItems}>Refresh</button>
    //       </div>
           

    //       <div style={{ backgroundColor: '#ddd', padding: '10px', borderRadius: '5px', height: '400px', overflowY: 'auto' }}>
    //         <div className="button-container">
    //           <LoadingButton onClick={handleMoveSubmission} target={target} playerSpeed={playerAttackSpeed*10 + playerAgility/playerAgilityPointsPerSpeed}>Submit Move</LoadingButton>
    //         </div>
    //         <h4>Move Fighter ({coords.x},{coords.y})</h4>
    //         <MoveFighterForm moveFighter={moveFighter} />
    //       </div>

    //       <div>
    //         <ChatWindow ref={chatWindowRef} />
    //       </div>
    //     </div>








    //     {/* Right section */}
    //     <div style={{ width: '30%', padding: '0 10px' }}>
           


    //       <h4>{PlayerID} [{playerLevel}]</h4>
    //       <img src="my-fighter.png" alt="My Fighter" style={{ width: '100%', marginBottom: '10px' }} />
           
            
    //       <div style={{ backgroundColor: '#ddd', padding: '10px', borderRadius: '5px' }}>
    //         <h5>Stats</h5>
    //         <div><Fighter currentHealth={playerHealth} health={playerMaxHP} color="green" /></div>
    //         <div>Exp: {playerExperience}</div>
    //         <div>
    //           <CharacterEquipment equipment={equipment} unequipItem={unequipItem}/>
    //         </div>
    //         <div style={{ display: 'flex', flexDirection: 'row' }}>
    //           <div style={{ flex: 1, padding: '10px', backgroundColor: '#f0f0f0' }}>
    //             <Stat
    //               name="Strength"
    //               value={attributes.Strength}
    //               onChange={handleAttributeChange}
    //               availablePoints={availablePoints}
    //             />
    //             <Stat
    //               name="Agility"
    //               value={attributes.Agility}
    //               onChange={handleAttributeChange}
    //               availablePoints={availablePoints}
    //             />
    //             <Stat
    //               name="Energy"
    //               value={attributes.Energy}
    //               onChange={handleAttributeChange}
    //               availablePoints={availablePoints}
    //             />
    //             <Stat
    //               name="Vitality"
    //               value={attributes.Vitality}
    //               onChange={handleAttributeChange}
    //               availablePoints={availablePoints}
    //             />
    //             <div>
    //               Available points: {availablePoints}{" "}
    //               <button onClick={resetAttributes}>Reset</button>
    //             </div>
    //             <button
    //               onClick={updateStats}
    //             >
    //               Submit Stats
    //             </button>
    //           </div>
    //           <div style={{ flex: 1, padding: '10px', backgroundColor: '#d9d9d9' }}>
    //               <p>Defence: {parseInt(playerAgility/4+playerItemsDefence)}</p>
    //               <p>Attack: {parseInt(playerStrength/4 + playerEnergy/4)}</p>
    //               <p>Speed: {parseInt(playerAttackSpeed + playerAgility/playerAgilityPointsPerSpeed)}</p>
    //           </div>
    //         </div>

    //       </div>
          
    //     </div>
    //   </div>










    //   {/* Bottom bar */}
    //   <div style={{ backgroundColor: '#333', color: '#fff', padding: '10px', marginTop: '50px' }}>
    //     <button style={{ marginRight: '10px' }}>Fight Again</button>
    //     <button>Choose Opponent</button>
    //   </div>
  //   </div>
  // </DndProvider>
  );
}

export default App;
