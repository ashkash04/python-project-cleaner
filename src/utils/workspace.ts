import * as vscode from 'vscode';


/**
 * Gets the absolute path of the first open workspace folder.
 * 
 * If no workspace folder is open, an error message is shown and `undefined`
 * is returned.
 * 
 * @returns Absolute workspace path, or `undefined` if no folder is open.
 */
export function getWorkspaceRoot(): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('No workspace folder is open.');
        return undefined;
    }

    return workspaceFolders[0].uri.fsPath;
}