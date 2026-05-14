import * as fs from 'fs';
import * as path from 'path';

import { getIgnoredFolders } from '../utils/settings';
import { extractImportsFromSource } from './extractImportsFromSource';


/**
 * Recursively finds Python files under a directory.
 *
 * @param directoryPath - Absolute path of the directory to scan.
 * @returns Absolute paths of discovered Python files.
 */
function findPythonFiles(directoryPath: string): string[] {
	const pythonFilePaths: string[] = [];
	const ignoredFolders = getIgnoredFolders();

	let entries: fs.Dirent[];

	try {
		entries = fs.readdirSync(directoryPath, { withFileTypes: true });
	} catch {
		return pythonFilePaths;
	}

	for (const entry of entries) {
		const fullPath = path.join(directoryPath, entry.name);

		if (entry.isDirectory()) {
			if (ignoredFolders.includes(entry.name)) {
				continue;
			}

			pythonFilePaths.push(...findPythonFiles(fullPath));
			continue;
		}

		if (entry.isFile() && entry.name.endsWith('.py')) {
			pythonFilePaths.push(fullPath);
		}
	}

	return pythonFilePaths;
}


/**
 * Recursively scans Python files and returns imported top-level module names.
 *
 * @param workspaceRoot - Absolute path of the workspace to scan.
 * @returns Imported top-level module names.
 */
export function findPythonImports(workspaceRoot: string): string[] {
	const imports = new Set<string>();
	const pythonFilePaths = findPythonFiles(workspaceRoot);

	for (const pythonFilePath of pythonFilePaths) {
		let sourceCode: string;

		try {
			sourceCode = fs.readFileSync(pythonFilePath, 'utf8');
		} catch {
			continue;
		}

		const fileImports = extractImportsFromSource(sourceCode);

		for (const importedModule of fileImports) {
			imports.add(importedModule);
		}
	}

	return [...imports].sort();
}