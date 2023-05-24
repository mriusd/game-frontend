import { createContext, useEffect, useState, useRef, useContext, ReactNode } from "react"
import { useEventCloud } from "EventCloudContext"
import type { Fighter } from "interfaces/fighter.interface"
import type { Coordinate } from "interfaces/coordinate.interface"
import type { ISceneContext } from "interfaces/sceneContext.interface"
import type { OccupiedCoordinate } from "interfaces/occupied.interface"
import type { ItemDroppedEvent } from "interfaces/item.interface"
import type { Skill } from "interfaces/skill.interface"
import { Group, Mesh } from "three"
import type { SceneData, ObjectData } from "interfaces/sceneData.interface"
import { getMeshDimensions } from "Scene/utils/getMeshDimensions"


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
        target: eventTarget,
        setTarget: setEventTarget,
        refreshFighterItems,
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
            // Send to server if we used skill, otherwise just set target to object
            setEventTarget(target.id)
            _setTarget({ target, skill })
            return
        }
        _setTarget(null)
    }
    const [ itemTarget, setItemTarget ] = useState<ItemDroppedEvent | null>(null)

    const [ hoveredItems, _setHoveredItems ] = useState<Fighter[]>([])
    const setHoveredItems = (item: Fighter, action: 'add' | 'remove') => {
        _setHoveredItems(state => {
            const newState = [...state]
            const itemIndex = newState.findIndex((hoveredItem: Fighter) => hoveredItem.id === item.id)
            if (action === 'add') {
                if (itemIndex === -1) {
                    newState.push(item)
                    return newState
                }
                return state
            }
            if (itemIndex === -1) { return state }
            return [...newState.slice(0, itemIndex), ...newState.slice(itemIndex + 1)]
        })
    }

    const worldSize = useRef<number>(360)
    const chunkSize = useRef<number>(60)
    const chunksPerAxis = useRef<number>(worldSize.current / chunkSize.current)

    const NpcList = useRef<Fighter[]>([])

    // Store npc refs, to have acces there position, boinding box etc
    const sceneData = useRef<SceneData>({})
    const setSceneObject = (id: string, object: Mesh | Group, action: 'add' | 'remove') => {
        if (action === 'add') {
            sceneData.current = {
                ...sceneData.current,
                [id]: {
                    id,
                    ref: object,
                    dimensions: getMeshDimensions(object)
                }
            }
            return
        }
        delete sceneData.current[id]
    }
    const getSceneObject = (id: string): ObjectData | null => {
        return sceneData.current[id] || null
    }

    const DroppedItems = useRef<any[]>([])
    const [isLoaded, setIsLoaded] = useState<boolean>(false)
    useEffect(() => {
        if (isLoaded) { return }
        setIsLoaded(
            !!fighter && !!worldSize.current
        )
    }, [fighter, worldSize.current])

    const VisibleDecor = useRef<any[]>([])

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

    useEffect(() => {
        const html = document.querySelector(".scene")
        if (!html) { console.error('[SceneContext]: Html Element not found') }
        setHTML(html as HTMLElement)
    }, [])

    const value = {
        html,

        worldSize,
        chunkSize,
        chunksPerAxis,

        npcList,
        setSceneObject, getSceneObject,
        NpcList,
        fighter,
        moveFighter,
        isLoaded,
        hoveredItems, setHoveredItems,

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
        VisibleDecor,

        target, setTarget,
        itemTarget, setItemTarget
    }

    return (
        <SceneContext.Provider value={value}>
            {children}
        </SceneContext.Provider>
    )
}

export default SceneContextProvider