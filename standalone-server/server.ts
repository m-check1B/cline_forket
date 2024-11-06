import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_PORT = 7230;
const WS_PORT = 7231;

// Types from shared
interface WebviewMessage {
    type:
        | "apiConfiguration"
        | "customInstructions"
        | "alwaysAllowReadOnly"
        | "webviewDidLaunch"
        | "newTask"
        | "askResponse"
        | "clearTask"
        | "didShowAnnouncement"
        | "selectImages"
        | "exportCurrentTask"
        | "showTaskWithId"
        | "deleteTaskWithId"
        | "exportTaskWithId"
        | "resetState"
        | "requestOllamaModels"
        | "openImage"
        | "openFile"
        | "openMention"
        | "cancelTask"
        | "refreshOpenRouterModels";
    text?: string;
    askResponse?: "yesButtonClicked" | "noButtonClicked" | "messageResponse";
    images?: string[];
    bool?: boolean;
}

interface ExtensionMessage {
    type: "action" | "state" | "selectedImages" | "ollamaModels" | "theme" | "workspaceUpdated" | "invoke" | "partialMessage";
    text?: string;
    action?: "chatButtonClicked" | "settingsButtonClicked" | "historyButtonClicked" | "didBecomeVisible";
    state?: ExtensionState;
    images?: string[];
}

interface ExtensionState {
    version: string;
    customInstructions?: string;
    clineMessages: ClineMessage[];
    taskHistory: any[];
    shouldShowAnnouncement: boolean;
}

interface ClineMessage {
    ts: number;
    type: "ask" | "say";
    ask?: string;
    say?: string;
    text?: string;
    images?: string[];
    partial?: boolean;
}

// API Types
interface TaskRequest {
    task: string;
    images?: string[];
}

interface APIResponse {
    status: 'success' | 'error';
    message?: string;
    error?: string;
    data?: any;
}

// In-memory storage
let tasks = new Map();
let selectedImages: string[] = [];
let customInstructions = 'Talk like a pirate';
let extensionState: ExtensionState = {
    version: '1.0.0',
    customInstructions,
    clineMessages: [],
    taskHistory: [],
    shouldShowAnnouncement: false
};

const app = express();
app.use(express.json({ limit: '50mb' }));

// Initialize WebSocket server
const wss = new WebSocketServer({ port: WS_PORT });

wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Send initial state
    const message: ExtensionMessage = {
        type: 'state',
        state: extensionState
    };
    ws.send(JSON.stringify(message));

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString()) as WebviewMessage;
            console.log('Received message:', message);

            // Handle specific message types
            switch (message.type) {
                case 'webviewDidLaunch':
                    // Send initial state
                    ws.send(JSON.stringify({
                        type: 'state',
                        state: extensionState
                    }));
                    break;
                case 'newTask':
                    if (message.text) {
                        const taskMessage: ClineMessage = {
                            ts: Date.now(),
                            type: 'ask',
                            text: message.text,
                            images: message.images
                        };
                        extensionState.clineMessages.push(taskMessage);
                        broadcast({
                            type: 'state',
                            state: extensionState
                        });
                    }
                    break;
                case 'clearTask':
                    extensionState.clineMessages = [];
                    broadcast({
                        type: 'state',
                        state: extensionState
                    });
                    break;
                case 'customInstructions':
                    if (message.text !== undefined) {
                        extensionState.customInstructions = message.text;
                        broadcast({
                            type: 'state',
                            state: extensionState
                        });
                    }
                    break;
            }

            // Broadcast to all other clients
            wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(data);
                }
            });
        } catch (error) {
            console.error('Error handling WebSocket message:', error);
        }
    });
});

const broadcast = (message: ExtensionMessage) => {
    const data = JSON.stringify(message);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
};

// API endpoints
app.post('/api/task/start', async (req, res) => {
    try {
        const taskRequest: TaskRequest = req.body;
        const taskId = uuidv4();
        
        const taskMessage: ClineMessage = {
            ts: Date.now(),
            type: 'ask',
            text: taskRequest.task,
            images: taskRequest.images
        };

        extensionState.clineMessages.push(taskMessage);
        
        broadcast({
            type: 'state',
            state: extensionState
        });
        
        res.json({ 
            status: 'success', 
            message: 'Task started',
            data: { taskId }
        } as APIResponse);
    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            error: 'Failed to start task' 
        } as APIResponse);
    }
});

app.post('/api/task/stop', async (req, res) => {
    try {
        extensionState.clineMessages = [];
        
        broadcast({
            type: 'state',
            state: extensionState
        });
        
        res.json({ 
            status: 'success', 
            message: 'Task stopped' 
        } as APIResponse);
    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            error: 'Failed to stop task' 
        } as APIResponse);
    }
});

app.get('/api/custom-instructions', (req, res) => {
    res.json({ 
        status: 'success',
        data: { instructions: extensionState.customInstructions }
    });
});

app.post('/api/custom-instructions', (req, res) => {
    try {
        const { instructions } = req.body;
        if (!instructions) {
            return res.status(400).json({
                status: 'error',
                error: 'Instructions are required'
            });
        }

        extensionState.customInstructions = instructions;
        
        broadcast({
            type: 'state',
            state: extensionState
        });
        
        res.json({
            status: 'success',
            message: 'Custom instructions updated'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: 'Failed to update custom instructions'
        });
    }
});

// Start the server
const server = app.listen(DEFAULT_PORT, () => {
    console.log(`External API Server started on port ${DEFAULT_PORT}`);
    console.log(`WebSocket Server started on port ${WS_PORT}`);
});

// Error handling
server.on('error', (error) => {
    console.error(`External API Server error:`, error);
});

// Handle server shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down server...');
    server.close(() => {
        console.log('Server closed');
        wss.close(() => {
            console.log('WebSocket server closed');
        });
    });
});
