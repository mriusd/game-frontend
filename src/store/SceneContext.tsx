import { createContext, useEffect, useState, useRef, useContext, ReactNode } from "react"
import { useEventCloud } from "EventCloudContext"
import type { Fighter } from "interfaces/fighter.interface"
import type { Coordinate } from "interfaces/coordinate.interface"
import type { ISceneContext } from "interfaces/sceneContext.interface"
import type { OccupiedCoordinate } from "interfaces/occupied.interface"
import type { ItemDroppedEvent } from "interfaces/item.interface"
import { Direction } from "interfaces/direction.interface"
import type { Skill } from "interfaces/skill.interface"


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
        target: eventTarget,
        setTarget: setEventTarget,
        refreshFighterItems
    } = useEventCloud()

    const [isMoving, setIsMoving] = useState<boolean>(false)
    const [html, setHTML] = useState<HTMLElement | null>(null)
    const [currentMatrixCoordinate, setCurrentMatrixCoordinate] = useState<Coordinate | null>(null)
    const [currentWorldCoordinate, setCurrentWorldCoordinate] = useState<Coordinate | null>(null)
    const [nextMatrixCoordinate, setNextMatrixCoordinate] = useState<Coordinate | null>(null)
    const [nextWorldCoordinate, setNextWorldCoordinate] = useState<Coordinate | null>(null)

    const [direction, setDirection] = useState<number>(0)
    const [focusedMatrixCoordinate, setFocusedMatrixCoordinate] = useState<Coordinate | null>(null)
    const [focusedWorldCoordinate, setFocusedWorldCoordinate] = useState<Coordinate | null>(null)
    const [pointerWorldCoordinate, setPointerWorldCoordinate] = useState<Coordinate | null>(null)

    const [occupiedCoords, _setOccupedCoords] = useState<OccupiedCoordinate[]>([])
    function setOccupedCoords(item: OccupiedCoordinate, action: 'add' | 'remove') {
        if (!item.coordinates || !item.id) { return console.warn("[SceneContextProvider] setOccupedCoords: invalid item") }
        _setOccupedCoords((state: OccupiedCoordinate[]) => {
            const newState = [...state]
            const itemIndex = newState.findIndex((occupiedCoord: OccupiedCoordinate) => occupiedCoord.id === item.id)
            
            if (action === 'remove') {
                if (itemIndex === -1) { return newState }
                return [...newState.slice(0, itemIndex), ...newState.slice(itemIndex + 1)]
            }
            
            if (itemIndex === -1) {
                newState.push(item)
                return newState
            }
            return [...newState.slice(0, itemIndex), ...newState.slice(itemIndex + 1), item]
        })
    }

    const [ target, _setTarget ] = useState<{ target: Fighter, skill: Skill } | null>(null)
    const setTarget = (target: Fighter | null, skill: Skill | null) => {
        if (target && skill) {
            setEventTarget(target.id)
            _setTarget({ target, skill })
            return
        }
        _setTarget(null)
    }

    const worldSize = useRef<number>(12)
    const NpcList = useRef<Fighter[]>([])
    const DroppedItems = useRef<any[]>([])
    const [isLoaded, setIsLoaded] = useState<boolean>(false)
    useEffect(() => {
        if (isLoaded) { return }
        setIsLoaded(
            !!fighter && !!worldSize.current
        )
    }, [fighter, worldSize.current])

    // Detect npc updates and add them to NpcList
    useEffect(() => {
        if (!npcList?.length) { return }
        // console.log("[SceneContextProvider] NPC list updated: ", npcList)
        npcList.forEach((serverNpc: Fighter) => {
            // const localeNpcIndex = NpcList.current.findIndex(localeNpc => localeNpc.id === serverNpc.id)
            // if (localeNpcIndex !== -1) {
            //     NpcList.current[localeNpcIndex] = { ...serverNpc }
            //     return
            // }
            // NpcList.current.push(serverNpc)
            if (serverNpc.isDead) {
                setOccupedCoords({
                    id: serverNpc.id,
                    coordinates: serverNpc.coordinates
                }, 'remove')
                return
            }
            setOccupedCoords({
                id: serverNpc.id,
                coordinates: serverNpc.coordinates
            }, 'add')
        })

        NpcList.current = [...npcList]
    }, [npcList]);

    // Dropped Items
    useEffect(() => {
        console.log('Dropped Items updated,', Object.values(droppedItems))
        DroppedItems.current = Object.values(droppedItems);
    }, [droppedItems]);

    // useEffect(() => {
    //     // Initiate hit animation for mobs
    //     console.log("[SceneContextProvider] Damage data is the last damages to an NPC {npcId, damage}: ", damageData)
    // }, [ damageData ]);

    // useEffect(() => {
    //     // Initiate hit animation for player
    //     console.log("[SceneContextProvider] Last damage received by player (value is an int): ", playerDamageData)
    // }, [ playerDamageData ]);

    useEffect(() => {
        const html = document.querySelector(".scene")
        if (!html) { console.error('[SceneContext]: Html Element not found') }
        setHTML(html as HTMLElement)
    }, [])

    const value = {
        html,
        worldSize,
        npcList,
        NpcList,
        fighter,
        moveFighter,
        isLoaded,

        isMoving, setIsMoving,

        currentMatrixCoordinate, setCurrentMatrixCoordinate,
        currentWorldCoordinate, setCurrentWorldCoordinate,
        nextMatrixCoordinate, setNextMatrixCoordinate,
        nextWorldCoordinate, setNextWorldCoordinate,

        controller: {
            direction, setDirection,
            focusedMatrixCoordinate, setFocusedMatrixCoordinate,
            focusedWorldCoordinate, setFocusedWorldCoordinate,
            pointerWorldCoordinate, setPointerWorldCoordinate
        },

        occupiedCoords, setOccupedCoords,

        DroppedItems,

        target, setTarget
    }

    return (
        <SceneContext.Provider value={value}>
            {children}
        </SceneContext.Provider>
    )
}

export default SceneContextProvider