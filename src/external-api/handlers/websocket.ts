import * as WebSocket from 'ws';
import { ClineAPI } from '../../exports/cline';
import { ExtensionMessage } from '../../shared/ExtensionMessage';

export class WebSocketHandler {
    private wss: WebSocket.Server;
    private clients: Set<WebSocket> = new Set();
    private api: ClineAPI;

    constructor(api: ClineAPI, port: number = 7778) {
        this.api = api;
        this.wss = new WebSocket.Server({ port });
        this.setupWebSocketServer();
    }

    private setupWebSocketServer() {
        this.wss.on('connection', (ws: WebSocket) => {
            this.clients.add(ws);

            ws.on('message', async (message: string) => {
                try {
                    const data = JSON.parse(message);
                    // Handle incoming messages if needed
                } catch (error) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Invalid message format'
                    }));
                }
            });

            ws.on('close', () => {
                this.clients.delete(ws);
            });

            // Send initial state
            this.api.getState().then(state => {
                ws.send(JSON.stringify({
                    type: 'state',
                    data: state
                }));
            });
        });
    }

    // Broadcast state updates to all connected clients
    public broadcastStateUpdate(state: ExtensionMessage) {
        const message = JSON.stringify({
            type: 'state_update',
            data: state
        });

        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }

    // Broadcast metrics updates
    public broadcastMetrics(metrics: any) {
        const message = JSON.stringify({
            type: 'metrics',
            data: metrics
        });

        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }

    public close() {
        this.wss.close();
    }
}
