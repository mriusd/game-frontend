import styles from './UserInterface2D.module.scss'

import { Leva } from 'leva'
import { useBackpackStore } from 'store/backpackStore'
import { useSceneContext } from 'store/SceneContext'

import CommandLine from './CommandLine/CommandLine'
import Stats from './Stats/Stats'
import Skills from './Skills/Skills'

import OpenButton from 'Auth/OpenButton'


const UserInterface2D = () => {
    const store = useSceneContext()
    const isBackpackOpened = useBackpackStore(state => state.isOpened)

    // const handleClick = (e) => {
    //     e.preventDefault()
    //     e.stopPropagation()
    //     console.log('User Click')
    // }

    return (
        <div className={styles.UserInterface2D} >
            <Stats/>
            <Skills/>
            <CommandLine/>

            {/* Auth Modal */}
            <OpenButton/>


            {/* For test */}
            {
                store.PlayerList.current.length && (
                    <div className={styles.players}>
                        <p>Close Players({store.PlayerList.current.length}):</p>
                        { store.PlayerList.current.map(_ => (<p key={_.id}>{ `${store.fighter.name} [${_.coordinates.x}, ${_.coordinates.z}]` }<span></span></p>)) }
                    </div>
                )
            }
            <div className={styles.coordinates}>
                <div>World size [{store.worldSize.current}x{store.worldSize.current}]</div>
                {/* <div>Server coordinate [ X: {store.currentMatrixCoordinate?.x} Z: {store.currentMatrixCoordinate?.z} ]</div> */}
                <div>Coordinate [ X: {store.currentWorldCoordinate?.x.toFixed(0)} Z: {store.currentWorldCoordinate?.z.toFixed(0)} ]</div>
            </div>
            <Leva
                hidden={!isBackpackOpened}
                flat
            />
        </div>
    )
}

export default UserInterface2D