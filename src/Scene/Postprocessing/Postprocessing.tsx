import { EffectComposer, DepthOfField, Bloom, Noise, Vignette, ColorAverage, HueSaturation } from '@react-three/postprocessing'
import { BlurPass, Resizer, KernelSize, Resolution } from 'postprocessing'
import { ToneMapping } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { SelectiveBloom } from '@react-three/postprocessing'
import { BrightnessContrast, Sepia } from '@react-three/postprocessing'
import { useControls } from 'leva'

import { usePost } from './usePost'
import React from 'react'

const Postprocessing = () => {

    // const [lights, bloomObjects] = usePost(state => [state.lights, state.bloomObjects])

    // const data = useControls('Postprocessing', {
    //     enabled: false,
    //     blendFunction: {
    //         label: "Blend Function",
    //         options: {
    //             'normal': BlendFunction.NORMAL,
    //             'overlay': BlendFunction.OVERLAY,
    //             'add': BlendFunction.ADD,
    //             'color burn': BlendFunction.COLOR_BURN,
    //             'color dodge': BlendFunction.COLOR_DODGE,
    //             'darken': BlendFunction.DARKEN,
    //             'lighten': BlendFunction.LIGHTEN,
    //             'multiply': BlendFunction.MULTIPLY
    //         }
    //     },
    //     hue: {
    //         value: Math.PI,
    //         min: 0,
    //         max: Math.PI * 2,
    //     },
    //     saturation: {
    //         value: Math.PI,
    //         min: 0,
    //         max: Math.PI * 2,
    //     },
    //     middleGrey: {
    //         min: 0,
    //         max: 1,
    //         value: 0.6,
    //         step: 0.1
    //     },
    //     maxLuminance: {
    //         min: 0,
    //         max: 64,
    //         value: 16,
    //         step: 1
    //     },
    //     brightness: {
    //         min: -1,
    //         max: 1,
    //         value: 0,
    //     },
    //     contrast: {
    //         min: -1,
    //         max: 1,
    //         value: 0,
    //     },
    //     sepia: {
    //         min: 0,
    //         max: 1,
    //         value: 0,
    //     }
    // });

    // React.useEffect(() => {
    //     console.log('Update Post', lights, bloomObjects)
    // }, [lights, bloomObjects])


    return (
        <EffectComposer>
            {/* <BrightnessContrast brightness={data.brightness} contrast={data.contrast} />
            <HueSaturation hue={data.hue} saturation={data.saturation} />
            <ToneMapping middleGrey={data.middleGrey} maxLuminance={data.maxLuminance} />
            <Sepia intensity={data.sepia} /> */}
            <Bloom kernelSize={KernelSize.LARGE} luminanceThreshold={0.1} luminanceSmoothing={0.5} height={300} />
              {/* <SelectiveBloom
                lights={lights.map(_ => ({ current: _ }))} // ⚠️ REQUIRED! all relevant lights
                selection={bloomObjects.map(_ => ({ current: _ }))} // selection of objects that will have bloom effect
                selectionLayer={10} // selection layer
                intensity={1.0} // The bloom intensity.
                // blurPass={undefined} // A blur pass.
                // width={Resizer.AUTO_SIZE} // render width
                // height={Resizer.AUTO_SIZE} // render height
                kernelSize={KernelSize.LARGE} // blur kernel size
                luminanceThreshold={0.9} // luminance threshold. Raise this value to mask out darker elements in the scene.
                luminanceSmoothing={0.025} // smoothness of the luminance threshold. Range is [0, 1]
            /> */}
        </EffectComposer>
    )
}

export default Postprocessing