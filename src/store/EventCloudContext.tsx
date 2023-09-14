import React from 'react';
import useWebSocket from 'react-use-websocket';

import { useEvents } from 'store/EventStore';
import { useFighter } from 'Scene/Fighter/useFighter';
import { useNpc } from 'Scene/Npc/useNpc';


const EventCloudContext = React.createContext({});
const socketUrl = process.env.REACT_APP_WS_URL; // ws://149.100.159.50:8080/ws
export const EventCloudProvider = ({ children }) => {
	const setNpcList = useNpc(state => state.setNpcList)
	const [setFighter] = useFighter(state => [state.setFighter])
	const [addEvent, setUserFighters] = useEvents(state => [state.addEvent, state.setUserFighters])
	const [setDroppedItems] = useEvents(state => [state.setDroppedItems]);
	const [updateBackpack, updateEquipment] = useEvents(state => [state.updateBackpack, state.updateEquipment]);
	const [refreshFighterItems] = useEvents(state => [state.refreshFighterItems])
	const [setChatLog] = useEvents(state => [state.setChatLog])
	const [setPlayerList] = useEvents(state => [state.setPlayerList])
	const [setMapObjects] = useEvents(state => [state.setMapObjects])

	const processIncomingMessage = React.useCallback((event: any) => {
		const msg = JSON.parse(event.data);

		switch (msg.action) {
			case "item_picked":
				handleItemPickedEvent(msg.item, msg.fighter, msg.qty);
				break;

			case "dropped_items":
				handleDroppedItems(msg.droppedItems);
				break;

			// case "spawn_npc":
			//   handleUpdateNpc(msg.npc);
			// break;

			case "fighter_items":
				handleFighterItems(msg.items, msg.attributes, msg.equipment, msg.stats, msg.npcs, msg.fighter, msg.money, msg.droppedItems, msg.backpack);
				break;

			case "damage_dealt":
				//console.log("[damage_dealt]  msg=", msg);
				handleDamage(msg.damage, msg.opponent, msg.player, msg.opponentHealth, msg.lastDmgTimestamp, msg.playerFighter, msg.opponentFighter, msg.type, msg.skill)
				break;

			case "ping":
				handlePing(msg.fighter, msg.mapObjects, msg.npcs, msg.players);
				break;

			// case "update_npc":
			//   handleUpdateNpc(msg.npc);
			// break;

			case "backpack_update":
				handleUpdateBackpack(msg.backpack, msg.equipment);
				break;

			case "user_fighters":
				handleUserFighters(msg.fighters);
				break;

			case "fire_skill":
				handleFireSkill(msg.fighter, msg.skill);
				break;

			case "chat_message":
				handleChatMessage(msg.author, msg.msg, msg.msgType);
				break;
		}

		// Event Processing Logic  
		function handleItemPickedEvent(item, fighter, qty) {
			refreshFighterItems();
		}

		function handleDroppedItems(droppedItems) {
			setDroppedItems(droppedItems);
		}

		function handleFighterItems(items, attributes, equipment, stats, npcs, fighter, money, droppedItems, backpack) {
			setDroppedItems(droppedItems)
			updateBackpack(backpack)
			updateEquipment(equipment)
			setFighter(fighter)
		}

		function handleDamage(damage, opponent, player, opponentHealth, lastDmgTimestamp, playerFighter, opponentFighter, dmgType, skill) {
			addEvent({ type: 'damage', npcId: opponent, damage, dmgType, skill, playerFighter, opponentFighter });
		}

		function handlePing(fighter, mapObjects, npcs, players) {
			setFighter(fighter);
			setMapObjects(mapObjects);
			setNpcList(npcs);
			setPlayerList(players);
		}

		function handleUpdateBackpack(newBackpack, newEquipment) {
			updateBackpack(newBackpack);
			updateEquipment(newEquipment)
		}

		function handleUserFighters(userFighters) { 
			setUserFighters(userFighters) 
		}


		function handleFireSkill(fighter, skill) {
			addEvent({ type: 'skill', fighter, skill });
		}

		function handleChatMessage(author, msg, msgType) {
			setChatLog({ author, msg, msgType })
		}
	}, [])

	// WebSocket Initialization
	const socketOptions = React.useMemo(() => ({
		onOpen: (event) => {},
		onError: (event) => {console.error('WebSocket error:', event)},
		onClose: (event) => {},
		onMessage: (event) => processIncomingMessage(event)
	}), [processIncomingMessage])
	const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(socketUrl, socketOptions);
	React.useLayoutEffect(() => void useEvents.getState().init(sendJsonMessage), [])

	return <EventCloudContext.Provider value={{}}>{children}</EventCloudContext.Provider>
};

