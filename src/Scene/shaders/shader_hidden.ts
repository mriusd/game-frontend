import { perlin4d } from "./presets/perlin4d"

export const shader_hidden = () => {
    const vertexShaderHeader = `
        varying vec2 newUv;
        varying vec3 vPosition;
        varying vec4 vWorldPosition;
    `
    const vertexShaderFooter = `
        newUv = uv;
        vWorldPosition = modelMatrix * vec4(position, 1.0);
        vPosition = position;
    `
    const fragmentShaderHeader = `
        varying vec2 newUv;
        varying vec3 vPosition;
        varying vec4 vWorldPosition;

        uniform vec3 uColorPrimary;
        uniform vec3 uColorAccent;

        // Time, Speed
        uniform float uTime;

        // Wave Base
        uniform float uWaveBaseFrequency;
        uniform float uWaveBaseStrength;
        uniform float uWaveBaseSpeed;
        uniform float uWaveBaseAlpha;

        // Laminate
        uniform float uLaminateIntensity;

        uniform bool uVisible;
        uniform float uHiddenAlpha;

        ${perlin4d}

        float getFlashAlpha(float perlingStrength) {
            float filledFlashAlpha = mix(0.1, 0.2, perlingStrength);
            float strokeFlashAlpha = 1. - smoothstep(0., 1., abs(perlingStrength));
            strokeFlashAlpha = mix(0., .5, strokeFlashAlpha);
            float combinedFlashFilledAlpha = max(filledFlashAlpha, strokeFlashAlpha);
            float solidCombined = max(0., combinedFlashFilledAlpha);
            return solidCombined;
        }

        vec3 getGlossColor() {
            return normalize(uColorPrimary) * uLaminateIntensity;
        }
    `
    const fragmentShaderFooter = `
        if (uVisible) { return; }

        // Model Color
        vec3 baseColor = gl_FragColor.rgb * gl_FragColor.a;

        // Choose Color
        vec3 colorAccent = uColorAccent;

        float t_waveBase = uTime * uWaveBaseSpeed;
        float waveBaseAccentPerling = perlin4d(vec4(vec3(newUv.x - t_waveBase, newUv.y + newUv.x - t_waveBase, 1.) * uWaveBaseFrequency, 1.)) * uWaveBaseStrength;
        float waveBaseAccentAlpha = getFlashAlpha(waveBaseAccentPerling);
        vec3 waveBaseAccentColor = normalize(colorAccent) * waveBaseAccentAlpha * uWaveBaseAlpha;

        vec3 glossColor = getGlossColor();
        gl_FragColor = vec4(baseColor + waveBaseAccentColor + glossColor, gl_FragColor.a * uHiddenAlpha);
    `

    const uniforms = {
        uColorPrimary: { value: { r: 255, g: 255, b: 255 } },
        uColorAccent: { value: { r: 245, g: 237, b: 201 } },

        // Global
        uTime: { value: 0 },

        // Wave Base
        uWaveBaseFrequency: { value: 2 },
        uWaveBaseStrength: { value: 10.0 },
        uWaveBaseSpeed: { value: 0.05 },
        uWaveBaseAlpha: { value: 0.3 },

        // Laminate
        uLaminateIntensity: { value: 0.3 },

        uVisible: { value: true },
        uHiddenAlpha: { value: .5 }
    }

    return {
        injectVertexShader: {
            header: vertexShaderHeader,
            footer: vertexShaderFooter
        },
        injectFragmentShader: {
            header: fragmentShaderHeader,
            footer: fragmentShaderFooter
        },
        uniforms,
    }
}