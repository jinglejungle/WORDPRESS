<?php
/**
 * @package MonNamespace
 * 
 * Block rendering with custom popup
 * 
 * @var array $attributes Block attributes
 * @var array $content Block content
 */

$popup_title = $attributes['popupTitle'] ?? '';
$popup_description = $attributes['popupDescription'] ?? '';
$links = $attributes['links'] ?? [];
?>

<div class="mon-composant" 
     exit-data-popup-title="<?php echo esc_attr($popup_title); ?>"
     exit-data-popup-description="<?php echo esc_attr($popup_description); ?>">
  
  <?php foreach ($links as $index => $link): ?>
    <a href="<?php echo esc_url($link['url']); ?>" 
       class="mon-lien" 
       data-exit-popup="<?php echo $link['useCustomPopup'] ? 'true' : 'false'; ?>"
       target="_blank" 
       rel="noopener noreferrer">
      <?php echo esc_html($link['text']); ?>
    </a>
  <?php endforeach; ?>
</div>
