/**
 * Extracts top-level imported module names from Python source code.
 *
 * Handles simple import forms such as:
 * - import numpy
 * - import pandas as pd
 * - import os, sys
 * - from sklearn.model_selection import train_test_split
 *
 * @param sourceCode - Python source code to analyze.
 * @returns Top-level imported module names.
 */
export function extractImportsFromSource(sourceCode: string): string[] {
    const imports = new Set<string>();
    const lines = sourceCode.split(/\r?\n/);

    for (const line of lines) {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('#')) {
            continue;
        }

        const importMatch = trimmedLine.match(/^import\s+(.+)$/);

        if (importMatch) {
            const importedItems = importMatch[1].split(',');

            for (const item of importedItems) {
                const moduleName = item.trim().split(/\s+/)[0];
                const topLevelModuleName = moduleName.split('.')[0];

                if (topLevelModuleName) {
                    imports.add(topLevelModuleName);
                }
            }

            continue;
        }

        const fromImportMatch = trimmedLine.match(/^from\s+([A-Za-z_][A-Za-z0-9_\.]*)\s+import\s+/);

        if (fromImportMatch) {
            const moduleName = fromImportMatch[1];
            const topLevelModuleName = moduleName.split('.')[0];

            if (topLevelModuleName) {
                imports.add(topLevelModuleName);
            }
        }
    }

    return [...imports].sort();
}