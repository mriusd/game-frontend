import styles from './Auth.module.scss'
import { useAuth } from "./useAuth"
import { useEventCloud } from 'store/EventCloudContext'

const CloseButton = () => {
    const { fighter } = useEventCloud()
    const hide = useAuth(state => state.hide)

    if (!fighter) {
        return <></>
    }

    return (
        <div className={styles.CloseButton} onClick={() => hide()}>x</div>
    )
}

export default CloseButton