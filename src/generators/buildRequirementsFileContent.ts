/**
 * Builds starter `requirements.txt` content for a Python project.
 * 
 * @returns Text content for a minimal `requirements.txt` file.
 */
export function buildRequirementsFileContent(): string {
	const lines = [
		'# Add your Python dependencies here.',
		'# Example:',
		'# requests==2.32.3',
		''
	];

	return lines.join('\n');
}