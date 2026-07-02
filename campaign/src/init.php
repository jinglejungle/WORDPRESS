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
if (! defined('ABSPATH')) {
	exit;
}

/**
 * Register the Campaign Block and enqueue its assets.
 *
 * @return void
 */
function gl_ampaign_block_register()
{

	// -----------------------------------------------------------------
	// 1. Enqueue the block editor script (only in the editor context).
	// -----------------------------------------------------------------
	wp_register_script(
		'gl-campaign-block-editor-js',
		plugin_dir_url(dirname(__FILE__)) . 'assets/block.js',
		array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-i18n', 'wp-block-editor', 'wp-data'),
		filemtime(plugin_dir_path(dirname(__FILE__)) . 'assets/block.js'),
		true
	);

	// -----------------------------------------------------------------
	// 2. Enqueue the shared stylesheet (editor + front end).
	// -----------------------------------------------------------------
	wp_register_style(
		'gl-campaign-block-style',
		plugin_dir_url(dirname(__FILE__)) . 'assets/block.css',
		array(),
		filemtime(plugin_dir_path(dirname(__FILE__)) . 'assets/block.css')
	);

	// -----------------------------------------------------------------
	// 3. Register the block type with its attributes and callbacks.
	// -----------------------------------------------------------------
	register_block_type(
		'gl-campaign-block/campaign',
		array(
			/* ---- Block attributes ---- */
			'attributes'      => array(

				//darkMode
				'darkLight' => array(
					'type' => 'boolean',
					'default' => false,
				),
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
				'background'     => array(
					'type'    => 'string',
					'default' => 'light',
				),
				

				// Text color applied to title and description (hex value).
				'boxTextColor'   => array(
					'type'    => 'string',
					'default' => '#ffffff',
				),

				// Button URL.
				'buttonUrl'    => array(
					'type'    => 'string',
					'default' => '',
				),

				// link
				'link'   => array(
					'type'    => 'string',
					'default' => '',
				),
				//
				'linkbis'   => array(
					'type'    => 'object',
					'default' => null,
				),
				// Whether the link opens in a new tab.
				'buttonTarget' => array(
					'type'    => 'boolean',
					'default' => false,
				),
				// Whether the icon link show.
				'iconShow' => array(
					'type'    => 'boolean',
					'default' => false,
				),
				// Button style: 'primary' | 'secondary' | 'tertiary' | 'ghost'.
				'buttonStyle'  => array(
					'type'    => 'string',
					'default' => 'primary',
				),
			),

			/* ---- Asset handles ---- */
			'editor_script'   => 'gl-campaign-block-editor-js',
			'editor_style'    => 'gl-campaign-block-style',
			'style'           => 'gl-campaign-block-style',

			/* ---- Server-side render callback ---- */
			'render_callback' => 'gl_ampaign_block_render',
		)
	);
}
add_action('init', 'gl_ampaign_block_register');


function gl_ampaign_block_render($attributes)
{

	// Sanitize all attribute values before output.
	$title           = isset($attributes['title'])          ? sanitize_text_field($attributes['title'])           : '';
	$description     = isset($attributes['description'])    ? sanitize_textarea_field($attributes['description']) : '';
	$image_url       = isset($attributes['imageUrl'])       ? esc_url($attributes['imageUrl'])                    : '';
	$image_alt       = isset($attributes['imageAlt'])       ? sanitize_text_field($attributes['imageAlt'])        : '';
	$image_alignment = isset($attributes['imageAlignment']) ? sanitize_text_field($attributes['imageAlignment'])  : 'left';
	$box_bg_color    = isset($attributes['boxBgColor'])     ? sanitize_hex_color($attributes['boxBgColor'])       : '#008252';
	$box_text_color  = isset($attributes['boxTextColor'])   ? sanitize_hex_color($attributes['boxTextColor'])     : '#ffffff';
	$link            = (isset($attributes['link']) && $attributes['link'] && is_string($attributes['link'])) ? esc_url($attributes['link']) : '';
	$button_text     = isset($attributes['buttonText'])     ? sanitize_text_field($attributes['buttonText'])      : 'Button content...';
	$button_target   = isset($attributes['buttonTarget'])   ? (bool) $attributes['buttonTarget']                    : false;
	$icon_show       = isset($attributes['iconShow'])     ? (bool) $attributes['iconShow']                      : false;
	$button_style    = isset($attributes['buttonStyle'])    ? sanitize_text_field($attributes['buttonStyle'])     : 'primary';
	$sizeButton = (isset($attributes['sizeButton']) && $attributes['sizeButton']) ? $attributes['sizeButton'] : '';

	// add only on the global div container for the background
	// there will be descriptionBox with dark mode or note so we can't use dark class on the global div container
	$darkBackgroundClass = (isset($attributes['darkLight']) && $attributes['darkLight']) ? 'darkBackground' : '';
	$borderContainer = (isset($attributes['darkLight']) && $attributes['darkLight']) ? 'border:1px solid #0C2728;' : 'border:1px solid #ffffff;';

	$darkColor = ['#0C2728', '#832E5A', '#12494B', '#61696E', '#153340','#465843','#001B15','#082D23','#003F29'];

	// Validate button style.
	if (! in_array($button_style, array('primary', 'secondary', 'tertiary', 'ghost'), true)) {
		$button_style = 'primary';
	}

	// Determine if the dark class should be added on the descriptionBox (when the color is a dark color).
	$button_dark_class = in_array($box_bg_color, $darkColor, true) ? ' dark' : '';

	// The button is only rendered if a URL has been set AND the text differs from the default.
	$show_button = (! empty($link) && ! empty($button_text) && 'Button content...' !== $button_text);

	// Validate alignment value to prevent unexpected output.
	if (! in_array($image_alignment, array('left', 'right'), true)) {
		$image_alignment = 'left';
	}
	$container_class  = 'campaign-container campaign-image-' . esc_attr($image_alignment);

	// Inline style for the description box – applies the chosen palette colors.
	$box_style = 'background-color:' . esc_attr($box_bg_color) . ';color:' . esc_attr($box_text_color) . ';';


	// Open the outer container.
	$html  = '<div id="global-campaign-container" class="' . $darkBackgroundClass . ' " >';
	$html .= '<div id="campaign_container" class="' . $container_class . '" style="' . $borderContainer . '" role="region" aria-label="' . esc_attr__('Campaign', 'gl-campaign-block') . ' ">';
	// ---- Image element (rendered as <img>, NOT as background-image) ----
	if ($image_url) {
		// outline on <img> instead of border on the wrapper:
		// outline draws on top of the image (outside the box model) so it is
		// never hidden by the absolutely-positioned wrapper's overflow.
		$img_shadow_style = 'box-shadow: 5px 5px 5px ' . esc_attr($box_bg_color) . '4D;';

		$html .= '<div class="campaign-image-wrapper" style="' . $img_shadow_style . '" aria-hidden="false">';
		$html .= '<img';
		$html .= ' src="' . esc_url($image_url) . '"';
		$html .= ' alt="' . esc_attr($image_alt) . '"';
		$html .= ' class="campaign-image"';
		$html .= ' width="700"';
		$html .= ' height="500"';
		$html .= ' loading="lazy"';
		$html .= ' decoding="async"';
		$html .= ' />';
		$html .= '</div>';
	}

	// ---- Description box (inline style applies the selected palette colors) ----
	$html .= '<div id="boxDescription" class="campaign-box-description ' . $button_dark_class . ' " style="' . $box_style . '">';

	if ($title) {
		// Use h2 for semantic heading; adjust to your document outline as needed.
		$html .= '<h2 class="campaign-title" style="color:' . esc_attr($box_text_color) . ';">' . esc_html($title) . '</h2>';
	}

	if ($description) {
		$html .= '<p class="campaign-description" style="color:' . esc_attr($box_text_color) . ';">' . esc_html($description) . '</p>';
	}

	// ---- Button (only when URL is set and text has been changed from default) ----
	if ($show_button) {
		$btn_class  = 'bnpp-button ' . esc_attr($button_style);
		$btn_target = $button_target ? ' target="_blank" rel="noopener noreferrer"' : '';

		if ($icon_show) {
			$icon = '<span class="button-icon"></span>';
		} else {
			$icon = "";
		}
		$html .= '<a href="' . esc_url($link)  . '" class="' . $btn_class . ' ' . $sizeButton . '" role="button" ' . $btn_target . ' > ' . esc_html($button_text) . ' ' . $icon . '</a>';
	}

	$html .= '</div>'; // #boxDescription
	$html .= '</div>'; // container with a a width

	$html .= '</div>'; // #campaign_container ( need to be 100% for dark mode)

	return $html;
}