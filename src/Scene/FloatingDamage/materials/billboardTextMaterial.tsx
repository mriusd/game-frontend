import React from "react"
import * as THREE from 'three'
import { useTexture } from "@react-three/drei"


function url(name: number) { return `assets/floating_damage/${name}.png`}
const urls = [url(0),url(1),url(2),url(3),url(4),url(5),url(6),url(7),url(8),url(9)]


const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
        vec3 scale = vec3(
            length(modelViewMatrix[0].xyz),
            length(modelViewMatrix[1].xyz),
            length(modelViewMatrix[2].xyz)
        );
        // size attenuation: scale *= -mvPosition.z * 0.2;
        mvPosition.xyz += position * scale;
        gl_Position = projectionMatrix * mvPosition;
    }

`

const fragmentShader = `
    uniform sampler2D uMaps[${urls.length}];
    uniform int uNumber[5];
    varying vec2 vUv;

    vec4 getNumberTexture() {
        vec2 uv = vec2(vUv.x * 5., vUv.y);
        vec4 color0 = texture2D(uMaps[0], vec2(uv.x, uv.y));
        vec4 color1 = texture2D(uMaps[1], vec2(uv.x+1., uv.y));
        vec4 color2 = texture2D(uMaps[2], vec2(uv.x+2., uv.y));
        vec4 color3 = texture2D(uMaps[3], vec2(uv.x+3., uv.y));
        vec4 color4 = texture2D(uMaps[4], vec2(uv.x+4., uv.y));
        return color0+color1+color2+color3+color4;
    }

    void main() {
        vec4 color = getNumberTexture();
        gl_FragColor = vec4(color.rgb, color.a);
    }

`

// for (float i = 0.0; i < ${samples}.0; i ++) {
//     vec3 sampleNorm = normalize(n + roughnessFactor * roughnessFactor * 2.0 * normalize(vec3(rand() - 0.5, rand() - 0.5, rand() - 0.5)) * pow(rand(), 0.33) + distortionNormal);
//     transmissionR = getIBLVolumeRefraction(
//       sampleNorm, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
//       pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness  + thickness_smear * (i + randomCoords) / float(${samples}),
//       material.attenuationColor, material.attenuationDistance
//     ).r;
//     transmissionG = getIBLVolumeRefraction(
//       sampleNorm, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
//       pos, modelMatrix, viewMatrix, projectionMatrix, material.ior  * (1.0 + chromaticAberration * (i + randomCoords) / float(${samples})) , material.thickness + thickness_smear * (i + randomCoords) / float(${samples}),
//       material.attenuationColor, material.attenuationDistance
//     ).g;
//     transmissionB = getIBLVolumeRefraction(
//       sampleNorm, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
//       pos, modelMatrix, viewMatrix, projectionMatrix, material.ior * (1.0 + 2.0 * chromaticAberration * (i + randomCoords) / float(${samples})), material.thickness + thickness_smear * (i + randomCoords) / float(${samples}),
//       material.attenuationColor, material.attenuationDistance
//     ).b;
//     transmission.r += transmissionR;
//     transmission.g += transmissionG;
//     transmission.b += transmissionB;
//   }


export const BillboardTextMaterial = () => {
    const textures = useTexture(urls)

    const material = React.useMemo(() => {
        return new THREE.ShaderMaterial({
            transparent: true,
            depthTest: false,
            vertexShader,
            fragmentShader,
            uniforms: {
                uMaps: { value: [...textures] }, // Array of texture numbers
                uNumber: { value: [1, 4, 9, 5] } // Array of numbers [0,9]
            }
        })
    }, [textures])


    return <primitive object={material} attach="material" />
}