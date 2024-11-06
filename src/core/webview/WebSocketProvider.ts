import * as vscode from "vscode"
import * as WebSocket from "ws"
import { EventEmitter } from "events"

export class WebSocketProvider extends EventEmitter {
    private wss: WebSocket.Server | undefined
    private connections: Set<WebSocket> = new Set()

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly outputChannel: vscode.OutputChannel
    ) {
        super()
    }

    initialize(port: number) {
        if (this.wss) {
            return
        }

        this.wss = new WebSocket.Server({ port })
        
        this.wss.on('connection', (ws: WebSocket) => {
            this.outputChannel.appendLine('WebSocket client connected')
            this.connections.add(ws)

            ws.on('message', (message: string) => {
                try {
                    const data = JSON.parse(message.toString())
                    this.emit('message', data)
                } catch (error) {
                    this.outputChannel.appendLine(`Error parsing WebSocket message: ${error}`)
                }
            })

            ws.on('close', () => {
                this.outputChannel.appendLine('WebSocket client disconnected')
                this.connections.delete(ws)
            })

            ws.on('error', (error) => {
                this.outputChannel.appendLine(`WebSocket error: ${error}`)
                this.connections.delete(ws)
            })
        })

        this.wss.on('error', (error) => {
            this.outputChannel.appendLine(`WebSocket server error: ${error}`)
        })

        this.outputChannel.appendLine(`WebSocket server started on port ${port}`)
    }

    broadcast(message: any) {
        if (!this.wss) {
            return
        }

        const data = JSON.stringify(message)
        this.connections.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data)
            }
        })
    }

    async dispose() {
        if (this.wss) {
            this.connections.forEach(client => {
                client.close()
            })
            this.connections.clear()
            
            return new Promise<void>((resolve) => {
                this.wss!.close(() => {
                    this.outputChannel.appendLine('WebSocket server closed')
                    this.wss = undefined
                    resolve()
                })
            })
        }
    }
}
