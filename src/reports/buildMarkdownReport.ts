import { HealthReport } from "../types";
import { buildSuggestedFixes } from "./buildSuggestedFixes";


/**
 * Appends a Markdown subsection containing a list of items.
 * 
 * If the list is empty, the subsection displays a fallback message instead.
 * 
 * @param lines - Markdown lines being built for the report.
 * @param title - Subsection title to display.
 * @param items - Items to render as Markdown bullet points.
 */
function addListSection(lines: string[], title: string, items: string[]): void {
	lines.push('');
	lines.push(`### ${title}`);
	lines.push('');

	if (items.length === 0) {
		lines.push('None found.');
		return;
	}

	for (const item of items) {
		lines.push(`- ${item}`);
	}
}

/**
 * Build the Markdown content shown after running the health check command.
 * 
 * @param report - Health report data for the current workspace.
 * @returns Markdown content for the generated report document.
 */
export function buildMarkdownReport(report: HealthReport): string {
	const lines = [
		'# Python Project Health Report',
		'',
		`**Score:** ${report.score}/100`,
		`**Workspace:** ${report.workspaceRoot}`,
		'',
		'## Checks',
		'',
		`- ${report.hasGitIgnore ? '✅' : '❌'} .gitignore ${report.hasGitIgnore ? 'found': 'missing'}`,
		`- ${report.hasDependencyFile ? '✅' : '❌'} Dependency file ${report.hasDependencyFile ? 'found' : 'missing'}`,
		`- ${report.hasVirtualEnvironment ? '✅' : '❌'} Virtual environment ${report.hasVirtualEnvironment ? 'found' : 'missing'}`,
		`- ${report.hasReadme ? '✅' : '❌'} README.md ${report.hasReadme ? 'found' : 'missing'}`,
		`- ${report.cacheFoldersFound === 0 ? '✅' : '⚠️'} Python cache folders: ${report.cacheFoldersFound}`,
		`- ${report.largeFilesFound === 0 ? '✅' : '⚠️'} Large files: ${report.largeFilesFound}`,
		'',
		'## Warnings',
		''
	];

	if (report.warnings.length === 0) {
		lines.push('No warnings found.');
	} else {
		for (const warning of report.warnings) {
			lines.push(`- ${warning}`);
		}
	}

	if (report.largeFilePaths.length > 0) {
		lines.push('');
		lines.push('## Large Files');
		lines.push('');

		for (const largeFilePath of report.largeFilePaths) {
			lines.push(`- ${largeFilePath}`);
		}
	}

	const suggestedFixes = buildSuggestedFixes(report);

	if (suggestedFixes.length > 0) {
		lines.push('');
		lines.push('## Suggested Fixes');
		lines.push('');

		for (const fix of suggestedFixes) {
			lines.push(`- ${fix}`);
		}
	}

	lines.push('');
	lines.push('## Dependency Analysis');

	addListSection(lines, 'Imported Packages', report.dependencyAnalysis.importedPackages);
	addListSection(lines, 'Listed Dependencies', report.dependencyAnalysis.listedDependencies);
	addListSection(lines, 'Possible Missing Dependencies', report.dependencyAnalysis.possibleMissingDependencies);
	addListSection(lines, 'Possible Unused Dependencies', report.dependencyAnalysis.possibleUnusedDependencies);

	return lines.join('\n');
}