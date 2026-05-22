/**
 * Exit popup handler for external links
 * Uses exit-data-popup-* attributes to customize popups
 */

document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (!link) return;
  
  if (isExternalLink(link.href)) {
    e.preventDefault();
    
    // Get the switch from the link itself
    const useCustom = link.dataset.exitPopup === 'true';
    
    let title, description;
    
    if (useCustom) {
      // Get parent component to retrieve title/description
      const composant = link.closest('[exit-data-popup-title]');
      title = composant?.dataset.exitDataPopupTitle || window.globalPopupConfig?.title;
      description = composant?.dataset.exitDataPopupDescription || window.globalPopupConfig?.description;
    } else {
      // Use global settings
      title = window.globalPopupConfig?.title || 'Warning';
      description = window.globalPopupConfig?.description || 'You are about to leave the site';
    }
    
    showPopup(title, description, link.href);
  }
});

/**
 * Display popup with title and description
 * @param {string} title - The popup title
 * @param {string} description - The popup description
 * @param {string} url - The target URL
 */
function showPopup(title, description, url) {
  console.log('=== EXIT POPUP ===');
  console.log('Title:', title);
  console.log('Description:', description);
  console.log('URL:', url);
  console.log('==================');
  
  // REPLACE with your existing popup logic
  // Examples:
  // - Display a modal
  // - Display a custom dialog
  // - Redirect after confirmation
  // etc.
  
  if (confirm(`${title}\n\n${description}`)) {
    window.open(url, '_blank');
  }
}

/**
 * Check if a link is external
 * @param {string} href - The URL to check
 * @returns {boolean}
 */
function isExternalLink(href) {
  try {
    const linkUrl = new URL(href);
    const currentUrl = new URL(window.location.href);
    return linkUrl.hostname !== currentUrl.hostname;
  } catch {
    return false;
  }
}

/**
 * Default global configuration
 * Customize as needed
 */
if (!window.globalPopupConfig) {
  window.globalPopupConfig = {
    title: 'You are leaving the site',
    description: 'You are about to leave our site. Are you sure?'
  };
}
