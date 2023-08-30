import { useRef, useMemo, memo } from "react"
import ReuseModel from '../components/ReuseModel'
import { getShaderedDecor } from "./utils/getShaderedDecor"
import { useCore } from "store/useCore"
import { Coordinate } from "interfaces/coordinate.interface"
import { Merged } from "@react-three/drei"
import { Instances, Instance } from "@react-three/drei"
import { createBillboardMaterial } from "Scene/helpers/createBillboardMaterial"


// Objects Data
import grassData from './data/grass.json'
import { shallow } from "zustand/shallow"

const DecorTest = memo(function Decor() {
    console.log('rerender')

    // const matrixCoordToWorld = useCore(state => state.matrixCoordToWorld)
    const grass = useMemo(() => getShaderedDecor('grass'), [])
    const tree = useMemo(() => getShaderedDecor('tree'), [])
    // // @ts-expect-error
    // console.log('nodes', grass.gltf.nodes)

    // const worldCoordinate = useMemo(() => matrixCoordToWorld(objectData.location), [grassData])

    // @ts-expect-error
    const meshes = useMemo(() => ({ Grass: grass.gltf.nodes.grass13139,  Tree: tree.gltf.nodes.tree_1 }), [grass, tree])
    // console.log('meshes', meshes)
    return (
        // <Merged meshes={meshes}>
        //     {(models) => (
        //         // <Object models={models} objectData={{
        //         //     location: { x: 0, z: 0 },
        //         //     rotation: { x: 0, y: 0, z: 0 },
        //         //     scale: { x: 1, y: 1, z: 1 }
        //         // }}  />
        //         <group>
        //             { (grassData as Array<any>).map((_, i) => <Object models={models} objectData={_} key={i}  />) }
        //         </group>
        //     )}
        // </Merged>
        // <Instances geometry={meshes.Grass.geometry} material={meshes.Grass.material}>
        //     {/* <meshBasicMaterial color={'red'} /> */}
        //     {/* <sphereGeometry args={[1, 64, 64]}/> */}
        //     <group position={[0, 0, 0]}>
        //         { (grassData as Array<any>).map((_, i) => <InstancedObject  objectData={_} key={i}  />) }
        //     </group>
        // </Instances>
        <>
        { (grassData as Array<any>).map((_, i) => <BaseObject objectData={_} key={i}  />) }
        </>
        // <></>
    )
})


interface Props { 
    objectData: {
        location: Coordinate
        rotation: { x: number, y: number, z: number }
        scale: { x: number, y: number, z: number }
    },
    models?: any
}
function Object({ objectData, models }: Props) {
    const ref = useRef<THREE.Mesh | null>(null)
    const matrixCoordToWorld = useCore(state => state.matrixCoordToWorld)
    const worldCoordinate = useMemo(() => matrixCoordToWorld(objectData.location), [grassData])
    return (
        <models.Grass
            ref={ref}
            position={[worldCoordinate.x, 0, worldCoordinate.z]}
            rotation={[objectData.rotation.x, objectData.rotation.y-Math.PI / 2.5, objectData.rotation.z]}
        />
        // <group name='decor'>
        //     <primitive
        //         ref={ref}
        //         object={model}
        //         position={[worldCoordinate.x, 0, worldCoordinate.z]}
        //         rotation={[objectData.rotation.x, objectData.rotation.y, objectData.rotation.z]}
        //         // scale={[objectData.scale.x-0.5, objectData.scale.y-0.5, objectData.scale.z-0.5]}
        //         scale={[0.33, 0.33, 0.33]}
        //     />
        // </group>
    )
}
function InstancedObject({ objectData }: Props) {
    const ref = useRef<THREE.Mesh | null>(null)
    const matrixCoordToWorld = useCore(state => state.matrixCoordToWorld)
    const worldCoordinate = useMemo(() => matrixCoordToWorld(objectData.location), [grassData])
    return (
        <group name='instanced-object'>
            <Instance
                color={'red'}
                ref={ref}
                position={[worldCoordinate.x, 0, worldCoordinate.z]}
                rotation={[objectData.rotation.x, objectData.rotation.y-Math.PI / 2.5, objectData.rotation.z]}
                // scale={[objectData.scale.x-0.5, objectData.scale.y-0.5, objectData.scale.z-0.5]}
                // scale={[0.33, 0.33, 0.33]}
            />
        </group>
    )
}


function BaseObject({ objectData }: Props) {
    const ref = useRef<THREE.Mesh | null>(null)
    const [worldSize, chunkSize] = useCore(state => [state.worldSize, state.chunkSize], shallow)

    const worldCoordinate = useMemo(() => ({
        x: objectData.location.x - worldSize / 2 - chunkSize / 2,
        z: objectData.location.z - worldSize / 2 - chunkSize / 2
    }), [grassData])
    const { model } = useMemo(() => getShaderedDecor('grass'), [])

    return (
        <group name='decor'>
            <primitive
                ref={ref}
                object={model}
                position={[worldCoordinate.x, 0, worldCoordinate.z]}
                // rotation={[objectData.rotation.x, objectData.rotation.y, objectData.rotation.z]}
                // scale={[objectData.scale.x, objectData.scale.y, objectData.scale.z]}
                // scale={[0.33, 0.33, 0.33]}
            />
        </group>
    )
}

export default DecorTest