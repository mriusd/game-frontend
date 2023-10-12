import styles from './Auth.module.scss'
import { useAuth } from "./useAuth"
import { useFighter } from 'Scene/Fighter/useFighter'

const CloseButton = () => {
    const fighter = useFighter(state => state.fighter)
    const hide = useAuth(state => state.hide)

    if (!fighter) {
        return <></>
    }

    return (
        <div className={styles.CloseButton} onClick={() => hide()}>x</div>
    )
}

export default CloseButton