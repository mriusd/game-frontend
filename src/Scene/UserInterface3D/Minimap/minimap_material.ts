import * as THREE from 'three'

const npcMaxCountToRender = 100

const minimap_material = () => {
    const material = new THREE.ShaderMaterial({
        uniforms: {
            uNpcCoordinates: { value: new Array(npcMaxCountToRender).fill(new THREE.Vector3(0, -1, 0)) },
            uPlayerCoordinate: {  value: { x: 0, y: 0, z: 0 } },
            uBaseMap: { value: null }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
            }
        `,
        fragmentShader: `
            const int NpcMaxCount = ${npcMaxCountToRender}; 
            uniform vec3 uNpcCoordinates[NpcMaxCount];
            uniform vec3 uPlayerCoordinate;
            uniform sampler2D uBaseMap;
            varying vec2 vUv;


            float getRectangle(vec3 pos, float halfWidth) {
                float rectX = step(pos.x - halfWidth, vUv.x) - step(pos.x + halfWidth, vUv.x);
                float rectY = step(1. - pos.z - halfWidth, vUv.y) - step(1. - pos.z + halfWidth, vUv.y);
                return rectX * rectY;
            }


            void main() {
                // Fighter (Player)
                vec3 playerColor = vec3(0., 1., 0.) * getRectangle(uPlayerCoordinate, .015);

                // Red Npc
                vec3 npcesColor = vec3(0., 0., 0.);
                for (int i = 0; i < NpcMaxCount; i++) {
                    // If less than zero means not to render
                    if (uNpcCoordinates[i].y >= 0.) {
                        npcesColor += vec3(1., 0., 0.) * getRectangle(uNpcCoordinates[i], .015);
                    } 
                }


                gl_FragColor = vec4(texture2D(uBaseMap, vUv).rgb + playerColor + npcesColor, 1.);
            }
        `
    })

    return material
}

export { minimap_material }