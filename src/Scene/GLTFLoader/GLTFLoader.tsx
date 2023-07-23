import { useGLTF } from "@react-three/drei";
import { useGLTFLoaderStore } from "Scene/GLTFLoader/GLTFLoaderStore";
import { models } from "./models";

import type { ModelLoadItem } from "interfaces/gltfloader.interface";

interface Props { item: ModelLoadItem }
const GLTFLoader = () => {
    // TODO: Replace <createRef> on custom one with initial value?
    useGLTFLoaderStore.getState().init()
    return <>{ models.map(item => <Load key={item.name} item={item} />) }</>
}

const Load = ({ item }: Props) => {
    const models = useGLTFLoaderStore(state => state.models)
    // @ts-expect-error
    models.current[item.name] = useGLTF(item.url)
    return <></>
}

export default GLTFLoader