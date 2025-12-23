<?php
/**
 * Plugin Name: BNPP Table Legend Block
 * Description: A Gutenberg block to display a table with legend (without React)
 * Version: 1.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author: Your Name
 * Text Domain: bnpp-table-legend-block
 */

// Security: prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('BNPP_TABLE_LEGEND_BLOCK_VERSION', '1.0');
define('BNPP_TABLE_LEGEND_BLOCK_PATH', plugin_dir_path(__FILE__));
define('BNPP_TABLE_LEGEND_BLOCK_URL', plugin_dir_url(__FILE__));

// Load initialization file
require_once BNPP_TABLE_LEGEND_BLOCK_PATH . 'src/init.php';