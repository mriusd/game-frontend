import { perlin4d } from "./presets/perlin4d"
import { normalizeColor } from "./presets/normalizeColor"

export const shader_level = () => {
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

        uniform float uLevel;
        uniform vec3 uColorPrimary;
        uniform vec3 uColorAccent;
        uniform vec3 uColorSecondary;
        uniform bool uIsExellent;

        // Excellent
        uniform float uExcellentColorSpeed;
        uniform vec3 uExcellentColorStop1;
        uniform vec3 uExcellentColorStop2;
        uniform vec3 uExcellentColorStop3;

        // Time, Speed
        uniform float uTime;

        // Flashing
        uniform float uFlashingSpeed;
        uniform float uFlashingFrequency;
        uniform float uFlashingStrength;
        

        // Flicker
        uniform float uFlickerEdge;
        uniform float uFlickerIntensity;
        uniform float uFlickerSpeed;

        // Flicker Reversed
        uniform float uFlickerReversedEdge;
        uniform float uFlickerReversedIntensity;
        uniform float uFlickerReversedSpeed;

        // Wave Base
        uniform float uWaveBaseFrequency;
        uniform float uWaveBaseStrength;
        uniform float uWaveBaseSpeed;
        uniform float uWaveBaseAlpha;

        // Laminate
        uniform float uLaminateIntensity;


        ${perlin4d}
        ${normalizeColor}

        float getFlashAlpha(float perlingStrength) {
            float filledFlashAlpha = mix(0.3, .5, perlingStrength);
            float strokeFlashAlpha = 1. - smoothstep(0., 1., abs(perlingStrength));
            strokeFlashAlpha = mix(0., .5, strokeFlashAlpha);
            float combinedFlashFilledAlpha = max(filledFlashAlpha, strokeFlashAlpha);
            float solidCombined = max(0.1, combinedFlashFilledAlpha);
            return solidCombined;
        }
        float getSolidFlashAlpha(float perlingStrength) {
            return mix(0., .2, smoothstep(0., 1., perlingStrength+.5));
        }
        float getVerticalFlicker(vec3 position) {
            float t = uTime * uFlickerSpeed;
            float width = 0.;
            float edge = uFlickerEdge;
            float move = sin(t);
            float flicker = ( 1. - smoothstep(width+edge, width+edge, abs(position.x*cos(t) - position.z*sin(t))) );
            return flicker * uFlickerIntensity;
        }
        float getVerticalFlickerReversed(vec3 position) {
            float t = uTime * uFlickerReversedSpeed;
            float move = sin(t);
            float width = uFlickerReversedEdge;
            float edge = 0.;
            float flicker = ( 1. - smoothstep(width, width+edge, abs(position.x*cos(t) + position.z*sin(t))) );
            // * step(0., position.z*cos(t))
            return flicker * uFlickerReversedIntensity;
        }
        vec3 getExcellentColor(vec3 position) {
            float t = (sin(position.y + uTime * uExcellentColorSpeed) + 1.)/2.;
            float t2 = (sin(position.x + uTime / 2. * uExcellentColorSpeed) + 1.)/2.;
            vec3 color = mix(normalize(uExcellentColorStop1)/4., mix(normalize(uExcellentColorStop2)*2., normalize(uExcellentColorStop3), t), t2);
            return color;
        }
        
        vec3 getGlossColor() {
            return normalize(uColorPrimary) * uLaminateIntensity;
        }
    `
    const fragmentShaderFooter = `
        vec3 newPos = vViewPosition;

        // Flashing
        float t_flashing = uTime * uFlashingSpeed;
        float flashingPerling = perlin4d(vec4(vec3(newUv.x, newUv.y, 1.) * uFlashingFrequency, 1.)) * uFlashingStrength;
        float flashing = (((sin(t_flashing) + 1.) / 2.)+.2);

        // Model Color
        vec3 baseColor = gl_FragColor.rgb * gl_FragColor.a;

        // Choose Color
        vec3 colorAccent;
        if (uIsExellent) {
            colorAccent = getExcellentColor(vPosition);
        } else {
            colorAccent = uColorAccent;
        }

        // Base Wave lvl 7+
        float t_waveBase = uTime * uWaveBaseSpeed;
        float waveBaseAccentPerling = perlin4d(vec4(vec3(newUv.x - t_waveBase, newUv.y - t_waveBase, 1.) * uWaveBaseFrequency, 1.)) * uWaveBaseStrength;
        float waveBaseAccentAlpha = getFlashAlpha(waveBaseAccentPerling);
        vec3 waveBaseAccentColor = normalize(colorAccent) * waveBaseAccentAlpha * uWaveBaseAlpha;

        // Flicker
        float verticalFlickerAlpha = getVerticalFlicker(vPosition) / 2.;
        float verticalFlickerReversed = getVerticalFlickerReversed(vPosition) / 2.;


        // Level 0
        if (uLevel < 0.5 && uIsExellent == false) {
            return;
        }

        // Level 1-6 + 0 for exellent
        if (uLevel < 6.5) {
            float darkest = uLevel / 10.;
            vec3 baseColor;
            vec3 colorAccentWave;

            float flashAlpha = mix(0., .2, smoothstep(0., 1., flashingPerling));

            if (uIsExellent) {
                baseColor = (gl_FragColor.rgb - darkest/1.5) * gl_FragColor.a;
                colorAccentWave = colorAccent * pow(uLevel + 20., 1.25) * flashAlpha * flashing;
            } else {
                baseColor = (gl_FragColor.rgb - darkest/1.5) * gl_FragColor.a;
                colorAccentWave = normalize(uColorPrimary) * pow(uLevel + 15., 1.25) * flashAlpha * flashing;
            }

            gl_FragColor = vec4(baseColor + colorAccentWave, gl_FragColor.a);
            return;
        }

        // level 7-8
        if (uLevel < 8.5) {
            gl_FragColor = vec4(baseColor + waveBaseAccentColor, gl_FragColor.a);
            return;
        }

        // level 9-10
        if (uLevel < 10.5) {
            vec3 glossColor = getGlossColor();
            gl_FragColor = vec4(baseColor + waveBaseAccentColor + glossColor, gl_FragColor.a);
            return;
        }

        // level 11-12
        if (uLevel < 12.5) {
            gl_FragColor = vec4(baseColor + waveBaseAccentColor, gl_FragColor.a);
            gl_FragColor.rgb += verticalFlickerAlpha;
            return;
        }

        // level 13-14
        if (uLevel < 14.5) {
            gl_FragColor = vec4(baseColor + waveBaseAccentColor, gl_FragColor.a);
            gl_FragColor.rgb += verticalFlickerAlpha;
            gl_FragColor.rgb += verticalFlickerReversed;
            return;
        }

        // level 15
        if (uLevel < 15.5) {
            gl_FragColor = vec4(baseColor + waveBaseAccentColor, gl_FragColor.a);
            gl_FragColor.rgb += verticalFlickerAlpha;
            gl_FragColor.rgb += verticalFlickerReversed;
            gl_FragColor.rgb *= 2.;
            return;
        }
    `

    const uniforms = {
        uLevel: { value: 0 },
        uIsExellent: { value: false },
        uColorPrimary: { value: { r: 255, g: 255, b: 255 } },
        uColorAccent: { value: { r: 245, g: 237, b: 201 } },
        uColorSecondary: { value: { r: 245, g: 237, b: 201 } },

        // Global
        uTime: { value: 0 },

        // Excellent
        uExcellentColorSpeed: { value: 2.0 },
        uExcellentColorStop1: { value: { r: 0, g: 255, b: 0 } },
        uExcellentColorStop2: { value: { r: 255, g: 0, b: 0 } },
        uExcellentColorStop3: { value: { r: 0, g: 0, b: 255 } },

        // Flashing
        uFlashingSpeed: { value: 2 },
        uFlashingFrequency: { value: 5.5 },
        uFlashingStrength: { value: 0.5 },

        // Flicker
        uFlickerSpeed: { value: 0.6 },
        uFlickerIntensity: { value: 0.45 },
        uFlickerEdge: { value: 0.05 },

        // Flicker Reversed
        uFlickerReversedSpeed: { value: 1.2 },
        uFlickerReversedIntensity: { value: 0.6 },
        uFlickerReversedEdge: { value: 0.05 },

        // Wave Base
        uWaveBaseFrequency: { value: 2.0 },
        uWaveBaseStrength: { value: 4.0 },
        uWaveBaseSpeed: { value: 0.3 },
        uWaveBaseAlpha: { value: 1.0 },

        // Laminate
        uLaminateIntensity: { value: 0.3 }
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