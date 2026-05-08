import * as vscode from 'vscode';


/**
 * Gets the configured large-file threshold in bytes.
 * 
 * The user-facing setting is stored in megabytes, but the scanner works with
 * bytes because filesystem file sizes are reported in bytes.
 * 
 * @returns Large-file threshold in bytes.
 */
export function getLargeFileThresholdBytes(): number {
    const config = vscode.workspace.getConfiguration('pythonProjectCleaner');

    const thresholdMb = config.get<number>('largeFileThresholdMb', 10);

    return thresholdMb * 1024 * 1024;
}


/**
 * Gets the configured folder names to skip during workspace scans.
 * 
 * @returns Folder names that should be ignored while scanning.
 */
export function getIgnoredFolders(): string[] {
    const config = vscode.workspace.getConfiguration('pythonProjectCleaner');

    return config.get<string[]>('ignoredFolders', [
        '.git',
        '.venv',
        'venv',
        'env',
        'node_modules',
        '__pycache__'
    ]);
}