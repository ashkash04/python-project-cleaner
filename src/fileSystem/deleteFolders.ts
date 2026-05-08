import * as fs from 'fs';


/**
 * Deletes folders and returns the number of successfully deleted folders.
 * 
 * Delete failures are skipped so one locked or unreadable folder does not stop
 * the entire cleanup command.
 * 
 * @param folderPaths - Absolute paths of folders to delete
 * @returns Number of folders successfully deleted.
 */
export function deleteFolders(folderPaths: string[]): number {
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