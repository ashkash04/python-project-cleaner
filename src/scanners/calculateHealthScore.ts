/**
 * Calculates a simple MVP health score for a Python workspace.
 * 
 * The score starts at 100 and subtracts points for missing project hygiene
 * items such as `.gitignore`, dependency files, virtual environments, and
 * Python cache folders.
 * 
 * @param reportInput - Basic scan results used to calculate the score.
 * @returns A score between 0 and 100.
 */
export function calculateHealthScore(reportInput: {
	hasGitIgnore: boolean;
	hasDependencyFile: boolean;
	hasVirtualEnvironment: boolean;
	hasReadme: boolean;
	cacheFoldersFound: number;
	largeFilesFound: number;
}): number {
	let score = 100;

	if (!reportInput.hasGitIgnore) {
		score -= 25;
	}

	if (!reportInput.hasDependencyFile) {
		score -= 25;
	}

	if (!reportInput.hasVirtualEnvironment) {
		score -= 25;
	}

	if (!reportInput.hasReadme) {
		score -= 10;
	}

	if (reportInput.cacheFoldersFound > 0) {
		score -= Math.min(reportInput.cacheFoldersFound * 5, 25);
	}

	if (reportInput.largeFilesFound > 0) {
		score -= Math.min(reportInput.largeFilesFound * 5, 20);
	}

	return Math.max(score, 0);
}