<?php
/**
 * Render function for the Accordion Block.
* @param   array $attributes - A clean associative array of block attributes.
* @param   array $block - All the block settings and attributes.
* @param   string $content - The block inner HTML (usually empty unless using inner blocks).
*/

[
    'colourDisplay' => $colourDisplay,
    'anchor'    => $anchor,
    'fullWidth' => $fullWidth,
] = $attributes;

// Prepare classes
$classes = "rebrand-accordion-block {$colourDisplay}";

// Add full width class if applicable
if ( $fullWidth ) {
    $classes .= ' full-width';
}

// Prepare id attribute
$id = ! empty( $anchor ) ? esc_attr( $anchor ) : '';

// Combine wrapper attributes, excluding 'id' since we'll add it manually
$wrapper_attributes = get_block_wrapper_attributes([
    'class' => $classes,
]);

?>

<section <?= $id ? 'id="' . $id . '"' : ''; ?> <?= $wrapper_attributes; ?>>

    <div class="bnpp-container">

        <div class="rebrand-accordion-block__list">
            <?= $content ?>
        </div>

    </div>
    
</section>