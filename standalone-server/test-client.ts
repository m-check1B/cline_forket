import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:7231');

ws.on('open', () => {
    console.log('Connected to server');

    // Send webviewDidLaunch message
    ws.send(JSON.stringify({
        type: 'webviewDidLaunch'
    }));

    // Wait a bit then send custom instructions
    setTimeout(() => {
        ws.send(JSON.stringify({
            type: 'customInstructions',
            text: 'Talk like a friendly robot'
        }));
    }, 1000);

    // Wait a bit then send a new task
    setTimeout(() => {
        ws.send(JSON.stringify({
            type: 'newTask',
            text: 'Hello! How are you?'
        }));
    }, 2000);
});

ws.on('message', (data) => {
    console.log('Received:', JSON.parse(data.toString()));
});

ws.on('error', console.error);
