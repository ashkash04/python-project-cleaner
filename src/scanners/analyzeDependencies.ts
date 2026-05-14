import { DependencyAnalysis } from '../types';

const STANDARD_LIBRARY_MODULES = new Set<string>([
	'abc',
	'argparse',
	'array',
	'asyncio',
	'base64',
	'bisect',
	'builtins',
	'calendar',
	'cmath',
	'collections',
	'concurrent',
	'contextlib',
	'copy',
	'csv',
	'dataclasses',
	'datetime',
	'decimal',
	'email',
	'enum',
	'functools',
	'glob',
	'gzip',
	'hashlib',
	'heapq',
	'html',
	'http',
	'importlib',
	'inspect',
	'io',
	'itertools',
	'json',
	'logging',
	'math',
	'multiprocessing',
	'os',
	'pathlib',
	'pickle',
	'platform',
	'pprint',
	'queue',
	'random',
	're',
	'shlex',
	'shutil',
	'signal',
	'socket',
	'sqlite3',
	'statistics',
	'string',
	'subprocess',
	'sys',
	'tempfile',
	'threading',
	'time',
	'timeit',
	'tkinter',
	'traceback',
	'typing',
	'unittest',
	'urllib',
	'uuid',
	'venv',
	'warnings',
	'xml',
	'zipfile',
]);

const IMPORT_TO_PACKAGE_NAMES: Record<string, string[]> = {
	bs4: ['beautifulsoup4'],
	cv2: [
		'opencv-python',
		'opencv-contrib-python',
		'opencv-python-headless',
		'opencv-contrib-python-headless',
	],
	dateutil: ['python-dateutil'],
	dotenv: ['python-dotenv'],
	jose: ['python-jose'],
	jwt: ['pyjwt'],
	magic: ['python-magic'],
	mysqldb: ['mysqlclient'],
	pil: ['pillow'],
	psycopg2: ['psycopg2', 'psycopg2-binary'],
	serial: ['pyserial'],
	sklearn: ['scikit-learn'],
	skimage: ['scikit-image'],
	socks: ['pysocks'],
	yaml: ['pyyaml'],

	corsheaders: ['django-cors-headers'],
	debug_toolbar: ['django-debug-toolbar'],
	django_filters: ['django-filter'],
	rest_framework: ['djangorestframework'],

	sentence_transformers: ['sentence-transformers'],
	tensorflow_datasets: ['tensorflow-datasets'],
	tensorflow_hub: ['tensorflow-hub'],
	torch_geometric: ['torch-geometric'],

	crypto: ['pycryptodome'],
	cryptodome: ['pycryptodomex'],

	ruamel: ['ruamel.yaml'],
};

/**
 * Gets possible dependency package names for an imported Python module.
 *
 * Some Python import names do not match their package names in requirements.txt.
 * For example, `import cv2` usually comes from `opencv-python`.
 *
 * @param importedPackage - Top-level imported module name.
 * @returns Possible package names that could provide the import.
 */
function getPossibleDependencyNames(importedPackage: string): string[] {
	const normalizedImportName = importedPackage.toLowerCase();

	return IMPORT_TO_PACKAGE_NAMES[normalizedImportName] ?? [normalizedImportName];
}

/**
 * Normalizes dependency names for comparison.
 *
 * @param dependencyName - Dependency name from requirements.txt or mapping table.
 * @returns Lowercase dependency name.
 */
function normalizeDependencyName(dependencyName: string): string {
	return dependencyName.toLowerCase();
}

/**
 * Removes standard library imports from a list of imported Python packages.
 *
 * @param importedPackages - Top-level imported module names.
 * @returns Imported package names that are likely third-party dependencies.
 */
function getThirdPartyImports(importedPackages: string[], ignoredImports: string[] = []): string[] {
	const ignoredImportSet = new Set(ignoredImports.map((importName) => importName.toLowerCase()));

	const thirdPartyImports = importedPackages
		.map((importedPackage) => importedPackage.toLowerCase())
		.filter((importedPackage) => !STANDARD_LIBRARY_MODULES.has(importedPackage))
		.filter((importedPackages) => !ignoredImportSet.has(importedPackages));

	return [...new Set(thirdPartyImports)].sort();
}

/**
 * Finds possible missing dependencies.
 *
 * A dependency is considered possibly missing when none of the possible package
 * names for an import appear in requirements.txt.
 *
 * @param thirdPartyImports - Imported package names after standard library filtering.
 * @param listedDependencySet - Dependencies listed in requirements.txt.
 * @returns Possible missing dependency package names.
 */
function findPossibleMissingDependencies(
	thirdPartyImports: string[],
	listedDependencySet: Set<string>,
): string[] {
	const possibleMissingDependencies: string[] = [];

	for (const importedPackage of thirdPartyImports) {
		const possibleDependencyNames = getPossibleDependencyNames(importedPackage);

		const hasMatchingListedDependency = possibleDependencyNames.some((dependencyName) => {
			return listedDependencySet.has(normalizeDependencyName(dependencyName));
		});

		if (!hasMatchingListedDependency) {
			possibleMissingDependencies.push(normalizeDependencyName(possibleDependencyNames[0]));
		}
	}

	return possibleMissingDependencies.sort();
}

/**
 * Finds dependencies that appear to be used by imported packages.
 *
 * @param thirdPartyImports - Imported package names after standard library filtering.
 * @param listedDependencySet - Dependencies listed in requirements.txt.
 * @returns Listed dependencies that appear to match imports.
 */
function findUsedListedDependencies(
	thirdPartyImports: string[],
	listedDependencySet: Set<string>,
): Set<string> {
	const usedListedDependencies = new Set<string>();

	for (const importedPackage of thirdPartyImports) {
		const possibleDependencyNames = getPossibleDependencyNames(importedPackage);

		for (const dependencyName of possibleDependencyNames) {
			const normalizedDependencyName = normalizeDependencyName(dependencyName);

			if (listedDependencySet.has(normalizedDependencyName)) {
				usedListedDependencies.add(normalizedDependencyName);
			}
		}
	}

	return usedListedDependencies;
}

/**
 * Finds possible unused dependencies.
 *
 * A dependency is considered possibly unused when it is listed in requirements.txt
 * but does not appear to match any imported top-level package.
 *
 * @param listedDependencies - Dependencies listed in requirements.txt.
 * @param usedListedDependencies - Listed dependencies that appear to be used.
 * @returns Possible unused dependency package names.
 */
function findPossibleUnusedDependencies(
	listedDependencies: string[],
	usedListedDependencies: Set<string>,
): string[] {
	return listedDependencies
		.filter((dependency) => !usedListedDependencies.has(dependency))
		.sort();
}

/**
 * Compares imported Python modules against listed requirements.txt dependencies.
 *
 * The result is intentionally described as "possible" missing/unused dependencies
 * because static dependency analysis can produce false positives.
 *
 * @param importedPackages - Top-level module names imported by Python files.
 * @param listedDependencies - Package names listed in requirements.txt.
 * @returns Dependency analysis result.
 */
export function analyzeDependencies(
	importedPackages: string[],
	listedDependencies: string[],
	ignoredImports: string[] = [],
): DependencyAnalysis {
	const normalizedListedDependencies = [...new Set(
		listedDependencies.map((dependency) => normalizeDependencyName(dependency)),
	)].sort();

	const listedDependencySet = new Set(normalizedListedDependencies);
	const thirdPartyImports = getThirdPartyImports(importedPackages, ignoredImports);

	const possibleMissingDependencies = findPossibleMissingDependencies(
		thirdPartyImports,
		listedDependencySet,
	);

	const usedListedDependencies = findUsedListedDependencies(
		thirdPartyImports,
		listedDependencySet,
	);

	const possibleUnusedDependencies = findPossibleUnusedDependencies(
		normalizedListedDependencies,
		usedListedDependencies,
	);

	return {
		importedPackages: thirdPartyImports,
		listedDependencies: normalizedListedDependencies,
		possibleMissingDependencies: possibleMissingDependencies,
		possibleUnusedDependencies: possibleUnusedDependencies,
	};
}