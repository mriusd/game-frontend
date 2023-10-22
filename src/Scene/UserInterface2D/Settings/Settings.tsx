import React from 'react'
import styles from './Settings.module.scss'

import SettingsButton from './SettingsButton'

import Slider from 'rc-slider'
import Checkbox from 'rc-checkbox'

import { useSettings } from './useSettings'

const Settings = () => {
    const [opened, hide] = useSettings(state => [state.opened, state.hide])
    const [minFps, maxFps, clipFps, updateClipFps, stepFps] = useSettings(state => [state.minFps, state.maxFps, state.clipFps, state.updateClipFps, state.stepFps])
    const [updateShadows, updatePostprocessing] = useSettings(state => [state.updateShadows, state.updatePostprocessing])

    const defaults = React.useMemo(() => {
        // Get Settings from Local Storage
        const fps = localStorage.getItem('settings_clipFps')
        fps && updateClipFps(+fps)

        const enableShadows = localStorage.getItem('settings_enableShadows')
        typeof enableShadows === 'string' && updateShadows(enableShadows === 'true')

        const enablePostprocessing = localStorage.getItem('settings_enablePostprocessing')
        typeof enablePostprocessing === 'string' && updatePostprocessing(enablePostprocessing === 'true')
        // 
        return useSettings.getState()
    }, [opened])

    return (
        <>
            <SettingsButton/>
            {
                opened ? (
                    <div className={styles.Settings}>
                        <div className={styles.CloseButton} onClick={() => hide()}>x</div>
                        <form>
                            <div className={styles.col}>
                                <p className={styles.title}>Max FPS: <b>{ clipFps }</b></p>
                                <Slider min={minFps} max={maxFps} defaultValue={defaults.clipFps} onChange={updateClipFps} step={stepFps} />
                            </div>
                            <div className={styles.row}>
                                <p className={styles.title}>Enable shadows</p>
                                <Checkbox defaultChecked={defaults.enableShadows} onChange={(e) => updateShadows(e.target.checked)} />
                                <p className={`${styles.info} ${styles.yellow}`}>(Restart required)</p>
                            </div>
                            <div className={styles.row}>
                                <p className={styles.title}>Enable postprocessing</p>
                                <Checkbox defaultChecked={defaults.enablePostprocessing} onChange={(e) => updatePostprocessing(e.target.checked)} />
                                {/* <p className={`${styles.info} ${styles.yellow}`}>(Restart required)</p> */}
                            </div>
                        </form>
                    </div>
                ) : <></>
            }
        </>
    )
}

export default Settings