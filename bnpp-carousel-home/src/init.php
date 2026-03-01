<?php
/**
 * Enregistrement et gestion du bloc Gutenberg
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Enregistre les scripts et styles du bloc
 */
function bnpp_carousel_register_block_assets() {
    
    // Scripts et styles côté édition
    wp_register_script(
        'bnpp-carousel-editor',
        BNPP_CAROUSEL_URL . 'assets/block.js',
        array( 'wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-data' ),
        BNPP_CAROUSEL_VERSION,
        true
    );

    // Styles côté édition
    wp_register_style(
        'bnpp-carousel-editor-style',
        BNPP_CAROUSEL_URL . 'assets/block.css',
        array( 'wp-edit-blocks' ),
        BNPP_CAROUSEL_VERSION
    );

    // Styles côté frontend
    wp_register_style(
        'bnpp-carousel-frontend-style',
        BNPP_CAROUSEL_URL . 'assets/block.css',
        array(),
        BNPP_CAROUSEL_VERSION
    );

    // Scripts côté frontend
    wp_register_script(
        'bnpp-carousel-frontend',
        BNPP_CAROUSEL_URL . 'assets/block.js',
        array( 'jquery' ),
        BNPP_CAROUSEL_VERSION,
        true
    );
}
add_action( 'init', 'bnpp_carousel_register_block_assets' );

/**
 * Enregistre le bloc Gutenberg
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
                            'title'       => 'Découvrez nos services',
                            'description' => 'Services de qualité adaptés à vos besoins',
                            'link'        => array(
                                'text'  => 'En savoir plus',
                                'url'   => '#',
                                'class' => 'primary',
                            ),
                        ),
                        array(
                            'title'       => 'Solutions adaptées à vos besoins',
                            'description' => 'Trouvez la solution parfaite pour votre entreprise',
                            'link'        => array(
                                'text'  => 'Voir les solutions',
                                'url'   => '#',
                                'class' => 'primary',
                            ),
                        ),
                        array(
                            'title'       => 'Contactez notre équipe',
                            'description' => 'Nous sommes à votre écoute pour répondre à vos questions',
                            'link'        => array(
                                'text'  => 'Nous contacter',
                                'url'   => '#',
                                'class' => 'primary',
                            ),
                        ),
                    ),
                    'items' => array(
                        'type' => 'object',
                        'properties' => array(
                            'title'       => array( 'type' => 'string' ),
                            'description' => array( 'type' => 'string' ),
                            'link'        => array(
                                'type' => 'object',
                                'properties' => array(
                                    'text'  => array( 'type' => 'string' ),
                                    'url'   => array( 'type' => 'string' ),
                                    'class' => array( 'type' => 'string' ),
                                ),
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
 * Rendu du bloc côté frontend
 */
function bnpp_carousel_render_block( $attributes ) {
    $slides = isset( $attributes['slides'] ) ? $attributes['slides'] : array();
    $autoplay_speed = isset( $attributes['autoplaySpeed'] ) ? intval( $attributes['autoplaySpeed'] ) : 4;

    if ( empty( $slides ) ) {
        return '';
    }

    $output = '<section class="bnpp-carousel-wrapper" role="region" aria-roledescription="carousel" aria-label="Présentation des services">';
    
    $output .= '<div class="bnpp-carousel">';

    foreach ( $slides as $index => $slide ) {
        $title       = isset( $slide['title'] ) ? sanitize_text_field( $slide['title'] ) : '';
        $description = isset( $slide['description'] ) ? sanitize_text_field( $slide['description'] ) : '';
        $link        = isset( $slide['link'] ) ? $slide['link'] : array();
        $link_text   = isset( $link['text'] ) ? sanitize_text_field( $link['text'] ) : '';
        $link_url    = isset( $link['url'] ) ? esc_url( $link['url'] ) : '#';
        $link_class  = isset( $link['class'] ) ? sanitize_text_field( $link['class'] ) : 'primary';

        $output .= '<div class="bnpp-slide">';
        $output .= '<div class="bnpp-overlay">';
        
        if ( ! empty( $title ) ) {
            $output .= '<h2>' . $title . '</h2>';
        }
        
        if ( ! empty( $description ) ) {
            $output .= '<p>' . $description . '</p>';
        }
        
        if ( ! empty( $link_text ) && ! empty( $link_url ) ) {
            $output .= '<a href="' . $link_url . '" class="bnpp-btn bnpp-btn-' . $link_class . '">' . $link_text . '</a>';
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
        $output .= '<button role="tab" aria-selected="' . $aria_selected . '" data-slide="' . $index . '">' . $title . '</button>';
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
        'autoplaySpeed' => $autoplay_speed * 1000, // Convertir en millisecondes
        'totalSlides'   => count( $slides ),
    ) );
    $output .= '</script>';

    return $output;
}
