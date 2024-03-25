import React from 'react';

import type { Fighter } from 'interfaces/fighter.interface';

import { useCloud } from 'EventCloud/useCloud';
import { useFighter } from 'Scene/Fighter/useFighter';
import { useNpc } from 'Scene/Npc/useNpc';
import { useDroppedItem } from 'Scene/DroppedItem/useDroppedItem';
import { useOtherFighter } from 'Scene/Fighter/OtherFighter/useOtherFighter';

import { useWorkerWebSocket } from './hooks/useWorkerWebSocket';

const EventCloudContext = React.createContext({});
const socketUrl = process.env.REACT_APP_WS_URL; // ws://149.100.159.50:8080/ws
export const EventCloudProvider = React.memo(function EventCloudProvider({ children }: any) {	
	const [setNpcList] = useNpc(state => [state.setNpcList])
	const [setFighter] = useFighter(state => [state.setFighter])
	const [addEvent, setUserFighters] = useCloud(state => [state.addEvent, state.setUserFighters])
	const [setDroppedItems] = useDroppedItem(state => [state.setDroppedItems]);
	const [updateBackpack, updateEquipment] = useCloud(state => [state.updateBackpack, state.updateEquipment]);
	const [updateVault] = useCloud(state => [state.updateVault])
	const [refreshFighterItems] = useCloud(state => [state.refreshFighterItems])
	const [setChatLog] = useCloud(state => [state.setChatLog])
	const [setPlayerList] = useCloud(state => [state.setPlayerList])
	const [setMapObjects] = useCloud(state => [state.setMapObjects])
	const [setOtherFighter] = useOtherFighter(state => [state.setOtherFighterList])

	const processIncomingMessage = React.useCallback((event: any) => {
		const msg = JSON.parse(event.data)

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

			case "vault_update":
				handleUpdateVault(msg.vault);
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

		function handlePing(fighter, mapObjects, npcs, players: Fighter[]) {
			setFighter(fighter);
			setMapObjects(mapObjects);
			setNpcList(npcs);
			setPlayerList(players);
			setOtherFighter(players.filter(_ => _.id !== useFighter.getState().fighter.id))
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

		function handleUpdateVault(vault) {
			updateVault(vault)
		}
	}, [])

	const socketOptions = React.useMemo(() => ({
		onMessage: (event) => processIncomingMessage(event)
	}), [processIncomingMessage])
	const { sendJsonMessage, readyState } = useWorkerWebSocket(socketUrl, socketOptions)
	React.useLayoutEffect(() => {
		if (readyState) {
			useCloud.getState().init(sendJsonMessage)
		}
	}, [readyState])

	return <EventCloudContext.Provider value={{}}>{children}</EventCloudContext.Provider>
});

