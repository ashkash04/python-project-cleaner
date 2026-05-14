import * as assert from 'assert';

import { extractImportsFromSource } from '../scanners/extractImportsFromSource';

suite('extractImportsFromSource', () => {
    test('extracts simple import statements', () => {
        const sourceCode = `
        import numpy
        import pandas as pd
        import cv2
        `;

        const imports = extractImportsFromSource(sourceCode);

        assert.deepStrictEqual(imports, ['cv2', 'numpy', 'pandas']);
    });

    test('extracts multiple imports from one line', () => {
        const sourceCode = `
        import os, sys, pathlib
        `;

        const imports = extractImportsFromSource(sourceCode);

        assert.deepStrictEqual(imports, ['os', 'pathlib', 'sys']);
    });

    test('extracts top-level modules from from-import statements', () => {
        const sourceCode = `
        from sklearn.model_selection import train_test_split
        from pathlib import Path
        `;

        const imports = extractImportsFromSource(sourceCode);

        assert.deepStrictEqual(imports, ['pathlib', 'sklearn']);
    });

    test('ignores comments', () => {
        const sourceCode = `
        # import fake_package
        import requests
        `;

        const imports = extractImportsFromSource(sourceCode);

        assert.deepStrictEqual(imports, ['requests']);
    });
});