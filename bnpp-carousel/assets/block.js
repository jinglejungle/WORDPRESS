/**
 * BNPP Carousel Block - Complete rewrite
 * Pure Vanilla JavaScript with Gutenberg InspectorControls
 * Inline editing, character limits, play/pause, and autoplay
 */

(function() {
	'use strict';

	// ==========================================
	// GUTENBERG EDITOR BLOCK
	// ==========================================
	
	if (typeof wp !== 'undefined' && wp.blocks) {
		wp.blocks.registerBlockType('bnpp/carousel-homepage', {
			title: 'BNPP Carousel Homepage',
			icon: 'images-alt2',
			category: 'media',
			keywords: ['carousel', 'slider', 'gallery'],
			description: 'A responsive carousel block with up to 3 slides',

			/**
			 * Block edit function
			 */
			edit: function(props) {
				var attributes = props.attributes;
				var setAttributes = props.setAttributes;
				var slides = attributes.slides || [];
				var activeSlide = attributes.activeSlide || 0;
				var autoPlayDuration = attributes.autoPlayDuration || 4;
				var showPlayButton = attributes.showPlayButton !== undefined ? attributes.showPlayButton : true;
				var enableAutoPlay = attributes.enableAutoPlay !== undefined ? attributes.enableAutoPlay : false;
				var activeEditSection = attributes.activeEditSection || null;

				// Ensure 3 slides
				var normalizedSlides = slides.slice();
				while (normalizedSlides.length < 3) {
					normalizedSlides.push({
						id: normalizedSlides.length,
						title: 'Slide ' + (normalizedSlides.length + 1),
						description: 'Add your description here',
						imageId: 0,
						imageUrl: '',
						buttonUrl: '',
						buttonText: 'Button content...',
						buttonStyle: 'primary',
						buttonTarget: false,
					});
				}

				if (normalizedSlides.length !== slides.length) {
					setAttributes({ slides: normalizedSlides });
				}

				var updateSlide = function(slideIndex, fieldName, value) {
					var updatedSlides = normalizedSlides.map(function(slide, i) {
						if (i === slideIndex) {
							var updated = Object.assign({}, slide);
							updated[fieldName] = value;
							return updated;
						}
						return slide;
					});
					setAttributes({ slides: updatedSlides });
				};

				var setActiveSlideHandler = function(index) {
					setAttributes({ activeSlide: index });
				};

				var onSelectImage = function(media, slideIndex) {
					if (!media || !media.url) {
						updateSlide(slideIndex, 'imageId', 0);
						updateSlide(slideIndex, 'imageUrl', '');
						return;
					}
					updateSlide(slideIndex, 'imageId', media.id);
					updateSlide(slideIndex, 'imageUrl', media.url);
				};

				var removeImage = function(slideIndex) {
					updateSlide(slideIndex, 'imageId', 0);
					updateSlide(slideIndex, 'imageUrl', '');
				};

				var handleTitleChange = function(slideIndex, value) {
					if (value.length > 70) {
						value = value.substring(0, 70);
					}
					updateSlide(slideIndex, 'title', value);
				};

				var handleDescriptionChange = function(slideIndex, value) {
					if (value.length > 100) {
						value = value.substring(0, 100);
					}
					updateSlide(slideIndex, 'description', value);
				};

				var currentSlideData = normalizedSlides[activeSlide] || normalizedSlides[0];
				var showButton = currentSlideData.buttonUrl && currentSlideData.buttonText !== 'Button content...';

				return wp.element.createElement(
					wp.element.Fragment,
					null,

					// CAROUSEL PREVIEW
					wp.element.createElement(
						'div',
						{ style: { position: 'relative' } },
						
						wp.element.createElement(
							'div',
							{
								className: 'bnpp-carousel-container',
								style: {
									position: 'relative',
									width: '100%',
									maxWidth: '1920px',
									height: '640px',
									backgroundColor: '#f5f5f5',
									overflow: 'hidden',
									margin: '0 auto',
									border: '2px solid #0066cc',
								},
							},
							
							// SLIDES
							normalizedSlides.map(function(slide, slideIndex) {
								var isActive = slideIndex === activeSlide;
								var slideShowButton = slide.buttonUrl && slide.buttonText !== 'Button content...';

								return wp.element.createElement(
									'div',
									{
										key: 'slide-' + slideIndex,
										className: 'diapositive' + (isActive ? ' active' : ''),
										onClick: function() { setActiveSlideHandler(slideIndex); },
										style: {
											position: 'absolute',
											top: 0,
											left: 0,
											width: '100%',
											height: '100%',
											opacity: isActive ? 1 : 0,
											transition: 'opacity 0.3s ease',
											backgroundImage: slide.imageUrl ? 'url(' + slide.imageUrl + ')' : 'none',
											backgroundSize: 'cover',
											backgroundPosition: 'center',
											zIndex: isActive ? 10 : 1,
											border: isActive ? '3px solid #0066cc' : '1px solid #ccc',
										},
									},
									
									// Description box with title inside
									wp.element.createElement(
										'div',
										{
											className: 'diapositive-description',
											onClick: function(e) {
												e.stopPropagation();
												setActiveSlideHandler(slideIndex);
											},
											style: {
												position: 'absolute',
												top: '180px',
												left: '40px',
												width: '689px',
												maxHeight: '285px',
												backgroundColor: 'rgba(255, 255, 255, 0.95)',
												padding: '20px',
												boxSizing: 'border-box',
												borderRadius: '4px',
												zIndex: 20,
												cursor: 'pointer',
												border: isActive ? '2px solid #0066cc' : 'none',
												boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
											},
										},
										
										// TITLE (editable, 70 chars)
										wp.element.createElement(
											'h3',
											{
												contentEditable: 'true',
												suppressContentEditableWarning: true,
												onBlur: function(e) {
													handleTitleChange(slideIndex, e.currentTarget.textContent);
												},
												onKeyDown: function(e) {
													if (e.key === 'Enter') {
														e.preventDefault();
														e.currentTarget.blur();
													}
													if (e.currentTarget.textContent.length >= 70 && e.key !== 'Backspace' && e.key !== 'Delete') {
														e.preventDefault();
													}
												},
												onInput: function(e) {
													var text = e.currentTarget.textContent;
													if (text.length > 70) {
														e.currentTarget.textContent = text.substring(0, 70);
													}
												},
												onPaste: function(e) {
													e.preventDefault();
													var text = (e.clipboardData || window.clipboardData).getData('text');
													if (text.length > 70) {
														alert('Title limited to 70 characters. Text has been truncated.');
														text = text.substring(0, 70);
													}
													document.execCommand('insertText', false, text);
												},
												onClick: function(e) {
													e.stopPropagation();
												},
												style: {
													margin: '0 0 12px 0',
													fontSize: '24px',
													fontWeight: '600',
													color: '#333',
													outline: 'none',
													minHeight: '30px',
												},
											},
											slide.title
										),
										
										// DESCRIPTION (editable, 100 chars)
										wp.element.createElement(
											'p',
											{
												contentEditable: 'true',
												suppressContentEditableWarning: true,
												onBlur: function(e) {
													handleDescriptionChange(slideIndex, e.currentTarget.textContent);
												},
												onKeyDown: function(e) {
													if (e.currentTarget.textContent.length >= 100 && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Enter') {
														e.preventDefault();
													}
												},
												onInput: function(e) {
													var text = e.currentTarget.textContent;
													if (text.length > 100) {
														e.currentTarget.textContent = text.substring(0, 100);
													}
												},
												onPaste: function(e) {
													e.preventDefault();
													var text = (e.clipboardData || window.clipboardData).getData('text');
													if (text.length > 100) {
														alert('Description limited to 100 characters. Text has been truncated.');
														text = text.substring(0, 100);
													}
													document.execCommand('insertText', false, text);
												},
												onClick: function(e) {
													e.stopPropagation();
												},
												style: {
													margin: 0,
													fontSize: '14px',
													color: '#666',
													lineHeight: '1.5',
													outline: 'none',
													minHeight: '20px',
												},
											},
											slide.description
										)
									),
									
									// BUTTON (shown if URL + text provided, or placeholder button)
									wp.element.createElement(
										'div',
										{
											style: {
												position: 'absolute',
												top: '525px',
												left: '40px',
												zIndex: 20,
											},
											onClick: function(e) {
												e.stopPropagation();
												setActiveSlideHandler(slideIndex);
												setAttributes({ activeEditSection: 'button' });
											},
										},
										slideShowButton ? wp.element.createElement(
											'a',
											{
												className: 'bnpp-button ' + (slide.buttonStyle || 'primary'),
												href: '#',
												onClick: function(e) {
													e.preventDefault();
													e.stopPropagation();
												},
												contentEditable: 'true',
												suppressContentEditableWarning: true,
												onBlur: function(e) {
													updateSlide(slideIndex, 'buttonText', e.currentTarget.textContent);
												},
												onKeyDown: function(e) {
													if (e.key === 'Enter') {
														e.preventDefault();
														e.currentTarget.blur();
													}
												},
												onClick: function(e) {
													e.stopPropagation();
													setAttributes({ activeEditSection: 'button' });
												},
												style: {
													display: 'inline-block',
													padding: '12px 24px',
													textDecoration: 'none',
													borderRadius: '4px',
													fontSize: '14px',
													fontWeight: '600',
													cursor: 'text',
													outline: 'none',
												},
											},
											slide.buttonText
										) : wp.element.createElement(
											'button',
											{
												onClick: function(e) {
													e.preventDefault();
													e.stopPropagation();
													updateSlide(slideIndex, 'buttonUrl', '#');
													updateSlide(slideIndex, 'buttonText', 'Button content...');
													setAttributes({ activeEditSection: 'button' });
												},
												style: {
													padding: '12px 24px',
													backgroundColor: '#e0e0e0',
													color: '#666',
													border: '2px dashed #999',
													borderRadius: '4px',
													cursor: 'pointer',
													fontSize: '14px',
													fontWeight: '600',
													transition: 'all 0.2s ease',
												},
											},
											'+ Add Button'
										)
									)
								);
							}),
							
							// TITLE INDICATORS
							wp.element.createElement(
								'div',
								{
									className: 'bnpp-carousel-titles',
									style: {
										position: 'absolute',
										bottom: 0,
										left: 0,
										right: 0,
										height: '154px',
										backgroundColor: '#f5f5f5',
										display: 'flex',
										alignItems: 'stretch',
										zIndex: 15,
										marginTop: '-154px',
									},
								},
								normalizedSlides.map(function(slide, index) {
									var isActive = index === activeSlide;
									return wp.element.createElement(
										'div',
										{
											key: 'title-' + index,
											className: 'bnpp-carousel-title-item' + (isActive ? ' active' : ''),
											onClick: function() { setActiveSlideHandler(index); },
											style: {
												flex: 1,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												padding: '20px',
												textAlign: 'center',
												cursor: 'pointer',
												backgroundColor: isActive ? '#ffffff' : '#ececec',
												border: '1px solid #ddd',
												borderLeft: isActive ? '4px solid #0066cc' : '1px solid #ddd',
												fontSize: '16px',
												fontWeight: isActive ? '700' : '600',
												color: isActive ? '#0066cc' : '#333',
												userSelect: 'none',
												marginLeft: index === 0 ? '286px' : '0',
												paddingLeft: isActive ? '16px' : '20px',
											},
										},
										slide.title
									);
								})
							),
							
							// PLAY/PAUSE BUTTON (if showPlayButton enabled)
							showPlayButton ? wp.element.createElement(
								'button',
								{
									style: {
										position: 'absolute',
										top: '10px',
										right: '10px',
										padding: '8px 12px',
										backgroundColor: enableAutoPlay ? '#cc0000' : '#0066cc',
										color: '#ffffff',
										border: 'none',
										borderRadius: '4px',
										cursor: 'pointer',
										fontSize: '12px',
										fontWeight: '600',
										zIndex: 30,
										transition: 'background-color 0.2s ease',
									},
								},
								enableAutoPlay ? '⏸ Pause' : '▶ Play'
							) : null
						)
					),

					// INSPECTOR CONTROLS
					wp.blockEditor.InspectorControls && wp.element.createElement(
						wp.blockEditor.InspectorControls,
						null,
						
						// SLIDE SELECTOR
						wp.element.createElement(
							'div',
							{ style: { padding: '15px', borderBottom: '1px solid #e0e0e0' } },
							wp.element.createElement(
								'h3',
								{ style: { margin: '0 0 10px 0', fontSize: '13px', fontWeight: '600', color: '#333' } },
								'Slide Settings'
							),
							wp.element.createElement(
								'div',
								{ style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
								normalizedSlides.map(function(slide, index) {
									return wp.element.createElement(
										'button',
										{
											key: 'btn-' + index,
											onClick: function() { setActiveSlideHandler(index); },
											style: {
												flex: '1',
												minWidth: '60px',
												padding: '8px 12px',
												backgroundColor: index === activeSlide ? '#0066cc' : '#e0e0e0',
												color: index === activeSlide ? '#ffffff' : '#333',
												border: index === activeSlide ? '2px solid #0066cc' : '2px solid #ccc',
												borderRadius: '4px',
												cursor: 'pointer',
												fontSize: '12px',
												fontWeight: index === activeSlide ? '600' : 'normal',
											},
										},
										'Slide ' + (index + 1)
									);
								})
							)
						),
						
						// TITLE
						wp.element.createElement(
							'div',
							{ style: { padding: '15px', borderBottom: '1px solid #e0e0e0' } },
							wp.element.createElement(
								'label',
								{ style: { display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '600', color: '#333', textTransform: 'uppercase' } },
								'Title (Max 70)'
							),
							wp.element.createElement(
								'input',
								{
									type: 'text',
									value: currentSlideData.title,
									onChange: function(e) {
										var value = e.target.value.substring(0, 70);
										handleTitleChange(activeSlide, value);
										e.target.value = value;
									},
									style: {
										width: '100%',
										padding: '6px 8px',
										border: '1px solid #ccc',
										borderRadius: '3px',
										fontSize: '12px',
										boxSizing: 'border-box',
										marginBottom: '5px',
									},
								}
							),
							wp.element.createElement(
								'small',
								{ style: { fontSize: '11px', color: '#999' } },
								currentSlideData.title.length + ' / 70'
							)
						),
						
						// DESCRIPTION
						wp.element.createElement(
							'div',
							{ style: { padding: '15px', borderBottom: '1px solid #e0e0e0' } },
							wp.element.createElement(
								'label',
								{ style: { display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '600', color: '#333', textTransform: 'uppercase' } },
								'Description (Max 100)'
							),
							wp.element.createElement(
								'textarea',
								{
									value: currentSlideData.description,
									onChange: function(e) {
										var value = e.target.value.substring(0, 100);
										handleDescriptionChange(activeSlide, value);
										e.target.value = value;
									},
									style: {
										width: '100%',
										padding: '6px 8px',
										border: '1px solid #ccc',
										borderRadius: '3px',
										fontSize: '12px',
										boxSizing: 'border-box',
										fontFamily: 'inherit',
										resize: 'vertical',
										minHeight: '60px',
										marginBottom: '5px',
									},
								}
							),
							wp.element.createElement(
								'small',
								{ style: { fontSize: '11px', color: '#999' } },
								currentSlideData.description.length + ' / 100'
							)
						),
						
						// BACKGROUND IMAGE
						wp.element.createElement(
							'div',
							{ style: { padding: '15px', borderBottom: '1px solid #e0e0e0' } },
							wp.element.createElement(
								'h3',
								{ style: { margin: '0 0 10px 0', fontSize: '12px', fontWeight: '600', color: '#333', textTransform: 'uppercase' } },
								'Background Image'
							),
							wp.element.createElement(
								'div',
								{
									style: {
										position: 'relative',
										width: '100%',
										height: '100px',
										backgroundColor: '#f5f5f5',
										border: currentSlideData.imageUrl ? '2px solid #0066cc' : '2px dashed #ccc',
										borderRadius: '3px',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										marginBottom: '10px',
										overflow: 'hidden',
										fontSize: '11px',
										color: '#666',
									},
								},
								currentSlideData.imageUrl ? wp.element.createElement(
									'img',
									{
										src: currentSlideData.imageUrl,
										alt: 'Background',
										style: { maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' },
									}
								) : 'No image'
							),
							wp.element.createElement(
								'button',
								{
									onClick: function() {
										if (wp.media) {
											var frame = wp.media({
												title: 'Select Image',
												button: { text: 'Use' },
												multiple: false,
												library: { type: 'image' },
											});
											frame.on('select', function() {
												var attachment = frame.state().get('selection').first().toJSON();
												if (attachment && attachment.url) {
													onSelectImage(attachment, activeSlide);
												}
											});
											frame.open();
										}
									},
									style: {
										width: '100%',
										padding: '6px 8px',
										backgroundColor: '#0066cc',
										color: '#ffffff',
										border: 'none',
										borderRadius: '3px',
										cursor: 'pointer',
										fontSize: '12px',
										fontWeight: '600',
										marginBottom: currentSlideData.imageUrl ? '8px' : '0',
									},
								},
								currentSlideData.imageUrl ? 'Change' : 'Upload'
							),
							currentSlideData.imageUrl ? wp.element.createElement(
								'button',
								{
									onClick: function() { removeImage(activeSlide); },
									style: {
										width: '100%',
										padding: '6px 8px',
										backgroundColor: '#e0e0e0',
										color: '#cc0000',
										border: 'none',
										borderRadius: '3px',
										cursor: 'pointer',
										fontSize: '12px',
										fontWeight: '600',
									},
								},
								'Remove'
							) : null
						),
						
						// BUTTON SETTINGS (highlighted when editing button)
						wp.element.createElement(
							'div',
							{
								style: {
									padding: '15px',
									borderBottom: '1px solid #e0e0e0',
									backgroundColor: activeEditSection === 'button' ? '#e3f2fd' : '#ffffff',
									border: activeEditSection === 'button' ? '2px solid #0066cc' : '1px solid #e0e0e0',
								},
							},
							wp.element.createElement(
								'h3',
								{ style: { margin: '0 0 10px 0', fontSize: '12px', fontWeight: '600', color: '#333', textTransform: 'uppercase' } },
								'Button Settings'
							),
							wp.element.createElement(
								'div',
								{ style: { marginBottom: '10px' } },
								wp.element.createElement(
									'label',
									{ style: { display: 'block', marginBottom: '5px', fontSize: '11px', fontWeight: '600', color: '#333' } },
									'URL'
								),
								wp.element.createElement(
									'input',
									{
										type: 'url',
										value: currentSlideData.buttonUrl,
										onChange: function(e) { updateSlide(activeSlide, 'buttonUrl', e.target.value); },
										placeholder: 'https://example.com',
										style: {
											width: '100%',
											padding: '6px 8px',
											border: '1px solid #ccc',
											borderRadius: '3px',
											fontSize: '12px',
											boxSizing: 'border-box',
										},
									}
								)
							),
							wp.element.createElement(
								'div',
								{ style: { marginBottom: '10px' } },
								wp.element.createElement(
									'label',
									{ style: { display: 'block', marginBottom: '5px', fontSize: '11px', fontWeight: '600', color: '#333' } },
									'Text'
								),
								wp.element.createElement(
									'input',
									{
										type: 'text',
										value: currentSlideData.buttonText,
										onChange: function(e) { updateSlide(activeSlide, 'buttonText', e.target.value); },
										placeholder: 'Button content...',
										style: {
											width: '100%',
											padding: '6px 8px',
											border: '1px solid #ccc',
											borderRadius: '3px',
											fontSize: '12px',
											boxSizing: 'border-box',
										},
									}
								)
							),
							wp.element.createElement(
								'div',
								{ style: { marginBottom: '10px' } },
								wp.element.createElement(
									'label',
									{ style: { display: 'block', marginBottom: '5px', fontSize: '11px', fontWeight: '600', color: '#333' } },
									'Style'
								),
								wp.element.createElement(
									'select',
									{
										value: currentSlideData.buttonStyle || 'primary',
										onChange: function(e) { updateSlide(activeSlide, 'buttonStyle', e.target.value); },
										style: {
											width: '100%',
											padding: '6px 8px',
											border: '1px solid #ccc',
											borderRadius: '3px',
											fontSize: '12px',
											boxSizing: 'border-box',
										},
									},
									wp.element.createElement('option', { value: 'primary' }, 'Primary'),
									wp.element.createElement('option', { value: 'secondary' }, 'Secondary'),
									wp.element.createElement('option', { value: 'tertiary' }, 'Tertiary'),
									wp.element.createElement('option', { value: 'ghost' }, 'Ghost')
								)
							),
							wp.element.createElement(
								'div',
								{ style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' } },
								wp.element.createElement(
									'input',
									{
										type: 'checkbox',
										checked: currentSlideData.buttonTarget,
										onChange: function(e) { updateSlide(activeSlide, 'buttonTarget', e.target.checked); },
										style: { width: 'auto', margin: 0, cursor: 'pointer' },
									}
								),
								wp.element.createElement(
									'label',
									{ style: { fontSize: '11px', fontWeight: '600', color: '#333', margin: 0, cursor: 'pointer' } },
									'New Tab'
								)
							),
							currentSlideData.buttonUrl ? wp.element.createElement(
								'button',
								{
									onClick: function() {
										updateSlide(activeSlide, 'buttonUrl', '');
										updateSlide(activeSlide, 'buttonText', 'Button content...');
									},
									style: {
										width: '100%',
										padding: '6px 8px',
										backgroundColor: '#e0e0e0',
										color: '#cc0000',
										border: 'none',
										borderRadius: '3px',
										cursor: 'pointer',
										fontSize: '12px',
										fontWeight: '600',
									},
								},
								'Delete Button'
							) : null
						),
						
						// CAROUSEL SETTINGS
						wp.element.createElement(
							'div',
							{ style: { padding: '15px', borderBottom: '1px solid #e0e0e0' } },
							wp.element.createElement(
								'h3',
								{ style: { margin: '0 0 10px 0', fontSize: '12px', fontWeight: '600', color: '#333', textTransform: 'uppercase' } },
								'Carousel Settings'
							),
							wp.element.createElement(
								'div',
								{ style: { marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' } },
								wp.element.createElement(
									'input',
									{
										type: 'checkbox',
										checked: showPlayButton,
										onChange: function(e) { setAttributes({ showPlayButton: e.target.checked }); },
										style: { width: 'auto', margin: 0, cursor: 'pointer' },
									}
								),
								wp.element.createElement(
									'label',
									{ style: { fontSize: '11px', fontWeight: '600', color: '#333', margin: 0, cursor: 'pointer' } },
									'Show Play/Pause Button'
								)
							),
							wp.element.createElement(
								'div',
								{ style: { marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' } },
								wp.element.createElement(
									'input',
									{
										type: 'checkbox',
										checked: enableAutoPlay,
										onChange: function(e) { setAttributes({ enableAutoPlay: e.target.checked }); },
										style: { width: 'auto', margin: 0, cursor: 'pointer' },
									}
								),
								wp.element.createElement(
									'label',
									{ style: { fontSize: '11px', fontWeight: '600', color: '#333', margin: 0, cursor: 'pointer' } },
									'Enable AutoPlay'
								)
							),
							enableAutoPlay ? wp.element.createElement(
								'div',
								null,
								wp.element.createElement(
									'label',
									{ style: { display: 'block', marginBottom: '5px', fontSize: '11px', fontWeight: '600', color: '#333' } },
									'Duration (seconds)'
								),
								wp.element.createElement(
									'input',
									{
										type: 'number',
										value: autoPlayDuration,
										onChange: function(e) { setAttributes({ autoPlayDuration: parseInt(e.target.value) || 4 }); },
										min: 1,
										max: 30,
										style: {
											width: '100%',
											padding: '6px 8px',
											border: '1px solid #ccc',
											borderRadius: '3px',
											fontSize: '12px',
											boxSizing: 'border-box',
										},
									}
								)
							) : null
						)
					)
				);
			},

			save: function() {
				return null;
			},
		});
	}

	// ==========================================
	// FRONTEND CAROUSEL
	// ==========================================

	function initializeCarousels() {
		var carouselWrappers = document.querySelectorAll('.bnpp-carousel-wrapper');

		carouselWrappers.forEach(function(wrapper) {
			var container = wrapper.querySelector('.bnpp-carousel-container');
			if (!container) return;

			var slides = container.querySelectorAll('.diapositive');
			var titleItems = wrapper.querySelectorAll('.bnpp-carousel-title-item');
			var currentSlideIndex = 0;
			var autoPlayInterval = null;
			var isPlaying = false;

			var showSlide = function(n) {
				slides.forEach(function(slide) {
					slide.classList.remove('active');
					slide.setAttribute('aria-hidden', 'true');
				});

				titleItems.forEach(function(item) {
					item.classList.remove('active');
					item.setAttribute('aria-selected', 'false');
				});

				slides[n].classList.add('active');
				slides[n].setAttribute('aria-hidden', 'false');
				titleItems[n].classList.add('active');
				titleItems[n].setAttribute('aria-selected', 'true');

				currentSlideIndex = n;
			};

			var nextSlide = function() {
				var n = (currentSlideIndex + 1) % slides.length;
				showSlide(n);
			};

			var prevSlide = function() {
				var n = (currentSlideIndex - 1 + slides.length) % slides.length;
				showSlide(n);
			};

			var goToSlide = function(n) {
				if (n >= 0 && n < slides.length) {
					showSlide(n);
				}
			};

			showSlide(0);

			titleItems.forEach(function(item, index) {
				item.addEventListener('click', function() {
					goToSlide(index);
				});
			});

			container.addEventListener('keydown', function(e) {
				if (e.key === 'ArrowLeft') {
					prevSlide();
				} else if (e.key === 'ArrowRight') {
					nextSlide();
				}
			});

			wrapper.carouselInstance = {
				nextSlide: nextSlide,
				prevSlide: prevSlide,
				goToSlide: goToSlide,
				getCurrentSlide: function() { return currentSlideIndex; }
			};
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initializeCarousels);
	} else {
		initializeCarousels();
	}

	if (window.MutationObserver) {
		var observer = new MutationObserver(function() {
			initializeCarousels();
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true
		});
	}

})();
			title: 'BNPP Carousel Homepage',
			icon: 'images-alt2',
			category: 'media',
			keywords: ['carousel', 'slider', 'gallery'],
			description: 'A responsive carousel block with up to 3 slides',

			/**
			 * Block edit function - Gutenberg editor interface
			 */
			edit: function(props) {
				var attributes = props.attributes;
				var setAttributes = props.setAttributes;
				var slides = attributes.slides || [];
				var activeSlide = attributes.activeSlide || 0;
				var autoPlayDuration = attributes.autoPlayDuration || 4;

				// Ensure we have exactly 3 slides
				var normalizedSlides = slides.slice();
				while (normalizedSlides.length < 3) {
					normalizedSlides.push({
						id: normalizedSlides.length,
						title: 'Slide ' + (normalizedSlides.length + 1),
						description: 'Add your description here',
						imageId: 0,
						imageUrl: '',
						buttonUrl: '',
						buttonText: 'Button content...',
						buttonStyle: 'primary',
						buttonTarget: false,
					});
				}

				if (normalizedSlides.length !== slides.length) {
					setAttributes({ slides: normalizedSlides });
				}

				/**
				 * Update a specific slide property
				 */
				var updateSlide = function(slideIndex, fieldName, value) {
					var updatedSlides = normalizedSlides.map(function(slide, i) {
						if (i === slideIndex) {
							var updated = Object.assign({}, slide);
							updated[fieldName] = value;
							return updated;
						}
						return slide;
					});
					setAttributes({ slides: updatedSlides });
				};

				/**
				 * Set active slide for editing
				 */
				var setActiveSlideHandler = function(index) {
					setAttributes({ activeSlide: index });
				};

				/**
				 * Handle media upload
				 */
				var onSelectImage = function(media, slideIndex) {
					if (!media || !media.url) {
						updateSlide(slideIndex, 'imageId', 0);
						updateSlide(slideIndex, 'imageUrl', '');
						return;
					}
					updateSlide(slideIndex, 'imageId', media.id);
					updateSlide(slideIndex, 'imageUrl', media.url);
				};

				/**
				 * Remove image from slide
				 */
				var removeImage = function(slideIndex) {
					updateSlide(slideIndex, 'imageId', 0);
					updateSlide(slideIndex, 'imageUrl', '');
				};

				/**
				 * Handle title change with 70 character limit
				 */
				var handleTitleChange = function(slideIndex, value) {
					if (value.length > 70) {
						if (value.length > normalizedSlides[slideIndex].title.length) {
							alert('Title is limited to 70 characters.');
						}
						value = value.substring(0, 70);
					}
					updateSlide(slideIndex, 'title', value);
				};

				/**
				 * Handle description change with 100 character limit
				 */
				var handleDescriptionChange = function(slideIndex, value) {
					if (value.length > 100) {
						if (value.length > normalizedSlides[slideIndex].description.length) {
							alert('Description is limited to 100 characters.');
						}
						value = value.substring(0, 100);
					}
					updateSlide(slideIndex, 'description', value);
				};

				/**
				 * Handle button text change
				 */
				var handleButtonTextChange = function(slideIndex, value) {
					updateSlide(slideIndex, 'buttonText', value);
				};

				var currentSlideData = normalizedSlides[activeSlide] || normalizedSlides[0];

				// Return editor with carousel preview + inspector panel
				return wp.element.createElement(
					wp.element.Fragment,
					null,

					// ==========================================
					// CAROUSEL PREVIEW (full width)
					// ==========================================
					wp.element.createElement(
						'div',
						{ style: { position: 'relative' } },
						
						// Carousel container
						wp.element.createElement(
							'div',
							{
								className: 'bnpp-carousel-container',
								style: {
									position: 'relative',
									width: '100%',
									maxWidth: '1920px',
									height: '640px',
									backgroundColor: '#f5f5f5',
									overflow: 'hidden',
									margin: '0 auto',
									border: '2px solid #0066cc',
								},
							},
							
							// Render slides
							normalizedSlides.map(function(slide, slideIndex) {
								var isActive = slideIndex === activeSlide;
								var showButton = slide.buttonUrl && slide.buttonText !== 'Button content...';

								return wp.element.createElement(
									'div',
									{
										key: 'slide-' + slideIndex,
										className: 'diapositive' + (isActive ? ' active' : ''),
										onClick: function() { setActiveSlideHandler(slideIndex); },
										style: {
											position: 'absolute',
											top: 0,
											left: 0,
											width: '100%',
											height: '100%',
											opacity: isActive ? 1 : 0,
											transition: 'opacity 0.3s ease',
											backgroundImage: slide.imageUrl ? 'url(' + slide.imageUrl + ')' : 'none',
											backgroundSize: 'cover',
											backgroundPosition: 'center',
											cursor: 'pointer',
											zIndex: isActive ? 10 : 1,
											border: isActive ? '3px solid #0066cc' : '1px solid #ccc',
										},
									},
									
									// Description box with inline editing
									wp.element.createElement(
										'div',
										{
											className: 'diapositive-description',
											onClick: function(e) {
												e.stopPropagation();
												setActiveSlideHandler(slideIndex);
											},
											style: {
												position: 'absolute',
												top: '180px',
												left: '40px',
												width: '689px',
												maxHeight: '285px',
												backgroundColor: 'rgba(255, 255, 255, 0.95)',
												padding: '20px',
												boxSizing: 'border-box',
												borderRadius: '4px',
												zIndex: 20,
												cursor: 'pointer',
												border: isActive ? '2px solid #0066cc' : 'none',
												boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
											},
										},
										
										// Title - Editable on double click
										wp.element.createElement(
											'h3',
											{
												onClick: function(e) {
													e.stopPropagation();
												},
												style: {
													margin: '0 0 12px 0',
													fontSize: '24px',
													fontWeight: '600',
													color: '#333',
													cursor: 'text',
													userSelect: 'text',
													WebkitUserSelect: 'text',
												},
												onDoubleClick: function(e) {
													var h3 = e.target;
													if (h3.contentEditable === 'true') return;
													
													h3.contentEditable = 'true';
													h3.focus();
													
													if (window.getSelection && document.createRange) {
														var range = document.createRange();
														range.selectNodeContents(h3);
														var sel = window.getSelection();
														sel.removeAllRanges();
														sel.addRange(range);
													}
													
													var handleInput = function() {
														var text = h3.textContent;
														if (text.length > 70) {
															h3.textContent = text.substring(0, 70);
														}
													};
													
													var handleBlur = function() {
														h3.contentEditable = 'false';
														var newText = h3.textContent;
														handleTitleChange(slideIndex, newText);
														h3.removeEventListener('input', handleInput);
														h3.removeEventListener('blur', handleBlur);
														h3.removeEventListener('keydown', handleKeydown);
													};
													
													var handleKeydown = function(e) {
														if (e.key === 'Enter') {
															e.preventDefault();
															h3.blur();
														}
													};
													
													h3.addEventListener('input', handleInput);
													h3.addEventListener('blur', handleBlur);
													h3.addEventListener('keydown', handleKeydown);
												},
											},
											slide.title
										),
										
										// Description - Editable on double click
										wp.element.createElement(
											'p',
											{
												onClick: function(e) {
													e.stopPropagation();
												},
												style: {
													margin: 0,
													fontSize: '14px',
													color: '#666',
													lineHeight: '1.5',
													cursor: 'text',
													userSelect: 'text',
													WebkitUserSelect: 'text',
												},
												onDoubleClick: function(e) {
													var p = e.target;
													if (p.contentEditable === 'true') return;
													
													p.contentEditable = 'true';
													p.focus();
													
													if (window.getSelection && document.createRange) {
														var range = document.createRange();
														range.selectNodeContents(p);
														var sel = window.getSelection();
														sel.removeAllRanges();
														sel.addRange(range);
													}
													
													var handleInput = function() {
														var text = p.textContent;
														if (text.length > 100) {
															p.textContent = text.substring(0, 100);
														}
													};
													
													var handleBlur = function() {
														p.contentEditable = 'false';
														var newText = p.textContent;
														handleDescriptionChange(slideIndex, newText);
														p.removeEventListener('input', handleInput);
														p.removeEventListener('blur', handleBlur);
														p.removeEventListener('keydown', handleKeydown);
													};
													
													var handleKeydown = function(e) {
														if (e.key === 'Enter' && e.ctrlKey) {
															e.preventDefault();
															p.blur();
														}
													};
													
													p.addEventListener('input', handleInput);
													p.addEventListener('blur', handleBlur);
													p.addEventListener('keydown', handleKeydown);
												},
											},
											slide.description
										)
									),
									
									// Button - Editable on double click
									showButton ? wp.element.createElement(
										'div',
										{
											style: {
												position: 'absolute',
												top: '525px',
												left: '40px',
												zIndex: 20,
											},
											onClick: function(e) {
												e.stopPropagation();
												setActiveSlideHandler(slideIndex);
											},
										},
										wp.element.createElement(
											'a',
											{
												className: 'bnpp-button ' + (slide.buttonStyle || 'primary'),
												href: '#',
												onClick: function(e) {
													e.preventDefault();
													e.stopPropagation();
												},
												style: {
													display: 'inline-block',
													padding: '12px 24px',
													textDecoration: 'none',
													borderRadius: '4px',
													fontSize: '14px',
													fontWeight: '600',
													cursor: 'pointer',
												},
												onDoubleClick: function(e) {
													e.stopPropagation();
													var a = e.target;
													if (a.contentEditable === 'true') return;
													
													a.contentEditable = 'true';
													a.focus();
													
													if (window.getSelection && document.createRange) {
														var range = document.createRange();
														range.selectNodeContents(a);
														var sel = window.getSelection();
														sel.removeAllRanges();
														sel.addRange(range);
													}
													
													var handleBlur = function() {
														a.contentEditable = 'false';
														var newText = a.textContent;
														handleButtonTextChange(slideIndex, newText);
														a.removeEventListener('blur', handleBlur);
														a.removeEventListener('keydown', handleKeydown);
													};
													
													var handleKeydown = function(e) {
														if (e.key === 'Enter') {
															e.preventDefault();
															a.blur();
														}
													};
													
													a.addEventListener('blur', handleBlur);
													a.addEventListener('keydown', handleKeydown);
												},
											},
											slide.buttonText
										)
									) : null
								);
							}),
							
							// Title indicators at bottom
							wp.element.createElement(
								'div',
								{
									className: 'bnpp-carousel-titles',
									style: {
										position: 'absolute',
										bottom: 0,
										left: 0,
										right: 0,
										height: '154px',
										backgroundColor: '#f5f5f5',
										display: 'flex',
										alignItems: 'stretch',
										zIndex: 15,
										marginTop: '-154px',
									},
								},
								normalizedSlides.map(function(slide, index) {
									var isActive = index === activeSlide;
									return wp.element.createElement(
										'div',
										{
											key: 'title-' + index,
											className: 'bnpp-carousel-title-item' + (isActive ? ' active' : ''),
											onClick: function() { setActiveSlideHandler(index); },
											style: {
												flex: 1,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												padding: '20px',
												textAlign: 'center',
												cursor: 'pointer',
												backgroundColor: isActive ? '#ffffff' : '#ececec',
												border: '1px solid #ddd',
												borderLeft: isActive ? '4px solid #0066cc' : '1px solid #ddd',
												fontSize: '16px',
												fontWeight: isActive ? '700' : '600',
												color: isActive ? '#0066cc' : '#333',
												userSelect: 'none',
												marginLeft: index === 0 ? '286px' : '0',
												paddingLeft: isActive ? '16px' : '20px',
											},
										},
										slide.title
									);
								})
							),
							
							// Play/Pause button
							wp.element.createElement(
								'button',
								{
									style: {
										position: 'absolute',
										top: '10px',
										right: '10px',
										padding: '8px 12px',
										backgroundColor: '#0066cc',
										color: '#ffffff',
										border: 'none',
										borderRadius: '4px',
										cursor: 'pointer',
										fontSize: '12px',
										fontWeight: '600',
										zIndex: 30,
									},
								},
								'▶ Play'
							)
						)
					),

					// ==========================================
					// INSPECTOR CONTROLS (right panel)
					// ==========================================
					wp.blockEditor.InspectorControls && wp.element.createElement(
						wp.blockEditor.InspectorControls,
						null,
						
						// Slide selector
						wp.element.createElement(
							'div',
							{
								style: {
									padding: '15px',
									borderBottom: '1px solid #e0e0e0',
								},
							},
							wp.element.createElement(
								'h3',
								{ style: { margin: '0 0 10px 0', fontSize: '13px', fontWeight: '600', color: '#333' } },
								'Slide Settings'
							),
							wp.element.createElement(
								'div',
								{ style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
								normalizedSlides.map(function(slide, index) {
									return wp.element.createElement(
										'button',
										{
											key: 'btn-slide-' + index,
											onClick: function() { setActiveSlideHandler(index); },
											style: {
												flex: '1',
												minWidth: '60px',
												padding: '8px 12px',
												backgroundColor: index === activeSlide ? '#0066cc' : '#e0e0e0',
												color: index === activeSlide ? '#ffffff' : '#333',
												border: index === activeSlide ? '2px solid #0066cc' : '2px solid #ccc',
												borderRadius: '4px',
												cursor: 'pointer',
												fontSize: '12px',
												fontWeight: index === activeSlide ? '600' : 'normal',
												transition: 'all 0.2s ease',
											},
										},
										'Slide ' + (index + 1)
									);
								})
							)
						),
						
						// Title input
						wp.element.createElement(
							'div',
							{ style: { padding: '15px', borderBottom: '1px solid #e0e0e0' } },
							wp.element.createElement(
								'label',
								{ style: { display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '600', color: '#333', textTransform: 'uppercase' } },
								'Title'
							),
							wp.element.createElement(
								'input',
								{
									type: 'text',
									value: currentSlideData.title,
									onChange: function(e) {
										var value = e.target.value;
										if (value.length > 70) {
											if (value.length > currentSlideData.title.length) {
												e.target.value = value.substring(0, 70);
											}
										}
										handleTitleChange(activeSlide, e.target.value);
									},
									onPaste: function(e) {
										e.preventDefault();
										var text = (e.clipboardData || window.clipboardData).getData('text');
										if (text.length > 70) {
											alert('Pasted text exceeded 70 character limit and has been truncated.');
											text = text.substring(0, 70);
										}
										handleTitleChange(activeSlide, text);
										e.target.value = text;
									},
									placeholder: 'Slide title',
									style: {
										width: '100%',
										padding: '6px 8px',
										border: '1px solid #ccc',
										borderRadius: '3px',
										fontSize: '12px',
										boxSizing: 'border-box',
										fontFamily: 'inherit',
										marginBottom: '5px',
									},
								}
							),
							wp.element.createElement(
								'small',
								{ style: { fontSize: '11px', color: '#999' } },
								currentSlideData.title.length + ' / 70 characters'
							)
						),
						
						// Description input
						wp.element.createElement(
							'div',
							{ style: { padding: '15px', borderBottom: '1px solid #e0e0e0' } },
							wp.element.createElement(
								'label',
								{ style: { display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '600', color: '#333', textTransform: 'uppercase' } },
								'Description'
							),
							wp.element.createElement(
								'textarea',
								{
									value: currentSlideData.description,
									onChange: function(e) {
										var value = e.target.value;
										if (value.length > 100) {
											if (value.length > currentSlideData.description.length) {
												e.target.value = value.substring(0, 100);
											}
										}
										handleDescriptionChange(activeSlide, e.target.value);
									},
									onPaste: function(e) {
										e.preventDefault();
										var text = (e.clipboardData || window.clipboardData).getData('text');
										if (text.length > 100) {
											alert('Pasted text exceeded 100 character limit and has been truncated.');
											text = text.substring(0, 100);
										}
										handleDescriptionChange(activeSlide, text);
										e.target.value = text;
									},
									placeholder: 'Slide description',
									style: {
										width: '100%',
										padding: '6px 8px',
										border: '1px solid #ccc',
										borderRadius: '3px',
										fontSize: '12px',
										boxSizing: 'border-box',
										fontFamily: 'inherit',
										resize: 'vertical',
										minHeight: '60px',
										marginBottom: '5px',
									},
								}
							),
							wp.element.createElement(
								'small',
								{ style: { fontSize: '11px', color: '#999' } },
								currentSlideData.description.length + ' / 100 characters'
							)
						),
						
						// Background image section
						wp.element.createElement(
							'div',
							{ style: { padding: '15px', borderBottom: '1px solid #e0e0e0' } },
							wp.element.createElement(
								'h3',
								{ style: { margin: '0 0 10px 0', fontSize: '12px', fontWeight: '600', color: '#333', textTransform: 'uppercase' } },
								'Background Image'
							),
							wp.element.createElement(
								'div',
								{
									style: {
										position: 'relative',
										width: '100%',
										height: '100px',
										backgroundColor: '#f5f5f5',
										border: currentSlideData.imageUrl ? '2px solid #0066cc' : '2px dashed #ccc',
										borderRadius: '3px',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										marginBottom: '10px',
										overflow: 'hidden',
										fontSize: '11px',
										color: '#666',
									},
								},
								currentSlideData.imageUrl ? wp.element.createElement(
									'img',
									{
										src: currentSlideData.imageUrl,
										alt: 'Slide background',
										style: { maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' },
									}
								) : 'No image'
							),
							wp.element.createElement(
								'button',
								{
									onClick: function() {
										if (wp.media) {
											var frame = wp.media({
												title: 'Select Background Image',
												button: { text: 'Use this image' },
												multiple: false,
												library: { type: 'image' },
											});
											frame.on('select', function() {
												var attachment = frame.state().get('selection').first().toJSON();
												if (attachment && attachment.url) {
													onSelectImage(attachment, activeSlide);
												}
											});
											frame.open();
										}
									},
									style: {
										width: '100%',
										padding: '6px 8px',
										backgroundColor: '#0066cc',
										color: '#ffffff',
										border: 'none',
										borderRadius: '3px',
										cursor: 'pointer',
										fontSize: '12px',
										fontWeight: '600',
										marginBottom: currentSlideData.imageUrl ? '8px' : '0',
									},
								},
								currentSlideData.imageUrl ? 'Change Image' : 'Upload Image'
							),
							currentSlideData.imageUrl ? wp.element.createElement(
								'button',
								{
									onClick: function() { removeImage(activeSlide); },
									style: {
										width: '100%',
										padding: '6px 8px',
										backgroundColor: '#e0e0e0',
										color: '#cc0000',
										border: 'none',
										borderRadius: '3px',
										cursor: 'pointer',
										fontSize: '12px',
										fontWeight: '600',
									},
								},
								'Remove Image'
							) : null
						),
						
						// Button settings
						wp.element.createElement(
							'div',
							{ style: { padding: '15px', borderBottom: '1px solid #e0e0e0' } },
							wp.element.createElement(
								'h3',
								{ style: { margin: '0 0 10px 0', fontSize: '12px', fontWeight: '600', color: '#333', textTransform: 'uppercase' } },
								'Button Settings'
							),
							wp.element.createElement(
								'div',
								{ style: { marginBottom: '10px' } },
								wp.element.createElement(
									'label',
									{ style: { display: 'block', marginBottom: '5px', fontSize: '11px', fontWeight: '600', color: '#333' } },
									'URL'
								),
								wp.element.createElement(
									'input',
									{
										type: 'url',
										value: currentSlideData.buttonUrl,
										onChange: function(e) { updateSlide(activeSlide, 'buttonUrl', e.target.value); },
										placeholder: 'https://example.com',
										style: {
											width: '100%',
											padding: '6px 8px',
											border: '1px solid #ccc',
											borderRadius: '3px',
											fontSize: '12px',
											boxSizing: 'border-box',
											fontFamily: 'inherit',
										},
									}
								)
							),
							wp.element.createElement(
								'div',
								{ style: { marginBottom: '10px' } },
								wp.element.createElement(
									'label',
									{ style: { display: 'block', marginBottom: '5px', fontSize: '11px', fontWeight: '600', color: '#333' } },
									'Text'
								),
								wp.element.createElement(
									'input',
									{
										type: 'text',
										value: currentSlideData.buttonText,
										onChange: function(e) { updateSlide(activeSlide, 'buttonText', e.target.value); },
										onFocus: function(e) {
											if (e.target.value === 'Button content...') {
												e.target.value = '';
											}
										},
										onBlur: function(e) {
											if (e.target.value === '') {
												e.target.value = 'Button content...';
												updateSlide(activeSlide, 'buttonText', 'Button content...');
											}
										},
										placeholder: 'Button text',
										style: {
											width: '100%',
											padding: '6px 8px',
											border: '1px solid #ccc',
											borderRadius: '3px',
											fontSize: '12px',
											boxSizing: 'border-box',
											fontFamily: 'inherit',
										},
									}
								)
							),
							wp.element.createElement(
								'div',
								{ style: { marginBottom: '10px' } },
								wp.element.createElement(
									'label',
									{ style: { display: 'block', marginBottom: '5px', fontSize: '11px', fontWeight: '600', color: '#333' } },
									'Style'
								),
								wp.element.createElement(
									'select',
									{
										value: currentSlideData.buttonStyle || 'primary',
										onChange: function(e) { updateSlide(activeSlide, 'buttonStyle', e.target.value); },
										style: {
											width: '100%',
											padding: '6px 8px',
											border: '1px solid #ccc',
											borderRadius: '3px',
											fontSize: '12px',
											boxSizing: 'border-box',
											fontFamily: 'inherit',
										},
									},
									wp.element.createElement('option', { value: 'primary' }, 'Primary'),
									wp.element.createElement('option', { value: 'secondary' }, 'Secondary'),
									wp.element.createElement('option', { value: 'tertiary' }, 'Tertiary'),
									wp.element.createElement('option', { value: 'ghost' }, 'Ghost')
								)
							),
							wp.element.createElement(
								'div',
								{ style: { display: 'flex', alignItems: 'center', gap: '8px' } },
								wp.element.createElement(
									'input',
									{
										type: 'checkbox',
										checked: currentSlideData.buttonTarget,
										onChange: function(e) { updateSlide(activeSlide, 'buttonTarget', e.target.checked); },
										style: { width: 'auto', margin: 0, cursor: 'pointer' },
									}
								),
								wp.element.createElement(
									'label',
									{ style: { fontSize: '11px', fontWeight: '600', color: '#333', margin: 0, cursor: 'pointer' } },
									'Open in New Tab'
								)
							)
						),
						
						// AutoPlay duration
						wp.element.createElement(
							'div',
							{ style: { padding: '15px' } },
							wp.element.createElement(
								'h3',
								{ style: { margin: '0 0 10px 0', fontSize: '12px', fontWeight: '600', color: '#333', textTransform: 'uppercase' } },
								'AutoPlay Duration'
							),
							wp.element.createElement(
								'label',
								{ style: { display: 'block', marginBottom: '5px', fontSize: '11px', color: '#666' } },
								'Seconds between slides'
							),
							wp.element.createElement(
								'input',
								{
									type: 'number',
									value: autoPlayDuration,
									onChange: function(e) { setAttributes({ autoPlayDuration: parseInt(e.target.value) || 4 }); },
									min: 1,
									max: 30,
									style: {
										width: '100%',
										padding: '6px 8px',
										border: '1px solid #ccc',
										borderRadius: '3px',
										fontSize: '12px',
										boxSizing: 'border-box',
										fontFamily: 'inherit',
									},
								}
							)
						)
					)
				);
			},

			/**
			 * Block save function
			 */
			save: function() {
				return null;
			},
		});
	}

	// ==========================================
	// FRONTEND CAROUSEL FUNCTIONALITY
	// ==========================================

	/**
	 * Initialize carousel when DOM is ready
	 */
	function initializeCarousels() {
		var carouselWrappers = document.querySelectorAll('.bnpp-carousel-wrapper');

		carouselWrappers.forEach(function(wrapper) {
			var container = wrapper.querySelector('.bnpp-carousel-container');
			if (!container) {
				return;
			}

			var slides = container.querySelectorAll('.diapositive');
			var titleItems = wrapper.querySelectorAll('.bnpp-carousel-title-item');
			var currentSlideIndex = 0;

			/**
			 * Display slide at index
			 */
			var showSlide = function(n) {
				slides.forEach(function(slide) {
					slide.classList.remove('active');
					slide.setAttribute('aria-hidden', 'true');
				});

				titleItems.forEach(function(item) {
					item.classList.remove('active');
					item.setAttribute('aria-selected', 'false');
				});

				slides[n].classList.add('active');
				slides[n].setAttribute('aria-hidden', 'false');
				titleItems[n].classList.add('active');
				titleItems[n].setAttribute('aria-selected', 'true');

				currentSlideIndex = n;
			};

			/**
			 * Next slide
			 */
			var nextSlide = function() {
				var n = (currentSlideIndex + 1) % slides.length;
				showSlide(n);
			};

			/**
			 * Previous slide
			 */
			var prevSlide = function() {
				var n = (currentSlideIndex - 1 + slides.length) % slides.length;
				showSlide(n);
			};

			/**
			 * Go to slide
			 */
			var goToSlide = function(n) {
				if (n >= 0 && n < slides.length) {
					showSlide(n);
				}
			};

			// Initialize first slide
			showSlide(0);

			// Title click handlers
			titleItems.forEach(function(item, index) {
				item.addEventListener('click', function() {
					goToSlide(index);
				});

				item.addEventListener('keydown', function(e) {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						goToSlide(index);
					}
				});
			});

			// Keyboard navigation
			container.addEventListener('keydown', function(e) {
				if (e.key === 'ArrowLeft') {
					prevSlide();
				} else if (e.key === 'ArrowRight') {
					nextSlide();
				}
			});

			// Store carousel instance
			wrapper.carouselInstance = {
				nextSlide: nextSlide,
				prevSlide: prevSlide,
				goToSlide: goToSlide,
				getCurrentSlide: function() { return currentSlideIndex; }
			};
		});
	}

	// Initialize on DOM ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initializeCarousels);
	} else {
		initializeCarousels();
	}

	/**
	 * Re-initialize on dynamic content
	 */
	if (window.MutationObserver) {
		var observer = new MutationObserver(function() {
			initializeCarousels();
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true
		});
	}

})();
