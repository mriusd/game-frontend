import styles from './Auth.module.scss'
import { useAuth } from './useAuth'

import MetamaskDialog from './MetamaskDialog'
import CloseButton from './CloseButton'

const Auth = () => {
    const opened = useAuth(state => state.opened)
    return (
        <div className={styles.Auth} style={{ display: opened ? 'flex' : 'none' }}>
            <h1>MRIUS-D</h1>
            <MetamaskDialog/>
            <CloseButton/>
        </div>
    )
}

export default Auth