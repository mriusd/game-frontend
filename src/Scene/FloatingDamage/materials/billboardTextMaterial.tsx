import React from "react"
import * as THREE from 'three'
import { useTexture } from "@react-three/drei"


const numberSize = 5
const skipSymbol = 0 // 0 => "@"

export const BillboardTextMaterial = () => {
    const textImage = useTexture('assets/textImage.png')

    const material = React.useMemo(() => {
        return new THREE.ShaderMaterial({
            transparent: true,
            depthTest: false,
            uniforms: {
                uNumber: { value: [] }, // Array of numbers in ASCII
                uChannel0: { value: textImage },
                uColor: { value: { r: 0, g: 0, b: 0 } },
                uAlpha: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    vec4 mvPosition = vec4( 0.0, 0.0, 0.0, 1.0 );
                    #ifdef USE_INSTANCING
                        mvPosition = instanceMatrix * mvPosition;
                    #endif
                    mvPosition = modelViewMatrix * mvPosition;
                    vec3 scale = vec3(
                        length(modelViewMatrix[0].xyz),
                        length(modelViewMatrix[1].xyz),
                        length(modelViewMatrix[2].xyz)
                    );
                    // // size attenuation: scale *= -mvPosition.z * 0.2;
                    mvPosition.xyz += position * scale;
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform sampler2D uChannel0;
                uniform int uNumber[${numberSize}];
                uniform vec3 uColor;
                uniform float uAlpha;

                //source -> https://www.shadertoy.com/view/4sBfRd
                //thanks to Fabrice Neyret for algorhitm https://www.shadertoy.com/view/llySRh
                #define C(c) U.x-=.5; O+= char(U,64+c)
                
                vec4 char(vec2 p, int c) 
                {
                    if (p.x<.0|| p.x>1. || p.y<0.|| p.y>1.) return vec4(0,0,0,1e5);
                    return textureGrad( uChannel0, p/16. + fract( vec2(c, 15-c/16) / 16. ), dFdx(p/16.),dFdy(p/16.) );
                }

                void main() {
                    vec4 O = vec4(0.0);

                    // uv /= iResolution.y;
    
                    vec2 uv = vUv;
                    vec2 position = vec2(.5);
                    float FontSize = 4.;
                    vec2 U = ( uv - position )*64.0/FontSize;
    
    
                    for (int i = 0; i < ${numberSize}; i++) {
                        if (uNumber[i] != ${skipSymbol}) {
                            C(uNumber[i]);
                        }
                    }
    
                    O = O.xxxx;
                    O.rgb *= uColor;
                    if (O.a < .3) { discard; }
    
                    gl_FragColor = vec4(O.rgb, O.a * uAlpha);
                }
            `
        })
    }, [textImage])

    return <primitive object={material} attach="material" />
}

export const setShaderText = (text: string, mesh: THREE.Mesh) => {
    const array = text.split('').map(_ => _.charCodeAt(0) - 64)
    array.push(...Array.from({ length: numberSize - text.length }, () => skipSymbol))
    
    if ((mesh.material as THREE.ShaderMaterial).uniforms) {
        (mesh.material as THREE.ShaderMaterial).uniforms[ 'uNumber' ].value = array
    } 
}

export const setShaderTextColor = (color: number, mesh: THREE.Mesh) => {
    if ((mesh.material as THREE.ShaderMaterial).uniforms) {
        (mesh.material as THREE.ShaderMaterial).uniforms[ 'uColor' ].value = new THREE.Color(color)
    } 
}

export const setShaderAlpha = (alpha: number, mesh: THREE.Mesh) => {
    if ((mesh.material as THREE.ShaderMaterial).uniforms) {
        (mesh.material as THREE.ShaderMaterial).uniforms[ 'uAlpha' ].value = alpha
    } 
}