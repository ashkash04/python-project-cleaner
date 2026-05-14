import { HealthReport } from "../types";


/**
 * Build suggested actions based on health report warnings.
 * 
 * @param report - Health report data for the current workspace.
 * @returns Suggested fixes for detected project issues.
 */
export function buildSuggestedFixes(report: HealthReport): string[] {
    const fixes: string[] = [];

    if (!report.hasGitIgnore) {
        fixes.push('Run `Python Project Cleaner: Create Python .gitignore`.');
    }

    if (!report.hasDependencyFile) {
        fixes.push('Run `Python Project Cleaner: Create requirements.txt`.');
    }

    if (!report.hasVirtualEnvironment) {
        fixes.push('Create a virtual environment with `python -m venv .venv`.');
    }

    if (!report.hasReadme) {
        fixes.push('Add a `README.md` file describing the project.');
    }

    if (report.cacheFoldersFound > 0) {
        fixes.push('Run `Python Project Cleaner: Delete __pycache__ Folders`.');
    }

    if (report.largeFilesFound > 0) {
        fixes.push('Consider moving large files out of the repository or using Git LFS.');
    }

    if (report.dependencyAnalysis.possibleMissingDependencies.length > 0) {
        fixes.push('Review possible missing dependencies and add them to `requirements.txt` if needed.');
    }

    if (report.dependencyAnalysis.possibleUnusedDependencies.length > 0) {
        fixes.push('Review possible unused dependencies before removing them from `requirements.txt`.');
    }

    return fixes;
}
