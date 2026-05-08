import * as fs from 'fs';


/**
 * Writes text content to a file.
 * 
 * @param filePath - Absolute path of the file to write.
 * @param content - Text content to write.
 * @returns `true` is the file was written successfully, otherwise `false`.
 */
export function writeTextFile(filePath: string, content: string): boolean {
    try {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    } catch {
        return false;
    }
}