import styles from './Stats.module.scss'
import FighterDash from './FighterDash'
import { useFighter } from 'Scene/Fighter/useFighter'

const Stats = () => {
    const fighter = useFighter(state => state.fighter)
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