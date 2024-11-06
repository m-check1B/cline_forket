import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:7231');

ws.on('open', () => {
    console.log('Connected to server');

    // Just send webviewDidLaunch to get current state
    ws.send(JSON.stringify({
        type: 'webviewDidLaunch'
    }));
});

ws.on('message', (data) => {
    console.log('Received:', JSON.parse(data.toString()));
});

ws.on('error', console.error);
