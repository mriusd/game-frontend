import styles from './UserInterface2D.module.scss'

import { Leva } from 'leva'
import { useBackpack } from 'Scene/UserInterface3D/Backpack/useBackpack'

import CommandLine from './CommandLine/CommandLine'
import Stats from './Stats/Stats'
import Skills from './Skills/Skills'
import Settings from './Settings/Settings'

import OpenButton from 'Auth/OpenButton'

import { useOtherFighter } from 'Scene/Fighter/OtherFighter/useOtherFighter'
import { useFighter } from 'Scene/Fighter/useFighter'
import { useCore } from 'Scene/useCore'


const UserInterface2D = () => {
    const [otherFighterList] = useOtherFighter(state => [state.otherFighterList])
    const fighter = useFighter(state => state.fighter)
    const isBackpackOpened = useBackpack(state => state.isOpened)
    const [worldSize, matrixCoordToWorld] = useCore(state => [state.worldSize, state.matrixCoordToWorld])

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
            <Settings/>

            {/* Auth Modal */}
            <OpenButton/>


            {/* For test */}
            {
                otherFighterList.length && (
                    <div className={styles.players}>
                        <p>Close Players({otherFighterList.length}):</p>
                        { otherFighterList.map(_ => (<p key={_.id}>{ `${_.name} [${_.coordinates.x}, ${_.coordinates.z}]` }<span></span></p>)) }
                    </div>
                )
            }
            <div className={styles.coordinates}>
                <div>World size [{worldSize}x{worldSize}]</div>
                {/* <div>Server coordinate [ X: {store.currentMatrixCoordinate?.x} Z: {store.currentMatrixCoordinate?.z} ]</div> */}
                {fighter?.coordinates && <div>Coordinate [ X: {matrixCoordToWorld(fighter.coordinates)?.x/*+60-.5*/} Z: {matrixCoordToWorld(fighter.coordinates)?.z/*+60-.5*/} ]</div>}
            </div>
            <Leva
                // hidden={!isBackpackOpened}
                collapsed
                flat
            />
        </div>
    )
}

export default UserInterface2D