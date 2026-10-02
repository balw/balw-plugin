<?php
/**
 * Registers the plugin's compiled block collection.
 *
 * @package Balw\BalwPlugin
 */

declare(strict_types=1);

namespace Balw\BalwPlugin\Blocks;

use Balw\BalwPlugin\Interfaces\RegistersHooks;

/**
 * Registers all blocks from the generated collection manifest.
 */
final class Registrar implements RegistersHooks {
	/**
	 * Absolute path to the plugin directory.
	 *
	 * @var string
	 */
	private string $plugin_dir;

	/**
	 * Sets the base directory used to locate compiled blocks.
	 *
	 * @param string $plugin_dir Absolute path to the plugin directory.
	 */
	public function __construct( string $plugin_dir ) {
		$this->plugin_dir = $plugin_dir;
	}

	/**
	 * Attaches block collection registration to WordPress initialization.
	 */
	public function register_hooks(): void {
		add_action( 'init', [ $this, 'register' ] );
	}

	/**
	 * Registers the collection when its compiled manifest is available.
	 */
	public function register(): void {
		$manifest = $this->plugin_dir . '/build/blocks-manifest.php';

		if ( ! is_readable( $manifest ) ) {
			return;
		}

		wp_register_block_types_from_metadata_collection(
			$this->plugin_dir . '/build/blocks',
			$manifest
		);
	}
}
