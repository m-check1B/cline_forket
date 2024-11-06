export const apiSchema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    definitions: {
        // Core Response Types
        APIResponse: {
            type: "object",
            properties: {
                status: { enum: ["success", "error"] },
                data: { type: "object" },
                error: { type: "string" }
            },
            required: ["status"]
        },

        // Task Types
        TaskRequest: {
            type: "object",
            properties: {
                task: { type: "string" },
                images: {
                    type: "array",
                    items: { type: "string", format: "data-url" }
                }
            }
        },

        // Task Management Types
        TaskResumeRequest: {
            type: "object",
            properties: {
                taskId: { type: "string" },
                feedback: { type: "string" },
                images: {
                    type: "array",
                    items: { type: "string", format: "data-url" }
                }
            },
            required: ["taskId"]
        },

        TaskCancelRequest: {
            type: "object",
            properties: {
                taskId: { type: "string" },
                reason: { type: "string" }
            },
            required: ["taskId"]
        },

        TaskDeleteRequest: {
            type: "object",
            properties: {
                taskId: { type: "string" }
            },
            required: ["taskId"]
        },

        TaskExportRequest: {
            type: "object",
            properties: {
                taskId: { type: "string" },
                format: { enum: ["json", "markdown"] }
            },
            required: ["taskId"]
        },

        TaskExportResponse: {
            type: "object",
            properties: {
                task: { type: "string" },
                messages: { 
                    type: "array",
                    items: { $ref: "#/definitions/ClineMessage" }
                },
                metrics: { $ref: "#/definitions/Metrics" },
                resources: {
                    type: "array",
                    items: { type: "string" }
                }
            },
            required: ["task", "messages", "metrics", "resources"]
        },

        TaskSearchResponse: {
            type: "object",
            properties: {
                results: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            timestamp: { type: "string", format: "date-time" },
                            task: { type: "string" },
                            metrics: { $ref: "#/definitions/Metrics" },
                            highlights: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        field: { type: "string" },
                                        matches: {
                                            type: "array",
                                            items: {
                                                type: "array",
                                                minItems: 2,
                                                maxItems: 2,
                                                items: { type: "number" }
                                            }
                                        }
                                    },
                                    required: ["field", "matches"]
                                }
                            }
                        },
                        required: ["id", "timestamp", "task", "metrics"]
                    }
                },
                total: { type: "number" },
                page: { type: "number" },
                hasMore: { type: "boolean" }
            },
            required: ["results", "total", "page", "hasMore"]
        },

        MessageRequest: {
            type: "object",
            properties: {
                message: { type: "string" },
                images: {
                    type: "array",
                    items: { type: "string", format: "data-url" }
                }
            }
        },

        // UI Types
        ViewRequest: {
            type: "object",
            properties: {
                view: { enum: ["history", "chat"] },
                showAnnouncement: { type: "boolean" }
            },
            required: ["view"]
        },

        MessageDisplayRequest: {
            type: "object",
            properties: {
                messageId: { type: "number" },
                expanded: { type: "boolean" }
            },
            required: ["messageId", "expanded"]
        },

        // Media Types
        ImageUploadRequest: {
            type: "object",
            properties: {
                images: {
                    type: "array",
                    items: { type: "string", format: "data-url" }
                }
            },
            required: ["images"]
        },

        ScreenshotRequest: {
            type: "object",
            properties: {
                type: { enum: ["vscode", "webpage"] },
                url: { type: "string", format: "uri" },
                selector: { type: "string" },
                fullPage: { type: "boolean" },
                encoding: { enum: ["base64", "binary"] },
                quality: { type: "number", minimum: 0, maximum: 100 }
            },
            required: ["type"]
        },

        // Configuration Types
        ConfigurationRequest: {
            type: "object",
            properties: {
                apiProvider: { type: "string" },
                apiModelId: { type: "string" },
                apiKey: { type: "string" },
                anthropicBaseUrl: { type: "string" },
                openRouterApiKey: { type: "string" },
                openRouterModelId: { type: "string" },
                awsAccessKey: { type: "string" },
                awsSecretKey: { type: "string" },
                awsSessionToken: { type: "string" },
                awsRegion: { type: "string" },
                vertexProjectId: { type: "string" },
                vertexRegion: { type: "string" },
                openAiBaseUrl: { type: "string" },
                openAiApiKey: { type: "string" },
                openAiModelId: { type: "string" },
                ollamaModelId: { type: "string" },
                ollamaBaseUrl: { type: "string" },
                geminiApiKey: { type: "string" },
                openAiNativeApiKey: { type: "string" },
                azureApiVersion: { type: "string" }
            }
        },

        // Response Types
        StatusResponse: {
            type: "object",
            properties: {
                taskStatus: {
                    type: "object",
                    properties: {
                        active: { type: "boolean" },
                        messages: { type: "array", items: { $ref: "#/definitions/ClineMessage" } },
                        metrics: { $ref: "#/definitions/Metrics" },
                        uiState: { $ref: "#/definitions/UIState" }
                    },
                    required: ["active", "messages"]
                },
                browserSessions: {
                    type: "array",
                    items: { $ref: "#/definitions/BrowserSession" }
                },
                apiMetrics: { $ref: "#/definitions/Metrics" },
                viewState: { $ref: "#/definitions/ViewState" }
            },
            required: ["taskStatus", "browserSessions", "apiMetrics", "viewState"]
        },

        HistoryResponse: {
            type: "object",
            properties: {
                conversations: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            timestamp: { type: "string", format: "date-time" },
                            task: { type: "string" },
                            metrics: { $ref: "#/definitions/Metrics" }
                        },
                        required: ["id", "timestamp", "task", "metrics"]
                    }
                }
            },
            required: ["conversations"]
        },

        // Shared Types
        ClineMessage: {
            type: "object",
            properties: {
                ts: { type: "number" },
                type: { enum: ["ask", "say"] },
                ask: { type: "string" },
                say: { type: "string" },
                text: { type: "string" },
                images: {
                    type: "array",
                    items: { type: "string", format: "data-url" }
                },
                partial: { type: "boolean" }
            },
            required: ["ts", "type"]
        },

        Metrics: {
            type: "object",
            properties: {
                tokensIn: { type: "number" },
                tokensOut: { type: "number" },
                cacheWrites: { type: "number" },
                cacheReads: { type: "number" },
                totalCost: { type: "number" }
            },
            required: ["tokensIn", "tokensOut", "totalCost"]
        },

        UIState: {
            type: "object",
            properties: {
                isStreaming: { type: "boolean" },
                textAreaDisabled: { type: "boolean" },
                enableButtons: { type: "boolean" },
                primaryButtonText: { type: "string" },
                secondaryButtonText: { type: "string" },
                expandedMessageIds: {
                    type: "array",
                    items: { type: "number" }
                },
                selectedImages: {
                    type: "array",
                    items: { type: "string", format: "data-url" }
                }
            },
            required: ["isStreaming", "textAreaDisabled", "enableButtons", "expandedMessageIds", "selectedImages"]
        },

        ViewState: {
            type: "object",
            properties: {
                currentView: { enum: ["history", "chat"] },
                showAnnouncement: { type: "boolean" },
                isAtBottom: { type: "boolean" },
                showScrollToBottom: { type: "boolean" }
            },
            required: ["currentView", "showAnnouncement", "isAtBottom", "showScrollToBottom"]
        },

        BrowserSession: {
            type: "object",
            properties: {
                action: { $ref: "#/definitions/BrowserAction" },
                result: { $ref: "#/definitions/BrowserActionResult" },
                timestamp: { type: "string", format: "date-time" }
            },
            required: ["action", "timestamp"]
        },

        BrowserAction: {
            type: "object",
            properties: {
                action: { enum: ["launch", "click", "type", "scroll_down", "scroll_up", "close"] },
                coordinate: { type: "string", pattern: "^\\d+,\\d+$" },
                text: { type: "string" }
            },
            required: ["action"]
        },

        BrowserActionResult: {
            type: "object",
            properties: {
                screenshot: { type: "string", format: "data-url" },
                logs: { type: "string" },
                currentUrl: { type: "string", format: "uri" },
                currentMousePosition: { type: "string", pattern: "^\\d+,\\d+$" }
            }
        }
    }
};
