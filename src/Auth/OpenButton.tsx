import styles from './Auth.module.scss'
import { useAuth } from "./useAuth"

const OpenButton = () => {
    const show = useAuth(state => state.show)
    return (
        <div className={styles.OpenButton} onClick={() => show()}>Change Character</div>
    )
}

export default OpenButton