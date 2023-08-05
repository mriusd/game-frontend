import { useEventCloud } from 'store/EventCloudContext';
import styles from './Stats.module.scss'
import { useMemo } from 'react';

const Fighter = () => {
	const { fighter } = useEventCloud();
	const color = useMemo(() => {
		const at = fighter.currentHealth / fighter.maxHealth
		if ( at > .7 ) {
			return 'green'
		}
		if ( at > .3 ) {
			return 'yellow'
		}
		return 'red'
	}, [fighter])
	const width = useMemo(() => fighter.currentHealth / fighter.maxHealth * 100, [])
	const progressStyle = useMemo(() => ({ backgroundColor: color, width: width+'%' }), [color, width])
	return (
		<div className={styles.FighterDash}>
			<div><div style={progressStyle} ></div></div>
			<p>{fighter.currentHealth} / {fighter.maxHealth}</p>
		</div>
	)
}

export default Fighter;