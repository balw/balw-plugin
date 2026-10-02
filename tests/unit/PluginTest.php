<?php
/**
 * Tests plugin hook coordination without loading WordPress.
 *
 * @package Balw\BalwPlugin
 */

declare(strict_types=1);

namespace Balw\BalwPlugin\Tests\Unit;

use Balw\BalwPlugin\Plugin;
use Balw\BalwPlugin\Interfaces\RegistersHooks;
use PHPUnit\Framework\TestCase;

/**
 * Tests the plugin's hook registration coordinator.
 */
final class PluginTest extends TestCase {

	/**
	 * Verifies that registering a plugin registers each feature once.
	 */
	public function test_register_hooks_registers_each_feature(): void {
		$first  = $this->createMock( RegistersHooks::class );
		$second = $this->createMock( RegistersHooks::class );

		$first->expects( self::once() )->method( 'register_hooks' );
		$second->expects( self::once() )->method( 'register_hooks' );

		$plugin = new Plugin( $first, $second );
		$plugin->register_hooks();
	}
}
