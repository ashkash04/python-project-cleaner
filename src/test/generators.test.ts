import * as assert from 'assert';

import { buildPythonGitIgnoreContent } from '../generators/buildPythonGitIgnoreContent';
import { buildRequirementsFileContent } from '../generators/buildRequirementsFileContent';

suite('generators', () => {
	test('buildPythonGitIgnoreContent includes common Python ignore patterns', () => {
		const content = buildPythonGitIgnoreContent();

		assert.ok(content.includes('__pycache__/'));
		assert.ok(content.includes('*.py[cod]'));
		assert.ok(content.includes('.venv/'));
		assert.ok(content.includes('.env'));
		assert.ok(content.includes('.pytest_cache/'));
	});

	test('buildRequirementsFileContent includes a dependency example', () => {
		const content = buildRequirementsFileContent();

		assert.ok(content.includes('# Add your Python dependencies here.'));
		assert.ok(content.includes('# requests==2.32.3'));
	});
});