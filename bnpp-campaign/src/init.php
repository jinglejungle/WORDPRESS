<?php
/**
 * Block registration for the Campaign Block.
 *
 * This file handles:
 * - Registering the block type with WordPress
 * - Enqueueing editor and front-end assets
 * - Defining block attributes
 * - Rendering the block on the front end
 *
 * Container layout:
 * - width: 100% (fluid), max-width: 1130 px.
 * - Image (700 × 500 px) and boxDescription (590 px wide) keep fixed sizes above 460 px.
 * - As the container narrows, boxDescription slides toward the left edge.
 * - Below 460 px: mobile stacked layout (image full-width on top, description below).
 *
 * @package CampaignBlock
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register the Campaign Block and enqueue its assets.
 *
 * @return void
 */
function campaign_block_register() {

	// -----------------------------------------------------------------
	// 1. Enqueue the block editor script (only in the editor context).
	// -----------------------------------------------------------------
	wp_register_script(
		'campaign-block-editor-js',
		plugin_dir_url( dirname( __FILE__ ) ) . 'assets/block.js',
		array( 'wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-i18n', 'wp-block-editor', 'wp-data' ),
		filemtime( plugin_dir_path( dirname( __FILE__ ) ) . 'assets/block.js' ),
		true
	);

	// -----------------------------------------------------------------
	// 2. Enqueue the shared stylesheet (editor + front end).
	// -----------------------------------------------------------------
	wp_register_style(
		'campaign-block-style',
		plugin_dir_url( dirname( __FILE__ ) ) . 'assets/block.css',
		array(),
		filemtime( plugin_dir_path( dirname( __FILE__ ) ) . 'assets/block.css' )
	);

	// -----------------------------------------------------------------
	// 3. Register the block type with its attributes and callbacks.
	// -----------------------------------------------------------------
	register_block_type(
		'campaign-block/campaign',
		array(
			/* ---- Block attributes ---- */
			'attributes'      => array(

				// Campaign title (max 55 characters; max 25 for Asian scripts).
				'title'          => array(
					'type'    => 'string',
					'default' => '',
				),

				// Campaign description (max 195 characters).
				'description'    => array(
					'type'    => 'string',
					'default' => '',
				),

				// Media-library image ID.
				'imageId'        => array(
					'type'    => 'integer',
					'default' => 0,
				),

				// Full URL of the selected image.
				'imageUrl'       => array(
					'type'    => 'string',
					'default' => '',
				),

				// Accessible alt text for the image.
				'imageAlt'       => array(
					'type'    => 'string',
					'default' => '',
				),

				// Image alignment inside campaign_container: 'left' | 'right'.
				'imageAlignment' => array(
					'type'    => 'string',
					'default' => 'left',
				),

				// Background color of the description box (hex value from the palette).
				'boxBgColor'     => array(
					'type'    => 'string',
					'default' => '#008252',
				),

				// Text color applied to title and description (hex value).
				'boxTextColor'   => array(
					'type'    => 'string',
					'default' => '#ffffff',
				),
			),

			/* ---- Asset handles ---- */
			'editor_script'   => 'campaign-block-editor-js',
			'editor_style'    => 'campaign-block-style',
			'style'           => 'campaign-block-style',

			/* ---- Server-side render callback ---- */
			'render_callback' => 'campaign_block_render',
		)
	);
}
add_action( 'init', 'campaign_block_register' );


/**
 * Server-side render callback for the Campaign Block.
 *
 * Outputs accessible, W3C-valid HTML for the block on the front end.
 *
 * @param array $attributes Block attributes saved in the database.
 * @return string           HTML markup for the block.
 */
/**
 * Convert a hex color to an rgba() CSS string.
 *
 * Used to compute the image border color (background color at 30 % opacity).
 *
 * @param  string $hex     Hex color, e.g. '#008252' or '#abc'.
 * @param  float  $opacity Opacity between 0 and 1.
 * @return string          CSS rgba() value, e.g. 'rgba(0,130,82,0.3)'.
 */
function campaign_block_hex_to_rgba( $hex, $opacity ) {
	$hex = ltrim( $hex, '#' );

	// Expand shorthand #rgb to #rrggbb.
	if ( 3 === strlen( $hex ) ) {
		$hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
	}

	if ( 6 !== strlen( $hex ) ) {
		return 'rgba(0,0,0,' . (float) $opacity . ')';
	}

	$r = hexdec( substr( $hex, 0, 2 ) );
	$g = hexdec( substr( $hex, 2, 2 ) );
	$b = hexdec( substr( $hex, 4, 2 ) );

	return 'rgba(' . $r . ',' . $g . ',' . $b . ',' . (float) $opacity . ')';
}

function campaign_block_render( $attributes ) {

	// Sanitize all attribute values before output.
	$title           = isset( $attributes['title'] )          ? sanitize_text_field( $attributes['title'] )           : '';
	$description     = isset( $attributes['description'] )    ? sanitize_textarea_field( $attributes['description'] ) : '';
	$image_url       = isset( $attributes['imageUrl'] )       ? esc_url( $attributes['imageUrl'] )                    : '';
	$image_alt       = isset( $attributes['imageAlt'] )       ? sanitize_text_field( $attributes['imageAlt'] )        : '';
	$image_alignment = isset( $attributes['imageAlignment'] ) ? sanitize_text_field( $attributes['imageAlignment'] )  : 'left';
	$box_bg_color    = isset( $attributes['boxBgColor'] )     ? sanitize_hex_color( $attributes['boxBgColor'] )       : '#008252';
	$box_text_color  = isset( $attributes['boxTextColor'] )   ? sanitize_hex_color( $attributes['boxTextColor'] )     : '#ffffff';

	// Fallback to defaults if sanitize_hex_color returns empty (invalid value).
	if ( ! $box_bg_color )   { $box_bg_color   = '#008252'; }
	if ( ! $box_text_color ) { $box_text_color = '#ffffff'; }

	// Border color for the image: background color at 30 % opacity.
	$image_border_color = campaign_block_hex_to_rgba( $box_bg_color, 0.3 );

	// Validate alignment value to prevent unexpected output.
	if ( ! in_array( $image_alignment, array( 'left', 'right' ), true ) ) {
		$image_alignment = 'left';
	}

	// Build CSS modifier class: image-left places description on the right, and vice-versa.
	$container_class = 'campaign-container campaign-image-' . esc_attr( $image_alignment );

	// Inline style for the description box – applies the chosen palette colors.
	$box_style = 'background-color:' . esc_attr( $box_bg_color ) . ';color:' . esc_attr( $box_text_color ) . ';';

	// Open the outer container.
	$html  = '<div id="campaign_container" class="' . $container_class . '" role="region" aria-label="' . esc_attr__( 'Campaign', 'campaign-block' ) . '">';

	// ---- Image element (rendered as <img>, NOT as background-image) ----
	if ( $image_url ) {
		// outline on <img> instead of border on the wrapper:
		// outline draws on top of the image (outside the box model) so it is
		// never hidden by the absolutely-positioned wrapper's overflow.
		$img_outline_style = 'outline:3px solid ' . esc_attr( $image_border_color ) . ';outline-offset:-3px;';
		$html .= '<div class="campaign-image-wrapper" aria-hidden="false">';
		$html .= '<img';
		$html .= ' src="' . esc_url( $image_url ) . '"';
		$html .= ' alt="' . esc_attr( $image_alt ) . '"';
		$html .= ' class="campaign-image"';
		$html .= ' style="' . $img_outline_style . '"';
		$html .= ' width="700"';
		$html .= ' height="500"';
		$html .= ' loading="lazy"';
		$html .= ' decoding="async"';
		$html .= ' />';
		$html .= '</div>';
	}

	// ---- Description box (inline style applies the selected palette colors) ----
	$html .= '<div id="boxDescription" class="campaign-box-description" style="' . $box_style . '">';

	if ( $title ) {
		// Use h2 for semantic heading; adjust to your document outline as needed.
		$html .= '<h2 class="campaign-title" style="color:' . esc_attr( $box_text_color ) . ';">' . esc_html( $title ) . '</h2>';
	}

	if ( $description ) {
		$html .= '<p class="campaign-description" style="color:' . esc_attr( $box_text_color ) . ';">' . esc_html( $description ) . '</p>';
	}

	$html .= '</div>';// #boxDescription

	$html .= '</div>';// #campaign_container

	return $html;
}
