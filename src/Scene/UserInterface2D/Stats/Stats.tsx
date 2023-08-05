import styles from './Stats.module.scss'
import { useEventCloud } from "store/EventCloudContext"
import FighterDash from './FighterDash'

const Stats = () => {
    const { fighter } = useEventCloud()
    return (
        <div className={styles.Stats}>
            <h4>{fighter?.name} [{fighter?.level}]</h4>
            <FighterDash/>
            <div className={styles.StatsRow}>
                <p>Damage: {fighter.damage}</p>
                <p>Defence: {fighter.defence}</p>
                <p>Exp: {fighter?.experience}</p>
            </div>
        </div>
    )
}

export default Stats