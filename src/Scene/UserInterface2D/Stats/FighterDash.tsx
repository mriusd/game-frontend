import styles from './Stats.module.scss'
import React from 'react';
import { useFighter } from 'Scene/Fighter/useFighter';

const Fighter = () => {
    const fighter = useFighter(state => state.fighter)
	const color = React.useMemo(() => {
		const at = fighter.currentHealth / fighter.maxHealth
		if ( at > .7 ) {
			return 'green'
		}
		if ( at > .3 ) {
			return 'yellow'
		}
		return 'red'
	}, [fighter])
	const width = React.useMemo(() => fighter.currentHealth / fighter.maxHealth * 100 || 0, [])
	const progressStyle = React.useMemo(() => ({ backgroundColor: color, width: width+'%' }), [color, width])
	return (
		<div className={styles.FighterDash}>
			<div><div style={progressStyle} ></div></div>
			<p>{fighter.currentHealth} / {fighter.maxHealth}</p>
		</div>
	)
}

export default Fighter;