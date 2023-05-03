import { createContext, useEffect, useState, useRef, useContext, ReactNode } from "react"
import { useEventCloud } from "EventCloudContext"
import type { Fighter } from "interfaces/fighter.interface"
import type { Coordinate } from "interfaces/coordinate.interface"
import type { ISceneContext } from "interfaces/sceneContext.interface"
import type { OccupiedCoordinate } from "interfaces/occupied.interface"


export const SceneContext = createContext({})

export const useSceneContext = (): ISceneContext => {
    const context = useContext(SceneContext) as ISceneContext
    if (!context) {
        throw new Error(`useSceneContext must be used within a SceneContextProvider`)
    }
    return context
}

interface Props { children: ReactNode | ReactNode[] }
const SceneContextProvider = ({ children }: Props) => {
    const { 
        PlayerID, 
        addDamageEvent, 
        fighter, 
        npcList, 
        droppedItems, 
        money, 
        equipment,
        moveFighter,
        submitAttack,
        target,
        setTarget,
        refreshFighterItems 
    } = useEventCloud()
    
    const [ currentMatrixCoordinate, setCurrentMatrixCoordinate ] = useState<Coordinate | null>(null)
    const [ currentWorldCoordinate, setCurrentWorldCoordinate ] = useState<Coordinate | null>(null)

    const [direction, setDirection] = useState<number>(0)
    const [focusedMatrixCoordinate, setFocusedMatrixCoordinate] = useState<Coordinate | null>(null)
    const [focusedWorldCoordinate, setFocusedWorldCoordinate] = useState<Coordinate | null>(null)
    const [pointerWorldCoordinate, setPointerWorldCoordinate] = useState<Coordinate | null>(null)

    const [occupiedCoords, _setOccupedCoords] = useState<OccupiedCoordinate[]>([])
    function setOccupedCoords(item: OccupiedCoordinate) {
        if (!item.coordinates || !item.id) { return console.warn("[SceneContextProvider] setOccupedCoords: invalid item") }
        _setOccupedCoords((state: OccupiedCoordinate[]) => {
            const newState = [ ...state ]
            const itemIndex = newState.findIndex((occupiedCoord: OccupiedCoordinate) => occupiedCoord.id === item.id)
            if (itemIndex === -1) {
                newState.push(item)
                return newState
            }
            return [...newState.slice(0, itemIndex), ...newState.slice(itemIndex+1), item]
        })
    }

    const worldSize = useRef<number>(13) 
    const NpcList = useRef<Fighter[]>([])
    const Fighter = useRef<Fighter | null>(null)

    const [isLoaded, setIsLoaded] = useState<boolean>(false)
    useEffect(() => {
        console.log(Fighter.current, worldSize.current)
        if (isLoaded) { return }
        setIsLoaded(
            !!Fighter.current && !!worldSize.current
        )
    }, [Fighter.current, worldSize.current])


    useEffect(() => {
        if (!fighter) { return }
        Fighter.current = fighter
    }, [fighter]);

    // Detect npc updates and add them to NpcList
    // TODO: add npc removal
    useEffect(() => {
        if (!npcList?.length) { return }
        console.log("[SceneContextProvider] NPC list updated: ", npcList)
        npcList.forEach((serverNpc: Fighter) => {
            const localeNpcIndex = NpcList.current.findIndex(localeNpc => localeNpc.id === serverNpc.id)
            if (localeNpcIndex !== -1) {
                NpcList.current[localeNpcIndex] = { ...serverNpc }
                return
            }
            NpcList.current.push(serverNpc)
        })
    }, [npcList]);


    // Dropped Items
    const prevDroppedItemsRef = useRef();
    useEffect(() => {
        if (!droppedItems?.length) { return }
        // Store the previous droppedItems in a ref
        prevDroppedItemsRef.current = droppedItems;
    }, [droppedItems]);

    useEffect(() => {
        if (!droppedItems?.length) { return }
        const prevDroppedItems = prevDroppedItemsRef.current;
        if (prevDroppedItems) {
            const addedItems = Object.keys(droppedItems).filter(
                (key) => !(key in prevDroppedItems)
            ).map(key => droppedItems[key]);

            const removedItems = Object.keys(prevDroppedItems).filter(
                (key) => !(key in droppedItems)
            ).map(key => prevDroppedItems[key]);

            if (addedItems.length > 0) {
                // These items must be rendered on the floor
                console.log('[SceneContextProvider] Added items:', addedItems);
            }

            if (removedItems.length > 0) {
                // These items should disappear from the floor
                console.log('[SceneContextProvider] Removed items:', removedItems);
            }
        }
        console.log('[SceneContextProvider] Dropped Items updated:', droppedItems);
    }, [droppedItems]);

    // useEffect(() => {
    //     // Initiate hit animation for mobs
    //     console.log("[SceneContextProvider] Damage data is the last damages to an NPC {npcId, damage}: ", damageData)
    // }, [ damageData ]);

    // useEffect(() => {
    //     // Initiate hit animation for player
    //     console.log("[SceneContextProvider] Last damage received by player (value is an int): ", playerDamageData)
    // }, [ playerDamageData ]);

    const value = {
        worldSize,
        NpcList,
        Fighter,
        moveFighter,
        isLoaded,

        currentMatrixCoordinate, setCurrentMatrixCoordinate,
        currentWorldCoordinate, setCurrentWorldCoordinate,

        controller: {
            direction, setDirection,
            focusedMatrixCoordinate, setFocusedMatrixCoordinate,
            focusedWorldCoordinate, setFocusedWorldCoordinate,
            pointerWorldCoordinate, setPointerWorldCoordinate
        },

        occupiedCoords, setOccupedCoords
    }

    return (
        <SceneContext.Provider value={value}>
            { children }
        </SceneContext.Provider>
    )
}

export default SceneContextProvider