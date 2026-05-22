import { TextControl, TextareaControl, ToggleControl } from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';

// Constantes
const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 650;

export default function Edit({ attributes, setAttributes }) {
  const { popupTitle, popupDescription, links } = attributes;

  // Mettre à jour un switch spécifique
  const updateLink = (index, newData) => {
    const updatedLinks = [...links];
    updatedLinks[index] = { ...updatedLinks[index], ...newData };
    setAttributes({ links: updatedLinks });
  };

  // Gérer le changement de titre avec limite et troncature
  const handleTitleChange = (value) => {
    const truncated = value.substring(0, MAX_TITLE_LENGTH);
    const wasTruncated = value.length > MAX_TITLE_LENGTH;
    
    setAttributes({ 
      popupTitle: truncated,
      titleWasTruncated: wasTruncated
    });
  };

  // Gérer le changement de description avec limite et troncature
  const handleDescriptionChange = (value) => {
    const truncated = value.substring(0, MAX_DESCRIPTION_LENGTH);
    const wasTruncated = value.length > MAX_DESCRIPTION_LENGTH;
    
    setAttributes({ 
      popupDescription: truncated,
      descriptionWasTruncated: wasTruncated
    });
  };

  const titleLength = popupTitle?.length || 0;
  const descriptionLength = popupDescription?.length || 0;
  const titleRemaining = MAX_TITLE_LENGTH - titleLength;
  const descriptionRemaining = MAX_DESCRIPTION_LENGTH - descriptionLength;

  return (
    <>
      <InspectorControls>
        <PanelBody title="Paramètres Popup du Composant" initialOpen={true}>
          
          {/* Titre avec limite */}
          <div style={{ marginBottom: '20px' }}>
            <TextControl
              label="Titre de la popup (optionnel)"
              value={popupTitle}
              onChange={handleTitleChange}
              placeholder="Titre personnalisé..."
              maxLength={MAX_TITLE_LENGTH}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <small style={{ color: '#666' }}>
                {titleLength} / {MAX_TITLE_LENGTH} caractères
              </small>
              {attributes.titleWasTruncated && (
                <small style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                  ⚠️ Texte tronqué
                </small>
              )}
            </div>
            {titleRemaining <= 10 && titleRemaining > 0 && (
              <small style={{ color: '#f39c12' }}>
                {titleRemaining} caractère{titleRemaining > 1 ? 's' : ''} restant{titleRemaining > 1 ? 's' : ''}
              </small>
            )}
          </div>

          {/* Description avec limite */}
          <div style={{ marginBottom: '20px' }}>
            <TextareaControl
              label="Description de la popup (optionnel)"
              value={popupDescription}
              onChange={handleDescriptionChange}
              placeholder="Description personnalisée..."
              rows={4}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <small style={{ color: '#666' }}>
                {descriptionLength} / {MAX_DESCRIPTION_LENGTH} caractères
              </small>
              {attributes.descriptionWasTruncated && (
                <small style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                  ⚠️ Texte tronqué
                </small>
              )}
            </div>
            {descriptionRemaining <= 50 && descriptionRemaining > 0 && (
              <small style={{ color: '#f39c12' }}>
                {descriptionRemaining} caractère{descriptionRemaining > 1 ? 's' : ''} restant{descriptionRemaining > 1 ? 's' : ''}
              </small>
            )}
          </div>

          <hr />
          <p><strong>Activer la popup personnalisée par lien :</strong></p>

          {/* LES 5 SWITCHS - UN PAR LIEN */}
          {links.map((link, index) => (
            <div key={link.id} style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <ToggleControl
                label={`Lien ${index + 1} : ${link.text || 'Sans titre'}`}
                checked={link.useCustomPopup}
                onChange={(value) => updateLink(index, { useCustomPopup: value })}
              />
            </div>
          ))}

        </PanelBody>

        <PanelBody title="Contenu des Liens">
          {/* Édition des liens (optionnel) */}
          {links.map((link, index) => (
            <div key={link.id} style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '4px' }}>
              <h4>Lien {index + 1}</h4>
              <TextControl
                label="Texte du lien"
                value={link.text}
                onChange={(value) => updateLink(index, { text: value })}
                placeholder="Texte à afficher..."
              />
              <TextControl
                label="URL"
                value={link.url}
                onChange={(value) => updateLink(index, { url: value })}
                placeholder="https://..."
                type="url"
              />
            </div>
          ))}
        </PanelBody>
      </InspectorControls>

      <div className="mon-bloc-edit">
        <h3>Aperçu des 5 liens</h3>
        {links.map((link, index) => (
          <div key={link.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
            <p><strong>Lien {index + 1}:</strong> {link.text || '(sans titre)'}</p>
            <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>
              URL: {link.url || '(non définie)'}
            </p>
            <p style={{ fontSize: '12px', color: link.useCustomPopup ? '#2ecc71' : '#e74c3c', margin: '5px 0' }}>
              Popup personnalisée : {link.useCustomPopup ? '✅ Activée' : '❌ Désactivée'}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
