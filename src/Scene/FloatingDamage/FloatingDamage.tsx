import { useEffect, useRef, memo, useMemo } from "react"
import type { Damage } from "interfaces/damage.interface"
import DamageText from "./DamageText"
import type { ObjectData } from "interfaces/sceneData.interface"
import { getDamageColor } from "Scene/utils/getDamageColor"
import { getDamageValue } from "Scene/utils/getDamageValue"

import { useNpc } from "Scene/Npc/useNpc"
import { useCloud } from "EventCloud/useCloud"
import { useCore } from "Scene/useCore"

interface TriggerDamage {
    label: string
    event: Damage
    remove: () => void
    color: number
    target: ObjectData
    message: string
}

const FloatingDamage = memo(function FloatingDamage() {
    const [events, removeEvent] = useCloud(state => [state.events, state.removeEvent])
    const [playerList] = useCloud(state => [state.playerList])
    const [getSceneObject] = useCore(state => [state.getSceneObject])

    const npcList = useNpc(state => state.npcList)

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
        // console.log('events', events)
        const damageEvents = events.filter((event: any) => event.type === 'damage')
        // console.log('damageEvents', damageEvents)
        if (damageEvents.length > 0) {
            damageEvents.forEach((damageEvent: Damage) => {
                const npc = npcList.find(npc => npc?.id === String(damageEvent.npcId))
                const fighter = playerList.find(player => player?.id === String(damageEvent.npcId))
                const object = npc || fighter

                // TODO: rm bc it kill cpu, should remake damage indicators
                if (fighter) { return removeEvent(damageEvent) }

                if (!object) { return removeEvent(damageEvent) }
                // console.log(`[FloatingDamage]: ID ${damageEvent.npcId} received ${damageEvent.damage} damage.`)

                const target = getSceneObject(object.id)
                if (!target) { return removeEvent(damageEvent) }

                triggerDamage.current.push(createDamage(damageEvent, target as any))

                // Send one more if double
                if (damageEvent.dmgType.isDouble) {
                    setTimeout(() => {
                        triggerDamage.current.push(createDamage(damageEvent, target as any))
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