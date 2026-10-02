const wordpressConfig = require( '@wordpress/scripts/config/eslint.config.cjs' );

module.exports = [
	...wordpressConfig.map( ( config ) =>
		config.plugins?.vitest
			? { ...config, files: [ 'src/**/tests/**/*.test.ts' ] }
			: config
	),
];
