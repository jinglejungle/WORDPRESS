<?php
/**
 * Plugin Name: BNPP Carousel Homepage
 * Description: An accessible carousel with advanced editing capabilities for WordPress
 * Version: 1.0.0
 * Author: BNPP
 * License: GPL v2 or later
 * Text Domain: bnpp-carousel-homepage
 * Domain Path: /languages
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Constants
define( 'BNPP_CAROUSEL_VERSION', '1.0.0' );
define( 'BNPP_CAROUSEL_PATH', plugin_dir_path( __FILE__ ) );
define( 'BNPP_CAROUSEL_URL', plugin_dir_url( __FILE__ ) );

// Load the initialization file
require_once BNPP_CAROUSEL_PATH . 'src/init.php';
