import { 
    ClineMessage, 
    ExtensionMessage, 
    ClineApiReqInfo,
    ClineSayBrowserAction,
    BrowserActionResult,
    ClineAsk,
    ClineSay
} from '../shared/ExtensionMessage';
import { WebviewMessage, ClineAskResponse } from '../shared/WebviewMessage';
import { ApiConfiguration, ModelInfo, ApiProvider } from '../shared/api';
import { BrowserSession } from '../services/browser/BrowserSession';

// WebSocket Types
export interface WebSocketMessage {
    type: 'state' | 'state_update' | 'metrics' | 'error';
    data?: any;
    error?: string;
}

export interface WebSocketStateMessage extends WebSocketMessage {
    type: 'state' | 'state_update';
    data: ExtensionMessage;
}

export interface WebSocketMetricsMessage extends WebSocketMessage {
    type: 'metrics';
    data: {
        tokensIn: number;
        tokensOut: number;
        cacheWrites?: number;
        cacheReads?: number;
        totalCost: number;
    };
}

export interface WebSocketErrorMessage extends WebSocketMessage {
    type: 'error';
    error: string;
}

// API Documentation Types
export interface APIEndpoint {
    path: string;
    method: 'GET' | 'POST' | 'DELETE';
    description: string;
    body?: Record<string, string>;
    response?: Record<string, any>;
    example?: {
        request?: any;
        response?: any;
    };
}

export interface APIDocumentation {
    version: string;
    baseUrl: string;
    endpoints: APIEndpoint[];
    schema?: Record<string, any>;
}

// Core Response Types
export interface APIResponse<T = any> {
    status: 'success' | 'error';
    data?: T;
    error?: string;
}

export interface HealthResponse {
    status: 'healthy';
    timestamp: string;
    extensionVersion: string;
}

// Task Management Types
export interface TaskRequest {
    task?: string;
    images?: string[];  // Base64 encoded image data URIs
}

export interface TaskResumeRequest {
    taskId: string;
    feedback?: string;
    images?: string[];
}

export interface TaskCancelRequest {
    taskId: string;
    reason?: string;
}

export interface TaskCleanupRequest {
    taskId: string;
    cleanupOptions: {
        removeFiles?: boolean;
        closeTerminals?: boolean;
        closeBrowser?: boolean;
    };
}

export interface TaskDeleteRequest {
    taskId: string;
}

export interface TaskExportRequest {
    taskId: string;
    format?: 'json' | 'markdown';
}

export interface TaskExportResponse {
    task: string;
    messages: ClineMessage[];
    metrics: {
        tokensIn: number;
        tokensOut: number;
        cacheWrites?: number;
        cacheReads?: number;
        totalCost: number;
    };
    resources: string[];
}

// History Types
export interface HistorySearchRequest {
    query: string;
    sort?: 'newest' | 'oldest' | 'mostExpensive' | 'mostTokens' | 'mostRelevant';
    page?: number;
    limit?: number;
}

export interface HistorySearchResponse {
    results: Array<{
        id: string;
        timestamp: string;
        task: string;
        metrics: {
            tokensIn: number;
            tokensOut: number;
            cacheWrites?: number;
            cacheReads?: number;
            totalCost: number;
        };
        highlights?: {
            field: string;
            matches: Array<[number, number]>;
        }[];
    }>;
    total: number;
    page: number;
    hasMore: boolean;
}

// Editor Types
export interface EditorDiffRequest {
    path: string;
    original: string;
    modified: string;
}

export interface EditorDiffResponse {
    diff: string;
    changes: number;
}

export interface DiagnosticsRequest {
    path?: string;
    severity?: 'error' | 'warning' | 'info';
}

export interface DiagnosticsResponse {
    diagnostics: Array<{
        path: string;
        line: number;
        message: string;
        severity: string;
        source?: string;
    }>;
}

// Settings Types
export interface ResetStateRequest {
    resetOptions: {
        history?: boolean;
        configuration?: boolean;
        customInstructions?: boolean;
        all?: boolean;
    };
}

export interface DebugOptionsRequest {
    options: {
        logLevel?: 'error' | 'warn' | 'info' | 'debug';
        metrics?: boolean;
        performance?: boolean;
        apiTrace?: boolean;
    };
}

// Existing Types
export interface MessageRequest {
    message?: string;
    images?: string[];  // Base64 encoded image data URIs
}

export interface ImageUploadRequest {
    images: string[];  // Base64 encoded image data URIs
}

export interface ImageUploadResponse {
    uploadedImages: string[];  // URLs or identifiers of uploaded images
}

export interface ViewRequest {
    view: 'history' | 'chat';
    showAnnouncement?: boolean;
}

export interface MessageDisplayRequest {
    messageId: number;
    expanded: boolean;
}

export interface CustomInstructionsResponse {
    instructions: string | undefined;
}

// Screenshot Types
export interface ScreenshotRequest {
    type: 'vscode' | 'webpage';
    url?: string;
    selector?: string;  // CSS selector to capture specific element
    fullPage?: boolean; // Capture full scrollable page
    encoding?: 'base64' | 'binary';
    quality?: number;   // JPEG quality 0-100
}

export interface ScreenshotResponse {
    image: string;      // Base64 encoded image data
    format: string;     // 'png' or 'jpeg'
    timestamp: string;
    dimensions: {
        width: number;
        height: number;
    };
}

// Configuration Types
export type ConfigurationRequest = Partial<ApiConfiguration>;

// State Types
export interface ExtendedState extends ExtensionMessage {
    apiMetrics?: {
        totalTokensIn: number;
        totalTokensOut: number;
        totalCacheWrites: number;
        totalCacheReads: number;
        totalCost: number;
    };
    browserSessions?: BrowserSession[];
    lastApiRequest?: ClineApiReqInfo;
}

export interface StatusResponse {
    taskStatus: {
        active: boolean;
        messages: ClineMessage[];
        currentAsk?: ClineAsk;
        currentSay?: ClineSay;
        metrics?: {
            tokensIn: number;
            tokensOut: number;
            cacheWrites?: number;
            cacheReads?: number;
            totalCost: number;
        };
        uiState?: {
            isStreaming: boolean;
            textAreaDisabled: boolean;
            enableButtons: boolean;
            primaryButtonText?: string;
            secondaryButtonText?: string;
            expandedMessageIds: number[];
            selectedImages: string[];
        };
    };
    browserSessions: BrowserSession[];
    apiMetrics: {
        totalTokensIn: number;
        totalTokensOut: number;
        totalCacheWrites: number;
        totalCacheReads: number;
        totalCost: number;
    };
    viewState: {
        currentView: 'history' | 'chat';
        showAnnouncement: boolean;
        isAtBottom: boolean;
        showScrollToBottom: boolean;
    };
}

export interface HistoryResponse {
    conversations: {
        id: string;
        timestamp: string;
        task: string;
        metrics: {
            tokensIn: number;
            tokensOut: number;
            cacheWrites?: number;
            cacheReads?: number;
            totalCost: number;
        };
    }[];
}

export interface ConfigurationResponse {
    current: ApiConfiguration;
    availableModels: ModelInfo[];
}
