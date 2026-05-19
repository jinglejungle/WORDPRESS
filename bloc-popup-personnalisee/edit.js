import { TextControl, TextareaControl, ToggleControl } from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';

export default function Edit({ attributes, setAttributes }) {
  const { popupTitle, popupDescription, links } = attributes;

  // Mettre à jour un switch spécifique
  const updateLink = (index, newData) => {
    const updatedLinks = [...links];
    updatedLinks[index] = { ...updatedLinks[index], ...newData };
    setAttributes({ links: updatedLinks });
  };

  return (
    <>
      <InspectorControls>
        <PanelBody title="Paramètres Popup du Composant" initialOpen={true}>
          
          {/* Titre et description GLOBAUX */}
          <TextControl
            label="Titre de la popup (optionnel)"
            value={popupTitle}
            onChange={(value) => setAttributes({ popupTitle: value })}
            placeholder="Titre personnalisé..."
          />
          <TextareaControl
            label="Description de la popup (optionnel)"
            value={popupDescription}
            onChange={(value) => setAttributes({ popupDescription: value })}
            placeholder="Description personnalisée..."
          />

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
