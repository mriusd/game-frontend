import * as THREE from 'three'
import React from 'react'
import { rand } from 'Scene/shaders/presets/rand'
import { normalizeColor } from 'Scene/shaders/presets/normalizeColor'
import Tween from 'Scene/utils/tween/tween'
import { useControls } from 'leva'


const config = {
    duration: 700,
    pointSize: 10,
    density: 5000,
    speedMin: 0,
    tubeRadius: .5,
    moveRadius: 2,
    alphaDifference: .45,
    alphaMultiplier: 1.2,
    lengthCoef: .05,
    color: { r: 178, g: 178, b: 255 },
    strikeDensity: 100,
    strikePointSize: 4,
    strikeSpeed: 2,
    position: { x: 0, y: 2, z: 0 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 },
}

export const useTwistingSlash = () => {
    const points = React.useMemo(() => {
        const material = new THREE.ShaderMaterial({
            transparent: true,
            toneMapped: false,
            uniforms: {
                uTime: { value: 0 },
                uProgress: { value: 0 },
                uPointSize: { value: config.pointSize },
                uMoveRadius: { value: config.moveRadius },
                uAlphaDifference: { value: config.alphaDifference },
                uAlphaMultiplier: { value: config.alphaMultiplier },
                uLengthCoef: { value: config.lengthCoef },
    
                // Strike
                uStrikePointSize: { value: config.strikePointSize },
                uStrikeSpeed: { value: config.strikeSpeed },
    
                uColor: { value: config.color }
            },
            vertexShader: `
                attribute vec3 initialPosition;
                attribute float speed;
                attribute float strikeSpeed;
                uniform float uProgress;
                uniform float uTime;
                uniform float uPointSize;
                uniform float uMoveRadius;
                uniform float uStrikePointSize;
                uniform float uStrikeSpeed;
    
                varying float relativeAngle;
                varying float phase;
                varying float vSpeed;
                varying float vStrikeSpeed;
                varying float vStrikeProgess;
    
    
                #define PI 3.1415926535
    
                ${rand}
                
                void main() {
                    vSpeed = speed;
                    vStrikeSpeed = strikeSpeed;
                    vStrikeProgess = clamp(0., 1., uProgress * uStrikeSpeed);
    
                    // Get the initial position
                    vec3 initialPos = initialPosition - vec3(uMoveRadius, 0.0, 0.0);
                    vec4 mvPosition;
                
                    // Calculate the new position
                    float ang = atan(initialPos.y, initialPos.x);
                    float dist = length(initialPos.xy);
                    ang += (uProgress * PI * 3.5) * speed;
    
    
                    // Strikes & Aura
                    if (strikeSpeed > 0.) {
                        vec3 randDir = normalize(vec3(rand(initialPosition.xy), rand(initialPosition.yz), rand(initialPosition.zx)));
                        vec3 pos = initialPosition + randDir * strikeSpeed * vStrikeProgess;
                        pos.x = pos.x - uMoveRadius;
                        pos.y += vStrikeProgess/2. * strikeSpeed;
                        pos.x -= vStrikeProgess*1.25 * strikeSpeed;
                        pos.z += sin(ang / 2.)/4. * vStrikeProgess * strikeSpeed;
    
                        mvPosition = modelViewMatrix * vec4( pos, 1.0 );
                        gl_PointSize = uStrikePointSize / -mvPosition.z * 8.0;
                    } else {
                        vec3 pos;
                        pos.x = dist * cos(ang);
                        pos.z = dist * sin(ang);
                        pos.y = initialPos.z;
        
                        // calculate relativePhase based on speed
                        relativeAngle = ang;
                        phase = mod(uProgress - ang / (2.0 * PI), 1.0);
        
                        mvPosition = modelViewMatrix * vec4( pos, 1.0 );
                        gl_PointSize = uPointSize / -mvPosition.z * 8.0;
                    }
    
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying float phase;
                uniform float uProgress;
                uniform float uAlphaDifference;
                uniform float uAlphaMultiplier;
                uniform vec3 uColor;
                uniform float uLengthCoef;
                varying float relativeAngle;
                varying float vSpeed;
                varying float vStrikeSpeed;
                varying float vStrikeProgess;
                
    
                #define PI 3.1415926535
    
                ${normalizeColor}
    
                void main() {
                    if (uProgress < .01) { 
                        discard;
                    }
    
                    if (vStrikeSpeed > 0.) {
                        gl_FragColor = vec4(normalizeColor(uColor), 1. - vStrikeProgess);
                    } else {
                        // TODO: fix error, relative angle a little wrong, some points just invisible all the time
                        if (relativeAngle > PI) {
                            discard;
                        }
        
                        if (phase > max(0., (1. - uProgress * uLengthCoef))) {  // adjust threshold as necessary
                            discard;
                        }
                        
                        float alpha = clamp(0., 1., (vSpeed - uAlphaDifference) * uAlphaMultiplier);
                        gl_FragColor = vec4(normalizeColor(uColor), alpha);
                    }
                }
            `
        })
    
    
        const geometry = new THREE.BufferGeometry()
        const count = config.density
        const strikesCount = config.strikeDensity
    
        const vertices = []
        const speeds = []
        for (let i = 0; i < count + strikesCount; i++) {
            const {x, y, z} = getRandomPointInSphere(config.tubeRadius)
            vertices.push(x, y, z)
            const min = config.speedMin
            speeds.push(Math.random() * (1. - min) + min)
        }
    
        const strikeSpeed = []
        for (let i = 0; i < strikesCount; i++) {
            strikeSpeed.push(Math.random() * 1.5 + .5)
        }
        for (let i = 0; i < count; i++) {
            strikeSpeed.push(0)
        }
    
    
        function getRandomPointInSphere(radius: number) {
            // Use spherical coordinates to ensure even distribution
            var u = Math.random();
            var v = Math.random();
            var theta = 2 * Math.PI * u; // azimuthal angle
            var phi = Math.acos(2 * v - 1); // polar angle
        
            // Convert spherical coordinates to cartesian
            var x = radius * Math.sin(phi) * Math.cos(theta);
            var y = radius * Math.sin(phi) * Math.sin(theta);
            var z = radius * Math.cos(phi);
        
            // Generate a random radius for each point to create a solid ball
            var pointRadius = Math.cbrt(Math.random()) * radius;
            return { x: x*pointRadius, y: y*pointRadius, z: z*pointRadius };
        }
    
        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
        geometry.setAttribute( 'initialPosition', new THREE.Float32BufferAttribute( vertices, 3 ) );
        geometry.setAttribute( 'speed', new THREE.Float32BufferAttribute(speeds, 1) );
        geometry.setAttribute( 'strikeSpeed', new THREE.Float32BufferAttribute(strikeSpeed, 1) );
    
        const points = new THREE.Points(geometry, material)
        points.position.set(config.position.x, config.position.y, config.position.z)
        points.rotation.set(config.rotation.x, config.rotation.y, config.rotation.z)

        return points
    }, [])
    
    const isPlaying = React.useRef(false)
    const play = React.useCallback((onComplete?: () => void) => {
        if (isPlaying.current) { return }

        isPlaying.current = true
        Tween.to(0, 1, {
            duration: config.duration,
            onChange(ctx) {
                points.material.uniforms['uProgress'].value = ctx.value
            },
            onComplete() {
                isPlaying.current = false
                points.material.uniforms['uProgress'].value = 0
                onComplete && onComplete()
            }
        })
    }, [])

    return {mesh: points, play}
}
