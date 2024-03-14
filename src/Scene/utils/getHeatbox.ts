export const getHeatbox = (model: THREE.Group | THREE.Mesh): THREE.Mesh | null => {
    let heatbox: THREE.Mesh | null = null
    model.traverse(_ => {
        if (_.name === 'heatbox') {
            heatbox = _ as THREE.Mesh
        }
    })
    return heatbox
}