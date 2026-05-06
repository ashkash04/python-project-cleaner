# Python Project Cleaner

Python Project Cleaner is a VS Code extension that scans a Python workspace and generates a simple project health report.

This extension is currently an MVP and is not published yet. It focuses on detecting common Python project hygiene issues such as missing dependency files, missing virtual environments, and Python cache folders.

## Features

### Run Python Project Health Check

The extension adds a command:

```text
Python Project Cleaner: Run Health Check
```

The health check scans the currently opened workspace and reports:

- Whether a `.gitignore` file exists
- Whether a Python dependency file exists:
    - `requirements.txt`
    - `pyproject.toml`
- Whether a virtual environment folder exists:
    - `.venv`
    - `venv`
    - `env`
- How many `__pycache__` folders were found
- A calculated project health score
- A list of warnings

The report opens as a Markdown document inside VS Code.

## Example Report

```md
# Python Project Health Report

**Score:** 75/100
**Workspace:** C:\Users\example\Desktop\my-python-project

## Checks

- ✅ .gitignore found
- ✅ Dependency file found
- ❌ Virtual environment missing
- ⚠️ Python cache folders: 2

## Warnings

- No virtual environment folder found.
- 2 Python cache folder(s) found.
```

## Requirements

This extension does not require any external dependencies to use.

It works on Python project folders opened in VS Code.

## Extension Settings

This extension does not currently contribute any VS Code settings.

## Known Issues

- The extension currently scans folders synchronously.
- Very large projects may take longer to scan.
- The health score is based on a simple MVP scoring system.
- The extension currently reports `__pycache__` folders but does not delete them yet.

## Roadmap

Planned features include:

- Delete `__pycache__` folders from the workspace
- Improve error handling for unreadable folders
- Add project cleanup commands
- Detect additional Python project issues
- Improve the health scoring system

## Release Notes

### 0.0.1

Initial MVP release.

Added:

- Python project health check command
- Markdown health report generation
- `.gitignore` detection
- Dependency file detection
- Virtual environment detection
- `__pycache__` folder detection
- Basic health score calculation