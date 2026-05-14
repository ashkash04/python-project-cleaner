import * as assert from 'assert';

import { analyzeDependencies } from '../scanners/analyzeDependencies';

suite('analyzeDependencies', () => {
	test('returns no missing or unused dependencies when imports match requirements', () => {
		const analysis = analyzeDependencies(
			['numpy', 'pandas', 'requests'],
			['numpy', 'pandas', 'requests'],
		);

		assert.deepStrictEqual(analysis.possibleMissingDependencies, []);
		assert.deepStrictEqual(analysis.possibleUnusedDependencies, []);
	});

	test('detects possible missing dependencies', () => {
		const analysis = analyzeDependencies(
			['numpy', 'pandas', 'requests'],
			['numpy', 'pandas'],
		);

		assert.deepStrictEqual(analysis.possibleMissingDependencies, ['requests']);
	});

	test('detects possible unused dependencies', () => {
		const analysis = analyzeDependencies(
			['numpy'],
			['numpy', 'requests'],
		);

		assert.deepStrictEqual(analysis.possibleUnusedDependencies, ['requests']);
	});

	test('ignores common standard library imports', () => {
		const analysis = analyzeDependencies(
			['os', 'sys', 'pathlib', 'json', 'requests'],
			['requests'],
		);

		assert.deepStrictEqual(analysis.importedPackages, ['requests']);
		assert.deepStrictEqual(analysis.possibleMissingDependencies, []);
		assert.deepStrictEqual(analysis.possibleUnusedDependencies, []);
	});

	test('maps common import names to package names', () => {
		const analysis = analyzeDependencies(
			['cv2', 'PIL', 'sklearn', 'yaml', 'dotenv', 'bs4'],
			['opencv-python', 'pillow', 'scikit-learn', 'pyyaml', 'python-dotenv', 'beautifulsoup4'],
		);

		assert.deepStrictEqual(analysis.possibleMissingDependencies, []);
		assert.deepStrictEqual(analysis.possibleUnusedDependencies, []);
	});

	test('accepts alternate package names for the same import', () => {
		const analysis = analyzeDependencies(
			['cv2', 'psycopg2'],
			['opencv-contrib-python', 'psycopg2-binary'],
		);

		assert.deepStrictEqual(analysis.possibleMissingDependencies, []);
		assert.deepStrictEqual(analysis.possibleUnusedDependencies, []);
	});

	test('reports mapped default package name when dependency is missing', () => {
		const analysis = analyzeDependencies(
			['cv2', 'PIL', 'sklearn'],
			[],
		);

		assert.deepStrictEqual(analysis.possibleMissingDependencies, [
			'opencv-python',
			'pillow',
			'scikit-learn',
		]);
	});

	test('normalizes listed dependency casing', () => {
		const analysis = analyzeDependencies(
			['yaml'],
			['PyYAML'],
		);

		assert.deepStrictEqual(analysis.listedDependencies, ['pyyaml']);
		assert.deepStrictEqual(analysis.possibleMissingDependencies, []);
		assert.deepStrictEqual(analysis.possibleUnusedDependencies, []);
	});
});