import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import { getWorkspaceRoot } from '../utils/workspace';
import { buildPythonGitIgnoreContent } from '../generators/buildPythonGitIgnoreContent';
import { writeTextFile } from '../fileSystem/writeTextFile';


/**
 * Registers the command that creates a starter Python `.gitignore` file.
 * 
 * @param context - VS Code extension context used to manage command cleanup.
 */
export function registerCreateGitIgnoreCommand(context: vscode.ExtensionContext): void {
    const dispoable = vscode.commands.registerCommand('python-project-cleaner.createGitIgnore', async () => {
            const workspaceRoot = getWorkspaceRoot();
    
            if (!workspaceRoot) {
                return;
            }
    
            const gitignorePath = path.join(workspaceRoot, '.gitignore');
    
            if (fs.existsSync(gitignorePath)) {
                vscode.window.showInformationMessage('.gitignore already exists.');
                return;
            }
    
            const confirmation = await vscode.window.showWarningMessage(
                'Create a basic Python .gitignore in this workspace?',
                { modal: true },
                'Create'
            );
    
            if (confirmation !== 'Create') {
                return;
            }
    
            const gitignoreContent = buildPythonGitIgnoreContent();
            const wasCreated = writeTextFile(gitignorePath, gitignoreContent);
    
            if (!wasCreated) {
                vscode.window.showErrorMessage('Failed to create .gitignore.');
                return;
            }
    
            const document = await vscode.workspace.openTextDocument(gitignorePath);
            await vscode.window.showTextDocument(document);
    
            vscode.window.showInformationMessage('Created Python .gitignore.');
        });

        context.subscriptions.push(dispoable);
}