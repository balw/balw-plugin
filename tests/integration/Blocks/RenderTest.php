<?php
/**
 * Tests the dynamic block with WordPress rendering APIs.
 *
 * @package Balw\BalwPlugin
 */

declare(strict_types=1);

namespace Balw\BalwPlugin\Tests\Integration\Blocks;

use WP_UnitTestCase;

/**
 * Tests block registration and rendering.
 */
final class RenderTest extends WP_UnitTestCase {

	/**
	 * Verifies that WordPress registers the block and sanitizes its output.
	 */
	public function test_plugin_registers_and_renders_block_safely(): void {
		$block = \WP_Block_Type_Registry::get_instance()->get_registered( 'balw-plugin/my-first-block' );

		$this->assertNotFalse( $block );

		$output = render_block(
			[
				'blockName'    => 'balw-plugin/my-first-block',
				'attrs'        => [ 'content' => '<strong>Safe</strong><script>alert(1)</script>' ],
				'innerBlocks'  => [],
				'innerHTML'    => '',
				'innerContent' => [],
			]
		);

		$this->assertStringContainsString( '<strong>Safe</strong>', $output );
		$this->assertStringNotContainsString( '<script>', $output );
	}
}
