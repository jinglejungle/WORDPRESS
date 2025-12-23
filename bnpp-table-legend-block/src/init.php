<?php
/**
 * Block initialization
 */

// Security: prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register custom block category
 */
function bnpp_table_legend_block_category($categories) {
    return array_merge(
        $categories,
        array(
            array(
                'slug' => 'bnpp-blocks',
                'title' => 'BNPP Blocks',
            ),
        )
    );
}
add_filter('block_categories_all', 'bnpp_table_legend_block_category', 10, 1);

/**
 * Register the block
 */
function register_bnpp_table_legend_block() {
    // Register JavaScript script
    wp_register_script(
        'bnpp-table-legend-block-editor',
        BNPP_TABLE_LEGEND_BLOCK_URL . 'src/assets/block.js',
        array('wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components'),
        BNPP_TABLE_LEGEND_BLOCK_VERSION,
        false
    );

    // Register CSS style
    wp_register_style(
        'bnpp-table-legend-block-style',
        BNPP_TABLE_LEGEND_BLOCK_URL . 'src/assets/block.css',
        array(),
        BNPP_TABLE_LEGEND_BLOCK_VERSION
    );

    // Register block type
    register_block_type('bnpp/table-legend', array(
        'editor_script' => 'bnpp-table-legend-block-editor',
        'editor_style' => 'bnpp-table-legend-block-style',
        'style' => 'bnpp-table-legend-block-style',
        'render_callback' => 'render_bnpp_table_legend_block',
        'attributes' => array(
            'showLegend' => array(
                'type' => 'boolean',
                'default' => true,
            ),
            'rows' => array(
                'type' => 'array',
                'default' => array(
                    array('col1' => '', 'col2' => '', 'col3' => '', 'color' => '')
                ),
            ),
        ),
    ));
}
add_action('init', 'register_bnpp_table_legend_block');

/**
 * Server-side rendering function (front-end)
 */
function render_bnpp_table_legend_block($attributes) {
    $show_legend = isset($attributes['showLegend']) ? $attributes['showLegend'] : true;
    $rows = isset($attributes['rows']) ? $attributes['rows'] : array(
        array('col1' => '', 'col2' => '', 'col3' => '', 'color' => '')
    );
    
    ob_start();
    ?>
    <div class="bnpp-table-legend-block">
        <?php if ($show_legend): ?>
        <div class="bnpp-table-legend">
            <strong>Table Legend:</strong><br>
            This is a static legend that explains the content of the table below.
        </div>
        <?php endif; ?>
        
        <table class="bnpp-custom-table">
            <thead>
                <tr class="bnpp-header-row">
                    <th>Column 1</th>
                    <th>Column 2</th>
                    <th>Column 3</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($rows as $row): ?>
                <tr class="bnpp-content-row">
                    <td><?php echo esc_html($row['col1']); ?></td>
                    <td style="background-color: <?php echo esc_attr($row['color']); ?>;">
                        <?php echo esc_html($row['col2']); ?>
                    </td>
                    <td><?php echo esc_html($row['col3']); ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
    <?php
    return ob_get_clean();
}