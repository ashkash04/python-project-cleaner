import * as fs from 'fs';
import * as path from 'path';

import { getIgnoredFolders } from '../utils/settings';

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
export function findCacheFolders(directoryPath: string): string[] {
    const cacheFolderPaths: string[] = [];
    const ignoredFolders = getIgnoredFolders().filter((folderName) => folderName !== '__pycache__');

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

        if (ignoredFolders.includes(entry.name)) {
            continue;
        }

        const nestedCacheFolderPaths = findCacheFolders(fullPath);
        cacheFolderPaths.push(...nestedCacheFolderPaths);
    }

    return cacheFolderPaths;
}