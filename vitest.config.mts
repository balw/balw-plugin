import { defineConfig } from 'vitest/config';

export default defineConfig( {
	test: {
		environment: 'node',
		globals: false,
		restoreMocks: true,
		include: [ 'src/**/tests/**/*.test.ts' ],
	},
} );
