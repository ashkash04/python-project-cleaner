/**
 * Parses package names from requirements.txt content.
 *
 * Handles common requirement formats such as:
 * - requests
 * - requests==2.32.2
 * - numpy>=2.0.0
 * - pandas~=2.2
 *
 * Comments and blank lines are ignored.
 *
 * @param content - Raw requirements.txt content.
 * @returns Parsed dependency package names.
 */
export function parseRequirementsContent(content: string): string[] {
	const dependencies = new Set<string>();
	const lines = content.split(/\r?\n/);

	for (const line of lines) {
		const trimmedLine = line.trim();

		if (trimmedLine.length === 0 || trimmedLine.startsWith('#')) {
			continue;
		}

		const withoutInlineComment = trimmedLine.split('#')[0].trim();

		if (withoutInlineComment.length === 0) {
			continue;
		}

		const packageNameMatch = withoutInlineComment.match(/^([A-Za-z0-9_.-]+)/);

		if (!packageNameMatch) {
			continue;
		}

		dependencies.add(packageNameMatch[1].toLowerCase());
	}

	return [...dependencies];
}