<?php
/**
 * Component entry file.
 *
 * This file is auto-loaded by the parent management plugin, which is
 * responsible for discovering and activating each component.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Constants.
define( 'BNPP_REBRAND_STATISTICS_BLOC_VERSION', '1.0.0' );
define( 'BNPP_REBRAND_STATISTICS_BLOC_PATH', plugin_dir_path( __FILE__ ) );
define( 'BNPP_REBRAND_STATISTICS_BLOC_URL', plugin_dir_url( __FILE__ ) );

// Include the initialization file.
require_once BNPP_REBRAND_STATISTICS_BLOC_PATH . 'src/init.php';
