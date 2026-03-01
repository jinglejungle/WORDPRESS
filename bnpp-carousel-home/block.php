<?php
/**
 * Plugin Name: BNPP Carousel Homepage
 * Description: Un carousel accessible avec édition avancée pour WordPress
 * Version: 1.0.0
 * Author: BNPP
 * License: GPL v2 or later
 * Text Domain: bnpp-carousel-homepage
 * Domain Path: /languages
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Constantes
define( 'BNPP_CAROUSEL_VERSION', '1.0.0' );
define( 'BNPP_CAROUSEL_PATH', plugin_dir_path( __FILE__ ) );
define( 'BNPP_CAROUSEL_URL', plugin_dir_url( __FILE__ ) );

// Inclure le fichier d'initialisation
require_once BNPP_CAROUSEL_PATH . 'src/init.php';
