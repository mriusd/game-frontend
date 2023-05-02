import { useEffect, useState, useContext } from "react"
import { matrixCoordToWorld } from "./utils/matrixCoordToWorld"
import { SceneContext } from "./store/SceneContextProvider"
import Tween from "./utils/tween/tween"

// TODO: prevent move character on npc position
const Npc = ({ npc }) => {
    const { worldSize } = useContext(SceneContext)
    const [spawned, setSpawned] = useState(false)
    const [currentMatrixPosition, setCurrentMatrixPosition] = useState(null)
    const [targetMatrixPosition, setTargetMatrixPosition] = useState(null)
    const [targetWorldPosition, setTargetWorldPosition] = useState(null)
    const [currentWorldPosition, setCurrentWorldPosition] = useState(null)

    // Fill changed npc properties
    useEffect(() => {
        console.log(`[NPC]: npc with id '${npc?.id}' updated`, npc)
        if (!npc?.isNpc) { return }
        if (npc?.coordinates) {
            setTargetMatrixPosition({ ...npc?.coordinates })
            return
        }
    }, [ npc ])

    // Move npc
    useEffect(() => {
        if (!targetMatrixPosition) { return }
        if (!worldSize.current) { return }

        setTargetWorldPosition(matrixCoordToWorld(worldSize.current, {...targetMatrixPosition}))

        if (!spawned) {
            setCurrentMatrixPosition(targetMatrixPosition)
            setCurrentWorldPosition(matrixCoordToWorld(worldSize.current, {...targetMatrixPosition}))
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
                            setCurrentMatrixPosition(targetMatrixPosition)
                            setCurrentWorldPosition(targetWorldPosition)
                        },
                    }
                )
            }
    }, [ targetMatrixPosition ])


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