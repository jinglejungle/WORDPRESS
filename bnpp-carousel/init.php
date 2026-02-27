<?php
/**
 * Block initialization and registration
 * 
 * This file handles the registration of the BNPP carousel block
 * and enqueues all necessary scripts and styles.
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register the carousel block
 */
function bnpp_carousel_register_block() {
	// Register the block script for editor only
	wp_register_script(
		'bnpp-carousel-editor',
		BNPP_CAROUSEL_URL . 'assets/block.js',
		array( 'wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-data' ),
		BNPP_CAROUSEL_VERSION,
		true
	);

	// Register the block style (frontend)
	wp_register_style(
		'bnpp-carousel-style',
		BNPP_CAROUSEL_URL . 'assets/block.css',
		array(),
		BNPP_CAROUSEL_VERSION
	);

	// Register the editor style
	wp_register_style(
		'bnpp-carousel-editor-style',
		BNPP_CAROUSEL_URL . 'assets/block.css',
		array(),
		BNPP_CAROUSEL_VERSION
	);

	// Register the block
	register_block_type(
		'bnpp/carousel-homepage',
		array(
			'editor_script'   => 'bnpp-carousel-editor',
			'style'           => 'bnpp-carousel-style',
			'editor_style'    => 'bnpp-carousel-editor-style',
			'render_callback' => 'bnpp_carousel_render_block',
			'attributes'      => array(
				'slides' => array(
					'type'    => 'array',
					'default' => array(
						array(
							'id'       => 0,
							'title'    => 'Slide 1',
							'description' => 'Add your description here',
							'imageId'  => 0,
							'imageUrl' => '',
							'buttonUrl' => '',
							'buttonText' => 'Button content...',
							'buttonStyle' => 'primary',
							'buttonTarget' => false,
						),
						array(
							'id'       => 1,
							'title'    => 'Slide 2',
							'description' => 'Add your description here',
							'imageId'  => 0,
							'imageUrl' => '',
							'buttonUrl' => '',
							'buttonText' => 'Button content...',
							'buttonStyle' => 'primary',
							'buttonTarget' => false,
						),
						array(
							'id'       => 2,
							'title'    => 'Slide 3',
							'description' => 'Add your description here',
							'imageId'  => 0,
							'imageUrl' => '',
							'buttonUrl' => '',
							'buttonText' => 'Button content...',
							'buttonStyle' => 'primary',
							'buttonTarget' => false,
						),
					),
				),
				'activeSlide' => array(
					'type'    => 'integer',
					'default' => 0,
				),
				'autoPlayDuration' => array(
					'type'    => 'integer',
					'default' => 4,
				),
				'showPlayButton' => array(
					'type'    => 'boolean',
					'default' => true,
				),
				'enableAutoPlay' => array(
					'type'    => 'boolean',
					'default' => false,
				),
				'activeEditSection' => array(
					'type'    => 'string',
					'default' => null,
				),
			),
		)
	);
}
add_action( 'init', 'bnpp_carousel_register_block' );

/**
 * Render the carousel block on the frontend
 * 
 * @param array $attributes Block attributes
 * @return string HTML output
 */
function bnpp_carousel_render_block( $attributes ) {
	$slides = isset( $attributes['slides'] ) ? $attributes['slides'] : array();
	$show_play_button = isset( $attributes['showPlayButton'] ) ? $attributes['showPlayButton'] : true;
	$enable_autoplay = isset( $attributes['enableAutoPlay'] ) ? $attributes['enableAutoPlay'] : false;
	$autoplay_duration = isset( $attributes['autoPlayDuration'] ) ? $attributes['autoPlayDuration'] : 4;
	
	if ( empty( $slides ) ) {
		return '';
	}

	ob_start();
	?>
	<div class="bnpp-carousel-wrapper" data-autoplay="<?php echo esc_attr( $enable_autoplay ? 'true' : 'false' ); ?>" data-duration="<?php echo esc_attr( $autoplay_duration ); ?>">
		<div class="bnpp-carousel-container">
			<?php foreach ( $slides as $index => $slide ) : ?>
				<?php
					$image_url = isset( $slide['imageUrl'] ) ? $slide['imageUrl'] : '';
					$title = isset( $slide['title'] ) ? $slide['title'] : '';
					$description = isset( $slide['description'] ) ? $slide['description'] : '';
					$button_url = isset( $slide['buttonUrl'] ) ? $slide['buttonUrl'] : '';
					$button_text = isset( $slide['buttonText'] ) ? $slide['buttonText'] : 'Button content...';
					$button_style = isset( $slide['buttonStyle'] ) ? $slide['buttonStyle'] : 'primary';
					$button_target = isset( $slide['buttonTarget'] ) ? $slide['buttonTarget'] : false;
					$show_button = ! empty( $button_url ) && $button_text !== 'Button content...';
				?>
				<div class="diapositive" 
					style="background-image: url('<?php echo esc_url( $image_url ); ?>'); <?php echo $image_url ? 'background-size: cover; background-position: center;' : ''; ?>"
					role="region"
					aria-label="<?php echo esc_attr( sprintf( 'Slide %d: %s', $index + 1, $title ) ); ?>">
					
					<div class="diapositive-description">
						<h3><?php echo esc_html( $title ); ?></h3>
						<p><?php echo esc_html( $description ); ?></p>
					</div>

					<?php if ( $show_button ) : ?>
						<a href="<?php echo esc_url( $button_url ); ?>"
							class="bnpp-button <?php echo esc_attr( $button_style ); ?>"
							<?php echo $button_target ? 'target="_blank" rel="noopener noreferrer"' : ''; ?>>
							<?php echo esc_html( $button_text ); ?>
						</a>
					<?php endif; ?>
				</div>
			<?php endforeach; ?>

			<!-- Slide title indicators at the bottom -->
			<div class="bnpp-carousel-titles" role="tablist">
				<?php foreach ( $slides as $index => $slide ) : ?>
					<?php $title = isset( $slide['title'] ) ? $slide['title'] : 'Slide ' . ( $index + 1 ); ?>
					<div class="bnpp-carousel-title-item"
						role="tab"
						aria-selected="false">
						<?php echo esc_html( $title ); ?>
					</div>
				<?php endforeach; ?>
			</div>

			<!-- Play/Pause button -->
			<?php if ( $show_play_button ) : ?>
				<button class="bnpp-carousel-play-button" data-playing="false" aria-label="Play carousel">▶ Play</button>
			<?php endif; ?>
		</div>
	</div>
	<?php
	return ob_get_clean();
}
	<?php
	return ob_get_clean();
}

/**
 * Enqueue frontend carousel functionality only
 */
function bnpp_carousel_enqueue_frontend_script() {
	// Only enqueue if block.js not already loaded in editor
	wp_enqueue_script(
		'bnpp-carousel-frontend',
		BNPP_CAROUSEL_URL . 'assets/block.js',
		array(),
		BNPP_CAROUSEL_VERSION,
		true
	);
	
	// Inline script to initialize carousels
	wp_add_inline_script( 'bnpp-carousel-frontend', '
		if ( document.readyState === "loading" ) {
			document.addEventListener( "DOMContentLoaded", function() {
				// Carousels auto-initialize via frontend code in block.js
			});
		}
	' );
}
add_action( 'wp_enqueue_scripts', 'bnpp_carousel_enqueue_frontend_script' );
