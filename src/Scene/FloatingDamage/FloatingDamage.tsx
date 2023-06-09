import { useEventCloud } from "EventCloudContext"
import { useEffect, useRef, memo } from "react"
import type { Damage } from "interfaces/damage.interface"
import DamageText from "./DamageText"
import { useSceneContext } from "store/SceneContext"
import type { ObjectData } from "interfaces/sceneData.interface"
import { getDamageColor } from "Scene/utils/getDamageColor"
import { getDamageValue } from "Scene/utils/getDamageValue"

interface TriggerDamage {
    label: string
    event: Damage
    remove: () => void
    color: number
    target: ObjectData
    message: string
}

const FloatingDamage = memo(function FloatingDamage() {
    const { events, removeEvent } = useEventCloud()
    const { NpcList, getSceneObject } = useSceneContext()

    const triggerDamage = useRef<TriggerDamage[]>([])
    const removeTriggerDamage = (label: string) => {
        triggerDamage.current = triggerDamage.current.filter((_: TriggerDamage) => _.label !== label)
    }

    const createDamage = (damageEvent: Damage, target: ObjectData) => {
        const label = `${damageEvent.npcId}${Date.now() * Math.random()}${damageEvent.damage}`
        return {
            label,
            target,
            event: damageEvent,
            message: getDamageValue(damageEvent),
            remove: () => {
                removeTriggerDamage(label)
                removeEvent(damageEvent)
            },
            color: getDamageColor(damageEvent),
        }
    }

    // Generate damage indicators
    useEffect(() => {
        console.log('events', events)
        const damageEvents = events.filter((event: any) => event.type === 'damage')
        console.log('damageEvents', damageEvents)
        if (damageEvents.length > 0) {
            damageEvents.forEach((damageEvent: Damage) => {
                const npc = NpcList.current.find(npc => npc?.id === String(damageEvent.npcId))
                if (!npc) { return }
                // console.log(`[FloatingDamage]: ID ${damageEvent.npcId} received ${damageEvent.damage} damage.`)

                const target = getSceneObject(npc.id)
                if (!target) { return }

                triggerDamage.current.push(createDamage(damageEvent, target))

                // Send one more if double
                if (damageEvent.dmgType.isDouble) {
                    setTimeout(() => {
                        triggerDamage.current.push(createDamage(damageEvent, target))
                    }, 100)
                }
            })
        }
    }, [events])

    return (
        <group name="floatingDamage">
            {triggerDamage.current.map((_: TriggerDamage) => (
                <DamageText
                    key={_.label}
                    color={_.color}
                    value={_.message}
                    target={_.target}
                    onComplete={() => _.remove()}
                />
            ))}
        </group>
    )
})

export default FloatingDamage