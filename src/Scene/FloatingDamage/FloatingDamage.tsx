import React, { useRef } from "react"
import { Instances, Instance } from "@react-three/drei"

import DamageText from "./DamageText"

import { getDamageColor } from "Scene/utils/getDamageColor"
import { getDamageValue } from "Scene/utils/getDamageValue"

import { useNpc } from "Scene/Npc/useNpc"
import { useCloud } from "EventCloud/useCloud"
import { useCore } from "Scene/useCore"

import type { Damage } from "interfaces/damage.interface"
import type { ObjectData } from "interfaces/sceneData.interface"

import { BillboardTextMaterial } from "./materials/billboardTextMaterial"
import { useFrame } from "@react-three/fiber"

interface TriggerDamage {
    label: string
    event: Damage
    remove: () => void
    color: number
    target: ObjectData
    message: string
}

const FloatingDamage = React.memo(function FloatingDamage() {
    const [events, removeEvent] = useCloud(state => [state.events, state.removeEvent])
    const [playerList] = useCloud(state => [state.playerList])
    const [getSceneObject] = useCore(state => [state.getSceneObject])

    const npcList = useNpc(state => state.npcList)

    const triggerDamage = React.useRef<TriggerDamage[]>([])

    // Store All Instance Ref to Reuse them
    // 1000 - Max Amount Of Damage Indicators
    const instancesSize = 1000
    const instancesSizeArray = useRef(new Array(instancesSize)) 
    const instanceRefs = useRef({}) 
    const availableInstanceIds = useRef(Array.from({ length: instancesSize }, (_, index) => index))


    const removeTriggerDamage = (label: string, instanceId: number) => {
        // Push to available instances
        availableInstanceIds.current.push(instanceId)
        // 
        triggerDamage.current = triggerDamage.current.filter((_: TriggerDamage) => _.label !== label)
    }

    const createDamage = (damageEvent: Damage, target: ObjectData) => {
        const label = `${damageEvent.npcId}${Date.now() * Math.random()}${damageEvent.damage}`

        // Remove from Available Instances
        const instanceId = availableInstanceIds.current[0]
        if (!instanceId) {
            removeTriggerDamage(label, instanceId)
            removeEvent(damageEvent)
            return
        }
        const instance = instanceRefs.current[instanceId]
        availableInstanceIds.current = availableInstanceIds.current.filter((id: number) => id !== instanceId)
        // 

        return {
            label,
            target,
            event: damageEvent,
            message: getDamageValue(damageEvent),
            remove: () => {
                removeTriggerDamage(label, instanceId)
                removeEvent(damageEvent)
            },
            color: getDamageColor(damageEvent),
            instanceId,
            instance,
        }
    }



    // Generate damage indicators
    React.useEffect(() => {
        // console.log('events', events)
        const damageEvents = events.filter((event: any) => event.type === 'damage')

        console.log('damageEvents', damageEvents)
        console.log('availableInstanceIds', availableInstanceIds)

        if (damageEvents.length > 0) {
            damageEvents.forEach((damageEvent: Damage) => {
                const npc = npcList.find(npc => npc?.id === String(damageEvent.npcId))
                const fighter = playerList.find(player => player?.id === String(damageEvent.npcId))
                const object = npc || fighter

                // TODO: rm bc it kill cpu, should remake damage indicators
                // Create optimized version based on InstancedMesh
                // I got an idea to use map textures for numbers
                // removeEvent(damageEvent)

                // if (fighter) { return removeEvent(damageEvent) }

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


    // Render Damage
    useFrame(() => {
        triggerDamage.current.forEach(_ => {
            _.remove()
        })
    })


    return (
        <group name="floating-damage">
            <Instances limit={instancesSize} range={instancesSize}>
                <planeGeometry />
                <BillboardTextMaterial/>
                {/* {triggerDamage.current.map((_: TriggerDamage) => (
                    <DamageText
                        key={_.label}
                        color={_.color}
                        value={_.message}
                        target={_.target}
                        onComplete={() => _.remove()}
                    />
                ))} */}
                {[...instancesSizeArray.current].map((_, i) => <Instance key={i} ref={r => instanceRefs.current[i] = r} visible={false}/>)}
            </Instances>
            {/* {triggerDamage.current.map((_: TriggerDamage) => (
                <DamageText
                    key={_.label}
                    color={_.color}
                    value={_.message}
                    target={_.target}
                    onComplete={() => _.remove()}
                />
            ))} */}
        </group>
    )
})

export default FloatingDamage