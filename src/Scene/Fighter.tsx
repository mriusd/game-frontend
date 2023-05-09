import * as THREE from "three"
import { useEffect, useState, useRef, memo } from "react"
import { useThree } from "@react-three/fiber"
import { useAnimations } from "@react-three/drei"
import { CAMERA_POSITION } from "./config"
import { matrixCoordToWorld } from "./utils/matrixCoordToWorld"
import { getNearestEmptySquareToTarget, getTargetSquareWithAttackDistance } from "./utils/getNextPosition"
import { inWorld } from "./utils/inWorld"
import { euclideanDistance } from "./utils/euclideanDistance"
import Tween from "./utils/tween/tween"
import { useSceneContext } from '../store/SceneContext'
import type { Coordinate } from "interfaces/coordinate.interface"
import { useLoadAssets } from "store/LoadAssetsContext"
import { isOccupiedCoordinate } from "./utils/isOccupiedCoordinate"
import { getMoveDuration } from "./utils/getMoveDuration"
import Name from "./components/Name"
import { useEventCloud } from "EventCloudContext"
import { calcDirection } from "./utils/calcDirection"

const Fighter = memo(function Fighter() {
    const cameraPosition = new THREE.Vector3(...CAMERA_POSITION)
    const camera = useThree(state => state.camera)
    const { gltf } = useLoadAssets()
    useEffect(() => {
        if (!gltf.current.fighter) { return }
        gltf.current.fighter.scene.traverse((child) => {
            // @ts-expect-error
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        }) 
    }, [gltf.current.fighter])

    const { submitMalee } = useEventCloud()
    const { 
        fighter, 
        moveFighter, 
        worldSize,
        target, setTarget,
        itemTarget, setItemTarget,

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
    const ENTER_TO_ISSTAYING_DELAY = 50 //ms

    const animationTarget = useRef()
    const { mixer, actions } = useAnimations(gltf.current.fighter.animations, animationTarget)

    // const [attacks, _setAttacks] = useState([])
    // const setAttacks = (attack: ) => {
    //     _setAttacks()
    // }

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
        // console.log('[Fighter]: spawned')
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
        // use isStaying instead isMoving to prevent "jumping" on checkpoint, and instead set new target on move end in TWEEN
        if (!isStaying) { return }
        if (!saveFocusedMatrixCoordinate) { return } 
        setTargetMatrixCoordinate(saveFocusedMatrixCoordinate)
    }, [saveFocusedMatrixCoordinate, isMoving])
        // Set target position to move on Object click
    useEffect(() => {
        console.log(target, itemTarget)
        // For attack target
        if (target && target?.skill) {
            const attackDistance = target.skill.activeDistance
            const objectCoordinate = target.target.coordinates
            const targetCoordinate = getTargetSquareWithAttackDistance(occupiedCoords, currentMatrixCoordinate, objectCoordinate, attackDistance)
            setSaveFocusedMatrixCoordinate(targetCoordinate)
            submitMalee(calcDirection(currentMatrixCoordinate, objectCoordinate))
            setTarget(null, null)
            return
        }
        // For item target
        if (itemTarget) {
            setSaveFocusedMatrixCoordinate(itemTarget.coords)
            setItemTarget(null)
        }
    }, [target, itemTarget])

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
        if (isMoving) { return }
        if (!worldSize.current) { return }
        if (!isSpawned) { return }
        if (!currentMatrixCoordinate || !targetMatrixCoordinate) { return }
        if (!inWorld(worldSize.current, targetMatrixCoordinate)) { return }
        // console.log('[Fighter]: Move cell (from->to)', currentMatrixCoordinate, targetMatrixCoordinate)

        const nextMatrixPosition = getNearestEmptySquareToTarget(occupiedCoords, currentMatrixCoordinate, targetMatrixCoordinate)
        if (!nextMatrixPosition) { return }
        const nextWorldPosition = matrixCoordToWorld(worldSize.current, nextMatrixPosition)
        
        // Used in controller for direction
        setNextMatrixCoordinate(nextMatrixPosition) 
        setNextWorldCoordinate(nextWorldPosition)
        // 
        // console.log('----> START MOVE <----')

        setIsMoving(true)
        moveFighter && moveFighter({ ...nextMatrixPosition })

        Tween.to(currentWorldCoordinate, nextWorldPosition,
            {
                duration: getMoveDuration(fighter.movementSpeed, currentMatrixCoordinate, nextMatrixPosition), 
                onChange(state) {
                    // console.log(state.value)
                    setCurrentWorldCoordinate(state.value)
                },
                onComplete() {
                    // setCurrentWorldCoordinate(nextWorldPosition)
                    setCurrentMatrixCoordinate(nextMatrixPosition)
                    setIsMoving(false)
                    setTargetMatrixCoordinate(saveFocusedMatrixCoordinate)
                },
            }
        )
    }, [ targetMatrixCoordinate, currentMatrixCoordinate ]) 


    // Toggle movement animation
    useEffect(() => {
        // console.log('[Fighter]: Toggle isMoving animation', mixer, actions)
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
        <group>
            <Name value="MyName()_()" target={animationTarget} />
            <primitive 
                ref={animationTarget}
                object={gltf.current.fighter.scene}
                position={[currentWorldCoordinate.x, -.1, currentWorldCoordinate.z]}
                scale={.7}
                rotation={[0, direction, 0]}
                castShadow 
            />
        </group>
    )
})

export default Fighter