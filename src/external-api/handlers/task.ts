import { APIResponse, TaskRequest, MessageRequest } from '../types';
import { ClineAPI } from '../../exports/cline';

export async function handleTaskRequest(api: ClineAPI, taskData: TaskRequest): Promise<APIResponse> {
    await api.startNewTask(taskData.task, taskData.images);
    return { status: 'success' };
}

export async function handleMessageRequest(api: ClineAPI, messageData: MessageRequest): Promise<APIResponse> {
    await api.sendMessage(messageData.message, messageData.images);
    return { status: 'success' };
}

export async function handleCustomInstructionsSet(api: ClineAPI, value: string): Promise<APIResponse> {
    await api.setCustomInstructions(value);
    return { status: 'success' };
}

export async function handleCustomInstructionsGet(api: ClineAPI): Promise<{ instructions: string | undefined }> {
    const instructions = await api.getCustomInstructions();
    return { instructions };
}
