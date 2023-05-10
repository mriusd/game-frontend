import { useEventCloud } from "EventCloudContext"
import { useEffect, useRef, memo } from "react"
import type { Damage } from "interfaces/damage.interface"
import DamageText from "./DamageText"
import { useSceneContext } from "store/SceneContext"
import type { ObjectData } from "interfaces/sceneData.interface"

interface TriggerDamage {
    label: string
    event: Damage
    remove: () => void
    color: number
    target: ObjectData
}

const FloatingDamage = memo(function FloatingDamage() {
    const { events, removeEvent } = useEventCloud()
    const { worldSize, NpcList, getSceneObject } = useSceneContext()

    const triggerDamage = useRef<TriggerDamage[]>([])
    const removeTriggerDamage = (label: string) => {
        triggerDamage.current = triggerDamage.current.filter((_: TriggerDamage) => _.label !== label)
    }

    // Generate damage indicators
    useEffect(() => {
        const damageEvents = events.filter((event: any) => event.type === 'damage')
        if (damageEvents.length > 0) {
            damageEvents.forEach((damageEvent: Damage) => {
                const npc = NpcList.current.find(npc => npc?.id === String(damageEvent.npcId))
                if (!npc) { return }
                // console.log(`[FloatingDamage]: ID ${damageEvent.npcId} received ${damageEvent.damage} damage.`)

                const target = getSceneObject(npc.id)
                if (!target) { return }
                
                const label = `${damageEvent.npcId}${Date.now() * Math.random()}${damageEvent.damage}`
                triggerDamage.current.push({
                    label,
                    target,
                    event: damageEvent,
                    remove: () => {
                        removeTriggerDamage(label)
                        removeEvent(damageEvent)
                    },
                    color: 0xFF0000 * Math.abs(Math.random() - .5),
                })
            })
        }
    }, [events])

    return (
        <group name="floatingDamage">
            {triggerDamage.current.map((_: TriggerDamage) => (
                <DamageText
                    key={_.label}
                    color={_.color}
                    value={`${String(_.event.damage)}`}
                    target={_.target}
                    onComplete={() => _.remove()}
                />
            ))}
        </group>
    )
})

export default FloatingDamage