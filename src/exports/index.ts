import * as vscode from "vscode"
import { ClineProvider } from "../core/webview/ClineProvider"
import { ClineAPI } from "./cline"
import { ApiConfiguration } from '../shared/api'
import { ExtensionMessage, ExtensionState } from '../shared/ExtensionMessage'
import { HistoryItem } from '../shared/HistoryItem'

export function createClineAPI(outputChannel: vscode.OutputChannel, sidebarProvider: ClineProvider): ClineAPI {
	const api: ClineAPI = {
		setCustomInstructions: async (value: string) => {
			await sidebarProvider.updateCustomInstructions(value)
			outputChannel.appendLine("Custom instructions set")
		},

		getCustomInstructions: async () => {
			return (await sidebarProvider.getGlobalState("customInstructions")) as string | undefined
		},

		startNewTask: async (task?: string, images?: string[]) => {
			outputChannel.appendLine("Starting new task")
			await sidebarProvider.clearTask()
			await sidebarProvider.postStateToWebview()
			await sidebarProvider.postMessageToWebview({ type: "action", action: "chatButtonClicked" })
			await sidebarProvider.postMessageToWebview({
				type: "invoke",
				invoke: "sendMessage",
				text: task,
				images: images,
			})
			outputChannel.appendLine(
				`Task started with message: ${task ? `"${task}"` : "undefined"} and ${images?.length || 0} image(s)`
			)
		},

		sendMessage: async (message?: string, images?: string[]) => {
			outputChannel.appendLine(
				`Sending message: ${message ? `"${message}"` : "undefined"} with ${images?.length || 0} image(s)`
			)
			await sidebarProvider.postMessageToWebview({
				type: "invoke",
				invoke: "sendMessage",
				text: message,
				images: images,
			})
		},

		pressPrimaryButton: async () => {
			outputChannel.appendLine("Pressing primary button")
			await sidebarProvider.postMessageToWebview({
				type: "invoke",
				invoke: "primaryButtonClick",
			})
		},

		pressSecondaryButton: async () => {
			outputChannel.appendLine("Pressing secondary button")
			await sidebarProvider.postMessageToWebview({
				type: "invoke",
				invoke: "secondaryButtonClick",
			})
		},

		cancelCurrentTask: async () => {
			outputChannel.appendLine("Canceling current task")
			await sidebarProvider.clearTask()
		},

		updateConfiguration: async (config: Partial<ApiConfiguration>) => {
			outputChannel.appendLine("Updating configuration")
			const currentState = await sidebarProvider.getStateToPostToWebview()
			const newConfig = { ...currentState.apiConfiguration, ...config }
			await sidebarProvider.postMessageToWebview({
				type: "state",
				state: {
					version: currentState.version,
					apiConfiguration: newConfig,
					customInstructions: currentState.customInstructions,
					alwaysAllowReadOnly: currentState.alwaysAllowReadOnly,
					uriScheme: currentState.uriScheme,
					clineMessages: currentState.clineMessages || [],
					taskHistory: currentState.taskHistory || [],
					shouldShowAnnouncement: currentState.shouldShowAnnouncement
				}
			})
		},

		getConfiguration: async () => {
			const state = await sidebarProvider.getState()
			return state.apiConfiguration
		},

		getAvailableModels: async () => {
			return [] // TODO: Implement model fetching
		},

		getState: async () => {
			const state = await sidebarProvider.getStateToPostToWebview()
			return {
				type: "state",
				state
			}
		},

		getHistory: async () => {
			const history = await sidebarProvider.getGlobalState("taskHistory") as HistoryItem[]
			return history || []
		},

		setView: async (view: 'history' | 'chat', showAnnouncement?: boolean) => {
			await sidebarProvider.postMessageToWebview({
				type: "action",
				action: view === 'history' ? 'historyButtonClicked' : 'chatButtonClicked'
			})
		},

		setMessageDisplay: async (messageId: number, expanded: boolean) => {
			// Handle through invoke message
			await sidebarProvider.postMessageToWebview({
				type: "invoke",
				invoke: "sendMessage",
				text: `Toggle message ${messageId} ${expanded ? 'expanded' : 'collapsed'}`
			})
		},

		updateScrollState: async (isAtBottom: boolean, showScrollToBottom: boolean) => {
			// Handle through action message
			await sidebarProvider.postMessageToWebview({
				type: "action",
				action: isAtBottom ? 'chatButtonClicked' : 'historyButtonClicked'
			})
		},

		handleWebviewAskResponse: async (askResponse: string, text?: string, images?: string[]) => {
			await sidebarProvider.postMessageToWebview({
				type: "invoke",
				invoke: "sendMessage",
				text,
				images
			})
		},

		abortTask: () => {
			sidebarProvider.clearTask()
		},

		getEnvironmentDetails: async (includeFileDetails?: boolean) => {
			const state = await sidebarProvider.getStateToPostToWebview()
			return JSON.stringify(state)
		},

		loadContext: async (userContent: any[], includeFileDetails?: boolean) => {
			const state = await sidebarProvider.getStateToPostToWebview()
			return [userContent, JSON.stringify(state)]
		},

		resumeTask: async (taskId: string, feedback?: string, images?: string[]) => {
			const { historyItem } = await sidebarProvider.getTaskWithId(taskId)
			await sidebarProvider.initClineWithHistoryItem(historyItem)
			if (feedback) {
				await api.sendMessage(feedback, images)
			}
		},

		cancelTask: async (taskId: string, reason?: string) => {
			await sidebarProvider.clearTask()
		},

		deleteTask: async (taskId: string) => {
			await sidebarProvider.deleteTaskWithId(taskId)
		},

		getTaskWithId: async (taskId: string) => {
			const { historyItem } = await sidebarProvider.getTaskWithId(taskId)
			return historyItem
		},

		searchTasks: async (query: string, sort?: string) => {
			const history = await api.getHistory()
			// Simple search implementation - could be enhanced
			return history.filter(item => 
				item.task.toLowerCase().includes(query.toLowerCase())
			)
		},

		exportTask: async (taskId: string, format?: string) => {
			const { historyItem, apiConversationHistory } = await sidebarProvider.getTaskWithId(taskId)
			return {
				task: historyItem.task,
				messages: apiConversationHistory,
				metrics: {
					tokensIn: historyItem.tokensIn,
					tokensOut: historyItem.tokensOut,
					cacheWrites: historyItem.cacheWrites,
					cacheReads: historyItem.cacheReads,
					totalCost: historyItem.totalCost
				},
				resources: []
			}
		}
	}

	return api
}
