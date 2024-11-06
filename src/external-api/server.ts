import * as http from 'http';
import * as vscode from 'vscode';
import { WebSocketProvider } from "../core/webview/WebSocketProvider";
import { createClineAPI } from '../exports';
import { BrowserSession } from '../services/browser/BrowserSession';
import { handleRequest } from './utils';
import { getApiDocumentation } from './docs';
import { 
    handleTaskRequest, 
    handleMessageRequest, 
    handleCustomInstructionsSet, 
    handleCustomInstructionsGet 
} from './handlers/task';
import { 
    handleButtonPrimary, 
    handleButtonSecondary, 
    handleViewChange, 
    handleMessageDisplay 
} from './handlers/ui';
import { 
    handleScreenshot, 
    handleImageUpload 
} from './handlers/media';
import { 
    handleConfigurationUpdate, 
    handleConfigurationGet, 
    handleStatusGet, 
    handleHistoryGet 
} from './handlers/config';
import {
    handleTaskResume,
    handleTaskCancel,
    handleTaskDelete,
    handleTaskExport,
    handleTaskSearch
} from './handlers/task-management';
import {
    handleEditorDiff,
    handleDiagnostics
} from './handlers/editor';
import {
    handleStateReset,
    handleDebugOptions
} from './handlers/settings';
import { WebSocketHandler } from './handlers/websocket';

export function startExternalAPIServer(
    context: vscode.ExtensionContext, 
    outputChannel: vscode.OutputChannel, 
    sidebarProvider: WebSocketProvider
): http.Server {
    const api = createClineAPI(outputChannel, sidebarProvider);
    const browserSession = new BrowserSession(context);
    const wsHandler = new WebSocketHandler(api);

    // Track view state
    let currentView: 'history' | 'chat' = 'chat';
    let showAnnouncement = true;
    let isAtBottom = true;
    let showScrollToBottom = false;
    let expandedMessageIds: number[] = [];
    let selectedImages: string[] = [];

    // Subscribe to state changes to broadcast via WebSocket
    sidebarProvider.onDidChangeState((state) => {
        wsHandler.broadcastStateUpdate(state);
    });

    // Subscribe to metrics updates
    sidebarProvider.onDidUpdateMetrics((metrics) => {
        wsHandler.broadcastMetrics(metrics);
    });

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
                    res.end(JSON.stringify(getApiDocumentation(context.extension?.packageJSON?.version || 'unknown'), null, 2));
                    return;
                }

                // Health check endpoint
                if (req.method === 'GET' && req.url === '/health') {
                    res.writeHead(200);
                    res.end(JSON.stringify({
                        status: 'healthy',
                        timestamp: new Date().toISOString(),
                        extensionVersion: context.extension?.packageJSON?.version || 'unknown'
                    }));
                    return;
                }

                let response;
                switch (req.method) {
                    case 'POST':
                        switch (req.url) {
                            case '/custom-instructions':
                                response = await handleCustomInstructionsSet(api, JSON.parse(body).value);
                                break;
                            case '/task':
                                response = await handleTaskRequest(api, JSON.parse(body));
                                break;
                            case '/task/resume':
                                response = await handleTaskResume(api, JSON.parse(body));
                                break;
                            case '/task/cancel':
                                response = await handleTaskCancel(api, JSON.parse(body));
                                break;
                            case '/task/delete':
                                response = await handleTaskDelete(api, JSON.parse(body));
                                break;
                            case '/task/export':
                                response = await handleTaskExport(api, JSON.parse(body));
                                break;
                            case '/message':
                                response = await handleMessageRequest(api, JSON.parse(body));
                                break;
                            case '/images':
                                response = await handleImageUpload(JSON.parse(body), selectedImages, 
                                    (images) => selectedImages = images);
                                break;
                            case '/view':
                                response = await handleViewChange(JSON.parse(body), 
                                    (view) => currentView = view,
                                    (show) => showAnnouncement = show);
                                break;
                            case '/message-display':
                                response = await handleMessageDisplay(JSON.parse(body), expandedMessageIds,
                                    (ids) => expandedMessageIds = ids);
                                break;
                            case '/config':
                                response = await handleConfigurationUpdate(api, JSON.parse(body));
                                break;
                            case '/screenshot':
                                response = await handleScreenshot(JSON.parse(body), browserSession, context);
                                break;
                            case '/button/primary':
                                response = await handleButtonPrimary(api);
                                break;
                            case '/button/secondary':
                                response = await handleButtonSecondary(api);
                                break;
                            case '/editor/diff':
                                response = await handleEditorDiff(api, JSON.parse(body));
                                break;
                            case '/settings/reset':
                                response = await handleStateReset(api, JSON.parse(body));
                                break;
                            case '/settings/debug':
                                response = await handleDebugOptions(api, JSON.parse(body));
                                break;
                            default:
                                res.writeHead(404);
                                res.end(JSON.stringify({ error: 'Not Found' }));
                                return;
                        }
                        break;

                    case 'GET':
                        switch (req.url) {
                            case '/custom-instructions':
                                response = await handleCustomInstructionsGet(api);
                                break;
                            case '/status':
                                response = await handleStatusGet(api, currentView, showAnnouncement, 
                                    isAtBottom, showScrollToBottom, expandedMessageIds, selectedImages);
                                break;
                            case '/history':
                                response = await handleHistoryGet(api);
                                break;
                            case '/config':
                                response = await handleConfigurationGet(api);
                                break;
                            case '/task/search':
                                const searchParams = new URLSearchParams(req.url.split('?')[1]);
                                response = await handleTaskSearch(
                                    api,
                                    searchParams.get('query') || '',
                                    searchParams.get('sort') || undefined
                                );
                                break;
                            case '/editor/diagnostics':
                                const diagParams = new URLSearchParams(req.url.split('?')[1]);
                                const severity = diagParams.get('severity');
                                response = await handleDiagnostics(api, {
                                    path: diagParams.get('path') || undefined,
                                    severity: severity as 'error' | 'warning' | 'info' | undefined
                                });
                                break;
                            default:
                                res.writeHead(404);
                                res.end(JSON.stringify({ error: 'Not Found' }));
                                return;
                        }
                        break;

                    default:
                        res.writeHead(405);
                        res.end(JSON.stringify({ error: 'Method Not Allowed' }));
                        return;
                }

                res.writeHead(response.status === 'success' ? 200 : 500);
                res.end(JSON.stringify(response));

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

    const PORT = 7230;
    server.listen(PORT, 'localhost', () => {
        outputChannel.appendLine(`Cline External API Server running on http://localhost:${PORT}`);
        outputChannel.appendLine(`WebSocket server running on ws://localhost:${PORT + 1}`);
    });

    // Clean up WebSocket server when HTTP server closes
    server.on('close', () => {
        wsHandler.close();
    });

    return server;
}
