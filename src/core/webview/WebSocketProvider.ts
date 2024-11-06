import * as vscode from 'vscode';
import { ClineProvider } from './ClineProvider';
import { ExtensionMessage } from '../../shared/ExtensionMessage';

export class WebSocketProvider extends ClineProvider {
    private _onDidChangeState = new vscode.EventEmitter<ExtensionMessage>();
    private _onDidUpdateMetrics = new vscode.EventEmitter<any>();

    readonly onDidChangeState = this._onDidChangeState.event;
    readonly onDidUpdateMetrics = this._onDidUpdateMetrics.event;

    constructor(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) {
        super(context, outputChannel);
    }

    async postStateToWebview() {
        const state = await this.getStateToPostToWebview();
        this._onDidChangeState.fire({
            type: 'state',
            state: state
        });
        await super.postStateToWebview();
    }

    async updateTaskHistory(item: any) {
        const history = await super.updateTaskHistory(item);
        this._onDidUpdateMetrics.fire({
            tokensIn: item.tokensIn,
            tokensOut: item.tokensOut,
            cacheWrites: item.cacheWrites,
            cacheReads: item.cacheReads,
            totalCost: item.totalCost
        });
        return history;
    }

    async dispose() {
        this._onDidChangeState.dispose();
        this._onDidUpdateMetrics.dispose();
        await super.dispose();
    }
}
