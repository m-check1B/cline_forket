import { ClineAPI } from '../../exports/cline';
import { APIResponse, TaskResumeRequest, TaskCancelRequest, TaskDeleteRequest, TaskExportRequest, TaskExportResponse } from '../types';
import { HistoryItem } from '../../shared/HistoryItem';
import { ExtensionState } from '../../shared/ExtensionMessage';

export async function handleTaskResume(api: ClineAPI, request: TaskResumeRequest): Promise<APIResponse> {
    try {
        await api.resumeTask(request.taskId, request.feedback, request.images);
        return { status: 'success' };
    } catch (error) {
        return {
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

export async function handleTaskCancel(api: ClineAPI, request: TaskCancelRequest): Promise<APIResponse> {
    try {
        await api.cancelTask(request.taskId, request.reason);
        return { status: 'success' };
    } catch (error) {
        return {
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

export async function handleTaskDelete(api: ClineAPI, request: TaskDeleteRequest): Promise<APIResponse> {
    try {
        await api.deleteTask(request.taskId);
        return { status: 'success' };
    } catch (error) {
        return {
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

export async function handleTaskExport(api: ClineAPI, request: TaskExportRequest): Promise<APIResponse<TaskExportResponse>> {
    try {
        const task = await api.getTaskWithId(request.taskId);
        if (!task) {
            return {
                status: 'error',
                error: 'Task not found'
            };
        }

        // Get messages from extension state
        const state = await api.getState();
        const messages = (state.state as ExtensionState)?.clineMessages || [];

        const exportData: TaskExportResponse = {
            task: task.task,
            messages: messages,
            metrics: {
                tokensIn: task.tokensIn,
                tokensOut: task.tokensOut,
                cacheWrites: task.cacheWrites,
                cacheReads: task.cacheReads,
                totalCost: task.totalCost
            },
            resources: [] // Could be extracted from messages if needed
        };

        return {
            status: 'success',
            data: exportData
        };
    } catch (error) {
        return {
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

export async function handleTaskSearch(api: ClineAPI, query: string, sort?: string): Promise<APIResponse> {
    try {
        const results = await api.searchTasks(query, sort);
        
        return {
            status: 'success',
            data: {
                results: results.map((item: HistoryItem) => ({
                    id: item.id,
                    timestamp: new Date(item.ts).toISOString(),
                    task: item.task,
                    metrics: {
                        tokensIn: item.tokensIn,
                        tokensOut: item.tokensOut,
                        cacheWrites: item.cacheWrites,
                        cacheReads: item.cacheReads,
                        totalCost: item.totalCost
                    }
                })),
                total: results.length,
                page: 1,
                hasMore: false
            }
        };
    } catch (error) {
        return {
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
