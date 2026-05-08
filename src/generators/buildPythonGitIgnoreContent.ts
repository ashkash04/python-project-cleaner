/**
 * Builds starter `.gitignore` content for a typical Python project.
 * 
 * @returns Text content for a Python-focused `.gitignore` file.
 */
export function buildPythonGitIgnoreContent(): string {
	const lines = [
		'# Python',
		'__pycache__/',
		'*.py[cod]',
		'',
		'# Virtual environments',
		'.venv/',
		'venv/',
		'env/',
		'',
		'# Environment variables',
		'.env',
		'.env.*',
		'',
		'# Build artifacts',
		'build/',
		'dist/',
		'*.egg-info/',
		'',
		'# Testing and coverage',
		'.pytest_cache/',
		'.coverage',
		'htmlcov/',
		'',
		'# Type checking',
		'.mypy_cache/',
		'.ruff_cache/',
		'',
		'# IDE',
		'.vscode/',
		''
	];

	return lines.join('\n');
}