<?php
/**
 * Server-side block registration for Campaign Block.
 *
 * @package CampaignBlock
 */

defined( 'ABSPATH' ) || exit;

/**
 * Registers the Campaign Block and its assets.
 */
function bnpp_campaign_register() {

    wp_register_script(
        'bnpp-campaign-editor',
        plugin_dir_url( dirname( __FILE__ ) ) . 'assets/block.js',
        array( 'wp-blocks', 'wp-block-editor', 'wp-components', 'wp-i18n', 'wp-element' ),
        filemtime( plugin_dir_path( dirname( __FILE__ ) ) . 'assets/block.js' ),
        true
    );

    wp_register_style(
        'bnpp-campaign-editor-style',
        plugin_dir_url( dirname( __FILE__ ) ) . 'assets/block.css',
        array(),
        filemtime( plugin_dir_path( dirname( __FILE__ ) ) . 'assets/block.css' )
    );

    wp_register_style(
        'bnpp-campaign-style',
        plugin_dir_url( dirname( __FILE__ ) ) . 'assets/block.css',
        array(),
        filemtime( plugin_dir_path( dirname( __FILE__ ) ) . 'assets/block.css' )
    );

    register_block_type( 'bnpp/campaign', array(
        'editor_script'   => 'bnpp-campaign-editor',
        'editor_style'    => 'bnpp-campaign-editor-style',
        'style'           => 'bnpp-campaign-style',
        'attributes'      => array(
            'title'          => array(
                'type'    => 'string',
                'default' => '',
            ),
            'description'    => array(
                'type'    => 'string',
                'default' => '',
            ),
            'imageUrl'       => array(
                'type'    => 'string',
                'default' => '',
            ),
            'imageId'        => array(
                'type'    => 'integer',
                'default' => 0,
            ),
            'imageAlt'       => array(
                'type'    => 'string',
                'default' => '',
            ),
            'imageAlign'     => array(
                'type'    => 'string',
                'default' => 'left',
            ),
        ),
        'render_callback' => 'bnpp_campaign_render',
    ) );
}
add_action( 'init', 'bnpp_campaign_register' );

/**
 * Server-side render callback (PHP).
 *
 * @param array $attributes Block attributes.
 * @return string Block HTML output.
 */
function bnpp_campaign_render( $attributes ) {

    $title       = isset( $attributes['title'] )      ? esc_html( $attributes['title'] )      : '';
    $description = isset( $attributes['description'] ) ? esc_html( $attributes['description'] ) : '';
    $image_url   = isset( $attributes['imageUrl'] )   ? esc_url( $attributes['imageUrl'] )    : '';
    $image_alt   = isset( $attributes['imageAlt'] )   ? esc_attr( $attributes['imageAlt'] )   : '';
    $image_align = isset( $attributes['imageAlign'] ) && $attributes['imageAlign'] === 'right' ? 'right' : 'left';

    $container_class   = 'campaign_container image-align-' . $image_align;
    $box_align_class   = $image_align === 'left' ? 'box-align-right' : 'box-align-left';

    ob_start();
    ?>
    <section class="<?php echo esc_attr( $container_class ); ?>" aria-label="<?php esc_attr_e( 'Campaign section', 'bnpp-campaign' ); ?>">

        <?php if ( $image_url ) : ?>
            <div class="campaign_image-wrapper" aria-hidden="true">
                <img
                    src="<?php echo $image_url; ?>"
                    alt="<?php echo $image_alt; ?>"
                    class="campaign_image"
                    loading="lazy"
                    decoding="async"
                />
            </div>
        <?php endif; ?>

        <div class="boxDescription <?php echo esc_attr( $box_align_class ); ?>">
            <?php if ( $title ) : ?>
                <h2 class="boxDescription__title"><?php echo $title; ?></h2>
            <?php endif; ?>
            <?php if ( $description ) : ?>
                <p class="boxDescription__text"><?php echo $description; ?></p>
            <?php endif; ?>
        </div>

    </section>
    <?php
    return ob_get_clean();
}
