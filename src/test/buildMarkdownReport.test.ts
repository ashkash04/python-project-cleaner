import * as assert from 'assert';

import { buildMarkdownReport } from '../reports/buildMarkdownReport';
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
		...overrides,
	};
}

suite('buildMarkdownReport', () => {
	test('includes score and workspace path', () => {
		const report = createReport();

		const markdown = buildMarkdownReport(report);

		assert.ok(markdown.includes('# Python Project Health Report'));
		assert.ok(markdown.includes('**Score:** 100/100'));
		assert.ok(markdown.includes('**Workspace:** C:\\test-project'));
	});

	test('includes warning section when warnings exist', () => {
		const report = createReport({
			warnings: ['No .gitignore file found.'],
		});

		const markdown = buildMarkdownReport(report);

		assert.ok(markdown.includes('## Warnings'));
		assert.ok(markdown.includes('- No .gitignore file found.'));
	});

	test('shows no warnings message when warning list is empty', () => {
		const report = createReport();

		const markdown = buildMarkdownReport(report);

		assert.ok(markdown.includes('No warnings found.'));
	});

	test('includes large files section when large files exist', () => {
		const report = createReport({
			largeFilesFound: 1,
			largeFilePaths: ['C:\\test-project\\large-file.bin'],
			warnings: ['1 large file(s) found.'],
		});

		const markdown = buildMarkdownReport(report);

		assert.ok(markdown.includes('## Large Files'));
		assert.ok(markdown.includes('- C:\\test-project\\large-file.bin'));
	});

	test('includes suggested fixes when issues exist', () => {
		const report = createReport({
			hasGitIgnore: false,
			warnings: ['No .gitignore file found.'],
		});

		const markdown = buildMarkdownReport(report);

		assert.ok(markdown.includes('## Suggested Fixes'));
		assert.ok(markdown.includes('Create Python .gitignore'));
	});
});