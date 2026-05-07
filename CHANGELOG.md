# Changelog

All notable changes to the Python Project Cleaner extension will be documented in this file.

This project follows milestone-based versioning during early development.

## [Unreleased]

### Planned

- Split `extension.ts` into smaller command, scanner, report, and utility modules
- Add tests for core helper functions
- Improve package metadata before publishing
- Add screenshots or GIFs to the README
- Package and test the extension locally as a `.vsix`
- Add configurable scan settings

## [0.2.0]

### Added

- README.md detection in the health check
- Large file detection for files over 10 MB
- Large file selection in the Markdown health report
- Suggested Fixes section in the Markdown health report
- Safer deletion helper for cache cleanup
- Safer file writing helper for generated files
- Improved error handling for delete and file creation commands

### Changed

- Refactored workspace scanning into a dedicated helper function
- Improved health report structure with more project hygiene checks

## [0.1.0]

### Added

- Command to delete `__pycache__` folders
- Confirmation dialog before deleting cache folders
- Command to create a starter Python `.gitignore`
- Command to create a starter `requirements.txt`
- Safer recursive folder scanning
- Error handling for unreadable folders during cache scans
- Shared workspace root helper to reduce repeated command logic
- TSDoc comments for core helper functions

## [0.0.1]

### Added

- VS Code API scaffolding
- Python project health check command
- Markdown health report generation
- `.gitignore` detection
- Dependency file detection
- `__pycache__` folder detection
- Basic health score calculation
