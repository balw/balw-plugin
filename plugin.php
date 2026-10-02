<?php
/**
 * Plugin Name:       Base Plugin
 * Plugin URI:        https://github.com/balw/base-plugin
 * Description:       A base setup for WordPress plugins
 * Version:           0.0.1
 * Requires at least: 7.0
 * Requires PHP:      8.3
 * Author:            Ben Wells
 * Author URI:        https://github.com/balw
 * License:           GPL-2.0-or-later
 * License URI:       https://spdx.org/licenses/GPL-2.0-or-later.html
 * Text Domain:       balw-plugin
 *
 * @package           Balw\BalwPlugin
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/vendor/autoload.php';

\Balw\BalwPlugin\Bootstrap::create( __FILE__ )->register_hooks();
