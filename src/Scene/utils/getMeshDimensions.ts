import * as THREE from "three";
import { Mesh } from "three";

export const getMeshDimensions = (mesh: Mesh) => {
    // Create a new bounding box
    const boundingBox = new THREE.Box3().setFromObject(mesh)
  
    // Calculate the dimensions of the bounding box
    const size = new THREE.Vector3()
    boundingBox.getSize(size)
  
    return {
      width: size.x,
      height: size.y,
      depth: size.z,
    }
}