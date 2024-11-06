import * as vscode from "vscode"
import { ClineProvider } from "../core/webview/ClineProvider"
import { ApiConfiguration, ModelInfo } from "../shared/api"
import { HistoryItem } from "../shared/HistoryItem"
import { ExtensionMessage } from "../shared/ExtensionMessage"

export interface ClineAPI {
    // Configuration
    getConfiguration(): Promise<ApiConfiguration>
    updateConfiguration(config: ApiConfiguration): Promise<void>
    getAvailableModels(): Promise<ModelInfo[]>
    
    // State
    getState(): Promise<any>
    
    // Task Management
    resumeTask(taskId: string, feedback?: string, images?: string[]): Promise<void>
    cancelTask(taskId: string, reason?: string): Promise<void>
    deleteTask(taskId: string): Promise<void>
    getTaskWithId(taskId: string): Promise<any>
    searchTasks(query: string, sort?: string): Promise<any[]>
    getHistory(): Promise<HistoryItem[]>

    // External API Methods
    setCustomInstructions(instructions: string): Promise<void>
    getCustomInstructions(): Promise<string | undefined>
    startNewTask(message: string, images?: string[]): Promise<void>
    sendMessage(message: string, images?: string[]): Promise<void>
    pressPrimaryButton(): Promise<void>
    pressSecondaryButton(): Promise<void>
}

export function createClineAPI(
    outputChannel: vscode.OutputChannel,
    sidebarProvider: ClineProvider
): ClineAPI {
    return {
        // Configuration
        async getConfiguration() {
            const state = await sidebarProvider.getState()
            return state.apiConfiguration
        },

        async updateConfiguration(config: ApiConfiguration) {
            const state = await sidebarProvider.getStateToPostToWebview()
            const message: ExtensionMessage = {
                type: "state",
                state: {
                    ...state,
                    apiConfiguration: config
                }
            }
            await sidebarProvider.postMessageToWebview(message)
        },

        async getAvailableModels() {
            const modelsRecord = await sidebarProvider.readOpenRouterModels() || {}
            return Object.entries(modelsRecord).map(([id, info]) => ({
                id,
                ...info
            }))
        },

        // State
        async getState() {
            return sidebarProvider.getStateToPostToWebview()
        },

        // Task Management
        async resumeTask(taskId: string, feedback?: string, images?: string[]) {
            const { historyItem } = await sidebarProvider.getTaskWithId(taskId)
            await sidebarProvider.initClineWithHistoryItem(historyItem)
            if (feedback) {
                await sidebarProvider.postMessageToWebview({
                    type: "action",
                    action: "chatButtonClicked"
                })
            }
        },

        async cancelTask(taskId: string, reason?: string) {
            await sidebarProvider.clearTask()
            await sidebarProvider.postMessageToWebview({
                type: "action",
                action: "chatButtonClicked"
            })
        },

        async deleteTask(taskId: string) {
            await sidebarProvider.deleteTaskWithId(taskId)
        },

        async getTaskWithId(taskId: string) {
            return sidebarProvider.getTaskWithId(taskId)
        },

        async searchTasks(query: string, sort?: string) {
            const state = await sidebarProvider.getState()
            const history = state.taskHistory || []
            if (!query) {
                return history
            }

            return history.filter(item => {
                return item.task.toLowerCase().includes(query.toLowerCase())
            }).sort((a, b) => {
                if (sort === 'asc') {
                    return a.ts - b.ts
                }
                return b.ts - a.ts
            })
        },

        async getHistory() {
            const state = await sidebarProvider.getState()
            return state.taskHistory || []
        },

        // External API Methods
        async setCustomInstructions(instructions: string) {
            await sidebarProvider.updateCustomInstructions(instructions)
        },

        async getCustomInstructions() {
            const state = await sidebarProvider.getState()
            return state.customInstructions
        },

        async startNewTask(message: string, images?: string[]) {
            await sidebarProvider.initClineWithTask(message, images)
            await sidebarProvider.postMessageToWebview({
                type: "action",
                action: "chatButtonClicked"
            })
        },

        async sendMessage(message: string, images?: string[]) {
            await sidebarProvider.initClineWithTask(message, images)
            await sidebarProvider.postMessageToWebview({
                type: "action",
                action: "chatButtonClicked"
            })
        },

        async pressPrimaryButton() {
            await sidebarProvider.postMessageToWebview({
                type: "action",
                action: "chatButtonClicked"
            })
        },

        async pressSecondaryButton() {
            await sidebarProvider.clearTask()
            await sidebarProvider.postMessageToWebview({
                type: "action",
                action: "chatButtonClicked"
            })
        }
    }
}
