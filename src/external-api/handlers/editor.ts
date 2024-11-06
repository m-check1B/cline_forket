import { ClineAPI } from '../../exports/cline';
import { APIResponse, EditorDiffRequest, DiagnosticsRequest, DiagnosticsResponse } from '../types';
import { DiffViewProvider } from '../../integrations/editor/DiffViewProvider';
import * as vscode from 'vscode';
import * as diff from 'diff';

export async function handleEditorDiff(api: ClineAPI, request: EditorDiffRequest): Promise<APIResponse> {
    try {
        const diffProvider = new DiffViewProvider(process.cwd());
        
        // Use diff library to generate diff
        const changes = diff.diffLines(request.original, request.modified);
        const diffText = changes.map(part => {
            const prefix = part.added ? '+' : part.removed ? '-' : ' ';
            return part.value.split('\n')
                .filter(line => line.length > 0)
                .map(line => prefix + line)
                .join('\n');
        }).join('\n');

        return {
            status: 'success',
            data: {
                diff: diffText,
                changes: changes.filter(part => part.added || part.removed).length
            }
        };
    } catch (error) {
        return {
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

export async function handleDiagnostics(api: ClineAPI, request: DiagnosticsRequest): Promise<APIResponse<DiagnosticsResponse>> {
    try {
        const diagnostics = vscode.languages.getDiagnostics();
        
        const filteredDiagnostics = Array.from(diagnostics)
            .filter(([uri]) => !request.path || uri.fsPath.includes(request.path))
            .flatMap(([uri, fileDiagnostics]) => 
                fileDiagnostics
                    .filter(d => !request.severity || d.severity.toString() === request.severity)
                    .map(d => ({
                        path: uri.fsPath,
                        line: d.range.start.line + 1,
                        message: d.message,
                        severity: d.severity.toString(),
                        source: d.source
                    }))
            );

        return {
            status: 'success',
            data: {
                diagnostics: filteredDiagnostics
            }
        };
    } catch (error) {
        return {
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}
