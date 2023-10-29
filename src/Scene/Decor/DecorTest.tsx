import React from "react"
import { getShaderedDecor } from "./utils/getShaderedDecor"
import { Coordinate } from "interfaces/coordinate.interface"
import { Instances, Instance, Box } from "@react-three/drei"

import { useFighter } from "Scene/Fighter/useFighter"
import { useFrame } from "@react-three/fiber"
import { useCore } from "Scene/useCore"
import { useSettings } from "Scene/UserInterface2D/Settings/useSettings"

// Objects Data
import grassData from './data/grass.json'
import christmasTreeData from './data/christmass_tree.json'
import treeData from './data/tree.json'
import flowerData from './data/flower.json'
import houseData from './data/house.json'
import stoneData from './data/stone.json'


const DecorTest = React.memo(function Decor() {
    // console.log('rerender')

    // const matrixCoordToWorld = useCore(state => state.matrixCoordToWorld)
    const grass = React.useMemo(() => getShaderedDecor('grass'), [])
    const tree = React.useMemo(() => getShaderedDecor('tree'), [])
    // // @ts-expect-error
    // console.log('nodes', grass.gltf.nodes)

    // console.log(grass)
    // const worldCoordinate = useMemo(() => matrixCoordToWorld(objectData.location), [grassData])

    // @ts-expect-error
    const meshes = React.useMemo(() => ({ Grass: grass.gltf.nodes.grass015,  Tree: tree.gltf.nodes.tree_1 }), [grass, tree])
    // console.log('meshes', meshes)
    const hideSmallObjects = useSettings(state => state.hideSmallObjects)

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

        <>
        {/* { (grassData as Array<any>).map((_, i) => <mesh key={i}>
            <meshBasicMaterial color={'red'} />
            <sphereGeometry args={[1, 16, 16]}/>
        </mesh>) } */}
        {/* Setting HideSmallObjects */}
        { !hideSmallObjects ? <>
            <Instances geometry={meshes.Grass.geometry} material={meshes.Grass.material}>
                <group position={[0, 0, 0]}>
                    { (grassData as Array<any>).map((_, i) => <InstancedObject  objectData={_} key={i}  />) }
                </group>
            </Instances>
            { (flowerData as Array<any>).map((_, i) => <BaseObject objectData={_} name="flower" key={i}  />) }
            { (stoneData as Array<any>).map((_, i) => <BaseObject objectData={_} name="stone" key={i}  />) }
        </> : null }
        {/* { (grassData as Array<any>).map((_, i) => <BaseObject objectData={_} name="grass" key={i}  />) } */}
        { (christmasTreeData as Array<any>).map((_, i) => <BaseObject objectData={_} name="christmas_tree"  key={i}  />) }
        { (treeData as Array<any>).map((_, i) => <BaseObject objectData={_} name="tree" key={i}  />) }
        { (houseData as Array<any>).map((_, i) => <BaseObject objectData={_} name="house" key={i}  />) }
        </>
        // <></>
    )
})


interface Props { 
    objectData: {
        type: string
        location: Coordinate
        rotation: { x: number, y: number, z: number }
        scale: { x: number, y: number, z: number }
        size: { width: number, height: number, length: number }
        occupiedCoords?: [{x: number, z: number}]
        collapsed?: boolean
    },
    models?: any
    name?: string
}
function Object({ objectData, models }: Props) {
    const ref = React.useRef<THREE.Mesh | null>(null)
    const matrixCoordToWorld = useCore(state => state.matrixCoordToWorld)
    const worldCoordinate = React.useMemo(() => matrixCoordToWorld(objectData.location), [grassData])
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
    const ref = React.useRef<THREE.Mesh | null>(null)
    const matrixCoordToWorld = useCore(state => state.matrixCoordToWorld)
    const worldCoordinate = React.useMemo(() => matrixCoordToWorld(objectData.location), [grassData])
    return (
        <group name='instanced-object'>
            <Instance
                ref={ref}
                position={[worldCoordinate.x - 40/2, 0, worldCoordinate.z - 40/2]}
                rotation={[objectData.rotation.x, objectData.rotation.y, objectData.rotation.z]}
                scale={[objectData.scale.x, objectData.scale.y, objectData.scale.z]}
            />
        </group>
    )
}


function BaseObject({ objectData, name }: Props) {
    const ref = React.useRef<THREE.Mesh | null>(null)
    const [matrixCoordToWorld, chunkSize] = useCore(state => [state.matrixCoordToWorld, state.chunkSize])
    const uniforms = React.useRef({ uTime: { value: 0 }, uVisible: { value: true } })
    const { model } = React.useMemo(() => getShaderedDecor(name, uniforms), [])
    const worldCoordinate = React.useMemo(() => matrixCoordToWorld(objectData.location), [objectData])

    // Check Collision
    useFrame(() => {
        if (!objectData.collapsed) { return }
        if (!ref.current) { return }
        const coordinate = useFighter.getState().fighter?.coordinates
        if (!coordinate) { return }
        const {x, z} = coordinate

        const objX = objectData.location.x - chunkSize/2
        const objZ = objectData.location.z - chunkSize/2

        const objWidth = objectData.size.width
        const objHeight = objectData.size.length

        if (x >= objX /*- objWidth/2*/ && x <= objX + objHeight
            && z >= objZ - objWidth/2 && z <= objZ + objWidth/2
        ) {
            uniforms.current.uVisible.value = false
        } else {
            uniforms.current.uVisible.value = true
        }
    })
    // Render Time Uniform
    useFrame(({ clock }) => {
        uniforms.current.uTime.value = clock.getElapsedTime()
    })
    // Occupied Coordinates
    const updateOccupiedCoord = useCore(state => state.updateOccupiedCoord)
    React.useEffect(() => {
        const coords = objectData.occupiedCoords
        if (!coords) { return }
        coords.forEach(_ => {updateOccupiedCoord({ id: objectData.type+_.x+_.z, coordinates: {x:_.x-chunkSize/2, z:_.z-chunkSize/2}}, 'add')})
        return () => coords.forEach(_ => {updateOccupiedCoord({ id: objectData.type+_.x+_.z, coordinates: {x:0,z:0} }, 'remove')})
    }, [])

    return (
        <group name='decor'>
            <primitive
                ref={ref}
                object={model}
                position={[worldCoordinate.x - chunkSize/2, 0, worldCoordinate.z - chunkSize/2]}
                rotation={[objectData.rotation.x, objectData.rotation.y, objectData.rotation.z]}
                scale={[objectData.scale.x, objectData.scale.y, objectData.scale.z]}
            ></primitive>
        </group>
    )
}

export default DecorTest