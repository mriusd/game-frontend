import React from "react"
// import { Instances, Instance } from "@react-three/drei"

import { getDamageColor } from "Scene/utils/getDamageColor"
import { getDamageValue } from "Scene/utils/getDamageValue"

import { useNpc } from "Scene/Npc/useNpc"
import { useCloud } from "EventCloud/useCloud"
import { useCore } from "Scene/useCore"

import type { Damage } from "interfaces/damage.interface"
import type { ObjectData } from "interfaces/sceneData.interface"

import { BillboardTextMaterial, setShaderText, setShaderTextColor, setShaderAlpha } from "./materials/billboardTextMaterial"

import Tween from "Scene/utils/tween/tween"

const FloatingDamage = React.memo(function FloatingDamage() {
    const [events, removeEvent] = useCloud(state => [state.events, state.removeEvent])
    const [playerList] = useCloud(state => [state.playerList])
    const [getSceneObject] = useCore(state => [state.getSceneObject])

    const npcList = useNpc(state => state.npcList)

    // Store All Instance Ref to Reuse them
    // 100 - Max Amount Of Damage Indicators
    const instancesSize = 100
    const instancesSizeArray = React.useRef(new Array(instancesSize)) 
    const instanceRefs = React.useRef<{ [key: number]: THREE.Mesh }>({}) 
    const availableInstanceIds = React.useRef(Array.from({ length: instancesSize }, (_, index) => index))


    // Generate damage indicators
    React.useEffect(() => {
        // console.log('events', events)
        // console.log('availableInstanceIds', availableInstanceIds)
        events.forEach(event => {
            if (event.type === 'damage') {
                const npc = npcList.find(npc => npc?.id === String(event.npcId))
                const fighter = playerList.find(player => player?.id === String(event.npcId))
                const object = npc || fighter
                removeEvent(event)

                if (!object) { return }

                const target = getSceneObject(object.id)
                if (!target) { return }

                playDamage(event, target as any)

                // Send one more if double
                if (event.dmgType.isDouble) {
                    setTimeout(() => {
                        playDamage(event, target as any)
                    }, 100)
                }
            }
        })
    }, [events])

    const playDamage = React.useCallback((damageEvent: Damage, target: ObjectData) => {
        const instanceId = availableInstanceIds.current[0]
        if (typeof instanceId !== 'number') {
            return
        }

        const instance = instanceRefs.current[instanceId]
        availableInstanceIds.current = availableInstanceIds.current.filter((id: number) => id !== instanceId)

        // Play Logic
        if (!target.ref) { return }

        setShaderTextColor(getDamageColor(damageEvent), instance)
        setShaderText(getDamageValue(damageEvent), instance)

        const { x, z } = target.ref.position
        const { height } = target.dimensions
        const from = { opacity: 1.5, offsetY: .5 }
        const to = { opacity: 0, offsetY: 1.3 }

        instance.position.set(x, height+from.offsetY, z)

        Tween.to(from, to, {
            duration: 700,
            onChange(state) {
                instance.position.y = height + state.value.offsetY
                // // @ts-expect-error
                // textRef.current.material.uniforms['customAlpha'].value = state.value.opacity
                setShaderAlpha(state.value.opacity, instance)
            },
            onComplete: () => {
                setShaderAlpha(0, instance)
                // Release Instance
                if (!availableInstanceIds.current.includes(instanceId)) {
                    availableInstanceIds.current.push(instanceId)
                }
            }
        })
    }, [])


    return (
        <group name="floating-damage">
            {/* <Instances limit={instancesSize} range={instancesSize}>
                <planeGeometry />
                <BillboardTextMaterial/>
                {[...instancesSizeArray.current].map((_, i) => <Instance color={'red'} key={i} ref={r => instanceRefs.current[i] = r}/>)}
            </Instances> */}

            {[...instancesSizeArray.current].map((_, i) => (
                <mesh key={i} ref={r => instanceRefs.current[i] = r}>
                    <planeGeometry args={[3, 3, 1]} />
                    <BillboardTextMaterial/>
                </mesh>
            ))}
        </group>
    )
})

export default FloatingDamage