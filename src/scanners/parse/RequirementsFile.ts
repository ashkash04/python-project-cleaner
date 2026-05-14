import * as fs from 'fs';

import { parseRequirementsContent } from './RequirementsContent';

/**
 * Parses dependency package names from a requirements.txt file.
 * 
 * If the file cannot be read, an empty list is returned.
 * 
 * @param requirementsPath - Absolute path to requirements.txt.
 * @returns Parsed dependency package names.
 */
export function parseRequirementsFile(requirementsPath: string): string[] {
    let content: string;

    try {
        content = fs.readFileSync(requirementsPath, 'utf8');
    } catch {
        return [];
    }

    return parseRequirementsContent(content);
}