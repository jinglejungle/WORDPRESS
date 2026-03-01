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
                    'items' => array(
                        'type' => 'object',
                        'properties' => array(
                            'title' => array( 'type' => 'string' ),
                            'description' => array( 'type' => 'string' ),
                            'background' => array( 'type' => 'string' ),
                            'link' => array(
                                'type' => 'object',
                                'properties' => array(
                                    'text' => array( 'type' => 'string' ),
                                    'url' => array( 'type' => 'string' ),
                                    'class' => array( 'type' => 'string' ),
                                ),
                            ),
                        ),
                    ),
                    'default' => array(
                        array(
                            'title'       => 'Slide 1',
                            'description' => 'Description 1',
                            'background'  => '',
                            'link'        => array(
                                'text'  => 'Learn more',
                                'url'   => '#',
                                'class' => 'primary',
                            ),
                        ),
                        array(
                            'title'       => 'Slide 2',
                            'description' => 'Description 2',
                            'background'  => '',
                            'link'        => array(
                                'text'  => 'Learn more',
                                'url'   => '#',
                                'class' => 'primary',
                            ),
                        ),
                        array(
                            'title'       => 'Slide 3',
                            'description' => 'Description 3',
                            'background'  => '',
                            'link'        => array(
                                'text'  => 'Learn more',
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
                'currentSlideIndex' => array(
                    'type'    => 'number',
                    'default' => 0,
                ),
                'currentSlide' => array(
                    'type'    => 'number',
                    'default' => 0,
                ),
            ),
        )
    );
}
add_action( 'init', 'bnpp_carousel_register_block' );
