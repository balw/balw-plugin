# Base WordPress Plugin

A reusable plugin base with TypeScript and the default `@wordpress/scripts`
build, linting, and formatting tools. Requires WordPress 7.0+, PHP 8.3+, and
Node.js 24.18.0 (npm is included with Node.js).

## Generating a plugin

Generate a new plugin directory from this skeleton using Node.js (no dependency
installation is needed in the skeleton):

```sh
npm run scaffold -- ../my-plugin
```

The script prompts for the plugin name, slug, PHP namespace, Composer package,
description, author details, and optional plugin/author URLs. The destination's
parent directory must already exist, and its folder name must match the slug.
Choose a new directory outside this skeleton.

The slug becomes the npm package name, text domain, block namespace, asset
prefix, and WordPress test path. The PHP namespace updates source, tests, and
Composer autoloading. Installed dependencies, build output, local caches, and
Git history are excluded from the generated plugin.

The PHP namespace defaults to `Vendor\` followed by the PascalCase plugin slug:
`my-plugin` becomes `Vendor\MyPlugin`. Replace `Vendor` with your own vendor
name as needed. The generated PHPCS configuration includes the selected
namespace and global prefix. Composer package names require `vendor/package`
format, independently of the PHP namespace.

For automated generation, use `--yes` with optional metadata overrides:

```sh
npm run scaffold -- ../my-plugin --yes \
  --name "My Plugin" --namespace 'Vendor\MyPlugin' \
  --package vendor/my-plugin --author "Your Name" --email dev@example.com
```

Use `npm run scaffold -- --help` to see all options. Omitted options with `--yes`
use defaults: the vendor-prefixed namespace, `vendor/<slug>` Composer package,
and placeholder author details.

Inside the generated directory, install dependencies and build:

```sh
npm ci
composer update --lock --no-install
composer install
npm run build
```

The Composer command refreshes lockfile metadata for the new package without
updating locked dependency versions. `composer install` generates the renamed
namespace's autoload files.

Run the scaffolding script's tests with `npm run test:scaffold`.

## Getting started

```sh
nvm install
nvm use
npm ci
composer install
npm run build
```

## VS code extensions

https://marketplace.visualstudio.com/items?itemName=bmewburn.vscode-intelephense-client

## PHP checks

Run PHP coding-standard and compatibility checks, or PHPStan static analysis:

```sh
composer lint
composer run phpstan
```

Run both checks together with the PHP unit tests:

```sh
composer check
```

## JavaScript unit tests

Vitest unit tests live in a `tests` directory alongside the component they
cover. The example for `my-first-block` is in
`src/blocks/my-first-block/tests/block-metadata.test.ts`.

Run the Vitest suite once or in watch mode with:

```sh
npm run test:js
npm run test:js:watch
```

## End-to-end tests

The Playwright E2E suite uses the WordPress Playwright configuration and fixtures
from `@wordpress/e2e-test-utils-playwright`. Docker is required to run the
test-only WordPress environment at `http://localhost:8890`. The same environment
provides WordPress's PHPUnit test files for integration tests.

Build the plugin assets before testing, then run:

```sh
npm run build
npm run test:e2e
```

`wp-scripts test-playwright` installs the Playwright browsers automatically when
needed. To install Chromium explicitly, run `npx playwright install chromium`.
The test runner starts the environment using `npm run env:start` and
uses `http://localhost:8890` as its base URL. Set `E2E_BASE_URL` to test an
already-running external environment instead of starting local wp-env.
Browser traces, screenshots, and authentication state are written under the
ignored `artifacts/` directory.

For interactive debugging, run:

```sh
npm run test:e2e:ui
```

Stop the environment when finished with `npm run env:stop`.
