import styles from './Settings.module.scss'
import { useSettings } from './useSettings'

const SettingsButton = () => {
    const show = useSettings(state => state.show)

    return (
        <div onClick={() => show()} className={styles.SettingsButton}>
            Settings
        </div>
    )
}

export default SettingsButton