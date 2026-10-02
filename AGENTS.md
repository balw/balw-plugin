# AGENTS.md

This is a skeleton WordPress plugin. Its purpose is to provide a configured starting
point so an engineer can quickly begin developing a plugin.

Keep examples small and simple. We do NOT need perfect test coverage. Prefer one
clear unit-test example and one clear WordPress integration-test example over
extensive coverage or custom test infrastructure.

PHPCompatibility packages are intentionally pinned to alpha releases for modern
PHP checks; stable releases do not yet provide the equivalent rulesets. Keep
prerelease allowances scoped to these packages, including Paragonie support.

## Commands

### JavaScript, TypeScript, and styles

| Command                 | Purpose                                                                       |
| ----------------------- | ----------------------------------------------------------------------------- |
| `npm start`             | Watch source and compile development assets.                                  |
| `npm run typecheck`     | Check plugin TypeScript without emitting files.                               |
| `npm run typecheck:tests` | Check colocated JavaScript unit tests without emitting files.                 |
| `npm run typecheck:e2e` | Check E2E tests and Playwright configuration without emitting files.          |
| `npm run build`         | Check TypeScript and compile production assets into `build/`.                 |
| `npm run lint:js`       | Lint plugin JavaScript/TypeScript source; warnings fail.                      |
| `npm run lint:tests`    | Lint Vitest tests and their configuration; warnings fail.                     |
| `npm run lint:e2e`      | Lint E2E tests and Playwright configuration; warnings fail.                   |
| `npm run lint:css`      | Lint source SCSS; warnings fail.                                              |
| `npm run format`        | Format source, E2E tests, and Playwright configuration using WordPress defaults. |
| `npm run check`         | Run JavaScript checks, Vitest tests, and the production build.                |

### PHP and tests

| Command                    | Purpose                                                         |
| -------------------------- | --------------------------------------------------------------- |
| `composer lint`            | Check PHP coding standards and compatibility.                   |
| `composer lint:fix`        | Automatically fix supported PHP coding-standard violations.     |
| `composer run phpstan`     | Run PHP static analysis.                                        |
| `composer test:unit`       | Run the local PHPUnit unit suite.                               |
| `npm run test:js`          | Run colocated Vitest unit tests once.                             |
| `npm run test:js:watch`    | Run colocated Vitest unit tests in watch mode.                    |
| `composer check`           | Run PHP linting, static analysis, and unit tests.               |
| `npm run test:integration` | Run WordPress integration tests in the wp-env test environment. |
| `npm run test:e2e`         | Run Playwright tests against the dedicated WordPress test environment. |
| `npm run test:e2e:ui`      | Run Playwright in interactive UI mode.                            |
