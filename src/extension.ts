import * as vscode from 'vscode';

import { registerRunHealthCheckCommand } from './commands/runHealthCheck';
import { registerDeleteCacheFoldersCommand } from './commands/deleteCacheFolders';
import { registerCreateGitIgnoreCommand } from './commands/createGitIgnore';
import { registerCreateRequirementsFileCommand } from './commands/createRequirementsFile';


export function activate(context: vscode.ExtensionContext): void {
	console.log('Python Project Cleaner is now active.');

	registerRunHealthCheckCommand(context);
	registerDeleteCacheFoldersCommand(context);
	registerCreateGitIgnoreCommand(context);
	registerCreateRequirementsFileCommand(context);
}

export function deactivate(): void {}
