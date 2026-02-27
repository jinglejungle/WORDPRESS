<?php
/**
 * Plugin Name: BNPP Carousel HomepagGZ
 * Description: A custom Gutenberg carousel block with 3 slides maximum
 * Version: 1.0.0
 * Author: Your Name
 * Text Domain: bnpp-carousel
 * Domain Path: /languages
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define plugin constants
define( 'BNPP_CAROUSEL_DIR', plugin_dir_path( __FILE__ ) );
define( 'BNPP_CAROUSEL_URL', plugin_dir_url( __FILE__ ) );
define( 'BNPP_CAROUSEL_VERSION', '1.0.0' );

// Include the initialization file
require_once BNPP_CAROUSEL_DIR . 'src/init.php';
