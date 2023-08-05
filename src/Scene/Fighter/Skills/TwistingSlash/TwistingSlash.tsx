import * as THREE from 'three'
import { useEffect, useMemo, useRef, useState } from "react"
import { Twisting } from "./Twisting"
import { useFrame } from "@react-three/fiber"
import { useControls } from 'leva'
import Tween from 'Scene/utils/tween/tween'
import { TwistingSword } from './TwistingSword'

const TwistingSlash = ({ renderEffect, onEffectComplete }) => {
    const isPlaying = useRef(false)
    const clock = useMemo(() => new THREE.Clock(),[])

    const [swords, _setSwords] = useState<Array<{id: number, progress: number}>>([])
    const setSwords = (sword: {id: number, progress: number} | null) => {
        _setSwords((prev) => {
            const newState = [...prev]
            if (!sword) {
                newState.pop()
                return newState
            }
            if (newState.findIndex((_) => _.id === sword.id) !== -1) { return newState } 
            newState.push({...sword})
            return newState
        })
    }
    // const swords = useRef<Array<{id: number, progress: number}>>([])

    const environment = useControls('Global', {
        play: { value: false },
        alwaysPlay: { value: false },
    })
    const aura = useControls('Aura', {
        duration: { min: 100, max: 5000, value: 700 },
        pointSize: { min: 0, max: 50, value: 8 },
        density: { min: 100, max: 10000, value: 5000 },
        speedMin: { min: 0., max: .9, value: 0 },
        tubeRadius: { min: 0, max: 2, value: .5 },
        moveRadius: { min: 0, max: 4, value: 1.25 },
        alphaDifference: { min: 0, max: 1, value: .45 },
        alphaMultiplier: { min: 0, max: 5, value: 1.2 },
        lengthCoef: { min: 0, max: 1, value: .05 },
        color: { value: { r: 178, g: 178, b: 255 }  }
    })
    const strikes = useControls('Strikes', {
        strikeDensity: { min: 1, max: 500, value: 100 },
        strikePointSize: { min: 0, max: 50, value: 4 },
        strikeSpeed: { min: 0., max: 5, value: 2 },
    })
    const swordSetting = useControls('Swords', {
        count: { min: 1, max: 20, value: 15 },
        minPos: { min: 0, max: .5, value: 0 },
        maxPos: { min: .5, max: 1, value: 1 },
        spawnDelay: { min: 0, max: 3, value: 0.1 },

        rotX: { min: -Math.PI*2, max: Math.PI*2, value: -Math.PI/2  },
        rotY: { min: -Math.PI*2, max: Math.PI*2, value: .25  },
        rotZ: { min: -Math.PI*2, max: Math.PI*2, value: 2  },
        rotCircleZ: { min: -Math.PI*2, max: Math.PI*2, value: .5  },

        rotCoefZ: { min: 0, max: 10, value: 6  },

        posY: { min: -1, max: 1, value: .1 },
        size: { min: 0, max: 2, value: 1 },

        removeDelay: { min: 0, max: 1, value: .35 },
    })

    const settings = useMemo(() => ({ ...aura, ...strikes }), [aura, strikes])

    const twisting = useMemo(() => Twisting(settings), [settings])

    useEffect(() => {
        if (isPlaying.current) { return }
        if (environment.alwaysPlay) { return }
        if (!renderEffect.current) { return }

        isPlaying.current = true
        Tween.to(0, 1, {
            duration: settings.duration,
            onChange(ctx) {
                twisting.material.uniforms['uProgress'].value = ctx.value
                if (ctx.value > 0) {
                    updateSwords(ctx.value, swordSetting.count)
                }
            },
            onComplete() {
                isPlaying.current = false
                twisting.material.uniforms['uProgress'].value = 0
                updateSwords(0, swordSetting.count)
                // TODO: Fixme, just for test
                onEffectComplete()
            }
        })
    }, [renderEffect.current])
    function updateSwords(progress: number, count: number) {
        const delay = swordSetting.spawnDelay
        progress = progress * (1+delay) - delay

        const min = swordSetting.minPos
        const max = swordSetting.maxPos
        if (progress < min) { return _setSwords([]) }
        if (progress > max) { return _setSwords([]) }

        for (let i = count; i > 0; i--) {
            if (progress+0.03 >= i * 1 / count) {
                return setSwords({ id: i, progress })
            }
        }
        // if (swords.length > count / 2) { setSwords(null) }
    }

    useFrame(() => {
        if (environment.alwaysPlay) {
            const t = clock.getElapsedTime() * 8 % 10 / 10
            twisting.material.uniforms['uProgress'].value = t
            updateSwords(t, swordSetting.count)
        }
        twisting.material.uniforms['uTime'].value = clock.getElapsedTime()
    })

    return (
        <group name='twisting-slash' position={[0, 1.5, 0]} rotation={[0, Math.PI / 2 + .3, 0]}>
            <primitive
                object={twisting}
            >
            </primitive>
            { swords.map(_ => 
                <TwistingSword 
                    settings={swordSetting}
                    duration={settings.duration}
                    progress={_.progress}
                    radius={settings.moveRadius}
                    key={_.id}
                />
            )}
        </group>

    )
}

export default TwistingSlash