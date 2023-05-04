import { useEffect, useState } from "react"
import { matrixCoordToWorld } from "./utils/matrixCoordToWorld"
import Tween from "./utils/tween/tween"
import { Coordinate } from "interfaces/coordinate.interface"
import { useSceneContext } from "store/SceneContext"
import { NpcTest } from "./models/NpcTest"

const Npc = ({ npc }) => {
    const { worldSize } = useSceneContext()
    const [spawned, setSpawned] = useState<boolean>(false)
    const [currentMatrixPosition, setCurrentMatrixPosition] = useState<Coordinate | null>(null)
    const [targetMatrixPosition, setTargetMatrixPosition] = useState<Coordinate | null>(null)
    const [targetWorldPosition, setTargetWorldPosition] = useState<Coordinate | null>(null)
    const [currentWorldPosition, setCurrentWorldPosition] = useState<Coordinate | null>(null)

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
        
        if (!currentWorldPosition || !targetWorldPosition) { return }
        if (currentWorldPosition.x !== targetWorldPosition.x 
            || currentWorldPosition.z !== targetWorldPosition.z) {
                Tween.to(currentWorldPosition, targetWorldPosition,
                    {
                        duration: 400,
                        onChange(state: { value: Coordinate }) {
                            // console.log(state.value)
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

    if (!spawned) {
        return <></>
    }

    return (
        <NpcTest
            position={[currentWorldPosition.x, .25, currentWorldPosition.z]}
            // rotation={[0, direction, 0]}
            scale={.005}
        />
    )
}

export default Npc