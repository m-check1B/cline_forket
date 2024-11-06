import * as vscode from 'vscode';
import delay from "delay";
import { ClineProvider } from "./core/webview/ClineProvider";
import { WebSocketProvider } from "./core/webview/WebSocketProvider";
import { createClineAPI } from "./exports";
import "./utils/path";
import { DIFF_VIEW_URI_SCHEME } from "./integrations/editor/DiffViewProvider";
import { startExternalAPIServer } from './external-api/server';

let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel("Cline");
    context.subscriptions.push(outputChannel);

    outputChannel.appendLine("Cline extension activated");

    // Create providers
    const sidebarProvider = new ClineProvider(context, outputChannel);
    const wsProvider = new WebSocketProvider(context, outputChannel);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(ClineProvider.sideBarId, sidebarProvider, {
            webviewOptions: { retainContextWhenHidden: true },
        })
    );

    // Start External API Server with WebSocket support
    const externalAPIServer = startExternalAPIServer(context, outputChannel, wsProvider);

    // Add server to context subscriptions for proper cleanup
    context.subscriptions.push({
        dispose: async () => {
            externalAPIServer.close();
            await wsProvider.dispose();
            outputChannel.appendLine('Cline External API Server stopped');
        }
    });

    // Add commands to start/stop external API server
    context.subscriptions.push(
        vscode.commands.registerCommand('cline.startExternalAPIServer', () => {
            outputChannel.appendLine('Manually starting External API Server');
            startExternalAPIServer(context, outputChannel, wsProvider);
        }),
        vscode.commands.registerCommand('cline.stopExternalAPIServer', () => {
            outputChannel.appendLine('Manually stopping External API Server');
            externalAPIServer.close();
        })
    );

    // Existing commands and functionality...
    context.subscriptions.push(
        vscode.commands.registerCommand("cline.plusButtonClicked", async () => {
            outputChannel.appendLine("Plus button Clicked");
            await sidebarProvider.clearTask();
            await sidebarProvider.postStateToWebview();
            await sidebarProvider.postMessageToWebview({ type: "action", action: "chatButtonClicked" });
        })
    );

    const openClineInNewTab = async () => {
        outputChannel.appendLine("Opening Cline in new tab");
        const tabProvider = new ClineProvider(context, outputChannel);
        const lastCol = Math.max(...vscode.window.visibleTextEditors.map((editor) => editor.viewColumn || 0));

        const hasVisibleEditors = vscode.window.visibleTextEditors.length > 0;
        if (!hasVisibleEditors) {
            await vscode.commands.executeCommand("workbench.action.newGroupRight");
        }
        const targetCol = hasVisibleEditors ? Math.max(lastCol + 1, 1) : vscode.ViewColumn.Two;

        const panel = vscode.window.createWebviewPanel(ClineProvider.tabPanelId, "Cline", targetCol, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [context.extensionUri],
        });

        panel.iconPath = {
            light: vscode.Uri.joinPath(context.extensionUri, "assets", "icons", "robot_panel_light.png"),
            dark: vscode.Uri.joinPath(context.extensionUri, "assets", "icons", "robot_panel_dark.png"),
        };
        tabProvider.resolveWebviewView(panel);

        await delay(100);
        await vscode.commands.executeCommand("workbench.action.lockEditorGroup");
    };

    context.subscriptions.push(
        vscode.commands.registerCommand('cline.popoutButtonClicked', openClineInNewTab),
        vscode.commands.registerCommand('cline.openInNewTab', openClineInNewTab)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("cline.settingsButtonClicked", () => {
            sidebarProvider.postMessageToWebview({ type: "action", action: "settingsButtonClicked" });
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("cline.historyButtonClicked", () => {
            sidebarProvider.postMessageToWebview({ type: "action", action: "historyButtonClicked" });
        })
    );

    const diffContentProvider = new (class implements vscode.TextDocumentContentProvider {
        provideTextDocumentContent(uri: vscode.Uri): string {
            return Buffer.from(uri.query, "base64").toString("utf-8");
        }
    })();
    context.subscriptions.push(
        vscode.workspace.registerTextDocumentContentProvider(DIFF_VIEW_URI_SCHEME, diffContentProvider)
    );

    const handleUri = async (uri: vscode.Uri) => {
        const path = uri.path;
        const query = new URLSearchParams(uri.query.replace(/\+/g, "%2B"));
        const visibleProvider = ClineProvider.getVisibleInstance();
        if (!visibleProvider) {
            return;
        }
        switch (path) {
            case "/openrouter": {
                const code = query.get("code");
                if (code) {
                    await visibleProvider.handleOpenRouterCallback(code);
                }
                break;
            }
            default:
                break;
        }
    };
    context.subscriptions.push(vscode.window.registerUriHandler({ handleUri }));

    return createClineAPI(outputChannel, sidebarProvider);
}

export function deactivate() {
    outputChannel.appendLine("Cline extension deactivated");
}
