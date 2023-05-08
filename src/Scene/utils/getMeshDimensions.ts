import * as THREE from "three";
import type { Mesh, Group } from "three";

export const getMeshDimensions = (mesh: Mesh | Group) => {
    // Create a new bounding box
    if (!mesh) { return null }
    const boundingBox = new THREE.Box3().setFromObject(mesh)
  
    // Calculate the dimensions of the bounding box
    if (!boundingBox) { return null }
    const size = new THREE.Vector3()
    boundingBox.getSize(size)
  
    return {
      width: size.x,
      height: size.y,
      depth: size.z,
    }
}