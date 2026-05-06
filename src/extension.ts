import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

type HealthReport = {
	score: number;
	workspaceRoot: string;
	cacheFoldersFound: number;
	hasGitIgnore: boolean;
	hasDependencyFile: boolean;
	hasVirtualEnvironment: boolean;
	warnings: string[];
};

function countCacheFolders(directoryPath: string): number {
	let count = 0;

	const entries = fs.readdirSync(directoryPath, { withFileTypes: true });

	for (const entry of entries) {
		if (!entry.isDirectory()) {
			continue;
		}

		const fullPath = path.join(directoryPath, entry.name);

		if (entry.name === '__pycache__') {
			count++;
			continue;
		}

		if (entry.name === '.venv' || entry.name === 'venv' || entry.name === 'env' || entry.name === '.git') {
			continue;
		}

		count += countCacheFolders(fullPath);
	}

	return count;
}

function calculateHealthScore(reportInput: {
	hasGitIgnore: boolean;
	hasDependencyFile: boolean;
	hasVirtualEnvironment: boolean;
	cacheFoldersFound: number;
}): number {
	let score = 100;

	if (!reportInput.hasGitIgnore) {
		score -= 25;
	}

	if (!reportInput.hasDependencyFile) {
		score -= 25;
	}

	if (!reportInput.hasVirtualEnvironment) {
		score -= 25;
	}

	if (reportInput.cacheFoldersFound > 0) {
		score -= Math.min(reportInput.cacheFoldersFound * 5, 25);
	}

	return Math.max(score, 0);
}

function buildMarkdownReport(report: HealthReport): string {
	const lines = [
		'# Python Project Health Report',
		'',
		`**Score:** ${report.score}/100`,
		`**Workspace:** ${report.workspaceRoot}`,
		'',
		'## Checks',
		'',
		`- ${report.hasGitIgnore ? '✅' : '❌'} .gitignore ${report.hasGitIgnore ? 'found': 'missing'}`,
		`- ${report.hasDependencyFile ? '✅' : '❌'} Dependency file ${report.hasDependencyFile ? 'found' : 'missing'}`,
		`- ${report.hasVirtualEnvironment ? '✅' : '❌'} Virtual environment ${report.hasVirtualEnvironment ? 'found' : 'missing'}`,
		`- ${report.cacheFoldersFound === 0 ? '✅' : '⚠️'} Python cache folders: ${report.cacheFoldersFound}`,
		'',
		'## Warnings',
		''
	];

	if (report.warnings.length === 0) {
		lines.push('No warnings found.');
	} else {
		for (const warning of report.warnings) {
			lines.push(`- ${warning}`);
		}
	}

	return lines.join('\n');
}

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "python-project-cleaner" is now active!');

	const disposable = vscode.commands.registerCommand('python-project-cleaner.runHealthCheck', () => {
		const workspaceFolders = vscode.workspace.workspaceFolders;

		if (!workspaceFolders || workspaceFolders.length === 0) {
			vscode.window.showErrorMessage('No workspace folder is open.');
			return;
		}

		const workspaceRoot = workspaceFolders[0].uri.fsPath;

		const gitignorePath = path.join(workspaceRoot, '.gitignore');
		const hasGitIgnore = fs.existsSync(gitignorePath);

		const requirementsPath = path.join(workspaceRoot, 'requirements.txt');
		const hasRequirementsFile = fs.existsSync(requirementsPath);

		const pyProjectPath = path.join(workspaceRoot, 'pyproject.toml');
		const hasPyProjectFile = fs.existsSync(pyProjectPath);

		const hasDependencyFile = hasRequirementsFile || hasPyProjectFile;

		const virtualEnvironmentNames = ['.venv', 'venv', 'env'];

		const hasVirtualEnvironment = virtualEnvironmentNames.some((folderName) => {
			const folderPath = path.join(workspaceRoot, folderName);
			return fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory();
		});

		const cacheFoldersFound = countCacheFolders(workspaceRoot);

		const score = calculateHealthScore({
			hasGitIgnore: hasGitIgnore,
			hasDependencyFile: hasDependencyFile,
			hasVirtualEnvironment: hasVirtualEnvironment,
			cacheFoldersFound: cacheFoldersFound
		});
		
		const report: HealthReport = {
			score: score,
			workspaceRoot: workspaceRoot,
			cacheFoldersFound: cacheFoldersFound,
			hasGitIgnore: hasGitIgnore,
			hasDependencyFile: hasDependencyFile,
			hasVirtualEnvironment: hasVirtualEnvironment,
			warnings: [
				...(!hasGitIgnore ? ['No .gitignore file found.'] : []),
				...(!hasDependencyFile ? ['No requirements.txt or pyproject.toml file found.'] : []),
				...(!hasVirtualEnvironment ? ['No virtual environment folder found.'] : []),
				...(cacheFoldersFound > 0 ? [`${cacheFoldersFound} Python cache folder(s) found.`] : [])
			]
		};

		const markdownReport = buildMarkdownReport(report);

		vscode.workspace.openTextDocument({
			content: markdownReport,
			language: 'markdown'
		}).then((document) => {
			vscode.window.showTextDocument(document);
		});
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
