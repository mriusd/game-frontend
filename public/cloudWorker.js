// Cloud Worker

const socket = { current: null }
self.addEventListener('message', (event) => {
	const { action, url, msg } = event.data

	if (action === 'openWebSocket') {
		socket.current = new WebSocket(url)

		socket.current.addEventListener('open', (event) => {
			console.log('[CloudWorker]: Websocket is opened')
			self.postMessage({ type: 'websocketOpen', event: { data: event.data, origin: event.origin } })
		})

		socket.current.addEventListener('error', (event) => {
			console.error('[CloudWorker]: Websocket error', event)
			self.postMessage({ type: 'websocketError', event: { data: event.data, origin: event.origin } })
		})

		socket.current.addEventListener('close', (event) => {
			console.warn('[CloudWorker]: Websocket is closed')
			self.postMessage({ type: 'websocketClose', event: { data: event.data, origin: event.origin } })
		})

		socket.current.addEventListener('message', (event) => {
			self.postMessage({ type: 'websocketMessage', event: { data: event.data, origin: event.origin } })
		})

		return
	}

	if (action === 'sendJsonMessage') {
		if (!socket.current) { return console.warn('[CloudWorker]: Socket message prevented, Web Socket does not connected yet') }
		socket.current.send(JSON.stringify(msg))
	}
})