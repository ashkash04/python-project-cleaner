import * as assert from 'assert';

import { calculateHealthScore } from '../scanners/calculateHealthScore';

suite('calculateHealthScore', () => {
    test('returns 100 for a clean project', () => {
        const score = calculateHealthScore({
            hasGitIgnore: true,
            hasDependencyFile: true,
            hasVirtualEnvironment: true,
            hasReadme: true,
            cacheFoldersFound: 0,
            largeFilesFound: 0,
        });

        assert.strictEqual(score, 100);
    });

    test('subtracts points for missing core files', () => {
        const score = calculateHealthScore({
            hasGitIgnore: true,
            hasDependencyFile: true,
            hasVirtualEnvironment: true,
            hasReadme: true,
            cacheFoldersFound: 999,
            largeFilesFound: 0
        });

        assert.strictEqual(score, 75);
    });

    test('caps large file penalty at 20 points', () => {
        const score = calculateHealthScore({
            hasGitIgnore: true,
            hasDependencyFile: true,
            hasVirtualEnvironment: true,
            hasReadme: true,
            cacheFoldersFound: 0,
            largeFilesFound: 999
        });

        assert.strictEqual(score, 80);
    });

    test('never returns below 0', () => {
        const score = calculateHealthScore({
            hasGitIgnore: false,
            hasDependencyFile: false,
            hasVirtualEnvironment: false,
            hasReadme: false,
            cacheFoldersFound: 999,
            largeFilesFound: 999
        });

        assert.strictEqual(score, 0);
    });
});