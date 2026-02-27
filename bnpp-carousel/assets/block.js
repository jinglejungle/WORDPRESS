/**
 * BNPP Carousel Block
 * Pure Vanilla JavaScript implementation
 * Gutenberg editor and frontend functionality
 */

(function() {
	'use strict';

	if (typeof wp !== 'undefined' && wp.blocks) {
		wp.blocks.registerBlockType('bnpp/carousel-homepage', {
			title: 'BNPP Carousel Homepage',
			icon: 'images-alt2',
			category: 'media',
			edit: function(props) {
				var attributes = props.attributes;
				var setAttributes = props.setAttributes;
				var slides = attributes.slides || [];
				var activeSlide = attributes.activeSlide || 0;
				var autoPlayDuration = attributes.autoPlayDuration || 4;

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

				var currentSlideData = normalizedSlides[activeSlide] || normalizedSlides[0];

				return wp.element.createElement(
					wp.element.Fragment,
					null,

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
							
							normalizedSlides.map(function(slide, slideIndex) {
								var isActive = slideIndex === activeSlide;

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
										
										wp.element.createElement(
											'h3',
											{ style: { margin: '0 0 12px 0', fontSize: '24px', fontWeight: '600', color: '#333' } },
											slide.title
										),
										
										wp.element.createElement(
											'p',
											{ style: { margin: 0, fontSize: '14px', color: '#666', lineHeight: '1.5' } },
											slide.description
										)
									)
								);
							}),
							
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
										transition: 'background-color 0.2s ease',
									},
								},
								'▶ Play'
							)
						)
					),

					wp.blockEditor && wp.blockEditor.InspectorControls ? wp.element.createElement(
						wp.blockEditor.InspectorControls,
						null,
						
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
										var value = e.target.value.substring(0, 70);
										updateSlide(activeSlide, 'title', value);
										e.target.value = value;
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
										var value = e.target.value.substring(0, 100);
										updateSlide(activeSlide, 'description', value);
										e.target.value = value;
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
						
						wp.element.createElement(
							'div',
							{
								style: {
									padding: '15px',
								},
							},
							wp.element.createElement(
								'h3',
								{ style: { margin: '0 0 10px 0', fontSize: '12px', fontWeight: '600', color: '#333', textTransform: 'uppercase' } },
								'AutoPlay Duration'
							),
							wp.element.createElement(
								'label',
								{ style: { display: 'block', marginBottom: '5px', fontSize: '11px', color: '#666' } },
								'Seconds between slides (default: 4)'
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
					) : null
				);
			},

			save: function() {
				return null;
			},
		});
	}

	document.addEventListener('DOMContentLoaded', function() {
		var carouselWrappers = document.querySelectorAll('.bnpp-carousel-wrapper');

		carouselWrappers.forEach(function(wrapper) {
			var container = wrapper.querySelector('.bnpp-carousel-container');
			if (!container) {
				return;
			}

			var slides = container.querySelectorAll('.diapositive');
			var titleItems = wrapper.querySelectorAll('.bnpp-carousel-title-item');
			var currentSlideIndex = 0;

			var showSlide = function(n) {
				slides.forEach(function(slide) {
					slide.classList.remove('active');
				});

				titleItems.forEach(function(item) {
					item.classList.remove('active');
				});

				slides[n].classList.add('active');
				titleItems[n].classList.add('active');

				currentSlideIndex = n;
			};

			showSlide(0);

			titleItems.forEach(function(item, index) {
				item.addEventListener('click', function() {
					showSlide(index);
				});
			});

			wrapper.carouselInstance = {
				showSlide: showSlide,
				getCurrentSlide: function() { return currentSlideIndex; }
			};
		});
	});

})();
