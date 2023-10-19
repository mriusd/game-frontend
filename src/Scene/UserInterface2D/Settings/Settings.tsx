import React from 'react'
import styles from './Settings.module.scss'

import SettingsButton from './SettingsButton'

import Slider from 'rc-slider';

import { useSettings } from './useSettings';

const Settings = () => {
    const [opened, hide] = useSettings(state => [state.opened, state.hide])
    const [minFps, maxFps, clipFps, updateClipFps, stepFps] = useSettings(state => [state.minFps, state.maxFps, state.clipFps, state.updateClipFps, state.stepFps])
    const defaultFps = React.useMemo(() => useSettings.getState().clipFps,[opened])

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
                                <Slider min={minFps} max={maxFps} defaultValue={defaultFps} onChange={updateClipFps} step={stepFps} />
                            </div>
                        </form>
                    </div>
                ) : <></>
            }
        </>
    )
}

export default Settings