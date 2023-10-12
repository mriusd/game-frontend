import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { EventCloudProvider } from 'EventCloud/EventCloud';

import Scene from './Scene/Scene';

import Auth from 'Auth/Auth';
import Chat from 'Scene/UserInterface2D/Chat/Chat';

import { useFighter } from 'Scene/Fighter/useFighter';


// Placeholder with commands for game is located:
// Scene/UserInterface2D/CommandLine/CommandsPlaceholder.tsx

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
	const fighter = useFighter(state => state.fighter)

	return (
		<EventCloudProvider>
			<DndProvider backend={HTML5Backend}>
				<Auth />
				<Chat />
				{fighter && <Scene />}
			</DndProvider>
		</EventCloudProvider>
	);

}

export default App;
