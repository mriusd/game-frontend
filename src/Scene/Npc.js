import { useEffect, useRef, useState, useContext } from "react"
import { detectObjectChanges } from "./utils/detectObjectChanges"
import { matrixCoordToWorld } from "./utils/matrixCoordToWorld"
import { SceneContext } from "./store/SceneContextProvider"
import Tween from "./utils/tween/tween"

const Npc = ({ npc }) => {
    const { matrix } = useContext(SceneContext)
    const [spawned, setSpawned] = useState(false)
    const [currentMatrixPosition, setCurrentMatrixPosition] = useState(null)
    const [targetWorldPosition, setTargetWorldPosition] = useState(null)
    const [currentWorldPosition, setCurrentWorldPosition] = useState(null)

    // Fill changed npc properties
    useEffect(() => {
        console.log(`[NPC]: npc with id '${npc?.id}' updated`, npc)
        if (!npc?.isNpc) { return }
        if (npc?.coordinates) {
            setCurrentMatrixPosition({ ...npc?.coordinates })
            return
        }
    }, [ npc ])


    // Move npc
    useEffect(() => {
        if (!currentMatrixPosition) { return }

        setTargetWorldPosition(matrixCoordToWorld(matrix, {...currentMatrixPosition}))

        if (!spawned) {
            setCurrentWorldPosition(matrixCoordToWorld(matrix, {...currentMatrixPosition}))
            setSpawned(true)
            return
        }
        
        if (currentWorldPosition.x !== targetWorldPosition.x 
            || currentWorldPosition.z !== targetWorldPosition.z) {
                Tween.to(currentWorldPosition, targetWorldPosition,
                    {
                        duration: 400,
                        onChange(state) {
                            console.log(state.value)
                            setCurrentWorldPosition(state.value)
                        },
                        onComplete() {
                            setCurrentWorldPosition(targetWorldPosition)
                        },
                    }
                )
            }
    }, [ currentMatrixPosition ])


    return (
        spawned && (
            <mesh castShadow position={[currentWorldPosition.x, .5, currentWorldPosition.z]}>
                <boxGeometry args={[1, 1]} />
                <meshStandardMaterial color={0x000FED} />
            </mesh>
        )
    )
}

export default Npc