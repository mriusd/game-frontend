// @ts-nocheck

import { createContext, useContext, useState, useEffect } from 'react';
import useWebSocket from 'react-use-websocket';
import type { EventCloud } from 'interfaces/eventCloud.interface';

import type { Fighter } from 'interfaces/fighter.interface';
import type { FighterEquipment } from 'interfaces/fighterEquipment.interface';
import type { ItemAttributes, ItemDroppedEvent } from 'interfaces/item.interface'
import type { Backpack, BackpackSlot } from './models/Backpack';
// @ts-expect-error
import { common } from 'ethereumjs-util';  




const EventCloudContext = createContext({});

export const useEventCloud = (): EventCloud => {
  return useContext(EventCloudContext) as EventCloud;
};

export const EventCloudProvider = ({ children }) => {
  const PlayerID = 1;
  const UserAddress = "0xC1FcD8e0e55499D25811FAEFd0418FEabd5e4E1e";

  const [events, setEvents] = useState([]);
  const [latestDamageEvent, setLatestDamageEvent] = useState(null);

  const [fighter, setFighter]           = useState<Fighter | null>(null);
  const [droppedItems, setDroppedItems] = useState<Record<common.Hash, ItemDroppedEvent>>({});
  const [npcList, setNpcList]           = useState<Fighter[]>([]);
  const [equipment, setEquipment]       = useState<FighterEquipment | null>(null);
  const [backpack, setBackpack]         = useState<Backpack | null>(null);
 
  const [money, setMoney] = useState(0);
  const [target, setTarget] = useState(0);

  const [town, setTown] = useState("lorencia")

  // WebSocket
  const socketUrl = process.env.REACT_APP_WS_URL; // ws://149.100.159.50:8080/ws
  const socketOptions = {
    onOpen: (event) => { 
      console.log('WebSocket connected!:', event); 
      // @ts-expect-error
      sendAuth(); 
    },
    onError: (event) => {
      console.error('WebSocket error:', event)
    },
    onClose: (event) => {
      console.log('WebSocket closed:', event);
    },
    onMessage: (event) => processIncomingMessage(event)
  };
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(socketUrl, socketOptions);

  // Trigger Backend
  async function sendAuth(target) {
    var response = sendJsonMessage({
      type: "auth",
      data: {
        // @ts-expect-error
          playerID: parseInt(PlayerID),
          userAddress: UserAddress,
          locationHash: "lorencia_0_0"
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

  async function submitAttack() {
    console.log("Submit attack");
    var response = sendJsonMessage({
      type: "submit_attack",
      data: {
          opponentID: target.toString(),
          playerID: PlayerID.toString(),
          skill: 4,
          direction: {dx: 0, dy: 1}
      }

    });
  }

  function pickupDroppedItem (event) {
    console.log("Pickup ", event.itemHash, event.item);

    var response = sendJsonMessage({
      type: "pickup_dropped_item",
      data: {
          itemHash: event.itemHash,
      }

    });
  }

  function refreshFighterItems() {
    var response = sendJsonMessage({
        type: "get_fighter_items",
        data: {
            fighterId: parseInt(PlayerID),
        }

      });
  }

  

  


  // Event processing logic here  
  function processIncomingMessage(event) {
      var msg = JSON.parse(event.data);
      console.log("New message", msg);

      switch (msg.action) {
        case "item_picked":
          handleItemPickedEvent(msg.item, msg.fighter, msg.qty);
        break;

        case "dropped_items":
          handleDroppedItems(msg.droppedItems);
        break;

        case "spawn_npc":
          handleUpdateNpc(msg.npc);
        break;

        case "fighter_items":
          handleFighterItems(msg.items, msg.attributes, msg.equipment, msg.stats, msg.npcs, msg.fighter, msg.money, msg.droppedItems, msg.backpack);
        break;

        case "damage_dealt":
          handleDamage(msg.damage, msg.opponent, msg.player, msg.opponentHealth, msg.lastDmgTimestamp, msg.fighter)
        break;

        case "ping":
          handlePing(msg.fighter);
        break;

      case "update_npc":
          handleUpdateNpc(msg.npc);
        break;
      }
  }

  function handlePing(fighter) {
    setFighter(fighter);
    console.log("Ping fighter: ", fighter);
  }

  function handleDamage(damage, opponent, player, opponentHealth, lastDmgTimestamp, opponentFighterObj) {
    //console.log("[handleDamage]  damage=", damage ," opponentId=", opponent, " player=", player, " opponentHealth=", opponentHealth);

    if (player == PlayerID) {
      handleUpdateNpc(opponentFighterObj);
      
      // Use addDamageEvent from EventCloudContext
      //console.log('Calling addDamageEvent');
      addDamageEvent({ npcId: opponent, damage });

    } else {

      setPlayerDamageData(damage);
      setFighter(fighter);
    }
  }

  function handleFighterItems(items, attributes, equipment, stats, npcs, fighter, money, droppedItems, backpack) {
    
    
    var attributes = JSON.parse(attributes);
    var fighter = JSON.parse(fighter);
    var npcs = JSON.parse(npcs);
    var equipment = JSON.parse(equipment);
    
    var newItems = [];
    var itemDefence = 0;
    

    setEquipment(equipment);
    setNpcList(npcs);    
    setDroppedItems(droppedItems);
    setBackpack(backpack);



     var stats = JSON.parse(stats);

    console.log("backpack", backpack);

    setFighter(fighter);
    
    //console.log("[updateFighterItems] ", attributes);

    //setAvailablePoints(parseInt(stats.maxStatPoints) - parseInt(stats.totalStatPoints));

    setMoney(money);
    
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

  function handleDroppedItems(droppedItems) {
    console.log("[handleDroppedItems] items=", droppedItems)
    setDroppedItems(droppedItems);
  }

  function handleItemPickedEvent(item, fighter, qty) {
    if (item.tokenId == 1 && fighter.tokenId == PlayerID) {
      setMoney(money + parseInt(qty));
    } else {
      refreshFighterItems();
    }
  }



  // Helpers
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





  // General Event Handlers
  useEffect(() => {
    // Listen for events from your backend server and update the events state
  }, []);

  const addDamageEvent = (damageEvent) => {
    setEvents((prevEvents) => [...prevEvents, { type: 'damage', ...damageEvent }]);
    setLatestDamageEvent({ type: 'damage', ...damageEvent });
  };

  const removeEvent = (event) => {
    setEvents((prevEvents) => prevEvents.filter((e) => e !== event));
  };

  return (
    <EventCloudContext.Provider value={
      { 
        PlayerID, 
        events, 
        addDamageEvent, 
        setEvents, 
        removeEvent, 
        fighter, 
        npcList, 
        droppedItems, 
        money, 
        equipment, 
        moveFighter, 
        submitAttack,
        target,
        setTarget,
        refreshFighterItems,
        generateItemName,
        isExcellent,
        pickupDroppedItem,
        backpack
      }}>
      {children}
    </EventCloudContext.Provider>
  );
};

