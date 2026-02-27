/**
 * BNPP Carousel Block
 * Pure Vanilla JavaScript with Gutenberg InspectorControls
 * Inline editing and character limits
 */

(function() {
	'use strict';

	/**
	 * Get block editor components
	 */
	var blockEditor = wp.blockEditor;
	var blocks = wp.blocks;
	var element = wp.element;

	/**
	 * Register the carousel block
	 */
	blocks.registerBlockType('bnpp/carousel-homepage', {
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
			return element.createElement(
				element.Fragment,
				null,

				// ==========================================
				// CAROUSEL PREVIEW (full width)
				// ==========================================
				element.createElement(
					'div',
					{ style: { position: 'relative' } },
					
					// Carousel container
					element.createElement(
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

							return element.createElement(
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
								element.createElement(
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
									element.createElement(
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
									element.createElement(
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
								showButton ? element.createElement(
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
									element.createElement(
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
						element.createElement(
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
								return element.createElement(
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
						element.createElement(
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
				element.createElement(
					blockEditor.InspectorControls,
					null,
					
					// Slide selector
					element.createElement(
						'div',
						{
							style: {
								padding: '15px',
								borderBottom: '1px solid #e0e0e0',
							},
						},
						element.createElement(
							'h3',
							{ style: { margin: '0 0 10px 0', fontSize: '13px', fontWeight: '600', color: '#333' } },
							'Slide Settings'
						),
						element.createElement(
							'div',
							{ style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
							normalizedSlides.map(function(slide, index) {
								return element.createElement(
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
					element.createElement(
						'div',
						{ style: { padding: '15px', borderBottom: '1px solid #e0e0e0' } },
						element.createElement(
							'label',
							{ style: { display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '600', color: '#333', textTransform: 'uppercase' } },
							'Title'
						),
						element.createElement(
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
						element.createElement(
							'small',
							{ style: { fontSize: '11px', color: '#999' } },
							currentSlideData.title.length + ' / 70 characters'
						)
					),
					
					// Description input
					element.createElement(
						'div',
						{ style: { padding: '15px', borderBottom: '1px solid #e0e0e0' } },
						element.createElement(
							'label',
							{ style: { display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '600', color: '#333', textTransform: 'uppercase' } },
							'Description'
						),
						element.createElement(
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
						element.createElement(
							'small',
							{ style: { fontSize: '11px', color: '#999' } },
							currentSlideData.description.length + ' / 100 characters'
						)
					),
					
					// Background image section
					element.createElement(
						'div',
						{ style: { padding: '15px', borderBottom: '1px solid #e0e0e0' } },
						element.createElement(
							'h3',
							{ style: { margin: '0 0 10px 0', fontSize: '12px', fontWeight: '600', color: '#333', textTransform: 'uppercase' } },
							'Background Image'
						),
						element.createElement(
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
							currentSlideData.imageUrl ? element.createElement(
								'img',
								{
									src: currentSlideData.imageUrl,
									alt: 'Slide background',
									style: { maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' },
								}
							) : 'No image'
						),
						element.createElement(
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
						currentSlideData.imageUrl ? element.createElement(
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
					element.createElement(
						'div',
						{ style: { padding: '15px', borderBottom: '1px solid #e0e0e0' } },
						element.createElement(
							'h3',
							{ style: { margin: '0 0 10px 0', fontSize: '12px', fontWeight: '600', color: '#333', textTransform: 'uppercase' } },
							'Button Settings'
						),
						element.createElement(
							'div',
							{ style: { marginBottom: '10px' } },
							element.createElement(
								'label',
								{ style: { display: 'block', marginBottom: '5px', fontSize: '11px', fontWeight: '600', color: '#333' } },
								'URL'
							),
							element.createElement(
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
						element.createElement(
							'div',
							{ style: { marginBottom: '10px' } },
							element.createElement(
								'label',
								{ style: { display: 'block', marginBottom: '5px', fontSize: '11px', fontWeight: '600', color: '#333' } },
								'Text'
							),
							element.createElement(
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
						element.createElement(
							'div',
							{ style: { marginBottom: '10px' } },
							element.createElement(
								'label',
								{ style: { display: 'block', marginBottom: '5px', fontSize: '11px', fontWeight: '600', color: '#333' } },
								'Style'
							),
							element.createElement(
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
								element.createElement('option', { value: 'primary' }, 'Primary'),
								element.createElement('option', { value: 'secondary' }, 'Secondary'),
								element.createElement('option', { value: 'tertiary' }, 'Tertiary'),
								element.createElement('option', { value: 'ghost' }, 'Ghost')
							)
						),
						element.createElement(
							'div',
							{ style: { display: 'flex', alignItems: 'center', gap: '8px' } },
							element.createElement(
								'input',
								{
									type: 'checkbox',
									checked: currentSlideData.buttonTarget,
									onChange: function(e) { updateSlide(activeSlide, 'buttonTarget', e.target.checked); },
									style: { width: 'auto', margin: 0, cursor: 'pointer' },
								}
							),
							element.createElement(
								'label',
								{ style: { fontSize: '11px', fontWeight: '600', color: '#333', margin: 0, cursor: 'pointer' } },
								'Open in New Tab'
							)
						)
					),
					
					// AutoPlay duration
					element.createElement(
						'div',
						{ style: { padding: '15px' } },
						element.createElement(
							'h3',
							{ style: { margin: '0 0 10px 0', fontSize: '12px', fontWeight: '600', color: '#333', textTransform: 'uppercase' } },
							'AutoPlay Duration'
						),
						element.createElement(
							'label',
							{ style: { display: 'block', marginBottom: '5px', fontSize: '11px', color: '#666' } },
							'Seconds between slides'
						),
						element.createElement(
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

	/**
	 * ==========================================
	 * Frontend Carousel Functionality
	 * ==========================================
	 */

	document.addEventListener('DOMContentLoaded', function() {
		initializeCarousels();
	});

	/**
	 * Initialize all carousels on page
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
