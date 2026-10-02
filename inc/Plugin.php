<?php
/**
 * Connects the plugin's services to WordPress.
 *
 * @package Balw\BalwPlugin
 */

declare(strict_types=1);

namespace Balw\BalwPlugin;

use Balw\BalwPlugin\Interfaces\RegistersHooks;

/**
 * Coordinates hook registration for an ordered collection of features.
 */
final class Plugin {

	/**
	 * Features in registration order.
	 *
	 * @var list<RegistersHooks>
	 */
	private array $features;

	/**
	 * Stores features without registering hooks or executing feature work.
	 *
	 * @param RegistersHooks ...$features Features in registration order.
	 */
	public function __construct( RegistersHooks ...$features ) {
		$this->features = array_values( $features );
	}

	/**
	 * Registers each feature's hooks in the supplied order.
	 */
	public function register_hooks(): void {
		foreach ( $this->features as $feature ) {
			$feature->register_hooks();
		}
	}
}
