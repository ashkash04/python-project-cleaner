/***
 * Represents the found dependencies of a Python workspace.
 */
export type DependencyAnalysis = {
	importedPackages: string[];
	listedDependencies: string[];
	possibleMissingDependencies: string[];
	possibleUnusedDependencies: string[]
}


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
	dependencyAnalysis: DependencyAnalysis;
	warnings: string[];
};