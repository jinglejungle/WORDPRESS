<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function bnpp_carousel_register_block_assets() {
    wp_register_script(
        'bnpp-carousel-editor',
        BNPP_CAROUSEL_URL . 'assets/block.js',
        array( 'wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-data', 'wp-block-editor' ),
        BNPP_CAROUSEL_VERSION,
        true
    );

    wp_register_style(
        'bnpp-carousel-editor-style',
        BNPP_CAROUSEL_URL . 'assets/editor.css',
        array( 'wp-edit-blocks' ),
        BNPP_CAROUSEL_VERSION
    );

    wp_register_style(
        'bnpp-carousel-frontend-style',
        BNPP_CAROUSEL_URL . 'assets/block.css',
        array(),
        BNPP_CAROUSEL_VERSION
    );

    wp_register_script(
        'bnpp-carousel-frontend',
        BNPP_CAROUSEL_URL . 'assets/block.js',
        array(),
        BNPP_CAROUSEL_VERSION,
        true
    );
}
add_action( 'init', 'bnpp_carousel_register_block_assets' );

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
                    'items' => array(
                        'type' => 'object',
                        'properties' => array(
                            'title' => array( 'type' => 'string' ),
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
                            'background'  => '',
                            'link'        => array(
                                'text'  => 'Learn more',
                                'url'   => '#',
                                'class' => 'primary',
                            ),
                        ),
                        array(
                            'title'       => 'Slide 2',
                            'background'  => '',
                            'link'        => array(
                                'text'  => 'Learn more',
                                'url'   => '#',
                                'class' => 'primary',
                            ),
                        ),
                        array(
                            'title'       => 'Slide 3',
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
            ),
        )
    );
}
add_action( 'init', 'bnpp_carousel_register_block' );

function bnpp_carousel_render_block( $attributes ) {
    $slides = isset( $attributes['slides'] ) ? $attributes['slides'] : array();
    $autoplay_speed = isset( $attributes['autoplaySpeed'] ) ? intval( $attributes['autoplaySpeed'] ) : 4;

    if ( empty( $slides ) ) {
        return '';
    }

    $output = '<section class="bnpp-carousel-wrapper" role="region" aria-roledescription="carousel" aria-label="Carousel">';
    $output .= '<div class="bnpp-carousel">';

    foreach ( $slides as $slide ) {
        $title = isset( $slide['title'] ) ? sanitize_text_field( $slide['title'] ) : '';
        $background = isset( $slide['background'] ) ? esc_url( $slide['background'] ) : '';
        $link = isset( $slide['link'] ) ? $slide['link'] : array();
        $link_text = isset( $link['text'] ) ? sanitize_text_field( $link['text'] ) : '';
        $link_url = isset( $link['url'] ) ? esc_url( $link['url'] ) : '#';
        $link_class = isset( $link['class'] ) ? sanitize_text_field( $link['class'] ) : 'primary';

        $style = ! empty( $background ) ? ' style="background: linear-gradient(270deg, rgba(12, 39, 40, 0.03) 38.74%, rgba(12, 39, 40, 0.70) 57.43%), url(' . $background . ') lightgray 0px -404px / 100% 200% no-repeat;"' : '';
        $output .= '<div class="bnpp-slide"' . $style . '>';
        $output .= '<div class="bnpp-overlay dark" style="background:transparent">';
        $output .= '<p>' . esc_html( $title ) . '</p>';
        $output .= '<a href="' . $link_url . '" class="bnpp-button ' . $link_class . '">' . esc_html( $link_text ) . '</a>';
        $output .= '</div></div>';
    }

    $output .= '</div>';

    $output .= '<div class="bnpp-carousel-nav" role="tablist">';
    foreach ( $slides as $index => $slide ) {
        $title = isset( $slide['title'] ) ? sanitize_text_field( $slide['title'] ) : 'Slide ' . ( $index + 1 );
        $aria_selected = $index === 0 ? 'true' : 'false';
        $output .= '<button role="tab" aria-selected="' . $aria_selected . '">' . esc_html( $title ) . '</button>';
    }
    $output .= '</div>';

    $output .= '<button class="bnpp-pause-btn" aria-pressed="false">Pause</button>';
    $output .= '<div class="sr-only" aria-live="polite" id="bnpp-carousel-status"></div>';
    $output .= '<script type="application/json" class="bnpp-carousel-config">' . wp_json_encode( array( 'autoplaySpeed' => $autoplay_speed * 1000, 'totalSlides' => count( $slides ) ) ) . '</script>';
    $output .= '</section>';

    return $output;
}
