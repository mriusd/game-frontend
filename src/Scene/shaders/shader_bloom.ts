export const shader_bloom = () => {
    const fragmentShaderHeader = `
        // Time, Speed
        // uniform float uTime;
        uniform float uBloomIntensity;
        uniform float uAnimateSpeed;
        uniform bool uAnimateBloom;
        uniform float uBloomRandom;
    `
    const fragmentShaderFooter = `
        float scaleBloom = (sin((uTime-uBloomRandom-vPosition.x-vPosition.y)*uAnimateSpeed)+1.)/4.; // from 0 to 0.5
        float intensity = uBloomIntensity;
        if (uAnimateBloom) {intensity-=intensity*scaleBloom;}
        gl_FragColor.rgb *= intensity;

    `

    const uniforms = {
        // Global
        uTime: { value: 0 },
        uBloomIntensity: { value: 2.5 },
        uAnimateBloom: { value: false },
        uAnimateSpeed: { value: 1 },
        uBloomRandom: { value: Math.random()*100 }
    }

    return {
        injectFragmentShader: {
            header: fragmentShaderHeader,
            footer: fragmentShaderFooter
        },
        uniforms,
    }
}