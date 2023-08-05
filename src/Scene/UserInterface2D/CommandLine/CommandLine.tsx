import { useCallback, useEffect, useRef } from 'react'
import styles from './CommandLine.module.scss'
import { useCommandLine } from './useCommandLine'
import { useEventCloud } from 'store/EventCloudContext'
import CommandsPlaceholder from './CommandsPlaceholder'

const CommandLine = () => {
    const { sendCommand } = useEventCloud()
    const inputRef = useRef<HTMLInputElement | null>(null)
    const commandLineRef = useCommandLine(state => state.commandLineRef)
    const opened = useCommandLine(state => state.opened)

    const command = useRef<string>('')
    const commandHistory = useRef([])
    const historyIndex = useRef(-1)


    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.code.toLowerCase() === 'backspace') {
            if (!command.current) {
                useCommandLine.getState().hide()
            }
            return
        }
        if (e.code.toLowerCase() === 'enter') {
            if (!command.current) {
                setTimeout(() => {
                    useCommandLine.getState().hide()
                }, 0)
                return
            }
        }

        // History Functional
        if (e.key.toLowerCase() === 'arrowup' && historyIndex.current < commandHistory.current.length - 1) {
            const newIndex = historyIndex.current + 1
            historyIndex.current = newIndex
            command.current = commandHistory.current[commandHistory.current.length - 1 - newIndex]
            return
        }
        if (e.key.toLowerCase() === 'arrowdown' && historyIndex.current > -1) {
            const newIndex = historyIndex.current - 1
            historyIndex.current = newIndex
            if (newIndex === -1) {
                command.current = ''
            } else {
                command.current = commandHistory.current[commandHistory.current.length - 1 - newIndex]
            }
            return
        }
        // 
    }, [])

    const handleChange = useCallback((e: any) => {
        command.current = e.target.value
    }, [])

    const handleSubmit = useCallback((e: any) => {
        e.preventDefault();
        if (!command.current) { return }
        console.log("Command:", command.current)
        sendCommand(command.current);
        commandHistory.current = [...commandHistory.current, command.current]
        historyIndex.current = -1
        inputRef.current.value = ''
        command.current = ''
        useCommandLine.getState().hide()
    }, [])

    useEffect(() => {
        if (!inputRef.current) { return }
        if (opened) {
            inputRef.current.focus()
        }
    }, [opened])

    useEffect(() => {
        if (command.current !== inputRef.current?.value) {
            inputRef.current.value = command.current
        }
    }, [command.current])

    return (
        <div
            style={{ display: opened ? 'block' : 'none' }}
            ref={commandLineRef}
            className={styles.CommandLine}
        >
            <CommandsPlaceholder/>
            <form onSubmit={handleSubmit}>
                <input
                    ref={inputRef}
                    // @ts-expect-error
                    onKeyDown={handleKeyDown}
                    onChange={handleChange}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                    onMouseUp={(e) => { e.preventDefault(); e.stopPropagation() }}
                    onBlur={() => useCommandLine.getState().hide()}
                    type='text'
                    placeholder='Enter command here'
                />
            </form>
        </div>
    )
}

export default CommandLine