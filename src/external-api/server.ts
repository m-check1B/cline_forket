import * as http from 'http';
import * as vscode from 'vscode';
import { ClineProvider } from "../core/webview/ClineProvider";
import { createClineAPI } from '../exports';
import { APIResponse, HealthResponse, APIDocumentation, TaskRequest, MessageRequest } from './types';

export function startExternalAPIServer(
    context: vscode.ExtensionContext, 
    outputChannel: vscode.OutputChannel, 
    sidebarProvider: ClineProvider
): http.Server {
    const api = createClineAPI(outputChannel, sidebarProvider);

    // API Documentation
    const apiDocs: APIDocumentation = {
        version: context.extension?.packageJSON?.version || 'unknown',
        baseUrl: 'http://localhost:7777',
        endpoints: [
            {
                path: '/health',
                method: 'GET',
                description: 'Health check endpoint',
                response: {
                    status: 'healthy',
                    timestamp: 'ISO timestamp',
                    extensionVersion: 'string'
                }
            },
            {
                path: '/api-docs',
                method: 'GET',
                description: 'API documentation endpoint'
            },
            {
                path: '/custom-instructions',
                method: 'POST',
                description: 'Set custom instructions for the AI assistant',
                body: {
                    value: 'string'
                }
            },
            {
                path: '/task',
                method: 'POST',
                description: 'Start a new task',
                body: {
                    task: 'string?',
                    images: 'string[]?'
                }
            },
            {
                path: '/message',
                method: 'POST',
                description: 'Send a message to the current task',
                body: {
                    message: 'string?',
                    images: 'string[]?'
                }
            },
            {
                path: '/button/primary',
                method: 'POST',
                description: 'Simulate pressing the primary button'
            },
            {
                path: '/button/secondary',
                method: 'POST',
                description: 'Simulate pressing the secondary button'
            }
        ]
    };

    const server = http.createServer(async (req, res) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                res.setHeader('Content-Type', 'application/json');

                // API Documentation endpoint
                if (req.method === 'GET' && req.url === '/api-docs') {
                    res.writeHead(200);
                    res.end(JSON.stringify(apiDocs, null, 2));
                    return;
                }

                // Health check endpoint
                if (req.method === 'GET' && req.url === '/health') {
                    const healthResponse: HealthResponse = {
                        status: 'healthy',
                        timestamp: new Date().toISOString(),
                        extensionVersion: context.extension?.packageJSON?.version || 'unknown'
                    };
                    res.writeHead(200);
                    res.end(JSON.stringify(healthResponse));
                    return;
                }

                switch (req.method) {
                    case 'POST':
                        switch (req.url) {
                            case '/custom-instructions':
                                const response: APIResponse = await handleRequest(async () => {
                                    await api.setCustomInstructions(JSON.parse(body).value);
                                    return { status: 'success' };
                                });
                                res.writeHead(response.status === 'success' ? 200 : 500);
                                res.end(JSON.stringify(response));
                                break;

                            case '/task':
                                const taskData = JSON.parse(body) as TaskRequest;
                                const taskResponse: APIResponse = await handleRequest(async () => {
                                    await api.startNewTask(taskData.task, taskData.images);
                                    return { status: 'success' };
                                });
                                res.writeHead(taskResponse.status === 'success' ? 200 : 500);
                                res.end(JSON.stringify(taskResponse));
                                break;

                            case '/message':
                                const messageData = JSON.parse(body) as MessageRequest;
                                const messageResponse: APIResponse = await handleRequest(async () => {
                                    await api.sendMessage(messageData.message, messageData.images);
                                    return { status: 'success' };
                                });
                                res.writeHead(messageResponse.status === 'success' ? 200 : 500);
                                res.end(JSON.stringify(messageResponse));
                                break;

                            case '/button/primary':
                                const primaryResponse: APIResponse = await handleRequest(async () => {
                                    await api.pressPrimaryButton();
                                    return { status: 'success' };
                                });
                                res.writeHead(primaryResponse.status === 'success' ? 200 : 500);
                                res.end(JSON.stringify(primaryResponse));
                                break;

                            case '/button/secondary':
                                const secondaryResponse: APIResponse = await handleRequest(async () => {
                                    await api.pressSecondaryButton();
                                    return { status: 'success' };
                                });
                                res.writeHead(secondaryResponse.status === 'success' ? 200 : 500);
                                res.end(JSON.stringify(secondaryResponse));
                                break;

                            default:
                                res.writeHead(404);
                                res.end(JSON.stringify({ error: 'Not Found' }));
                        }
                        break;

                    case 'GET':
                        if (req.url === '/custom-instructions') {
                            const instructions = await api.getCustomInstructions();
                            res.writeHead(200);
                            res.end(JSON.stringify({ instructions }));
                        } else {
                            res.writeHead(404);
                            res.end(JSON.stringify({ error: 'Not Found' }));
                        }
                        break;

                    default:
                        res.writeHead(405);
                        res.end(JSON.stringify({ error: 'Method Not Allowed' }));
                }
            } catch (error) {
                console.error('API Server Error:', error);
                res.writeHead(500);
                res.end(JSON.stringify({ 
                    status: 'error',
                    error: 'Internal Server Error', 
                    message: error instanceof Error ? error.message : 'Unknown error' 
                }));
            }
        });
    });

    const PORT = 7777;
    server.listen(PORT, 'localhost', () => {
        outputChannel.appendLine(`Cline External API Server running on http://localhost:${PORT}`);
    });

    return server;
}

async function handleRequest<T>(fn: () => Promise<T>): Promise<APIResponse<T>> {
    try {
        const result = await fn();
        return {
            status: 'success',
            data: result
        };
    } catch (error) {
        return {
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
