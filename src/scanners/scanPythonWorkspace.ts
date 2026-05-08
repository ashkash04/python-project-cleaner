import * as fs from 'fs';
import * as path from 'path';

import { HealthReport } from '../types';
import { findCacheFolders } from './findCacheFolders';
import { findLargeFiles } from './findLargeFiles';
import { getLargeFileThresholdBytes } from '../utils/settings';
import { calculateHealthScore } from './calculateHealthScore';


/**
 * Scans a Python workspace and builds a health report.
 * 
 * @param workspaceRoot - Absolute path of the workspace to scan.
 * @returns Health report for the workspace.
 */
export function scanPythonWorkspace(workspaceRoot: string): HealthReport {
    const gitignorePath = path.join(workspaceRoot, '.gitignore');
    const hasGitIgnore = fs.existsSync(gitignorePath);

    const requirementsPath = path.join(workspaceRoot, 'requirements.txt');
    const hasRequirementsFile = fs.existsSync(requirementsPath);

    const pyProjectPath = path.join(workspaceRoot, 'pyproject.toml');
    const hasPyProjectFile = fs.existsSync(pyProjectPath);
    const hasDependencyFile = hasRequirementsFile || hasPyProjectFile;

    const virtualEnvironmentNames = ['.venv', 'venv', 'env'];
    const hasVirtualEnvironment = virtualEnvironmentNames.some((folderName) => {
        const folderPath = path.join(workspaceRoot, folderName);
        return fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory();
    });

    const readmePath = path.join(workspaceRoot, 'README.md');
    const hasReadme = fs.existsSync(readmePath);

    const cacheFolderPaths = findCacheFolders(workspaceRoot);
    const cacheFoldersFound = cacheFolderPaths.length;

    const largeFileLimitBytes = getLargeFileThresholdBytes();
    const largeFilePaths = findLargeFiles(workspaceRoot, largeFileLimitBytes);
    const largeFilesFound = largeFilePaths.length;
    const largeFileLimitMiB = largeFileLimitBytes / (1024 * 1024);

    const score = calculateHealthScore({
        hasGitIgnore: hasGitIgnore,
        hasDependencyFile: hasDependencyFile,
        hasVirtualEnvironment: hasVirtualEnvironment,
        hasReadme: hasReadme,
        cacheFoldersFound: cacheFoldersFound,
        largeFilesFound: largeFilesFound
    });

    return {
        score: score,
        workspaceRoot: workspaceRoot,
        cacheFoldersFound: cacheFoldersFound,
        hasGitIgnore: hasGitIgnore,
        hasDependencyFile: hasDependencyFile,
        hasVirtualEnvironment: hasVirtualEnvironment,
        hasReadme: hasReadme,
        largeFilesFound: largeFilesFound,
        largeFilePaths: largeFilePaths,
        warnings: [
            ...(!hasGitIgnore ? ['No .gitignore file found.'] : []),
            ...(!hasDependencyFile ? ['No requirements.txt or pyproject.toml file found.'] : []),
            ...(!hasVirtualEnvironment ? ['No virtual environment folder found.'] : []),
            ...(!hasReadme ? ['No README.md file found.'] : []),
            ...(cacheFoldersFound > 0 ? [`${cacheFoldersFound} Python cache folder(s) found.`] : []),
            ...(largeFilesFound > 0 ? [`${largeFilesFound} large file(s) found at or above ${largeFileLimitMiB} MiB.`] : [])
        ]
    };
}