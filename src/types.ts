/**
 * Represents the result of scanning a Python workspace.
 */
export type HealthReport = {
	score: number;
	workspaceRoot: string;
	cacheFoldersFound: number;
	largeFilesFound: number;
	largeFilePaths: string[];
	hasGitIgnore: boolean;
	hasDependencyFile: boolean;
	hasVirtualEnvironment: boolean;
	hasReadme: boolean;
	warnings: string[];
};