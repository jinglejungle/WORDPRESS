<?php
/**
 * Block registration and management
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Register block scripts and styles
 */
function bnpp_carousel_register_block_assets() {
    
    // Editor scripts
    wp_register_script(
        'bnpp-carousel-editor',
        BNPP_CAROUSEL_URL . 'assets/block.js',
        array( 'wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-data' ),
        BNPP_CAROUSEL_VERSION,
        true
    );

    // Editor styles
    wp_register_style(
        'bnpp-carousel-editor-style',
        BNPP_CAROUSEL_URL . 'assets/block.css',
        array( 'wp-edit-blocks' ),
        BNPP_CAROUSEL_VERSION
    );

    // Frontend styles
    wp_register_style(
        'bnpp-carousel-frontend-style',
        BNPP_CAROUSEL_URL . 'assets/block.css',
        array(),
        BNPP_CAROUSEL_VERSION
    );

    // Frontend scripts
    wp_register_script(
        'bnpp-carousel-frontend',
        BNPP_CAROUSEL_URL . 'assets/block.js',
        array(),
        BNPP_CAROUSEL_VERSION,
        true
    );
}
add_action( 'init', 'bnpp_carousel_register_block_assets' );

/**
 * Register the Gutenberg block
 */
function bnpp_carousel_register_block() {
    
    register_block_type(
        'bnpp/carousel-homepage',
        array(
            'editor_script'   => 'bnpp-carousel-editor',
            'editor_style'    => 'bnpp-carousel-editor-style',
            'style'           => 'bnpp-carousel-frontend-style',
            'script'          => 'bnpp-carousel-frontend',
            'attributes'      => array(
                'slides' => array(
                    'type' => 'array',
                    'default' => array(
                        array(
                            'title'       => 'Discover our services',
                            'description' => 'Quality services tailored to your needs',
                            'background'  => '',
                            'link'        => array(
                                'text'  => 'Learn more',
                                'url'   => '#',
                                'class' => 'primary',
                            ),
                        ),
                        array(
                            'title'       => 'Solutions for your needs',
                            'description' => 'Find the perfect solution for your business',
                            'background'  => '',
                            'link'        => array(
                                'text'  => 'View solutions',
                                'url'   => '#',
                                'class' => 'primary',
                            ),
                        ),
                        array(
                            'title'       => 'Contact our team',
                            'description' => 'We are here to answer your questions',
                            'background'  => '',
                            'link'        => array(
                                'text'  => 'Contact us',
                                'url'   => '#',
                                'class' => 'primary',
                            ),
                        ),
                    ),
                ),
                'autoplaySpeed' => array(
                    'type'    => 'number',
                    'default' => 4,
                ),
            ),
        )
    );
}
add_action( 'init', 'bnpp_carousel_register_block' );
