import React from "react";

export interface Options {
    onOpen?: (event: MessageEvent) => void,
    onError?: (event: MessageEvent) => void
    onClose?: (event: MessageEvent) => void
    onMessage?: (event: MessageEvent) => void
}

export interface JsonValue { type: string; data: any }

export const useWorkerWebSocket = (url: string, options?: Options) => {
    const worker = React.useRef<Worker>(null)

    React.useLayoutEffect(() => {
        worker.current = new Worker('cloudWorker.js');
        worker.current.postMessage({ action: 'openWebSocket', url });
        worker.current.addEventListener('message', (event) => {
            const { type, event: socketEvent } = event.data
            if (type === 'websocketOpen') {
                _setReadyState(true)
                options?.onOpen && options.onOpen(socketEvent)
            }
            if (type === 'websocketClose') {
                _setReadyState(false)
                options?.onClose && options.onClose(socketEvent)
            }
            if (type === 'websocketError') {
                options?.onError && options.onError(socketEvent)
            }
            if (type === 'websocketMessage') {
                options?.onMessage && options.onMessage(socketEvent)
            }
        })
        return () => void worker.current.terminate()
    }, [options])


    const [readyState, _setReadyState] = React.useState(false)
    const sendJsonMessage = React.useCallback((value: JsonValue) => {
        if (!worker.current || !readyState) { return }
        worker.current.postMessage({ action: 'sendJsonMessage', msg: value });
    }, [worker.current, readyState])

    return {
        sendJsonMessage,
        readyState
    }
}