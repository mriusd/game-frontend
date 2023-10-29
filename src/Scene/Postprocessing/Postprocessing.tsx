import { EffectComposer, DepthOfField, Bloom, Noise, Vignette, ColorAverage, HueSaturation } from '@react-three/postprocessing'
import { BlurPass, Resizer, KernelSize, Resolution } from 'postprocessing'
import { ToneMapping } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { SelectiveBloom } from '@react-three/postprocessing'
import { BrightnessContrast, Sepia } from '@react-three/postprocessing'
import { useControls } from 'leva'

import { usePost } from './usePost'
import { useSettings } from 'Scene/UserInterface2D/Settings/useSettings'

import React from 'react'
import { Box } from '@react-three/drei'

const Postprocessing = () => {
    const enabled = useSettings(state => state.enablePostprocessing)
    // const [lights, bloomObjects] = usePost(state => [state.lights, state.bloomObjects]) // Used for SelectiveBloom
    // React.useEffect(() => {console.log('Update Post', lights, bloomObjects)}, [lights, bloomObjects])


    if (!enabled) return null

    return (
        <> 
        <EffectComposer 
            renderPriority={2}
        >
            {/* Use This Bloom As Selective, controlling by lifting material out of range [0,1]  */}
            <Bloom kernelSize={KernelSize.HUGE} luminanceThreshold={0.9} luminanceSmoothing={0.025} />
              {/* <SelectiveBloom
                lights={lights} // ⚠️ REQUIRED! all relevant lights
                selection={bloomObjects} // selection of objects that will have bloom effect
                selectionLayer={10} // selection layer
                intensity={10.0} // The bloom intensity.
                // blurPass={undefined} // A blur pass.
                // width={Resizer.AUTO_SIZE} // render width
                // height={Resizer.AUTO_SIZE} // render height
                kernelSize={KernelSize.HUGE} // blur kernel size
                luminanceThreshold={0.1} // luminance threshold. Raise this value to mask out darker elements in the scene.
                luminanceSmoothing={0.01} // smoothness of the luminance threshold. Range is [0, 1]
            /> */}
        </EffectComposer>
        </>
        
    )
}

export default Postprocessing