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
import { ApiConfiguration, ModelInfo } from '../shared/api';

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

// API Specific Types
export interface TaskStatus {
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
}

export interface BrowserSession {
    action: ClineSayBrowserAction;
    result?: BrowserActionResult;
    timestamp: string;
}

// Request/Response Types
export interface TaskRequest {
    task?: string;
    images?: string[];
}

export interface MessageRequest {
    message?: string;
    images?: string[];
}

export interface CustomInstructionsResponse {
    instructions: string | undefined;
}

export interface APIEndpoint {
    path: string;
    method: 'GET' | 'POST';
    description: string;
    body?: Record<string, string>;
    response?: Record<string, any>;
}

export interface APIDocumentation {
    version: string;
    baseUrl: string;
    endpoints: APIEndpoint[];
}

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
