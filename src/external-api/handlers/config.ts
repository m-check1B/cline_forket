import { APIResponse, ConfigurationRequest, ConfigurationResponse, StatusResponse } from '../types';
import { ClineAPI } from '../../exports/cline';
import { ExtensionState } from '../../shared/ExtensionMessage';
import { ExtendedState } from '../types';

export async function handleConfigurationUpdate(
    api: ClineAPI,
    configData: ConfigurationRequest
): Promise<APIResponse> {
    await api.updateConfiguration(configData);
    return { status: 'success' };
}

export async function handleConfigurationGet(
    api: ClineAPI
): Promise<APIResponse<ConfigurationResponse>> {
    const config = await api.getConfiguration();
    const models = await api.getAvailableModels();
    return {
        status: 'success',
        data: {
            current: config,
            availableModels: models
        }
    };
}

export async function handleStatusGet(
    api: ClineAPI,
    currentView: 'history' | 'chat',
    showAnnouncement: boolean,
    isAtBottom: boolean,
    showScrollToBottom: boolean,
    expandedMessageIds: number[],
    selectedImages: string[]
): Promise<APIResponse<StatusResponse>> {
    const state = await api.getState() as ExtendedState;
    const extState = state.state as ExtensionState;
    
    const defaultMetrics = {
        tokensIn: 0,
        tokensOut: 0,
        cacheWrites: 0,
        cacheReads: 0,
        totalCost: 0
    };

    const metrics = state.apiMetrics ? {
        tokensIn: state.apiMetrics.totalTokensIn,
        tokensOut: state.apiMetrics.totalTokensOut,
        cacheWrites: state.apiMetrics.totalCacheWrites,
        cacheReads: state.apiMetrics.totalCacheReads,
        totalCost: state.apiMetrics.totalCost
    } : defaultMetrics;

    const lastMessage = extState.clineMessages.at(-1);
    const isStreaming = lastMessage?.partial === true;
    const textAreaDisabled = isStreaming || !lastMessage;
    const enableButtons = lastMessage?.type === 'ask' && !lastMessage.partial;

    return {
        status: 'success',
        data: {
            taskStatus: {
                active: !!extState.clineMessages?.length,
                messages: extState.clineMessages || [],
                currentAsk: undefined,
                currentSay: undefined,
                metrics,
                uiState: {
                    isStreaming,
                    textAreaDisabled,
                    enableButtons,
                    primaryButtonText: undefined,
                    secondaryButtonText: undefined,
                    expandedMessageIds,
                    selectedImages
                }
            },
            browserSessions: state.browserSessions || [],
            apiMetrics: state.apiMetrics || {
                totalTokensIn: 0,
                totalTokensOut: 0,
                totalCacheWrites: 0,
                totalCacheReads: 0,
                totalCost: 0
            },
            viewState: {
                currentView,
                showAnnouncement,
                isAtBottom,
                showScrollToBottom
            }
        }
    };
}

export async function handleHistoryGet(api: ClineAPI): Promise<APIResponse> {
    const history = await api.getHistory();
    return {
        status: 'success',
        data: {
            conversations: history.map(item => ({
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
            }))
        }
    };
}
