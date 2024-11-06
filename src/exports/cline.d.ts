import { ApiConfiguration, ModelInfo } from '../shared/api'
import { ExtensionMessage } from '../shared/ExtensionMessage'
import { HistoryItem } from '../shared/HistoryItem'

export interface ClineAPI {
	/**
	 * Sets the custom instructions in the global storage.
	 * @param value The custom instructions to be saved.
	 */
	setCustomInstructions(value: string): Promise<void>

	/**
	 * Retrieves the custom instructions from the global storage.
	 * @returns The saved custom instructions, or undefined if not set.
	 */
	getCustomInstructions(): Promise<string | undefined>

	/**
	 * Starts a new task with an optional initial message and images.
	 * @param task Optional initial task message.
	 * @param images Optional array of image data URIs (e.g., "data:image/webp;base64,...").
	 */
	startNewTask(task?: string, images?: string[]): Promise<void>

	/**
	 * Sends a message to the current task.
	 * @param message Optional message to send.
	 * @param images Optional array of image data URIs (e.g., "data:image/webp;base64,...").
	 */
	sendMessage(message?: string, images?: string[]): Promise<void>

	/**
	 * Simulates pressing the primary button in the chat interface.
	 */
	pressPrimaryButton(): Promise<void>

	/**
	 * Simulates pressing the secondary button in the chat interface.
	 */
	pressSecondaryButton(): Promise<void>

	/**
	 * Cancels the current active task.
	 */
	cancelCurrentTask(): Promise<void>

	/**
	 * Updates the API configuration settings.
	 * @param config Configuration options to update.
	 */
	updateConfiguration(config: Partial<ApiConfiguration>): Promise<void>

	/**
	 * Gets the current API configuration.
	 */
	getConfiguration(): Promise<ApiConfiguration>

	/**
	 * Gets the list of available models.
	 */
	getAvailableModels(): Promise<ModelInfo[]>

	/**
	 * Gets the current extension state.
	 */
	getState(): Promise<ExtensionMessage>

	/**
	 * Gets the conversation history.
	 */
	getHistory(): Promise<HistoryItem[]>

	/**
	 * Sets the current view (history or chat).
	 * @param view The view to switch to.
	 * @param showAnnouncement Whether to show the announcement.
	 */
	setView(view: 'history' | 'chat', showAnnouncement?: boolean): Promise<void>

	/**
	 * Controls message expansion state.
	 * @param messageId The ID of the message to control.
	 * @param expanded Whether the message should be expanded.
	 */
	setMessageDisplay(messageId: number, expanded: boolean): Promise<void>

	/**
	 * Updates the scroll position state.
	 * @param isAtBottom Whether the view is scrolled to the bottom.
	 * @param showScrollToBottom Whether to show the scroll to bottom button.
	 */
	updateScrollState(isAtBottom: boolean, showScrollToBottom: boolean): Promise<void>

	/**
	 * Handles webview ask responses.
	 * @param askResponse The response type.
	 * @param text Optional response text.
	 * @param images Optional response images.
	 */
	handleWebviewAskResponse(askResponse: string, text?: string, images?: string[]): Promise<void>

	/**
	 * Aborts the current task.
	 */
	abortTask(): void

	/**
	 * Gets the environment details including visible files, open tabs, terminal state, etc.
	 * @param includeFileDetails Whether to include detailed file listings.
	 */
	getEnvironmentDetails(includeFileDetails?: boolean): Promise<string>

	/**
	 * Loads and processes context for user content.
	 * @param userContent The content to process.
	 * @param includeFileDetails Whether to include detailed file listings in environment details.
	 */
	loadContext(userContent: any[], includeFileDetails?: boolean): Promise<[any[], string]>

	/**
	 * Resumes a previously interrupted task.
	 * @param taskId The ID of the task to resume.
	 * @param feedback Optional feedback to provide when resuming.
	 * @param images Optional images to include with the feedback.
	 */
	resumeTask(taskId: string, feedback?: string, images?: string[]): Promise<void>

	/**
	 * Cancels a specific task by ID.
	 * @param taskId The ID of the task to cancel.
	 * @param reason Optional reason for cancellation.
	 */
	cancelTask(taskId: string, reason?: string): Promise<void>

	/**
	 * Deletes a task from history.
	 * @param taskId The ID of the task to delete.
	 */
	deleteTask(taskId: string): Promise<void>

	/**
	 * Gets a specific task by ID.
	 * @param taskId The ID of the task to retrieve.
	 */
	getTaskWithId(taskId: string): Promise<HistoryItem | undefined>

	/**
	 * Searches tasks in history.
	 * @param query The search query.
	 * @param sort Optional sort order ('newest', 'oldest', 'mostExpensive', 'mostTokens', 'mostRelevant').
	 */
	searchTasks(query: string, sort?: string): Promise<HistoryItem[]>

	/**
	 * Exports a task's data.
	 * @param taskId The ID of the task to export.
	 * @param format Optional export format ('json' or 'markdown').
	 */
	exportTask(taskId: string, format?: string): Promise<{
		task: string;
		messages: any[];
		metrics: {
			tokensIn: number;
			tokensOut: number;
			cacheWrites?: number;
			cacheReads?: number;
			totalCost: number;
		};
		resources: string[];
	}>
}
