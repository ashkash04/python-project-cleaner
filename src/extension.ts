import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';


/**
 * Represents the result of scanning a Python workspace.
 */
type HealthReport = {
	score: number;
	workspaceRoot: string;
	cacheFoldersFound: number;
	largeFilesFound: number;
	largeFilePaths: string[];
	hasGitIgnore: boolean;
	hasDependencyFile: boolean;
	hasVirtualEnvironment: boolean;
	hasReadme: boolean;
	warnings: string[];
};


/**
 * Recursively searches a directory for Python __pycache__ folders.
 * 
 * Virtual environment folders and `.git` are skipped because they are usually
 * large and not useful for this extension's cache scan.
 * 
 * Unreadable directories are skipped instead of throwing, so a single bad
 * directory does not stop the entire command.
 * 
 * @param directoryPath - Absolute path of the directory to scan.
 * @returns Absolute paths of discovered `__pycache__` folders.
 */
function findCacheFolders(directoryPath: string): string[] {
	const cacheFolderPaths: string[] = [];

	let entries: fs.Dirent[];

	try {
		entries = fs.readdirSync(directoryPath, { withFileTypes: true });
	} catch {
		return cacheFolderPaths;
	}

	for (const entry of entries) {
		if (!entry.isDirectory()) {
			continue;
		}

		const fullPath = path.join(directoryPath, entry.name);

		if (entry.name === '__pycache__') {
			cacheFolderPaths.push(fullPath);
			continue;
		}

		if (entry.name === '.venv' || entry.name === 'venv' || entry.name === 'env' || entry.name === '.git') {
			continue;
		}

		const nestedCacheFolderPaths = findCacheFolders(fullPath);
		cacheFolderPaths.push(...nestedCacheFolderPaths);
	}

	return cacheFolderPaths;
}


/**
 * Recursively finds large files inside a workspace.
 * 
 * Virtual environments, `.git`, and cache folders are skipped because they can
 * contain many generated files that are not useful for this project-level scan.
 * 
 * @param directoryPath - Absolute path of the directory in use.
 * @param sizeLimitBytes - Minimum file size in bytes to report.
 * @returns Absolute paths of files larger than the size limit.
 */
function findLargeFiles(directoryPath: string, sizeLimitBytes: number): string[] {
	const largeFilePaths: string[] = [];

	let entries: fs.Dirent[];

	try {
		entries = fs.readdirSync(directoryPath, { withFileTypes: true });
	} catch {
		return largeFilePaths;
	}

	for (const entry of entries) {
		const fullPath = path.join(directoryPath, entry.name);

		if (entry.isDirectory()) {
			if (
				entry.name === '.venv' ||
				entry.name === 'venv' ||
				entry.name === 'env' ||
				entry.name === '.git' ||
				entry.name === '__pycache__'
			) {
				continue;
			}

			const nestedLargeFilePaths = findLargeFiles(fullPath, sizeLimitBytes);
			largeFilePaths.push(...nestedLargeFilePaths);
			continue;
		}

		if (!entry.isFile()) {
			continue;
		}

		try {
			const stats = fs.statSync(fullPath);

			if (stats.size >= sizeLimitBytes) {
				largeFilePaths.push(fullPath);
			}
		} catch {
			continue;
		}
	}

	return largeFilePaths;
}


/**
 * Calculates a simple MVP health score for a Python workspace.
 * 
 * The score starts at 100 and subtracts points for missing project hygiene
 * items such as `.gitignore`, dependency files, virtual environments, and
 * Python cache folders.
 * 
 * @param reportInput - Basic scan results used to calculate the score.
 * @returns A score between 0 and 100.
 */
function calculateHealthScore(reportInput: {
	hasGitIgnore: boolean;
	hasDependencyFile: boolean;
	hasVirtualEnvironment: boolean;
	hasReadme: boolean;
	cacheFoldersFound: number;
	largeFilesFound: number;
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

	if (!reportInput.hasReadme) {
		score -= 10;
	}

	if (reportInput.cacheFoldersFound > 0) {
		score -= Math.min(reportInput.cacheFoldersFound * 5, 25);
	}

	if (reportInput.largeFilesFound > 0) {
		score -= Math.min(reportInput.largeFilesFound * 5, 20);
	}

	return Math.max(score, 0);
}


/**
 * Build suggested actions based on health report warnings.
 * 
 * @param report - Health report data for the current workspace.
 * @returns Suggested fixes for detected project issues.
 */
function buildSuggestedFixes(report: HealthReport): string[] {
	const fixes: string[] = [];

	if (!report.hasGitIgnore) {
		fixes.push('Run `Python Project Cleaner: Create Python .gitignore`.');
	}

	if (!report.hasDependencyFile) {
		fixes.push('Run `Python Project Cleaner: Create requirements.txt`.');
	}

	if (!report.hasVirtualEnvironment) {
		fixes.push('Create a virtual environment with `python -m venv .venv`.');
	}

	if (!report.hasReadme) {
		fixes.push('Add a `README.md` file describing the project.');
	}

	if (report.cacheFoldersFound > 0) {
		fixes.push('Run `Python Project Cleaner: Delete __pycache__ Folders`.');
	}

	if (report.largeFilesFound > 0) {
		fixes.push('Consider moving large files out of the repository or using Git LFS.');
	}

	return fixes;
}


/**
 * Build the Markdown content shown after running the health check command.
 * 
 * @param report - Health report data for the current workspace.
 * @returns Markdown content for the generated report document.
 */
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
		`- ${report.hasReadme ? '✅' : '❌'} README.md ${report.hasReadme ? 'found' : 'missing'}`,
		`- ${report.cacheFoldersFound === 0 ? '✅' : '⚠️'} Python cache folders: ${report.cacheFoldersFound}`,
		`- ${report.largeFilesFound === 0 ? '✅' : '⚠️'} Large files: ${report.largeFilesFound}`,
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

	if (report.largeFilePaths.length > 0) {
		lines.push('');
		lines.push('## Large Files');
		lines.push('');

		for (const largeFilePath of report.largeFilePaths) {
			lines.push(`- ${largeFilePath}`);
		}
	}

	const suggestedFixes = buildSuggestedFixes(report);

	if (suggestedFixes.length > 0) {
		lines.push('');
		lines.push('## Suggested Fixes');
		lines.push('');

		for (const fix of suggestedFixes) {
			lines.push(`- ${fix}`);
		}
	}

	return lines.join('\n');
}


/**
 * Builds starter `.gitignore` content for a typical Python project.
 * 
 * @returns Text content for a Python-focused `.gitignore` file.
 */
function buildPythonGitIgnoreContent(): string {
	const lines = [
		'# Python',
		'__pycache__/',
		'*.py[cod]',
		'',
		'# Virtual environments',
		'.venv/',
		'venv/',
		'env/',
		'',
		'# Environment variables',
		'.env',
		'.env.*',
		'',
		'# Build artifacts',
		'build/',
		'dist/',
		'*.egg-info/',
		'',
		'# Testing and coverage',
		'.pytest_cache/',
		'.coverage',
		'htmlcov/',
		'',
		'# Type checking',
		'.mypy_cache/',
		'.ruff_cache/',
		'',
		'# IDE',
		'.vscode/',
		''
	];

	return lines.join('\n');
}


/**
 * Builds starter `requirements.txt` content for a Python project.
 * 
 * @returns Text content for a minimal `requirements.txt` file.
 */
function buildRequirementsFileContent(): string {
	const lines = [
		'# Add your Python dependencies here.',
		'# Example:',
		'# requests==2.32.3',
		''
	];

	return lines.join('\n');
}


/**
 * Gets the absolute path of the first open workspace folder.
 * 
 * If no workspace folder is open, an error message is shown and `undefined`
 * is returned.
 * 
 * @returns Absolute workspace path, or `undefined` if no folder is open.
 */
function getWorkspaceRoot(): string | undefined {
	const workspaceFolders = vscode.workspace.workspaceFolders;

	if (!workspaceFolders || workspaceFolders.length === 0) {
		vscode.window.showErrorMessage('No workspace folder is open.');
		return undefined;
	}

	return workspaceFolders[0].uri.fsPath;
}


/**
 * Scans a Python workspace and builds a health report.
 * 
 * @param workspaceRoot - Absolute path of the workspace to scan.
 * @returns Health report for the workspace.
 */
function scanPythonWorkspace(workspaceRoot: string): HealthReport {
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

	const readmePath = path.join(workspaceRoot, 'README.md');
	const hasReadme = fs.existsSync(readmePath);

	const cacheFolderPaths = findCacheFolders(workspaceRoot);
	const cacheFoldersFound = cacheFolderPaths.length;

	const largeFileLimitBytes = 10 * 1024 * 1024;
	const largeFilePaths = findLargeFiles(workspaceRoot, largeFileLimitBytes);
	const largeFilesFound = largeFilePaths.length;

	const score = calculateHealthScore({
		hasGitIgnore: hasGitIgnore,
		hasDependencyFile: hasDependencyFile,
		hasVirtualEnvironment: hasVirtualEnvironment,
		hasReadme: hasReadme,
		cacheFoldersFound: cacheFoldersFound,
		largeFilesFound: largeFilesFound
	});

	return {
		score: score,
		workspaceRoot: workspaceRoot,
		cacheFoldersFound: cacheFoldersFound,
		hasGitIgnore: hasGitIgnore,
		hasDependencyFile: hasDependencyFile,
		hasVirtualEnvironment: hasVirtualEnvironment,
		hasReadme: hasReadme,
		largeFilesFound: largeFilesFound,
		largeFilePaths: largeFilePaths,
		warnings: [
			...(!hasGitIgnore ? ['No .gitignore file found.'] : []),
			...(!hasDependencyFile ? ['No requirements.txt or pyproject.toml file found.'] : []),
			...(!hasVirtualEnvironment ? ['No virtual environment folder found.'] : []),
			...(!hasReadme ? ['No README.md file found.'] : []),
			...(cacheFoldersFound > 0 ? [`${cacheFoldersFound} Python cache folder(s) found.`] : []),
			...(largeFilesFound > 0 ? [`${largeFilesFound} large file(s) found over 10 MB.`] : [])
		]
	};
}


/**
 * Deletes folders and returns the number of successfully deleted folders.
 * 
 * Delete failures are skipped so one locked or unreadable folder does not stop
 * the entire cleanup command.
 * 
 * @param folderPaths - Absolute paths of folders to delete
 * @returns Number of folders successfully deleted.
 */
function deleteFolders(folderPaths: string[]): number {
	let deletedCount = 0;

	for (const folderPath of folderPaths) {
		try {
			fs.rmSync(folderPath, {
				recursive: true,
				force: true,
			});

			deletedCount++;
		} catch {
			continue;
		}
	}

	return deletedCount;
}


/**
 * Writes text content to a file.
 * 
 * @param filePath - Absolute path of the file to write.
 * @param content - Text content to write.
 * @returns `true` is the file was written successfully, otherwise `false`.
 */
function writeTextFile(filePath: string, content: string): boolean {
	try {
		fs.writeFileSync(filePath, content, 'utf8');
		return true;
	} catch {
		return false;
	}
}


export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "python-project-cleaner" is now active!');

	const runHealthCheckDisposable = vscode.commands.registerCommand('python-project-cleaner.runHealthCheck', async () => {
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

	const deleteCacheFoldersDisposable = vscode.commands.registerCommand('python-project-cleaner.deleteCacheFolders', async () => {
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

	const createGitIgnoreDisposable = vscode.commands.registerCommand('python-project-cleaner.createGitIgnore', async () => {
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

	const createRequirementsFileDisposable = vscode.commands.registerCommand('python-project-cleaner.createRequirementsFile', async () => {
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

	context.subscriptions.push(
		runHealthCheckDisposable,
		deleteCacheFoldersDisposable,
		createGitIgnoreDisposable,
		createRequirementsFileDisposable
	);
}

export function deactivate() {}
