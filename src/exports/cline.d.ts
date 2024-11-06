import { ApiConfiguration, ModelInfo } from "../shared/api"
import { HistoryItem } from "../shared/HistoryItem"

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
