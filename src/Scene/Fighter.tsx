import * as THREE from "three"
import { useEffect, useState, useRef } from "react"
import { useThree } from "@react-three/fiber"
import { CAMERA_POSITION } from "./config"
import { matrixCoordToWorld } from "./utils/matrixCoordToWorld"
import { getNextPosition } from "./utils/getNextPosition"
import { inWorld } from "./utils/inWorld"
import { euclideanDistance } from "./utils/euclideanDistance"
import Tween from "./utils/tween/tween"
import { useSceneContext } from '../store/SceneContext'
import type { Coordinate } from "interfaces/coordinate.interface"

const Fighter = () => {
    const cameraPosition = new THREE.Vector3(...CAMERA_POSITION)
    const camera = useThree(state => state.camera)

    const { 
        Fighter, 
        moveFighter, 
        worldSize,

        currentMatrixCoordinate, setCurrentMatrixCoordinate,
        currentWorldCoordinate, setCurrentWorldCoordinate,

        controller: {
            direction,
            focusedMatrixCoordinate,
            focusedWorldCoordinate,
            pointerWorldCoordinate
        }
    } = useSceneContext()
    const [ isSpawned, setIsSpawned ] = useState<boolean>(false)
    const [ serverMatrixCoordinate, setServerMatrixCoordinate ] = useState<Coordinate | null>(null)
    const [ targetMatrixCoordinate, setTargetMatrixCoordinate ] = useState<Coordinate | null>(null)
    // const [ targetWorldPosition, setTargetWorldPosition ] = useState(null) // we use 1 cell move instead

    const [ isMoving, setIsMoving ] = useState<boolean>(false)
     // Unlike 'isMoving', 'isStaying' sets to TRUE with delay, but sets to FALSE as 'isMoving' immediately
    const [ isStaying, setIsStaying ] = useState<boolean>(false)
    const ENTER_TO_ISSTAYING_DELAY = 200 //ms



    const [ managedDirection, setManagedDirection ] = useState<number>(direction.current || 0)

    // Manage fighter changes from server
    useEffect(() => {
        console.log('[Fighter]: updated', Fighter)
        if (!Fighter.current) { return }
        if (!isSpawned) {
            spawnFighter()
            return
        }
        if (Fighter.current?.coordinates) { 
            setServerMatrixCoordinate({ ...Fighter.current.coordinates })
        }
    }, [ Fighter ])
    function spawnFighter() {
        if (!worldSize.current) { return }
        if (!Fighter.current?.coordinates) { return console.warn("[Fighter]: No 'coordinates' in response") }
        console.log('[Fighter]: spawned')
        setServerMatrixCoordinate({ ...Fighter.current.coordinates })
        setCurrentMatrixCoordinate({ ...Fighter.current.coordinates })
        setCurrentWorldCoordinate(matrixCoordToWorld(worldSize.current, {...Fighter.current.coordinates}))
        setTargetMatrixCoordinate({ ...Fighter.current.coordinates })
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

    // Controll Fighter rotation
    useEffect(() => {
        if (direction.current === null) { return }
        if (isMoving) { return }
        console.log('[Fighter]: direction', direction.current)
        setManagedDirection(direction.current)
    }, [ direction.current ])

    // Set position to move to
    useEffect(() => {
        if (!isSpawned) { return }
        if (!focusedMatrixCoordinate.current) { return }
        setTargetMatrixCoordinate(focusedMatrixCoordinate.current)
    }, [ focusedMatrixCoordinate.current ])

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
        console.log('[Fighter]: Move cell', currentMatrixCoordinate, targetMatrixCoordinate)
        if (!worldSize.current) { return }
        if (!isSpawned) { return }
        if (!currentMatrixCoordinate || !targetMatrixCoordinate) { return }
        if (!inWorld(worldSize.current, targetMatrixCoordinate)) { return }
        if ( targetMatrixCoordinate.x === currentMatrixCoordinate.x && targetMatrixCoordinate.z === currentMatrixCoordinate.z ) { return }

        console.log('[Fighter]: Move 1 cell')
        const nextMatrixPosition = getNextPosition(currentMatrixCoordinate, targetMatrixCoordinate)
        // const nextPosition = getNearestEmptySquareToTarget(matrix, currentPosition, targetPosition)
        if (!nextMatrixPosition) { return }

        setIsMoving(true)
        moveFighter && moveFighter({ ...nextMatrixPosition })

        const nextWorldPosition = matrixCoordToWorld(worldSize.current, nextMatrixPosition)
        Tween.to(currentWorldCoordinate, nextWorldPosition,
            {
                duration: 200,
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

    if (!currentWorldCoordinate) {
        return <></>
    }

    return (
        <mesh 
            castShadow 
            position={[currentWorldCoordinate.x, .5, currentWorldCoordinate.z]}
            rotation={[0, managedDirection, 0]}
        >
            <boxGeometry args={[1, 1]}/>
            <meshStandardMaterial color={0x444444}/>
        </mesh>
    )
}

export default Fighter