<?php
/**
 * Plugin Name:       Campaign Block
 * Description:       A custom Gutenberg block to display a campaign with title, description, and image.
 * Author:            BNPP
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Load the block registration logic.
 */
require_once plugin_dir_path( __FILE__ ) . 'src/init.php';
