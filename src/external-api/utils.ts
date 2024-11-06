import { APIResponse } from './types';

/**
 * Generic request handler that wraps async operations and provides consistent error handling
 * @param fn Async function to execute
 * @returns APIResponse with success/error status and data/error message
 */
export async function handleRequest<T>(fn: () => Promise<T>): Promise<APIResponse<T>> {
    try {
        const result = await fn();
        return {
            status: 'success',
            data: result
        };
    } catch (error) {
        return {
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Formats an error response with consistent structure
 * @param error Error object or string
 * @returns Formatted error response
 */
export function formatErrorResponse(error: Error | string): APIResponse {
    return {
        status: 'error',
        error: error instanceof Error ? error.message : error
    };
}

/**
 * Validates that required parameters are present in a request
 * @param params Object containing parameters
 * @param required Array of required parameter names
 * @returns Error message if validation fails, undefined if successful
 */
export function validateRequiredParams(params: Record<string, any>, required: string[]): string | undefined {
    const missing = required.filter(param => params[param] === undefined);
    if (missing.length > 0) {
        return `Missing required parameters: ${missing.join(', ')}`;
    }
    return undefined;
}

/**
 * Safely parses JSON with error handling
 * @param input String to parse as JSON
 * @returns Parsed object or undefined if parsing fails
 */
export function safeJsonParse(input: string): any | undefined {
    try {
        return JSON.parse(input);
    } catch {
        return undefined;
    }
}
