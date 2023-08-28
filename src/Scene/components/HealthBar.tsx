import * as THREE from "three"
import { useFrame } from "@react-three/fiber"
import { useEffect, useRef, memo } from "react"
import { Sprite, Shader } from "three"
import { getMeshDimensions } from "Scene/utils/getMeshDimensions"

const HealthBar = memo(function HealthBar({ object, target, offset = 0 }: any) {
    const bar = useRef<Sprite | null>(null)
    const shader = useRef<Shader | null>(null)
    const textBoundingBox = useRef<ReturnType<typeof getMeshDimensions> | null>(null)

    useFrame(() => {
        if (!bar.current) { return }
        if (!object) { return }
        if (!target.current) { return }
        if (!textBoundingBox.current) {
            textBoundingBox.current = getMeshDimensions(target.current)
            return
        }
        const { x, y, z } = target.current.position
        bar.current.position.set(x, y + textBoundingBox.current.height + offset, z)
    })

    const onBeforeCompile = (_shader: Shader) => {
        _shader.uniforms.maxHealth = { value: object.maxHealth }
        _shader.uniforms.currentHealth = { value: object.currentHealth }

        _shader.vertexShader = _shader.vertexShader.replace(`uniform vec2 center;`, `
            uniform vec2 center;
            // varying vec2 vUv;
        `)

        _shader.vertexShader = _shader.vertexShader.replace(`#include <fog_vertex>`, `
            #include <fog_vertex>
            // vUv = uv;
        `)

        _shader.fragmentShader = _shader.fragmentShader.replace(`uniform float opacity;`, `
            uniform float opacity;
            uniform float maxHealth;
            uniform float currentHealth;
            varying vec2 vUv;
        `)

        _shader.fragmentShader = _shader.fragmentShader.replace(`#include <fog_fragment>`, `
            #include <fog_fragment>
            float health = currentHealth / maxHealth;
            float height = .96;

            // Height & position
            float alpha = step(height, 1. - vUv.y);

            // Green -> Yellow -> Red
            vec3 healthColor = vec3(0., 1., 0.);
            if (health > .3 && health < .65) {
                 healthColor = vec3(1., 1., 0.);
            }
            if (health <= .3) {
                healthColor = vec3(1., 0., 0.);
            }

            // Width
            float alphaWidth = step(vUv.x, health);

            gl_FragColor = vec4(healthColor, alpha * alphaWidth * .7);
        `)

        shader.current = _shader 
        return _shader
    }

    useEffect(() => {
        if (!shader.current) { return }
        shader.current.uniforms.currentHealth.value = object.currentHealth
        shader.current.uniforms.maxHealth.value = object.maxHealth
    }, [ object ])

    return (
        <sprite visible={!!object && !!target.current && !!textBoundingBox.current} ref={bar}>
            <spriteMaterial attach="material" onBeforeCompile={onBeforeCompile} />
        </sprite>
    )
})

export default HealthBar