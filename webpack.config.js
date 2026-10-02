const path = require( 'path' );
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

module.exports = {
	...defaultConfig,
	entry: () => ( {
		...defaultConfig.entry(),
		'frontend/index': path.resolve( __dirname, 'src/frontend/index.ts' ),
	} ),
};
