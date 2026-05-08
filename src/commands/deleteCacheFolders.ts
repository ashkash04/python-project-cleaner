import * as vscode from 'vscode';

import { getWorkspaceRoot } from '../utils/workspace';
import { findCacheFolders } from '../scanners/findCacheFolders';
import { deleteFolders } from '../fileSystem/deleteFolders';


/**
 * Registers the command that deletes discovered Python `__pycache__` folders
 * after user confirmation.
 * 
 * @param context - VS Code extension context used to manage command cleanup.
 */
export function registerDeleteCacheFoldersCommand(context: vscode.ExtensionContext): void {
    const disposable = vscode.commands.registerCommand('python-project-cleaner.deleteCacheFolders', async () => {
            const workspaceRoot = getWorkspaceRoot();
    
            if (!workspaceRoot) {
                return;
            }
    
            const cacheFolderPaths = findCacheFolders(workspaceRoot);
    
            if (cacheFolderPaths.length === 0) {
                vscode.window.showInformationMessage('No Python cache folders found.');
                return;
            }
    
            const confirmation = await vscode.window.showWarningMessage(
                `Found ${cacheFolderPaths.length} Python cache folder(s). Delete them?`,
                { modal: true },
                'Delete'
            );
    
            if (confirmation !== 'Delete') {
                return;
            }
    
            const deletedCount = deleteFolders(cacheFolderPaths);
    
            vscode.window.showInformationMessage(`Deleted ${deletedCount} Python cache folder(s).`);
        });

        context.subscriptions.push(disposable);
}