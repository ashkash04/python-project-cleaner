import * as assert from 'assert';

import { buildSuggestedFixes } from '../reports/buildSuggestedFixes';
import { HealthReport } from '../types';

function createReport(overrides: Partial<HealthReport> = {}): HealthReport {
    return {
        score: 100,
        workspaceRoot: 'C:\\test-project',
        cacheFoldersFound: 0,
        largeFilesFound: 0,
        largeFilePaths: [],
        hasGitIgnore: true,
        hasDependencyFile: true,
        hasVirtualEnvironment: true,
        hasReadme: true,
        warnings: [],
        ...overrides
    };
}

suite('buildSuggestedFixes', () => {
    test('returns no fixes for a clean report', () => {
        const report = createReport();

        const fixes = buildSuggestedFixes(report);

        assert.deepStrictEqual(fixes, []);
    });

    test('suggests creating .gitignore when missing', () => {
        const report = createReport({
            hasGitIgnore: false
        });

        const fixes = buildSuggestedFixes(report);

        assert.ok(fixes.some((fix) => fix.includes('Create Python .gitignore')));
    });

    test('suggests creating requirements.txt when dependency file is missing', () => {
        const report = createReport({
            hasDependencyFile: false
        });

        const fixes = buildSuggestedFixes(report);

        assert.ok(fixes.some((fix) => fix.includes('Create requirements.txt')));
    });

    test('suggests deleting cache folders when cache folders exist', () => {
        const report = createReport({
            cacheFoldersFound: 3
        });

        const fixes = buildSuggestedFixes(report);

        assert.ok(fixes.some((fix) => fix.includes('Delete __pycache__ Folders')));
    });
    
    test('suggests Git LFS when large files exist', () => {
        const report = createReport({
            largeFilesFound: 2,
            largeFilePaths: ['C:\\test-project\\large-file.bin']
        });

        const fixes = buildSuggestedFixes(report);

        assert.ok(fixes.some((fix) => fix.includes('Git LFS')));
    });
});