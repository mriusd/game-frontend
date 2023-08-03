import { EffectComposer, DepthOfField, Bloom, Noise, Vignette, ColorAverage, HueSaturation } from '@react-three/postprocessing'
import { BlurPass, Resizer, KernelSize, Resolution } from 'postprocessing'
import { ToneMapping } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { SelectiveBloom } from '@react-three/postprocessing'

import { useControls } from 'leva'

const Postprocessing = () => {

    const { blendFunction } = useControls({
        blendFunction: {
            label: "Blend Function",
            options: [
                BlendFunction.OVERLAY,
                BlendFunction.NORMAL,
                BlendFunction.ADD,
                BlendFunction.COLOR_BURN,
                BlendFunction.COLOR_DODGE,
                BlendFunction.DARKEN,
                BlendFunction.LIGHTEN,
                BlendFunction.MULTIPLY
            ]
        }
    });

    const { hue, saturation } = useControls({
        hue: {
            value: 0,
            min: 0,
            max: Math.PI,
            step: 0.1
        },
        saturation: {
            value: Math.PI,
            min: 0,
            max: Math.PI,
            step: 0.1
        }
    });

    const { middleGrey, maxLuminance } = useControls({
        middleGrey: {
            min: 0,
            max: 1,
            value: 0.6,
            step: 0.1
        },
        maxLuminance: {
            min: 0,
            max: 64,
            value: 16,
            step: 1
        }
    });

    return (
        <EffectComposer>
            <ColorAverage blendFunction={blendFunction} />
            <HueSaturation hue={hue} saturation={saturation} />
            <ToneMapping middleGrey={middleGrey} maxLuminance={maxLuminance} />
            <Bloom kernelSize={KernelSize.LARGE} luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
            {/* <SelectiveBloom
                        // lights={[lightRef1, lightRef2]} // ⚠️ REQUIRED! all relevant lights
                        selection={[worldRef]} // selection of objects that will have bloom effect
                        selectionLayer={10} // selection layer
                        intensity={1.0} // The bloom intensity.
                        kernelSize={KernelSize.LARGE} // blur kernel size
                        luminanceThreshold={0.9} // luminance threshold. Raise this value to mask out darker elements in the scene.
                        luminanceSmoothing={0.025} // smoothness of the luminance threshold. Range is [0, 1]
                    /> */}
        </EffectComposer>
    )
}

export default Postprocessing