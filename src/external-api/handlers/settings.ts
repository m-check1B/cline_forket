import { ClineAPI } from '../../exports/cline';
import { APIResponse, ResetStateRequest, DebugOptionsRequest } from '../types';
import * as vscode from 'vscode';

export async function handleStateReset(api: ClineAPI, request: ResetStateRequest): Promise<APIResponse> {
    try {
        const { resetOptions } = request;
        
        if (resetOptions.history || resetOptions.all) {
            // Clear task history
            await api.getState().then(state => {
                if (state.state) {
                    state.state.taskHistory = [];
                }
            });
        }

        if (resetOptions.configuration || resetOptions.all) {
            // Reset API configuration
            await api.updateConfiguration({});
        }

        if (resetOptions.customInstructions || resetOptions.all) {
            // Clear custom instructions
            await api.setCustomInstructions('');
        }

        return {
            status: 'success',
            data: {
                message: 'State reset successful'
            }
        };
    } catch (error) {
        return {
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

export async function handleDebugOptions(api: ClineAPI, request: DebugOptionsRequest): Promise<APIResponse> {
    try {
        const { options } = request;
        
        // Update log level
        if (options.logLevel) {
            vscode.workspace.getConfiguration('cline').update('logLevel', options.logLevel, true);
        }

        // Enable/disable metrics collection
        if (options.metrics !== undefined) {
            vscode.workspace.getConfiguration('cline').update('collectMetrics', options.metrics, true);
        }

        // Enable/disable performance tracking
        if (options.performance !== undefined) {
            vscode.workspace.getConfiguration('cline').update('trackPerformance', options.performance, true);
        }

        // Enable/disable API trace
        if (options.apiTrace !== undefined) {
            vscode.workspace.getConfiguration('cline').update('traceApi', options.apiTrace, true);
        }

        return {
            status: 'success',
            data: {
                message: 'Debug options updated successfully'
            }
        };
    } catch (error) {
        return {
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
