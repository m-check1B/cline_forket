import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';

const DEFAULT_PORT = 7230;
const WS_PORT = 7231;

interface TaskRequest {
    task: string;
    images?: string[];
}

interface WebSocketMessage {
    type: string;
    task?: TaskRequest;
}

interface APIResponse {
    status: 'success' | 'error';
    message?: string;
    error?: string;
    data?: any;
}

const app = express();
app.use(express.json());

// Initialize WebSocket server
const wss = new WebSocketServer({ port: WS_PORT });

wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
});

const broadcast = (message: WebSocketMessage) => {
    if (!wss.clients) return;
    
    wss.clients.forEach((client: WebSocket) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
};

// Store custom instructions
let customInstructions = 'Talk like a pirate';

// API Documentation endpoint
app.get('/api/docs', (req, res) => {
    const docs = {
        version: '1.0.0',
        baseUrl: `http://localhost:${DEFAULT_PORT}`,
        endpoints: [
            {
                path: '/api/task/start',
                method: 'POST',
                description: 'Start a new task',
                body: {
                    task: 'string',
                    images: 'string[] (optional)'
                }
            },
            {
                path: '/api/task/stop',
                method: 'POST',
                description: 'Stop current task'
            },
            {
                path: '/api/custom-instructions',
                method: 'GET',
                description: 'Get current custom instructions'
            },
            {
                path: '/api/custom-instructions',
                method: 'POST',
                description: 'Set custom instructions',
                body: {
                    instructions: 'string'
                }
            }
        ]
    };
    res.json(docs);
});

// Task management endpoints
app.post('/api/task/start', async (req, res) => {
    try {
        const task: TaskRequest = req.body;
        
        console.log('Task received:', task);

        const message: WebSocketMessage = {
            type: 'taskStart',
            task
        };
        broadcast(message);
        
        res.json({ 
            status: 'success', 
            message: 'Task started',
            data: task
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
        console.log('Stopping task');
        
        const message: WebSocketMessage = {
            type: 'taskStop'
        };
        broadcast(message);
        
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

// Custom instructions endpoints
app.get('/api/custom-instructions', (req, res) => {
    res.json({ 
        status: 'success',
        data: { instructions: customInstructions }
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
        customInstructions = instructions;
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
