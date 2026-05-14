import * as assert from 'assert';

import { parseRequirementsContent } from '../scanners/parse/RequirementsContent';

suite('parseRequirementsContent', () => {
    test('parses plain package names', () => {
        const content = `
        requests
        numpy
        pandas
        `;

        const dependencies = parseRequirementsContent(content);

        assert.deepStrictEqual(dependencies, ['requests', 'numpy', 'pandas']);
    });
    test('parses version-pinned dependencies', () => {
        const content = `
        requests==2.32.3
        numpy>=2.0.0
        pandas~=2.2
        scikit-learn<=1.5
        `;

        const dependencies = parseRequirementsContent(content);

        assert.deepStrictEqual(dependencies, ['requests', 'numpy', 'pandas', 'scikit-learn']);
    });
    
    test('ignores comments and blank lines', () => {
        const content = `
        # Main dependencies
        requests==2.32.3

        # Data
        pandas>=2.2
        `;

        const dependencies = parseRequirementsContent(content);

        assert.deepStrictEqual(dependencies, ['requests', 'pandas']);
    });
    
    test('ignores inline comments', () => {
        const content = `
        requests==2.32.3 # HTTP client
        numpy>=2.0.0 # arrays
        `;

        const dependencies = parseRequirementsContent(content);

        assert.deepStrictEqual(dependencies, ['requests', 'numpy']);
    });

        test('deduplicates dependencies', () => {
        const content = `
        requests
        requests==2.32.3
        `;

        const dependencies = parseRequirementsContent(content);

        assert.deepStrictEqual(dependencies, ['requests']);
    });
});