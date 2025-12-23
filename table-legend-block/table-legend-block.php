<?php
/**
 * Plugin Name: Tableau avec Légende
 * Description: Un bloc WordPress pour créer un tableau avec une légende affichable/masquable
 * Version: 1.0
 * Author: Votre Nom
 */

// Empêcher l'accès direct
if (!defined('ABSPATH')) {
    exit;
}

// Enregistrer le bloc
function register_table_legend_block() {
    // Enregistrer le script du bloc
    wp_register_script(
        'table-legend-block',
        plugins_url('block.js', __FILE__),
        array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-i18n'),
        filemtime(plugin_dir_path(__FILE__) . 'block.js')
    );

    // Enregistrer les styles pour l'éditeur
    wp_register_style(
        'table-legend-editor-style',
        plugins_url('editor-style.css', __FILE__),
        array('wp-edit-blocks'),
        filemtime(plugin_dir_path(__FILE__) . 'editor-style.css')
    );

    // Enregistrer les styles pour le frontend
    wp_register_style(
        'table-legend-style',
        plugins_url('style.css', __FILE__),
        array(),
        filemtime(plugin_dir_path(__FILE__) . 'style.css')
    );

    // Enregistrer le bloc
    register_block_type('custom/table-legend', array(
        'editor_script' => 'table-legend-block',
        'editor_style' => 'table-legend-editor-style',
        'style' => 'table-legend-style',
        'render_callback' => 'render_table_legend_block',
        'attributes' => array(
            'showLegend' => array(
                'type' => 'boolean',
                'default' => true,
            ),
            'rows' => array(
                'type' => 'array',
                'default' => array(
                    array(
                        'col1' => '',
                        'col2' => '',
                        'col3' => '',
                        'color' => ''
                    )
                ),
            ),
        ),
    ));
}
add_action('init', 'register_table_legend_block');

// Fonction de rendu du bloc
function render_table_legend_block($attributes) {
    $show_legend = isset($attributes['showLegend']) ? $attributes['showLegend'] : true;
    $rows = isset($attributes['rows']) ? $attributes['rows'] : array(
        array('col1' => '', 'col2' => '', 'col3' => '', 'color' => '')
    );

    ob_start();
    ?>
    <div class="table-legend-block">
        <?php if ($show_legend): ?>
            <div class="table-legend">
                <strong>Légende :</strong> Ce tableau présente des informations importantes organisées en colonnes.
            </div>
        <?php endif; ?>
        
        <table class="custom-table">
            <thead>
                <tr class="header-row">
                    <th>Colonne 1</th>
                    <th>Colonne 2</th>
                    <th>Colonne 3</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($rows as $row): ?>
                    <tr class="content-row">
                        <td><?php echo esc_html($row['col1']); ?></td>
                        <td class="color-cell" style="background-color: <?php echo esc_attr($row['color']); ?>">
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