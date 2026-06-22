<?php
/**
 * Registration and server side rendering for the Rebrand Statistic Bloc block.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Render function for the statistics block.
 *
 * @param array  $attributes A clean associative array of block attributes.
 * @param string $content    The block inner HTML (rendered inner blocks).
 * @param object $block      The block instance.
 * @return string
 */
function bnpp_rebrand_statistics_bloc_render( $attributes, $content = '', $block = null ) {

	[
		'headingLevel'  => $headingLevel,
		'colourDisplay' => $colourDisplay,
		'layout'        => $layout,
		'columnLayout'  => $columnLayout,
		'heading'       => $heading,
		'text'          => $text,
		'anchor'        => $anchor,
		'buttonOptions' => $buttonOptions,
	] = $attributes;

	$button_text       = $buttonOptions['buttonText'] ?? '';
	$button_aria_label = $buttonOptions['buttonAriaLabel'] ?? $button_text;
	$button_url        = $buttonOptions['buttonUrl'] ?? '';
	$show_icon         = $buttonOptions['showButtonIcon'] ?? false;
	$color_scheme      = $buttonOptions['buttonColorScheme'] ?? 'primary';
	$buttonSize        = $buttonOptions['buttonSize'] ?? '';

	// Prepare classes.
	$classes = "statistics-block {$layout} {$colourDisplay} {$columnLayout}";

	// Prepare id attribute.
	$id = ! empty( $anchor ) ? esc_attr( $anchor ) : '';

	// Combine wrapper attributes, excluding 'id' since we'll add it manually.
	$wrapper_attributes = get_block_wrapper_attributes( [
		'class' => $classes,
	] );

	if ( class_exists( 'Core' ) ) {
		$button_url = Core::get_instance()->get_correct_website_link( $button_url );
	}

	ob_start();
	?>

	<section <?= $id ? 'id="' . $id . '"' : ''; ?> <?= $wrapper_attributes; ?>>

		<div class="bnpp-container">

			<?php if ( $heading || $text || ( $button_text && $button_url ) ) : ?>
				<div class="statistics-block__content">
					<?php if ( $headingLevel === 2 ) : ?>
						<h2><?= esc_html( $heading ) ?></h2>
					<?php else : ?>
						<h3><?= esc_html( $heading ) ?></h3>
					<?php endif; ?>
					<p><?= $text ?></p>
					<?php include BNPP_CUSTOM_BLOCKS_ROOT . 'includes/components/button.php'; ?>
				</div>
			<?php endif; ?>
			<div class="statistics-block__statistics">
				<?= $content ?>
			</div>

		</div>

	</section>

	<?php
	return ob_get_clean();
}

/**
 * Register the block, its assets and its render callback.
 */
function bnpp_rebrand_statistics_bloc_register_block() {

	$url     = BNPP_REBRAND_STATISTICS_BLOC_URL;
	$version = BNPP_REBRAND_STATISTICS_BLOC_VERSION;

	// Editor script.
	wp_register_script(
		'bnpp-rebrand-statistics-bloc-editor',
		$url . 'assets/block.js',
		[ 'wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n' ],
		$version,
		true
	);

	// Shared dependency styles, kept as separate files so they can later be
	// extracted and reused globally by other components.
	wp_register_style(
		'bnpp-rebrand-statistics-bloc-css-variables',
		$url . 'assets/dependencies/css-variables.css',
		[],
		$version
	);

	wp_register_style(
		'bnpp-rebrand-statistics-bloc-breakpoints',
		$url . 'assets/dependencies/breakpoints.css',
		[],
		$version
	);

	wp_register_style(
		'bnpp-rebrand-statistics-bloc-mixins',
		$url . 'assets/dependencies/mixins.css',
		[],
		$version
	);

	$dependency_styles = [
		'bnpp-rebrand-statistics-bloc-css-variables',
		'bnpp-rebrand-statistics-bloc-breakpoints',
		'bnpp-rebrand-statistics-bloc-mixins',
	];

	// Front end style (loads with the block on the front end).
	wp_register_style(
		'bnpp-rebrand-statistics-bloc-style',
		$url . 'assets/block.css',
		$dependency_styles,
		$version
	);

	// Editor style.
	wp_register_style(
		'bnpp-rebrand-statistics-bloc-editor',
		$url . 'assets/editor.css',
		$dependency_styles,
		$version
	);

	// Front end only script (registered without a file, inline only).
	$view_js = <<<'JS'
window.addEventListener('load', function () {

	const statisticsBlockModules = document.querySelectorAll('.bnpp-statistics-module-number:not(.block-editor-rich-text__editable)');

	if (!statisticsBlockModules.length) {
		return;
	}

	const observer = new IntersectionObserver((entries) => {
		entries.forEach(entry => {
			if (entry.isIntersecting) {
				const statisticsBlockModule = entry.target;
				statisticsBlockModule.classList.add('active');
				observer.unobserve(statisticsBlockModule);
			}
		});
	}
	);
	statisticsBlockModules.forEach(statisticsBlockModule => {
		observer.observe(statisticsBlockModule);
	});

});
JS;

	wp_register_script( 'bnpp-rebrand-statistics-bloc-view', false, [], $version, true );
	wp_add_inline_script( 'bnpp-rebrand-statistics-bloc-view', $view_js );

	register_block_type(
		'bnpp-custom-blocks/bnpp-rebrand-statistics-bloc',
		[
			'api_version'     => 2,
			'editor_script'   => 'bnpp-rebrand-statistics-bloc-editor',
			'editor_style'    => 'bnpp-rebrand-statistics-bloc-editor',
			'view_style'      => 'bnpp-rebrand-statistics-bloc-style',
			'view_script'     => 'bnpp-rebrand-statistics-bloc-view',
			'render_callback' => 'bnpp_rebrand_statistics_bloc_render',
			'attributes'      => [
				'cover'         => [
					'type'    => 'string',
					'default' => '',
				],
				'colourDisplay' => [
					'type'    => 'string',
					'default' => 'light',
				],
				'layout'        => [
					'type'    => 'string',
					'default' => '',
				],
				'columnLayout'  => [
					'type'    => 'string',
					'default' => 'double',
				],
				'heading'       => [
					'type'    => 'string',
					'default' => '',
				],
				'headingLevel'  => [
					'type'    => 'number',
					'default' => 2,
				],
				'text'          => [
					'type'    => 'string',
					'default' => '',
				],
				'buttonOptions' => [
					'type'    => 'object',
					'default' => [
						'buttonText'        => '',
						'buttonUrl'         => '',
						'openInNewTab'      => '',
						'showButtonIcon'    => false,
						'buttonColorScheme' => 'primary',
						'buttonAriaLabel'   => '',
					],
				],
				'anchor'        => [
					'type'    => 'string',
					'default' => '',
				],
			],
		]
	);
}
add_action( 'init', 'bnpp_rebrand_statistics_bloc_register_block' );

/**
 * Register the "new-blocks" block category if it is not already registered,
 * so the block is visible in the inserter list.
 */
function bnpp_rebrand_statistics_bloc_register_category( $categories ) {

	foreach ( $categories as $category ) {
		if ( isset( $category['slug'] ) && 'new-blocks' === $category['slug'] ) {
			return $categories;
		}
	}

	$categories[] = [
		'slug'  => 'new-blocks',
		'title' => __( 'New Blocks', 'bnpp-custom-blocks' ),
	];

	return $categories;
}
add_filter( 'block_categories_all', 'bnpp_rebrand_statistics_bloc_register_category' );
