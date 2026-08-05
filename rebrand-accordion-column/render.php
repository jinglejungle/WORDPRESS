<?php
/**
 * Render function for a single Accordion Column (one list of accordion modules).
 * @param   array $attributes - A clean associative array of block attributes.
 * @param   array $block - All the block settings and attributes.
 * @param   string $content - The block inner HTML (the accordion modules).
 */

$wrapper_attributes = get_block_wrapper_attributes([
    'class' => 'rebrand-accordion-column',
]);

?>

<div <?= $wrapper_attributes; ?>>
    <?= $content ?>
</div>
