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
            'render_callback' => 'bnpp_carousel_render_block',
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

/**
 * Render the block on frontend
 */
function bnpp_carousel_render_block( $attributes ) {
    $slides = isset( $attributes['slides'] ) ? $attributes['slides'] : array();
    $autoplay_speed = isset( $attributes['autoplaySpeed'] ) ? intval( $attributes['autoplaySpeed'] ) : 4;

    if ( empty( $slides ) ) {
        return '';
    }

    $output = '<section class="bnpp-carousel-wrapper" role="region" aria-roledescription="carousel" aria-label="Services presentation">';
    
    $output .= '<div class="bnpp-carousel">';

    foreach ( $slides as $index => $slide ) {
        $title       = isset( $slide['title'] ) ? sanitize_text_field( $slide['title'] ) : '';
        $description = isset( $slide['description'] ) ? sanitize_text_field( $slide['description'] ) : '';
        $background  = isset( $slide['background'] ) ? esc_url( $slide['background'] ) : '';
        $link        = isset( $slide['link'] ) ? $slide['link'] : array();
        $link_text   = isset( $link['text'] ) ? sanitize_text_field( $link['text'] ) : '';
        $link_url    = isset( $link['url'] ) ? esc_url( $link['url'] ) : '#';
        $link_class  = isset( $link['class'] ) ? sanitize_text_field( $link['class'] ) : 'primary';

        $output .= '<div class="bnpp-slide"' . ( ! empty( $background ) ? ' style="background-image: url(\'' . $background . '\');"' : '' ) . '>';
        $output .= '<div class="bnpp-overlay">';
        
        if ( ! empty( $title ) ) {
            $output .= '<h2>' . esc_html( $title ) . '</h2>';
        }
        
        if ( ! empty( $description ) ) {
            $output .= '<p>' . esc_html( $description ) . '</p>';
        }
        
        if ( ! empty( $link_text ) && ! empty( $link_url ) ) {
            $output .= '<a href="' . $link_url . '" class="bnpp-btn bnpp-btn-' . $link_class . '">' . esc_html( $link_text ) . '</a>';
        }
        
        $output .= '</div>';
        $output .= '</div>';
    }

    $output .= '</div>';

    // Navigation buttons
    $output .= '<div class="bnpp-carousel-nav" role="tablist">';
    foreach ( $slides as $index => $slide ) {
        $title = isset( $slide['title'] ) ? sanitize_text_field( $slide['title'] ) : 'Slide ' . ( $index + 1 );
        $aria_selected = $index === 0 ? 'true' : 'false';
        $output .= '<button role="tab" aria-selected="' . $aria_selected . '" data-slide="' . $index . '">' . esc_html( $title ) . '</button>';
    }
    $output .= '</div>';

    // Pause button
    $output .= '<button class="bnpp-pause-btn" aria-pressed="false">Pause</button>';

    // Live region for screen readers
    $output .= '<div class="sr-only" aria-live="polite" id="bnpp-carousel-status"></div>';

    $output .= '</section>';

    // Inline script data
    $output .= '<script type="application/json" class="bnpp-carousel-config">';
    $output .= wp_json_encode( array(
        'autoplaySpeed' => $autoplay_speed * 1000, // Convert to milliseconds
        'totalSlides'   => count( $slides ),
    ) );
    $output .= '</script>';

    return $output;
}
