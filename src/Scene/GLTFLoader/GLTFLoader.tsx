// import { useGLTF } from "@react-three/drei";
import { useGLTF } from "./hooks/useGLTF";
import { useGLTFLoaderStore } from "Scene/GLTFLoader/GLTFLoaderStore";
import { models } from "./models";

const GLTFLoader = ({ children }) => {
    // TODO: Replace <createRef> on custom one with initial value?
    const modelsRef = useGLTFLoaderStore(state => state.models)
    // @ts-expect-error
    modelsRef.current = useGLTF(models)
    return <>{ children }</>
}

export default GLTFLoader