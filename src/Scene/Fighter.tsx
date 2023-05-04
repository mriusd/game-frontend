import * as THREE from "three"
import { useEffect, useState, useRef } from "react"
import { useThree } from "@react-three/fiber"
import { useAnimations } from "@react-three/drei"
import { CAMERA_POSITION } from "./config"
import { matrixCoordToWorld } from "./utils/matrixCoordToWorld"
import { getNearestEmptySquareToTarget } from "./utils/getNextPosition"
import { inWorld } from "./utils/inWorld"
import { euclideanDistance } from "./utils/euclideanDistance"
import Tween from "./utils/tween/tween"
import { useSceneContext } from '../store/SceneContext'
import type { Coordinate } from "interfaces/coordinate.interface"
import { useLoadAssets } from "store/LoadAssetsContext"
import { isOccupiedCoordinate } from "./utils/isOccupiedCoordinate"

const Fighter = () => {
    const cameraPosition = new THREE.Vector3(...CAMERA_POSITION)
    const camera = useThree(state => state.camera)
    const { gltf } = useLoadAssets()

    const { 
        fighter, 
        moveFighter, 
        worldSize,

        isMoving, setIsMoving,

        currentMatrixCoordinate, setCurrentMatrixCoordinate,
        currentWorldCoordinate, setCurrentWorldCoordinate,
        setNextMatrixCoordinate,
        setNextWorldCoordinate,

        controller: {
            direction,
            focusedMatrixCoordinate,
            focusedWorldCoordinate,
            pointerWorldCoordinate
        },

        occupiedCoords
    } = useSceneContext()
    const [ isSpawned, setIsSpawned ] = useState<boolean>(false)
    const [ serverMatrixCoordinate, setServerMatrixCoordinate ] = useState<Coordinate | null>(null)
    const [ targetMatrixCoordinate, setTargetMatrixCoordinate ] = useState<Coordinate | null>(null)
    // const [ targetWorldPosition, setTargetWorldPosition ] = useState(null) // we use 1 cell move instead

    const [ saveFocusedMatrixCoordinate, setSaveFocusedMatrixCoordinate ] = useState<Coordinate | null>(null)

     // Unlike 'isMoving', 'isStaying' sets to TRUE with delay, but sets to FALSE as 'isMoving' immediately
    const [ isStaying, setIsStaying ] = useState<boolean>(false)
    const ENTER_TO_ISSTAYING_DELAY = 200 //ms

    const animationTarget = useRef()
    const { mixer, actions } = useAnimations(gltf.current.fighter.animations, animationTarget)

    // Manage fighter changes from server
    useEffect(() => {
        // console.log('[Fighter]: updated', fighter)
        if (!fighter) { return }
        if (!isSpawned) {
            spawnFighter()
            return
        }
        if (fighter.coordinates) { 
            setServerMatrixCoordinate({ ...fighter.coordinates })
        }
    }, [ fighter ])
    function spawnFighter() {
        if (!worldSize.current) { return }
        if (!fighter.coordinates) { return console.warn("[Fighter]: No 'coordinates' in response") }
        console.log('[Fighter]: spawned')
        setServerMatrixCoordinate({ ...fighter.coordinates })
        setCurrentMatrixCoordinate({ ...fighter.coordinates })
        setCurrentWorldCoordinate(matrixCoordToWorld(worldSize.current, {...fighter.coordinates}))
        setTargetMatrixCoordinate({ ...fighter.coordinates })
        setIsSpawned(true)
    }

    // Synchronize server and locale Fighter position
    useEffect(() => {
        if (!serverMatrixCoordinate || !currentMatrixCoordinate) { return }
        // Check if the same position while staying & does not differ by more than one cell while moving
        if (euclideanDistance(serverMatrixCoordinate, currentMatrixCoordinate, isStaying ? 0 : 1)) {
            return
        }
        setCurrentMatrixCoordinate({ ...serverMatrixCoordinate })
    }, [ serverMatrixCoordinate ])

    // Make Camera follow the Fighter
    useEffect(() => {
        if (!currentWorldCoordinate) { return }
        camera.position.set(currentWorldCoordinate.x, 0, currentWorldCoordinate.z).add(cameraPosition)
    }, [ currentWorldCoordinate ])

    // Set position to move to
    useEffect(() => {
        console.log('[Fighter]: Set target position')
        if (!isSpawned) { return }
        if (!focusedMatrixCoordinate) { return }
        if (isOccupiedCoordinate(occupiedCoords, focusedMatrixCoordinate)) { return }
        setSaveFocusedMatrixCoordinate(focusedMatrixCoordinate)
    }, [ focusedMatrixCoordinate ])
    useEffect(() => {
        if (isMoving) { return }
        if (!saveFocusedMatrixCoordinate) { return } 
        if (targetMatrixCoordinate?.x !== saveFocusedMatrixCoordinate.x && targetMatrixCoordinate?.z !== saveFocusedMatrixCoordinate.z) {
            setTargetMatrixCoordinate(saveFocusedMatrixCoordinate)
        }
    }, [saveFocusedMatrixCoordinate, currentMatrixCoordinate])

    // Add delay to prevent freeze on "checkpoint" when synchronising with server
    // On delayed mooving "true" we render fighter in the same position as server
    // Otherwise we render if fighter < 2 cells away from server
    const timeout = useRef<any>(0)
    useEffect(() => {
        clearTimeout(timeout.current)

        if (isMoving) {
            setIsStaying(false)
            return
        }

        timeout.current = setTimeout(() => {
            setIsStaying(true)
        }, ENTER_TO_ISSTAYING_DELAY) // 200ms delay
    }, [ isMoving ])

    // Fighter movement
    useEffect(() => {
        if (!worldSize.current) { return }
        if (!isSpawned) { return }
        if (!currentMatrixCoordinate || !targetMatrixCoordinate) { return }
        if (!inWorld(worldSize.current, targetMatrixCoordinate)) { return }
        if (targetMatrixCoordinate.x === currentMatrixCoordinate.x && targetMatrixCoordinate.z === currentMatrixCoordinate.z) { return }
        console.log('[Fighter]: Move cell (from->to)', currentMatrixCoordinate, targetMatrixCoordinate)

        const nextMatrixPosition = getNearestEmptySquareToTarget(occupiedCoords, currentMatrixCoordinate, targetMatrixCoordinate)
        const nextWorldPosition = matrixCoordToWorld(worldSize.current, nextMatrixPosition)
        // const nextPosition = getNearestEmptySquareToTarget(matrix, currentPosition, targetPosition)
        if (!nextMatrixPosition) { return }
        
        // Used in controller for direction
        setNextMatrixCoordinate(nextMatrixPosition) 
        setNextWorldCoordinate(nextWorldPosition)
        // 

        setIsMoving(true)
        moveFighter && moveFighter({ ...nextMatrixPosition })

        Tween.to(currentWorldCoordinate, nextWorldPosition,
            {
                duration: 60000 / fighter.movementSpeed, // 1m * 60s * 1000ms / speed
                onChange(state) {
                    // console.log(state.value)
                    setCurrentWorldCoordinate(state.value)
                },
                onComplete() {
                    setCurrentWorldCoordinate(nextWorldPosition)
                    setCurrentMatrixCoordinate(nextMatrixPosition)
                    setIsMoving(false)
                },
            }
        )
    }, [ targetMatrixCoordinate, currentMatrixCoordinate ]) 


    // Toggle movement animation
    useEffect(() => {
        console.log('[Fighter]: Toggle isMoving animation', mixer, actions)
        if (isStaying) {
            actions.Scene?.fadeOut(.1).stop()
        } else {
            actions.Scene?.setDuration(60 / fighter.movementSpeed * 4).fadeIn(.1).play()
        }
    }, [ isStaying ])


    if (!currentWorldCoordinate) {
        return <></>
    }

    return (
        <primitive 
            ref={animationTarget}
            object={gltf.current.fighter.scene}
            position={[currentWorldCoordinate.x, -.1, currentWorldCoordinate.z]}
            scale={.7}
            rotation={[0, direction, 0]}
            castShadow 
        />
    )
}

export default Fighter