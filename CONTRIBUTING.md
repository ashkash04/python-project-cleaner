# Contributing

Thanks for your interest in contributing to Python Project Cleaner.

## Setup

Install dependencies:

```powershell
npm install
```

Compile the extension:

```powershell
npm run compile
```

Run tests:

```powershell
npm test
```

## Development

Open the project in VS Code and press `F5` to launch an Extension Development Host.

From there, open a Python project folder and run the extension commands from the Command Palette.

## Project Structure

```text
src/
├─ commands/
├─ fileSystem/
├─ generators/
├─ reports/
├─ scanners/
├─ test/
├─ utils/
├─ extension.ts
└─ types.ts
```

## Before Submitting a Pull Request

Please run:

```powershell
npm test
```

Also make sure:

- the extension compiles successfully
- linting passes
- new logic has tests when possible
- README or CHANGELOG updates are included when relevant

## Current Contribution Ideas

- Add more unit tests
- Improve health report formatting
- Improve README examples or screenshots
- Add more Python project checks
- Improve cross-platform path handling
- Improve error messages
- Add dependency/import analysis features

## Reporting Bugs

When reporting a bug, please include

- your operating system
- VS Code version
- Python Project Cleaner version
- steps to reproduce the issue
- screenshots or logs if helpful
