import * as vscode from 'vscode';

import { getWorkspaceRoot } from '../utils/workspace';
import { scanPythonWorkspace } from '../scanners/scanPythonWorkspace';
import { buildMarkdownReport } from '../reports/buildMarkdownReport';


/**
 * Registers the command that scans the current Python workspace and opens
 * a Markdown health report.
 * 
 * @param context - VS Code extension context used to manage command cleanup.
 */
export function registerRunHealthCheckCommand(context: vscode.ExtensionContext): void {
    const disposable = vscode.commands.registerCommand('python-project-cleaner.runHealthCheck', async () => {
            const workspaceRoot = getWorkspaceRoot();
    
            if (!workspaceRoot) {
                return;
            }
    
            const report = scanPythonWorkspace(workspaceRoot);
    
            const markdownReport = buildMarkdownReport(report);
    
            const document = await vscode.workspace.openTextDocument({
                content: markdownReport,
                language: 'markdown'
            });
    
            await vscode.window.showTextDocument(document);
        });

        context.subscriptions.push(disposable);
}