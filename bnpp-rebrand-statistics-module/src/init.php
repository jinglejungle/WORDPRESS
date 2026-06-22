<?php
/**
 * Registration and server side rendering for the Rebrand statistic Module block.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Render function for the statistics module.
 *
 * @param array  $attributes A clean associative array of block attributes.
 * @param string $content    The block inner HTML.
 * @param object $block      The block instance.
 * @return string
 */
function bnpp_rebrand_statistics_module_render( $attributes, $content = '', $block = null ) {

	[
		'title'         => $title,
		'displayType'   => $displayType,
		'statistic'     => $statistic,
		'prefixText'    => $prefixText,
		'statisticUnit' => $statisticUnit,
		'value'         => $value,
	] = $attributes;

	ob_start();
	?>

	<div <?= get_block_wrapper_attributes( [ 'class' => 'bnpp-statistics-module' ] ) ?>>

		<div class="bnpp-statistics-module-title-container">
			<?php if ( $displayType == 'default' ) : ?>

				<div class="head_info_stat"><?= $title ?></div>

			<?php else : ?>

				<div class="head_info_stat"><?= $prefixText ?: '' ?><span class="bnpp-statistics-module-number" style="--numberToAnimateTo: <?= $statistic ?>;"></span><?= $statisticUnit ?: '' ?></div>

			<?php endif; ?>
		</div>


		<?php if ( $value ) : ?>
			<p class="bnpp-statistics-module-value"><?= $value ?></p>
		<?php endif; ?>

	</div>

	<?php
	return ob_get_clean();
}

/**
 * Register the block, its assets and its render callback.
 */
function bnpp_rebrand_statistics_module_register_block() {

	wp_register_script(
		'bnpp-rebrand-statistics-module-editor',
		BNPP_REBRAND_STATISTICS_MODULE_URL . 'assets/block.js',
		[ 'wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n' ],
		BNPP_REBRAND_STATISTICS_MODULE_VERSION,
		true
	);

	wp_register_style(
		'bnpp-rebrand-statistics-module-style',
		BNPP_REBRAND_STATISTICS_MODULE_URL . 'assets/block.css',
		[],
		BNPP_REBRAND_STATISTICS_MODULE_VERSION
	);

	wp_register_style(
		'bnpp-rebrand-statistics-module-editor',
		BNPP_REBRAND_STATISTICS_MODULE_URL . 'assets/editor.css',
		[],
		BNPP_REBRAND_STATISTICS_MODULE_VERSION
	);

	// Front end only script that triggers the counter animation once the
	// element scrolls into view (registered without a file, inline only).
	$view_js = <<<'JS'
( function () {
	var elements = document.querySelectorAll( '.bnpp-statistics-module-number' );

	if ( ! elements.length ) {
		return;
	}

	if ( ! ( 'IntersectionObserver' in window ) ) {
		elements.forEach( function ( element ) {
			element.classList.add( 'active' );
		} );
		return;
	}

	var observer = new IntersectionObserver( function ( entries ) {
		entries.forEach( function ( entry ) {
			if ( entry.isIntersecting ) {
				entry.target.classList.add( 'active' );
				observer.unobserve( entry.target );
			}
		} );
	}, { threshold: 0.5 } );

	elements.forEach( function ( element ) {
		observer.observe( element );
	} );
} )();
JS;

	wp_register_script( 'bnpp-rebrand-statistics-module-view', false, [], BNPP_REBRAND_STATISTICS_MODULE_VERSION, true );
	wp_add_inline_script( 'bnpp-rebrand-statistics-module-view', $view_js );

	register_block_type(
		'bnpp-custom-blocks/bnpp-rebrand-statistics-module',
		[
			'api_version'     => 2,
			'editor_script'   => 'bnpp-rebrand-statistics-module-editor',
			'editor_style'    => 'bnpp-rebrand-statistics-module-editor',
			'view_style'      => 'bnpp-rebrand-statistics-module-style',
			'view_script'     => 'bnpp-rebrand-statistics-module-view',
			'render_callback' => 'bnpp_rebrand_statistics_module_render',
			'attributes'      => [
				'title'         => [
					'type'    => 'string',
					'default' => '',
				],
				'statisticUnit' => [
					'type'    => 'string',
					'default' => '',
				],
				'value'         => [
					'type'    => 'string',
					'default' => '',
				],
				'statistic'     => [
					'type'    => 'number',
					'default' => 0,
				],
				'prefixText'    => [
					'type'    => 'string',
					'default' => '',
				],
				'displayType'   => [
					'type'    => 'string',
					'default' => 'default',
					'enum'    => [ 'default', 'animated' ],
				],
			],
		]
	);
}
add_action( 'init', 'bnpp_rebrand_statistics_module_register_block' );
