<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Check if text contains Asian characters
 */
function bnpp_carousel_has_asian_chars( $text ) {
    return preg_match( '/[\x{4E00}-\x{9FFF}\x{3040}-\x{309F}\x{30A0}-\x{30FF}\x{AC00}-\x{D7AF}]/u', $text );
}

/**
 * Get character limit based on text content (50 for Asian, 70 for European)
 */
function bnpp_carousel_get_char_limit( $text ) {
    return bnpp_carousel_has_asian_chars( $text ) ? 50 : 70;
}

/**
 * Truncate title to max length, removing 3 chars and adding "..."
 */
function bnpp_carousel_truncate_title( $title ) {
    $limit = bnpp_carousel_get_char_limit( $title );
    $length = mb_strlen( $title );
    
    if ( $length > $limit ) {
        // Remove 3 characters and add "..."
        $truncated = mb_substr( $title, 0, $limit - 3 );
        return $truncated . '...';
    }
    
    return $title;
}

/**
 * Get recent published posts with cache (1 hour)
 * Returns array of posts with title, category, featured image, and URL
 */
function bnpp_carousel_get_recent_posts( $count = 3 ) {
    $cache_key = 'bnpp_carousel_recent_posts_' . $count;
    $cached_posts = get_transient( $cache_key );
    
    if ( $cached_posts !== false ) {
        return $cached_posts;
    }
    
    $posts = get_posts( array(
        'numberposts'      => $count,
        'orderby'          => 'date',
        'order'            => 'DESC',
        'post_type'        => 'post',
        'post_status'      => 'publish',
        'suppress_filters' => false,
    ) );
    
    $formatted_posts = array();
    
    foreach ( $posts as $post ) {
        // Get first category
        $categories = get_the_category( $post->ID );
        $category_name = ! empty( $categories ) ? $categories[0]->name : '';
        
        // Get featured image
        $image_id = get_post_thumbnail_id( $post->ID );
        $image_url = $image_id ? wp_get_attachment_image_src( $image_id, 'full' )[0] : '';
        
        $formatted_posts[] = array(
            'title'    => $post->post_title,
            'category' => $category_name,
            'image'    => $image_url,
            'url'      => get_permalink( $post->ID ),
        );
    }
    
    // Cache for 1 hour (3600 seconds)
    set_transient( $cache_key, $formatted_posts, 3600 );
    
    return $formatted_posts;
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
                            'mode' => array( 'type' => 'string', 'default' => 'manual' ),
                            'link' => array(
                                'type' => 'object',
                                'properties' => array(
                                    'text' => array( 'type' => 'string' ),
                                    'url' => array( 'type' => 'string' ),
                                    'class' => array( 'type' => 'string' ),
                                    'target' => array( 'type' => 'string', 'default' => '_self' ),
                                    'showIcon' => array( 'type' => 'boolean', 'default' => false ),
                                    'category' => array( 'type' => 'string', 'default' => '' ),
                                ),
                            ),
                        ),
                    ),
                    'default' => array(
                        array(
                            'title'       => 'Slide 1',
                            'background'  => '',
                            'mode'        => 'manual',
                            'link'        => array(
                                'text'  => 'Learn more',
                                'url'   => '#',
                                'class' => 'primary',
                                'target' => '_self',
                                'showIcon' => false,
                                'category' => '',
                            ),
                        ),
                        array(
                            'title'       => 'Slide 2',
                            'background'  => '',
                            'mode'        => 'manual',
                            'link'        => array(
                                'text'  => 'Learn more',
                                'url'   => '#',
                                'class' => 'primary',
                                'target' => '_self',
                                'showIcon' => false,
                                'category' => '',
                            ),
                        ),
                        array(
                            'title'       => 'Slide 3',
                            'background'  => '',
                            'mode'        => 'manual',
                            'link'        => array(
                                'text'  => 'Learn more',
                                'url'   => '#',
                                'class' => 'primary',
                                'target' => '_self',
                                'showIcon' => false,
                                'category' => '',
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
                'numSlides' => array(
                    'type'    => 'number',
                    'default' => 3,
                ),
            ),
        )
    );
}
add_action( 'init', 'bnpp_carousel_register_block' );

function bnpp_carousel_render_block( $attributes ) {
    $slides = isset( $attributes['slides'] ) ? $attributes['slides'] : array();
    $autoplay_speed = isset( $attributes['autoplaySpeed'] ) ? intval( $attributes['autoplaySpeed'] ) : 4;
    $num_slides = isset( $attributes['numSlides'] ) ? intval( $attributes['numSlides'] ) : 3;
    
    // Limit to the specified number of slides (max 3)
    $num_slides = min( $num_slides, 3 );
    $slides = array_slice( $slides, 0, $num_slides );

    if ( empty( $slides ) ) {
        return '';
    }

    // Get all recent posts for automatic slides
    $recent_posts = bnpp_carousel_get_recent_posts( 3 );
    $post_index = 0;

    $output = '<section class="bnpp-carousel-wrapper" role="region" aria-roledescription="carousel" aria-label="Carousel">';
    $output .= '<div class="bnpp-carousel">';

    foreach ( $slides as $slide_index => $slide ) {
        // Initialize all variables for this iteration
        $title = '';
        $category = '';
        $background = '';
        $link_url = '#';
        $link_text = '';
        $link_class = 'primary';
        $link_target = '_self';
        $link_show_icon = false;
        
        // Determine if this slide is automatic
        $is_automatic = isset( $slide['mode'] ) && $slide['mode'] === 'automatic';
        
        // Get slide data based on mode
        if ( $is_automatic && isset( $recent_posts[ $post_index ] ) ) {
            $post_data = $recent_posts[ $post_index ];
            $title = bnpp_carousel_truncate_title( $post_data['title'] );
            $category = $post_data['category'];
            $background = $post_data['image'];
            $link_url = $post_data['url'];
            $link_text = 'Read More';
            $post_index++;
        } else {
            // Manual mode
            $title = isset( $slide['title'] ) ? sanitize_text_field( $slide['title'] ) : '';
            $background = isset( $slide['background'] ) ? esc_url( $slide['background'] ) : '';
            $link = isset( $slide['link'] ) ? $slide['link'] : array();
            $link_text = isset( $link['text'] ) ? sanitize_text_field( $link['text'] ) : '';
            $link_url = isset( $link['url'] ) ? esc_url( $link['url'] ) : '#';
            $category = isset( $link['category'] ) ? sanitize_text_field( $link['category'] ) : '';
            $link_class = isset( $link['class'] ) ? sanitize_text_field( $link['class'] ) : 'primary';
            $link_target = isset( $link['target'] ) ? sanitize_text_field( $link['target'] ) : '_self';
            $link_show_icon = isset( $link['showIcon'] ) && $link['showIcon'] ? true : false;
        }

        $style = ! empty( $background ) ? ' style="background: linear-gradient(270deg, rgba(12, 39, 40, 0.03) 38.74%, rgba(12, 39, 40, 0.70) 57.43%), url(' . $background . ') lightgray 0px -404px / 100% 200% no-repeat;"' : '';
        $output .= '<div class="bnpp-slide"' . $style . '>';
        $output .= '<div class="bnpp-overlay dark" style="background:transparent">';
        $output .= '<p>' . esc_html( $title ) . '</p>';
        $category_html = ! empty( $category ) ? '<span class="slide-title-category">' . esc_html( $category ) . '</span>' : '<span class="slide-title-category"></span>';
        $icon_html = $link_show_icon ? '<span class="button-icon"></span>' : '';
        $rel_attr = $link_target === '_blank' ? ' rel="noopener noreferrer"' : '';
        $output .= '<a href="' . $link_url . '" class="bnpp-button ' . $link_class . '" target="' . $link_target . '"' . $rel_attr . ' >' . esc_html( $link_text ) . $icon_html . '</a>';
        $output .= '</div></div>';
    }

    $output .= '</div>';

    $output .= '<div class="bnpp-carousel-nav" role="tablist">';
    $output .= '<div class="bnpp-carousel-nav-sub-container">';
    foreach ( $slides as $index => $slide ) {
        $title = isset( $slide['title'] ) ? sanitize_text_field( $slide['title'] ) : 'Slide ' . ( $index + 1 );
        $aria_selected = $index === 0 ? 'true' : 'false';
        $link = isset( $slide['link'] ) ? $slide['link'] : array();
        $category = isset( $link['category'] ) ? sanitize_text_field( $link['category'] ) : '';
        $category_html = ! empty( $category ) ? '<span class="slide-title-category">' . esc_html( $category ) . '</span>' : '<span class="slide-title-category"></span>';
        $output .= '<button role="tab" aria-selected="' . $aria_selected . '">' . $category_html . '<span class="slide_title">' . esc_html( $title ) . '</span></button>';
    }
    $output .= '</div>';
    $output .= '</div>';

    $output .= '<button class="bnpp-pause-btn" aria-pressed="false">Pause</button>';
    $output .= '<div class="sr-only" aria-live="polite" id="bnpp-carousel-status"></div>';
    $output .= '<script type="application/json" class="bnpp-carousel-config">' . wp_json_encode( array( 'autoplaySpeed' => $autoplay_speed * 1000, 'totalSlides' => count( $slides ) ) ) . '</script>';
    $output .= '</section>';

    return $output;
}
