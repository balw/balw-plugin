<?php
/**
 * Constructs the plugin and its dependencies.
 *
 * @package Balw\BalwPlugin
 */

declare(strict_types=1);

namespace Balw\BalwPlugin;

use Balw\BalwPlugin\Blocks\Registrar;

/**
 * Provides explicit dependency wiring without registering WordPress hooks.
 */
final class Bootstrap {

	/**
	 * Creates a plugin ready to be connected to WordPress.
	 *
	 * @param string $plugin_file Absolute path to the plugin entry file.
	 * @return Plugin
	 */
	public static function create( string $plugin_file ): Plugin {
		return new Plugin(
			new Registrar( dirname( $plugin_file ) ),
			new AssetLoader( $plugin_file )
		);
	}
}
