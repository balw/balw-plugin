<?php
/**
 * Renders the block's editable text on the frontend.
 *
 * @package Balw\BalwPlugin
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Block attributes supplied by WordPress.
 *
 * @var array{content?: string} $attributes
 */
$text = $attributes['content'] ?? '';

if ( ! is_string( $text ) ) {
	$text = '';
}

?>
<p <?php echo get_block_wrapper_attributes(); ?>><?php echo wp_kses_post( $text ); ?></p>
