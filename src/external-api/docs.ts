import { APIDocumentation } from './types';
import { apiSchema } from './schema';

export function getApiDocumentation(version: string): APIDocumentation & { schema: typeof apiSchema } {
    return {
        version,
        baseUrl: 'http://localhost:7777',
        schema: apiSchema,
        endpoints: [
            // Task Management
            {
                path: '/task',
                method: 'POST',
                description: 'Start a new task with optional text and images',
                body: {
                    task: 'string? - Task description',
                    images: 'string[]? - Array of base64 encoded images'
                },
                response: {
                    status: 'success | error',
                    error: 'string? - Error message if status is error'
                },
                example: {
                    request: {
                        task: "Create a React component",
                        images: ["data:image/jpeg;base64,/9j/4AAQSkZJRg..."]
                    },
                    response: {
                        status: "success"
                    }
                }
            },
            {
                path: '/task/resume',
                method: 'POST',
                description: 'Resume a previously interrupted task',
                body: {
                    taskId: 'string - ID of the task to resume',
                    feedback: 'string? - Optional feedback when resuming',
                    images: 'string[]? - Optional images to include'
                },
                response: {
                    status: 'success | error',
                    error: 'string? - Error message if status is error'
                }
            },
            {
                path: '/task/cancel',
                method: 'POST',
                description: 'Cancel a specific task',
                body: {
                    taskId: 'string - ID of the task to cancel',
                    reason: 'string? - Optional reason for cancellation'
                },
                response: {
                    status: 'success | error',
                    error: 'string? - Error message if status is error'
                }
            },
            {
                path: '/task/delete',
                method: 'POST',
                description: 'Delete a task from history',
                body: {
                    taskId: 'string - ID of the task to delete'
                },
                response: {
                    status: 'success | error',
                    error: 'string? - Error message if status is error'
                }
            },
            {
                path: '/task/export',
                method: 'POST',
                description: 'Export a task\'s data',
                body: {
                    taskId: 'string - ID of the task to export',
                    format: 'string? - Export format (json or markdown)'
                },
                response: {
                    status: 'success | error',
                    data: {
                        task: 'string - Task description',
                        messages: 'ClineMessage[] - Task messages',
                        metrics: 'object - Task metrics',
                        resources: 'string[] - Related resources'
                    },
                    error: 'string? - Error message if status is error'
                }
            },
            {
                path: '/task/search',
                method: 'GET',
                description: 'Search tasks in history',
                body: {
                    query: 'string - Search query',
                    sort: 'string? - Sort order (newest, oldest, mostExpensive, mostTokens, mostRelevant)'
                },
                response: {
                    status: 'success | error',
                    data: {
                        results: [{
                            id: 'string - Task ID',
                            timestamp: 'string - ISO timestamp',
                            task: 'string - Task description',
                            metrics: 'object - Task metrics',
                            highlights: 'object[] - Search match highlights'
                        }],
                        total: 'number - Total results',
                        page: 'number - Current page',
                        hasMore: 'boolean - Whether more results exist'
                    },
                    error: 'string? - Error message if status is error'
                }
            },
            {
                path: '/message',
                method: 'POST',
                description: 'Send a message to the current task',
                body: {
                    message: 'string? - Message text',
                    images: 'string[]? - Array of base64 encoded images'
                },
                response: {
                    status: 'success | error',
                    error: 'string? - Error message if status is error'
                }
            },

            // UI Control
            {
                path: '/button/primary',
                method: 'POST',
                description: 'Simulate pressing the primary button (approve tool use)',
                response: {
                    status: 'success | error',
                    error: 'string? - Error message if status is error'
                }
            },
            {
                path: '/button/secondary',
                method: 'POST',
                description: 'Simulate pressing the secondary button (reject tool use)',
                response: {
                    status: 'success | error',
                    error: 'string? - Error message if status is error'
                }
            },
            {
                path: '/view',
                method: 'POST',
                description: 'Switch between views and control announcement visibility',
                body: {
                    view: 'history | chat - View to switch to',
                    showAnnouncement: 'boolean? - Whether to show announcements'
                },
                response: {
                    status: 'success | error',
                    error: 'string? - Error message if status is error'
                }
            },
            {
                path: '/message-display',
                method: 'POST',
                description: 'Control message expansion state',
                body: {
                    messageId: 'number - ID of the message',
                    expanded: 'boolean - Whether message should be expanded'
                },
                response: {
                    status: 'success | error',
                    error: 'string? - Error message if status is error'
                }
            },

            // Media Handling
            {
                path: '/images',
                method: 'POST',
                description: 'Upload images to be used in messages',
                body: {
                    images: 'string[] - Array of base64 encoded image data URIs'
                },
                response: {
                    status: 'success | error',
                    data: {
                        uploadedImages: 'string[] - Array of uploaded image identifiers'
                    },
                    error: 'string? - Error message if status is error'
                }
            },
            {
                path: '/screenshot',
                method: 'POST',
                description: 'Capture screenshot of VSCode or webpage',
                body: {
                    type: 'vscode | webpage - Type of screenshot to capture',
                    url: 'string? - Required for webpage screenshots',
                    fullPage: 'boolean? - Capture full scrollable page',
                    encoding: 'base64 | binary - Image encoding format',
                    quality: 'number? - JPEG quality 0-100'
                },
                response: {
                    status: 'success | error',
                    data: {
                        image: 'string - Base64 encoded image data',
                        format: 'string - Image format (png/jpeg)',
                        timestamp: 'string - ISO timestamp',
                        dimensions: {
                            width: 'number - Image width',
                            height: 'number - Image height'
                        }
                    },
                    error: 'string? - Error message if status is error'
                }
            },

            // Configuration & Status
            {
                path: '/config',
                method: 'GET',
                description: 'Get current API configuration and available models',
                response: {
                    status: 'success | error',
                    data: {
                        current: 'ApiConfiguration - Current configuration',
                        availableModels: 'ModelInfo[] - Available AI models'
                    },
                    error: 'string? - Error message if status is error'
                }
            },
            {
                path: '/config',
                method: 'POST',
                description: 'Update API configuration',
                body: {
                    apiProvider: 'string? - AI provider (anthropic, openrouter, etc.)',
                    apiModelId: 'string? - Model identifier',
                    apiKey: 'string? - API key',
                    // ... other provider-specific settings
                },
                response: {
                    status: 'success | error',
                    error: 'string? - Error message if status is error'
                }
            },
            {
                path: '/status',
                method: 'GET',
                description: 'Get current task status, metrics, and browser sessions',
                response: {
                    status: 'success | error',
                    data: {
                        taskStatus: {
                            active: 'boolean - Whether a task is active',
                            messages: 'ClineMessage[] - Task messages',
                            metrics: 'object - Task metrics',
                            uiState: 'object - UI state information'
                        },
                        browserSessions: 'BrowserSession[] - Active browser sessions',
                        apiMetrics: 'object - API usage metrics',
                        viewState: 'object - Current view state'
                    },
                    error: 'string? - Error message if status is error'
                }
            },
            {
                path: '/history',
                method: 'GET',
                description: 'Get conversation history',
                response: {
                    status: 'success | error',
                    data: {
                        conversations: [{
                            id: 'string - Conversation ID',
                            timestamp: 'string - ISO timestamp',
                            task: 'string - Task description',
                            metrics: 'object - Conversation metrics'
                        }]
                    },
                    error: 'string? - Error message if status is error'
                }
            },

            // Custom Instructions
            {
                path: '/custom-instructions',
                method: 'GET',
                description: 'Get current custom instructions',
                response: {
                    instructions: 'string | undefined - Current custom instructions'
                }
            },
            {
                path: '/custom-instructions',
                method: 'POST',
                description: 'Set custom instructions for the AI assistant',
                body: {
                    value: 'string - Custom instructions text'
                },
                response: {
                    status: 'success | error',
                    error: 'string? - Error message if status is error'
                }
            },

            // System Status
            {
                path: '/health',
                method: 'GET',
                description: 'Health check endpoint',
                response: {
                    status: 'healthy',
                    timestamp: 'string - ISO timestamp',
                    extensionVersion: 'string - Extension version'
                }
            },
            {
                path: '/api-docs',
                method: 'GET',
                description: 'Get this API documentation with full JSON schema'
            }
        ]
    };
}
