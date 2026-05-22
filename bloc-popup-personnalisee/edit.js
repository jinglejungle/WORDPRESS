import { TextControl, TextareaControl, ToggleControl } from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';

// Constants
const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 650;

export default function Edit({ attributes, setAttributes }) {
  const { popupTitle, popupDescription, links } = attributes;

  // Update a specific switch
  const updateLink = (index, newData) => {
    const updatedLinks = [...links];
    updatedLinks[index] = { ...updatedLinks[index], ...newData };
    setAttributes({ links: updatedLinks });
  };

  // Handle title change with limit and truncation
  const handleTitleChange = (value) => {
    const truncated = value.substring(0, MAX_TITLE_LENGTH);
    const wasTruncated = value.length > MAX_TITLE_LENGTH;
    
    setAttributes({ 
      popupTitle: truncated,
      titleWasTruncated: wasTruncated
    });
  };

  // Handle description change with limit and truncation
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
        <PanelBody title="Popup Settings" initialOpen={true}>
          
          {/* Title with limit */}
          <div style={{ marginBottom: '20px' }}>
            <TextControl
              label="Popup title (optional)"
              value={popupTitle}
              onChange={handleTitleChange}
              placeholder="Custom title..."
              maxLength={MAX_TITLE_LENGTH}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <small style={{ color: '#666' }}>
                {titleLength} / {MAX_TITLE_LENGTH} characters
              </small>
              {attributes.titleWasTruncated && (
                <small style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                  ⚠️ Text truncated
                </small>
              )}
            </div>
            {titleRemaining <= 10 && titleRemaining > 0 && (
              <small style={{ color: '#f39c12' }}>
                {titleRemaining} character{titleRemaining > 1 ? 's' : ''} remaining
              </small>
            )}
          </div>

          {/* Description with limit */}
          <div style={{ marginBottom: '20px' }}>
            <TextareaControl
              label="Popup description (optional)"
              value={popupDescription}
              onChange={handleDescriptionChange}
              placeholder="Custom description..."
              rows={4}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <small style={{ color: '#666' }}>
                {descriptionLength} / {MAX_DESCRIPTION_LENGTH} characters
              </small>
              {attributes.descriptionWasTruncated && (
                <small style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                  ⚠️ Text truncated
                </small>
              )}
            </div>
            {descriptionRemaining <= 50 && descriptionRemaining > 0 && (
              <small style={{ color: '#f39c12' }}>
                {descriptionRemaining} character{descriptionRemaining > 1 ? 's' : ''} remaining
              </small>
            )}
          </div>

          <hr />
          <p><strong>Enable custom popup per link:</strong></p>

          {/* THE 5 SWITCHES - ONE PER LINK */}
          {links.map((link, index) => (
            <div key={link.id} style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <ToggleControl
                label={`Link ${index + 1}: ${link.text || 'No title'}`}
                checked={link.useCustomPopup}
                onChange={(value) => updateLink(index, { useCustomPopup: value })}
              />
            </div>
          ))}

        </PanelBody>

        <PanelBody title="Link Content">
          {/* Edit links (optional) */}
          {links.map((link, index) => (
            <div key={link.id} style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '4px' }}>
              <h4>Link {index + 1}</h4>
              <TextControl
                label="Link text"
                value={link.text}
                onChange={(value) => updateLink(index, { text: value })}
                placeholder="Text to display..."
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
        <h3>Links Preview</h3>
        {links.map((link, index) => (
          <div key={link.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
            <p><strong>Link {index + 1}:</strong> {link.text || '(no title)'}</p>
            <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>
              URL: {link.url || '(not set)'}
            </p>
            <p style={{ fontSize: '12px', color: link.useCustomPopup ? '#2ecc71' : '#e74c3c', margin: '5px 0' }}>
              Custom popup: {link.useCustomPopup ? '✅ Enabled' : '❌ Disabled'}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
