import express from 'express'
import * as vscode from 'vscode'
import { WebSocketProvider } from '../core/webview/WebSocketProvider'
import { 
    APIResponse,
    TaskRequest,
    WebSocketMessage,
    APIEndpoint,
    APIDocumentation
} from './types'

const DEFAULT_PORT = 7230
const WS_PORT = 7231

export function startExternalAPIServer(
    context: vscode.ExtensionContext,
    outputChannel: vscode.OutputChannel,
    wsProvider: WebSocketProvider
) {
    const app = express()
    app.use(express.json())

    // Initialize WebSocket server
    wsProvider.initialize(WS_PORT)

    // API Documentation endpoint
    app.get('/api/docs', (req, res) => {
        const docs: APIDocumentation = {
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
                    path: '/api/settings',
                    method: 'GET',
                    description: 'Get current settings'
                }
            ]
        }
        res.json(docs)
    })

    // Task management endpoints
    app.post('/api/task/start', (req, res) => {
        try {
            const task: TaskRequest = req.body
            const message: WebSocketMessage = {
                type: 'taskStart',
                task
            }
            wsProvider.broadcast(message)
            res.json({ 
                status: 'success', 
                message: 'Task started' 
            } as APIResponse)
        } catch (error) {
            res.status(500).json({ 
                status: 'error', 
                error: 'Failed to start task' 
            } as APIResponse)
        }
    })

    app.post('/api/task/stop', (req, res) => {
        try {
            const message: WebSocketMessage = {
                type: 'taskStop'
            }
            wsProvider.broadcast(message)
            res.json({ 
                status: 'success', 
                message: 'Task stopped' 
            } as APIResponse)
        } catch (error) {
            res.status(500).json({ 
                status: 'error', 
                error: 'Failed to stop task' 
            } as APIResponse)
        }
    })

    // Settings endpoints
    app.get('/api/settings', (req, res) => {
        try {
            const settings = vscode.workspace.getConfiguration('cline')
            res.json({ 
                status: 'success', 
                data: settings 
            } as APIResponse)
        } catch (error) {
            res.status(500).json({ 
                status: 'error', 
                error: 'Failed to get settings' 
            } as APIResponse)
        }
    })

    app.post('/api/settings', (req, res) => {
        try {
            const settings = req.body
            Object.entries(settings).forEach(([key, value]) => {
                vscode.workspace.getConfiguration('cline').update(key, value, true)
            })
            res.json({ 
                status: 'success', 
                message: 'Settings updated' 
            } as APIResponse)
        } catch (error) {
            res.status(500).json({ 
                status: 'error', 
                error: 'Failed to update settings' 
            } as APIResponse)
        }
    })

    // Start the server
    const server = app.listen(DEFAULT_PORT, () => {
        outputChannel.appendLine(`External API Server started on port ${DEFAULT_PORT}`)
        outputChannel.appendLine(`WebSocket Server started on port ${WS_PORT}`)
    })

    // Error handling
    server.on('error', (error) => {
        outputChannel.appendLine(`External API Server error: ${error}`)
    })

    return server
}
