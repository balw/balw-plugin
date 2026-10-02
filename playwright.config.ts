import { defineConfig } from '@playwright/test';

const externalBaseURL = process.env.E2E_BASE_URL;
const baseURL = externalBaseURL || 'http://localhost:8890';

// The WordPress utilities read this directly and the scripts wrapper otherwise
// derives it from the default, non-test wp-env configuration.
process.env.WP_BASE_URL = baseURL;

const wordpressConfig = require( '@wordpress/scripts/config/playwright.config.js' );

export default defineConfig( {
	...wordpressConfig,
	testDir: './tests/e2e',
	webServer: externalBaseURL
		? undefined
		: {
				command: 'npm run env:start',
				url: baseURL,
				timeout: 120_000,
				reuseExistingServer: true,
			},
	use: {
		...wordpressConfig.use,
		baseURL,
	},
} );
