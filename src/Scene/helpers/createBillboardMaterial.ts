import { Material } from 'three'
import { createDerivedMaterial } from 'troika-three-utils'

export function createBillboardMaterial(baseMaterial: Material, opts?: any) {
  return createDerivedMaterial(
    baseMaterial,
    Object.assign(
      {
        vertexMainOutro: `
            vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
            vec3 scale = vec3(
                length(modelViewMatrix[0].xyz),
                length(modelViewMatrix[1].xyz),
                length(modelViewMatrix[2].xyz)
            );
            // size attenuation: scale *= -mvPosition.z * 0.2;
            mvPosition.xyz += position * scale;
            gl_Position = projectionMatrix * mvPosition;
        `,
      },
      opts
    )
  )
}