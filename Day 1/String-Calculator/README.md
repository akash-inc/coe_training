# String Calculator

This repository contains a simple String Calculator implemented in TypeScript. It provides functionality to perform basic string-based calculations, making it easy to add, subtract, multiply, and divide numbers represented as strings.

## Test-Driven Development (TDD)

The project follows TDD principles, ensuring that tests are written before the actual code implementation. This helps in maintaining high code quality and reducing bugs.

## Testing Workflow

The testing framework used in this project is Jest, which is configured to work with TypeScript using `ts-jest`. The tests are run using the command:

```sh
npm test
```

The `package.json` includes the following dependencies for testing:
- `jest`
- `@types/jest`
- `ts-jest`
- `typescript`

## Continuous Integration

The repository uses GitHub Actions for continuous integration. The workflow files located in the `.github/workflows` directory define the steps for running tests on each push and pull request.
