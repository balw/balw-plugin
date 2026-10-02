<?php
/**
 * Defines the hook registration contract for plugin features.
 *
 * @package Balw\BalwPlugin
 */

declare(strict_types=1);

namespace Balw\BalwPlugin\Interfaces;

/**
 * Connects a feature to WordPress without executing its callbacks.
 */
interface RegistersHooks {

	/**
	 * Attaches the feature's callbacks to WordPress hooks.
	 */
	public function register_hooks(): void;
}
