import * as THREE from "three"
import { useContext, useEffect, useState, useRef } from "react"
import { useThree } from "@react-three/fiber"
import { SceneContext } from "./store/SceneContextProvider"
import { CAMERA_POSITION } from "./config"
import { matrixCoordToWorld } from "./utils/matrixCoordToWorld"
import { getNextPosition } from "./utils/getNextPosition"
import { inWorld } from "./utils/inWorld"
import { useController } from "./hooks/useController"
import { euclideanDistance } from "./utils/euclideanDistance"
import Tween from "./utils/tween/tween"

const Fighter = ({ world }) => {
    const cameraPosition = new THREE.Vector3(...CAMERA_POSITION)
    const camera = useThree(state => state.camera)

    const { Fighter, moveFighter, worldSize } = useContext(SceneContext)
    const [ isSpawned, setIsSpawned ] = useState(false)
    const [ serverMatrixPosition, setServerMatrixPosition ] = useState(null)
    const [ currentMatrixPosition, setCurrentMatrixPosition ] = useState(null)
    const [ targetMatrixPosition, setTargetMatrixPosition ] = useState(null)
    const [ currentWorldPosition, setCurrentWorldPosition ] = useState(null)
    // const [ targetWorldPosition, setTargetWorldPosition ] = useState(null) // we use 1 cell move instead

    const [ isMoving, setIsMoving ] = useState(false)
     // Unlike 'isMoving', 'isStaying' sets to TRUE with delay, but sets to FALSE as 'isMoving' immediately
    const [ isStaying, setIsStaying ] = useState(false)
    const ENTER_TO_ISSTAYING_DELAY = 200 //ms

    // Mouse events rely on world & fighter world position
    const { 
        direction, // updates when direction changes
        focusedMatrixPosition, // updates on mousedown on matrix
        focusedWorldPosition,  // updates on mousedown on matrix
        pointerWorldPosition // updates on mousemove && fighter move
    } = useController(world, currentWorldPosition)

    const [ managedDirection, setManagedDirection ] = useState(direction.current)

    // Manage fighter changes from server
    useEffect(() => {
        console.log('[Fighter]: updated', Fighter)
        if (!Fighter.current) { return }
        if (!isSpawned) {
            spawnFighter()
            return
        }
        if (Fighter.current?.coordinates) { 
            setServerMatrixPosition({ ...Fighter.current.coordinates })
        }
    }, [ Fighter ])
    function spawnFighter() {
        console.log('[Fighter]: spawned')
        if (!Fighter.current?.coordinates) { return console.warn("[Fighter]: No 'coordinates' in response") }
        setServerMatrixPosition({ ...Fighter.current.coordinates })
        setCurrentMatrixPosition({ ...Fighter.current.coordinates })
        setCurrentWorldPosition(matrixCoordToWorld(worldSize.current, {...Fighter.current.coordinates}))
        setTargetMatrixPosition({ ...Fighter.current.coordinates })
        setIsSpawned(true)
    }

    // Synchronize server and locale Fighter position
    useEffect(() => {
        if (!serverMatrixPosition) { return }
        // Check if the same position while staying & does not differ by more than one cell while moving
        if (euclideanDistance(serverMatrixPosition, currentMatrixPosition, isStaying ? 0 : 1)) {
            return
        }
        setCurrentMatrixPosition({ ...serverMatrixPosition })
    }, [ serverMatrixPosition ])

    // Make Camera follow the Fighter
    useEffect(() => {
        if (!currentWorldPosition) { return }
        camera.position.set(currentWorldPosition.x, 0, currentWorldPosition.z).add(cameraPosition)
    }, [ currentWorldPosition ])

    // Controll Fighter rotation
    useEffect(() => {
        console.log('isMovingisMovingisMovingisMoving', isMoving)
        if (isMoving) { return }
        console.log('[Fighter]: direction', direction.current)
        setManagedDirection(direction.current)
    }, [ direction.current ])

    // Set position to move to
    useEffect(() => {
        if (!isSpawned) { return }
        if (!focusedMatrixPosition.current) { return }
        setTargetMatrixPosition(focusedMatrixPosition.current)
    }, [ focusedMatrixPosition.current ])

    // Add delay to prevent freeze on "checkpoint" when synchronising with server
    // On delayed mooving "true" we render fighter in the same position as server
    // Otherwise we render if fighter < 2 cells away from server
    const timeout = useRef()
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
        console.log('[Fighter]: Move cell', currentMatrixPosition, targetMatrixPosition)
        if (!isSpawned) { return }
        if (!currentMatrixPosition || !targetMatrixPosition) { return }
        if (!inWorld(worldSize.current, targetMatrixPosition)) { return }
        if ( targetMatrixPosition.x === currentMatrixPosition.x && targetMatrixPosition.z === currentMatrixPosition.z ) { return }

        console.log('[Fighter]: Move 1 cell')
        const nextMatrixPosition = getNextPosition(currentMatrixPosition, targetMatrixPosition)
        // const nextPosition = getNearestEmptySquareToTarget(matrix, currentPosition, targetPosition)
        if (!nextMatrixPosition) { return }

        setIsMoving(true)
        moveFighter && moveFighter({ ...nextMatrixPosition })

        const nextWorldPosition = matrixCoordToWorld(worldSize.current, nextMatrixPosition)
        Tween.to(currentWorldPosition, nextWorldPosition,
            {
                duration: 200,
                onChange(state) {
                    // console.log(state.value)
                    setCurrentWorldPosition(state.value)
                },
                onComplete() {
                    setCurrentWorldPosition(nextWorldPosition)
                    setCurrentMatrixPosition(nextMatrixPosition)
                    setIsMoving(false)
                },
            }
        )
    }, [ targetMatrixPosition, currentMatrixPosition ]) 

    return (
        isSpawned && (
            <mesh 
                castShadow 
                position={[currentWorldPosition.x, .5, currentWorldPosition.z]}
                rotation={[0, managedDirection, 0]}
            >
                <boxGeometry args={[1, 1]}/>
                <meshStandardMaterial color={0x444444}/>
            </mesh>
        )
    )
}

export default Fighter