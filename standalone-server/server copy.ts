import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';

const DEFAULT_PORT = 7230;
const WS_PORT = 7231;

interface TaskRequest {
    task: string;
    images?: string[];
}

interface TaskResumeRequest {
    taskId: string;
    feedback?: string;
    images?: string[];
}

interface TaskCancelRequest {
    taskId: string;
    reason?: string;
}

interface TaskDeleteRequest {
    taskId: string;
}

interface TaskExportRequest {
    taskId: string;
    format: 'json' | 'markdown';
}

interface ImageUploadRequest {
    images: string[];
}

interface ScreenshotRequest {
    type: 'vscode' | 'webpage';
    url?: string;
    selector?: string;
    fullPage?: boolean;
    encoding?: 'base64' | 'binary';
    quality?: number;
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
app.use(express.json({ limit: '50mb' }));

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

// Store tasks and images
let tasks: Map<string, any> = new Map();
let selectedImages: string[] = [];

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
                path: '/api/task/resume',
                method: 'POST',
                description: 'Resume a task',
                body: {
                    taskId: 'string',
                    feedback: 'string (optional)',
                    images: 'string[] (optional)'
                }
            },
            {
                path: '/api/task/cancel',
                method: 'POST',
                description: 'Cancel a task',
                body: {
                    taskId: 'string',
                    reason: 'string (optional)'
                }
            },
            {
                path: '/api/task/delete',
                method: 'POST',
                description: 'Delete a task',
                body: {
                    taskId: 'string'
                }
            },
            {
                path: '/api/task/export',
                method: 'POST',
                description: 'Export a task',
                body: {
                    taskId: 'string',
                    format: 'json | markdown'
                }
            },
            {
                path: '/api/task/search',
                method: 'GET',
                description: 'Search tasks',
                query: {
                    q: 'string',
                    sort: 'string (optional)'
                }
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
            },
            {
                path: '/api/media/screenshot',
                method: 'POST',
                description: 'Take a screenshot',
                body: {
                    type: 'vscode | webpage',
                    url: 'string (required for webpage)',
                    selector: 'string (optional)',
                    fullPage: 'boolean (optional)',
                    encoding: 'base64 | binary (optional)',
                    quality: 'number (optional)'
                }
            },
            {
                path: '/api/media/upload',
                method: 'POST',
                description: 'Upload images',
                body: {
                    images: 'string[]'
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

app.post('/api/task/resume', async (req, res) => {
    try {
        const request: TaskResumeRequest = req.body;
        if (!request.taskId) {
            return res.status(400).json({
                status: 'error',
                error: 'Task ID is required'
            });
        }
        
        res.json({
            status: 'success',
            message: 'Task resumed'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: 'Failed to resume task'
        });
    }
});

app.post('/api/task/cancel', async (req, res) => {
    try {
        const request: TaskCancelRequest = req.body;
        if (!request.taskId) {
            return res.status(400).json({
                status: 'error',
                error: 'Task ID is required'
            });
        }
        
        res.json({
            status: 'success',
            message: 'Task cancelled'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: 'Failed to cancel task'
        });
    }
});

app.post('/api/task/delete', async (req, res) => {
    try {
        const request: TaskDeleteRequest = req.body;
        if (!request.taskId) {
            return res.status(400).json({
                status: 'error',
                error: 'Task ID is required'
            });
        }
        
        res.json({
            status: 'success',
            message: 'Task deleted'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: 'Failed to delete task'
        });
    }
});

app.post('/api/task/export', async (req, res) => {
    try {
        const request: TaskExportRequest = req.body;
        if (!request.taskId) {
            return res.status(400).json({
                status: 'error',
                error: 'Task ID is required'
            });
        }
        
        const task = tasks.get(request.taskId);
        if (!task) {
            return res.status(404).json({
                status: 'error',
                error: 'Task not found'
            });
        }
        
        res.json({
            status: 'success',
            data: {
                task: task.task,
                messages: [],
                metrics: {
                    tokensIn: 0,
                    tokensOut: 0,
                    cacheWrites: 0,
                    cacheReads: 0,
                    totalCost: 0
                },
                resources: []
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: 'Failed to export task'
        });
    }
});

app.get('/api/task/search', async (req, res) => {
    try {
        const query = req.query.q as string;
        const sort = req.query.sort as string;
        
        if (!query) {
            return res.status(400).json({
                status: 'error',
                error: 'Search query is required'
            });
        }
        
        res.json({
            status: 'success',
            data: {
                results: [],
                total: 0,
                page: 1,
                hasMore: false
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: 'Failed to search tasks'
        });
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

// Media endpoints
app.post('/api/media/screenshot', async (req, res) => {
    try {
        const request: ScreenshotRequest = req.body;
        if (!request.type) {
            return res.status(400).json({
                status: 'error',
                error: 'Screenshot type is required'
            });
        }
        
        if (request.type === 'webpage' && !request.url) {
            return res.status(400).json({
                status: 'error',
                error: 'URL is required for webpage screenshots'
            });
        }
        
        res.json({
            status: 'success',
            data: {
                image: 'base64_encoded_image_data',
                format: 'png',
                timestamp: new Date().toISOString(),
                dimensions: { width: 900, height: 600 }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: 'Failed to take screenshot'
        });
    }
});

app.post('/api/media/upload', async (req, res) => {
    try {
        const request: ImageUploadRequest = req.body;
        if (!request.images || !request.images.length) {
            return res.status(400).json({
                status: 'error',
                error: 'Images are required'
            });
        }
        
        selectedImages = [...selectedImages, ...request.images];
        
        res.json({
            status: 'success',
            data: {
                uploadedImages: request.images
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: 'Failed to upload images'
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
