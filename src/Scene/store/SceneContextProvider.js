import { createContext, useEffect, useState, useRef } from "react"
import { useCoordinatesSystem } from "../hooks/useCoordinatesSystem"
import { getNextPosition } from "../utils/getNextPosition"

import { CHARACTER_SETTINGS } from "../config"
import { matrixCoordToWorld } from "../utils/matrixCoordToWorld"
import { detectObjectChanges } from "../utils/detectObjectChanges"

import Tween from "../utils/tween/tween"

export const SceneContext = createContext()

const SceneContextProvider = ({ children, fighter, moveFighter, npcList, droppedItems, damageData, playerDamageData }) => {
    const [ matrix, setMatrix, position, setPosition ] = useCoordinatesSystem() //position in matrix & world
    const [ targetPosition, setTargetPosition ] = useState()
    const [ isFighterMoving, setIsFighterMoving ] = useState(false)
    const [ direction, setDirection ] = useState(0)
    const [ spawned, setSpawned ] = useState(false)
    const NpcList = useRef([])
    

    const getMatrixPosition = () => {
        if (!matrix.size) { return }
        const pos = matrix.value.find(_ => _.eq)
        return { x: pos.x, z: pos.z }
    }
    const setMatrixPosition = ({ x, y, z }) => {
        if (!matrix.size) { return }
        setMatrix(prev => {
            const newMatrix = { ...prev }
            const currentPosition = newMatrix.value.find(_ => _.eq)
            const newPosition = newMatrix.value.find(_ => _.x === x && _.z === z /*&& _.y === y*/)
            
            if (!newPosition) {
                console.warn('[STORE]: Matrix point not found')
                return newMatrix
            }

            // wont work on first spawn
            if (currentPosition) {
                currentPosition.eq = false
                currentPosition.av = true
            }

            newPosition.av = false
            newPosition.eq = true

            return newMatrix
        }) 
    }
    const setMatrixPointAvailibility = ({ x, y, z }, value) => {
        if (!matrix.size) { return }
        setMatrix(prev => {
            const newMatrix = { ...prev }
            const position = newMatrix.value.find(_ => _.x === x && _.z === z /*&& _.y === y*/)
            if (!position) {
                console.warn('[STORE<setMatrixAvailibility>]: Matrix point not found')
                return newMatrix
            }
            position.av = value
            return newMatrix
        })
    }

    useEffect(() => {
        synchroniseFighterPosition()
    }, [ fighter ]);
    function synchroniseFighterPosition() {
        if (!spawned) { return }
        if (!matrix?.size) { return }
        if (isFighterMoving) { return }

        console.log("[SceneContextProvider] fighter updated", fighter);
        const serverFighterPosition = fighter?.coordinates // { x, z }
        if (!serverFighterPosition) { return }

        const localeFighterPosition = getMatrixPosition() // { x, z }
        // TODO: decide which expression to use
        // function euclideanDistance(coord1, coord2) {
        //     deltaX = float64(coord1.x - coord2.x)
        //     deltaZ = float64(coord1.z - coord2.z)
        //     return Math.Sqrt(deltaX*deltaX + deltaZ*deltaZ)
        // }
        if (serverFighterPosition.x - localeFighterPosition.x < 2 
            && serverFighterPosition.z - localeFighterPosition.z < 2) {
                return
        }

        setMatrixPosition({ ...serverFighterPosition })
    }

    // Detect npc updates and add them to NpcList
    // TODO: add npc removal
    useEffect(() => {
        console.log("[SceneContextProvider] NPC list updated: ", npcList)
        if (!npcList?.length) { return }
        npcList.forEach(serverNpc => {
            const localeNpcIndex = NpcList.current.findIndex(localeNpc => localeNpc.id === serverNpc.id)
            if (localeNpcIndex !== -1) {
                NpcList.current[localeNpcIndex] = { ...serverNpc }
                return
            }
            NpcList.current.push(serverNpc)
        })
    }, [ npcList ]);



    // Dropped Items
    const prevDroppedItemsRef = useRef();
    useEffect(() => {
        // Store the previous droppedItems in a ref
        prevDroppedItemsRef.current = droppedItems;
    }, [droppedItems]);

    useEffect(() => {
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

    // spawn fighter on load
    useEffect(() => {
        if (spawned) { return }
        if (!matrix?.size, !fighter?.coordinates) { return }
        setPosition(matrixCoordToWorld(matrix, { ...fighter.coordinates }))
        setMatrixPosition({ ...fighter.coordinates })
        setSpawned(true)
    }, [ fighter, matrix ])

    useEffect(() => {
        if (!spawned) { return }
        if (!matrix.size) { return }
        const currentPosition = getMatrixPosition()
        if (!currentPosition || !targetPosition) { return }

        // prevent infinite loop if clicked on position which no in matrix
        const targetMatrixPosition = matrix.value.find(_ => _.x === targetPosition.x && _.z === targetPosition.z /*&& _.y === y*/)
        if (!targetMatrixPosition) { return }
        // 
        if (!targetMatrixPosition.av) { return }

        if ( targetPosition.x === currentPosition.x && targetPosition.z === currentPosition.z ) { return }
        console.log('[STORE]:move:step')
        const nextPosition = getNextPosition(currentPosition, targetPosition)
        const currentWorldPosition = matrixCoordToWorld(matrix, currentPosition)
        const nextWorldPosition = matrixCoordToWorld(matrix, nextPosition)

        moveFighter && moveFighter({ ...nextPosition })

        setIsFighterMoving(true)
        Tween.to(currentWorldPosition, nextWorldPosition,
            {
                duration: 200 / CHARACTER_SETTINGS.speed,
                onChange(state) {
                    // console.log(state.value)
                    setPosition(state.value)
                },
                onComplete() {
                    setPosition(nextWorldPosition)
                    setMatrixPosition(nextPosition)
                    setIsFighterMoving(false)
                },
            }
        )
    }, [ targetPosition, matrix ]) 

    const value = {
        matrix,
        getMatrixPosition,
        targetPosition,
        position,
        setMatrixPosition,
        setTargetPosition,
        setMatrixPointAvailibility,
        direction,
        setDirection,
        isFighterMoving,
        spawned,
        NpcList
    } 

    return (
        <SceneContext.Provider value={value}>
            { children }
        </SceneContext.Provider>
    )
}

export default SceneContextProvider