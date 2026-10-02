<?php
/**
 * Boots WordPress and the plugin for integration tests.
 *
 * @package Balw\BalwPlugin
 */

declare(strict_types=1);

require_once dirname( __DIR__, 2 ) . '/vendor/autoload.php';

$balw_wp_tests_dir = getenv( 'WP_TESTS_DIR' );

if ( $balw_wp_tests_dir === false || ! is_readable( $balw_wp_tests_dir . '/includes/functions.php' ) ) {
	throw new RuntimeException( 'WP_TESTS_DIR must point to the WordPress PHPUnit test suite. Run this suite inside the wp-env test container.' );
}

if ( ! defined( 'WP_TESTS_PHPUNIT_POLYFILLS_PATH' ) ) {
	// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedConstantFound -- Required by the WordPress PHPUnit bootstrap.
	define( 'WP_TESTS_PHPUNIT_POLYFILLS_PATH', dirname( __DIR__, 2 ) . '/vendor/yoast/phpunit-polyfills' );
}

require_once $balw_wp_tests_dir . '/includes/functions.php';

tests_add_filter(
	'muplugins_loaded',
	static function (): void {
		require_once dirname( __DIR__, 2 ) . '/plugin.php';
	}
);

require $balw_wp_tests_dir . '/includes/bootstrap.php';
