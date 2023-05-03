import { createContext, useEffect, useState, useRef } from "react"

export const SceneContext = createContext()

const SceneContextProvider = ({ children, fighter, moveFighter, npcList, droppedItems, damageData, playerDamageData }) => {
    const worldSize = useRef(12)

    const NpcList = useRef([])
    const Fighter = useRef(null)

    const [isLoaded, setIsLoaded] = useState(false)
    useEffect(() => {
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
        npcList.forEach(serverNpc => {
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
        isLoaded
    }

    return (
        <SceneContext.Provider value={value}>
            {children}
        </SceneContext.Provider>
    )
}

export default SceneContextProvider