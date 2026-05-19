/**
 * Gestionnaire de popups pour les liens externes
 * Utilise les attributs exit-data-popup-* pour personnaliser les popups
 */

document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (!link) return;
  
  if (isExternalLink(link.href)) {
    e.preventDefault();
    
    // Chercher le bloc qui contient le lien
    const bloc = link.closest('[exit-data-use-custom-popup]');
    const useCustom = bloc?.dataset.exitDataUseCustomPopup === 'true';
    
    let title, description;
    
    if (useCustom) {
      // Chercher le composant parent pour récupérer titre/description
      const composant = link.closest('[exit-data-popup-title]');
      title = composant?.dataset.exitDataPopupTitle || window.globalPopupConfig?.title;
      description = composant?.dataset.exitDataPopupDescription || window.globalPopupConfig?.description;
    } else {
      // Utiliser les paramètres globaux
      title = window.globalPopupConfig?.title || 'Attention';
      description = window.globalPopupConfig?.description || 'Vous allez quitter le site';
    }
    
    showPopup(title, description, link.href);
  }
});

/**
 * Affiche la popup avec le titre et la description
 * @param {string} title - Le titre de la popup
 * @param {string} description - La description de la popup
 * @param {string} url - L'URL cible
 */
function showPopup(title, description, url) {
  console.log('=== POPUP EXIT ===');
  console.log('Titre:', title);
  console.log('Description:', description);
  console.log('URL:', url);
  console.log('==================');
  
  // À REMPLACER avec votre logique de popup existante
  // Exemple :
  // - Afficher une modal
  // - Afficher un dialog personnalisé
  // - Rediriger après confirmation
  // etc.
  
  if (confirm(`${title}\n\n${description}`)) {
    window.open(url, '_blank');
  }
}

/**
 * Vérifie si un lien est externe
 * @param {string} href - L'URL à vérifier
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
 * Configuration globale par défaut
 * À personnaliser selon vos besoins
 */
if (!window.globalPopupConfig) {
  window.globalPopupConfig = {
    title: 'Vous quittez le site',
    description: 'Vous êtes sur le point de quitter notre site. Êtes-vous sûr ?'
  };
}
