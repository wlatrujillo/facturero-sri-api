# Tests

This directory contains all test files for the facturero-sri-signer package.

## Structure

The test directory mirrors the `src/` structure:

```
test/
  xml-signer/
    impl/
      certificate.provider.impl.test.ts
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch
```

## Writing Tests

Tests use Node.js built-in `node:test` module. Example:

```typescript
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('MyClass', () => {
    it('should do something', () => {
        assert.strictEqual(1 + 1, 2);
    });
});
```

## Test Conventions

- Test files: `*.test.ts`
- Mirror the src structure in the test directory
- Use descriptive test names
- One test file per source file
