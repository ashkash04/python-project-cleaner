import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import { getWorkspaceRoot } from '../utils/workspace';
import { buildRequirementsFileContent } from '../generators/buildRequirementsFileContent';
import { writeTextFile } from '../fileSystem/writeTextFile';


/**
 * Registers the command that creates a starter `requirements.txt` file.
 * 
 * The command does nothing if either `requirements.txt` or `pyproject.toml`
 * already exists.
 * 
 * @param context - VS Code extension context used to manage command cleanup.
 */
export function registerCreateRequirementsFileCommand(context: vscode.ExtensionContext): void {
    const disposable = vscode.commands.registerCommand('python-project-cleaner.createRequirementsFile', async () => {
		const workspaceRoot = getWorkspaceRoot();

		if (!workspaceRoot) {
			return;
		}

		const requirementsPath = path.join(workspaceRoot, 'requirements.txt');
		const pyProjectPath = path.join(workspaceRoot, 'pyproject.toml');

		if (fs.existsSync(requirementsPath)) {
			vscode.window.showInformationMessage('requirements.txt already exists.');
			return;
		}

		if (fs.existsSync(pyProjectPath)) {
			vscode.window.showInformationMessage('pyproject.toml already exists.');
			return;
		}

		const confirmation = await vscode.window.showWarningMessage(
			'Create a basic requirements.txt in this workspace?',
			{ modal: true },
			'Create'
		);

		if (confirmation !== 'Create') {
			return;
		}

		const requirementsContent = buildRequirementsFileContent();

		const wasCreated = writeTextFile(requirementsPath, requirementsContent);

		if (!wasCreated) {
			vscode.window.showErrorMessage('Failed to create requirements.txt.');
			return;
		}

		const document = await vscode.workspace.openTextDocument(requirementsPath);
		await vscode.window.showTextDocument(document);

		vscode.window.showInformationMessage('Created requirements.txt.');
	});
}