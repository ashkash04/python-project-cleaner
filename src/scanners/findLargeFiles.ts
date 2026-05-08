import * as fs from 'fs';
import * as path from 'path';

import { getIgnoredFolders } from '../utils/settings';

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
export function findLargeFiles(directoryPath: string, sizeLimitBytes: number): string[] {
	const largeFilePaths: string[] = [];
	const ignoredFolders = getIgnoredFolders();

	let entries: fs.Dirent[];

	try {
		entries = fs.readdirSync(directoryPath, { withFileTypes: true });
	} catch {
		return largeFilePaths;
	}

	for (const entry of entries) {
		const fullPath = path.join(directoryPath, entry.name);

		if (entry.isDirectory()) {
			if (ignoredFolders.includes(entry.name)) {
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