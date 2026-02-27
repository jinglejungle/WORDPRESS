/**
 * BNPP Carousel Block
 * Pure Vanilla JavaScript implementation without React dependencies
 * Supports Gutenberg editor interface and frontend carousel functionality
 */

(function() {
	'use strict';

	/**
	 * ==========================================
	 * Gutenberg Block Registration (Pure JS)
	 * ==========================================
	 */

	/**
	 * Register the carousel block using WordPress Gutenberg API
	 * No React, pure DOM manipulation with vanilla JavaScript
	 */
	wp.blocks.registerBlockType('bnpp/carousel-homepage', {
		title: 'BNPP Carousel Homepage',
		icon: 'images-alt2',
		category: 'media',
		keywords: ['carousel', 'slider', 'gallery'],
		description: 'A responsive carousel block with up to 3 slides',
		example: {
			attributes: {
				slides: [
					{
						id: 0,
						title: 'Slide 1',
						description: 'Add your description here',
						imageId: 0,
						imageUrl: '',
						buttonUrl: '',
						buttonText: 'Button content...',
						buttonStyle: 'primary',
						buttonTarget: false,
					},
					{
						id: 1,
						title: 'Slide 2',
						description: 'Add your description here',
						imageId: 0,
						imageUrl: '',
						buttonUrl: '',
						buttonText: 'Button content...',
						buttonStyle: 'primary',
						buttonTarget: false,
					},
					{
						id: 2,
						title: 'Slide 3',
						description: 'Add your description here',
						imageId: 0,
						imageUrl: '',
						buttonUrl: '',
						buttonText: 'Button content...',
						buttonStyle: 'primary',
						buttonTarget: false,
					},
				],
				activeSlide: 0,
			},
		},

		/**
		 * Block edit function - Gutenberg editor interface
		 * Returns Gutenberg-compatible element structure using wp.element.createElement
		 */
		edit: function(props) {
			var attributes = props.attributes;
			var setAttributes = props.setAttributes;
			var slides = attributes.slides || [];
			var activeSlide = attributes.activeSlide || 0;

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

			// Update attributes if we added slides
			if (normalizedSlides.length !== slides.length) {
				setAttributes({ slides: normalizedSlides });
			}

			slides = normalizedSlides;

			/**
			 * Update a specific slide property
			 */
			var updateSlide = function(slideIndex, fieldName, value) {
				var updatedSlides = slides.map(function(slide, i) {
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
			 * Set active slide for editing in inspector panel
			 */
			var setActiveSlideHandler = function(index) {
				setAttributes({ activeSlide: index });
			};

			/**
			 * Handle media upload for slide background image
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

			var currentSlideData = slides[activeSlide] || slides[0];

			// Use wp.element.createElement to create proper Gutenberg elements
			return wp.element.createElement(
				'div',
				{ style: { display: 'flex', gap: '20px' } },
				// Left column - Carousel preview
				wp.element.createElement(
					'div',
					{ style: { flex: 1 } },
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
						slides.map(function(slide, slideIndex) {
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
								// Description box
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
											top: '280px',
											left: '40px',
											width: '689px',
											maxHeight: '285px',
											backgroundColor: 'rgba(255, 255, 255, 0.95)',
											padding: '20px',
											boxSizing: 'border-box',
											borderRadius: '4px',
											zIndex: 20,
											cursor: 'pointer',
											border: 'none',
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
								),
								// Button
								showButton ? wp.element.createElement(
									'div',
									{
										style: { position: 'absolute', top: '585px', left: '40px', zIndex: 20 },
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
										},
										slide.buttonText
									)
								) : null
							);
						}),
						// Title indicators
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
							slides.map(function(slide, index) {
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
											borderBottom: isActive ? '3px solid #0066cc' : '1px solid #ddd',
											fontSize: '16px',
											fontWeight: isActive ? '700' : '600',
											color: isActive ? '#0066cc' : '#333',
											userSelect: 'none',
											marginLeft: index === 0 ? '286px' : '0',
										},
									},
									slide.title
								);
							})
						)
					)
				),
				// Right column - Inspector panel
				wp.element.createElement(
					'div',
					{
						style: {
											width: '280px',
											maxHeight: '600px',
											overflowY: 'auto',
											paddingRight: '10px',
											padding: '15px',
											backgroundColor: '#ffffff',
											borderRadius: '4px',
										},
					},
					// Slide selector buttons
					wp.element.createElement(
						'div',
						{ style: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' } },
						slides.map(function(slide, index) {
							return wp.element.createElement(
								'button',
								{
									key: 'btn-slide-' + index,
									onClick: function() { setActiveSlideHandler(index); },
									style: {
										padding: '10px 15px',
										backgroundColor: index === activeSlide ? '#0066cc' : '#e0e0e0',
										color: index === activeSlide ? '#ffffff' : '#333',
										border: '2px solid ' + (index === activeSlide ? '#0066cc' : '#999'),
										borderRadius: '4px',
										cursor: 'pointer',
										fontSize: '14px',
										fontWeight: index === activeSlide ? '600' : 'normal',
										transition: 'all 0.2s ease',
									},
								},
								'Slide ' + (index + 1)
							);
						})
					),
					// Title input
					wp.element.createElement(
						'div',
						{ style: { marginBottom: '15px' } },
						wp.element.createElement(
							'label',
							{ style: { display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500', color: '#555' } },
							'Slide Title'
						),
						wp.element.createElement(
							'input',
							{
								type: 'text',
								value: currentSlideData.title,
								onChange: function(e) { updateSlide(activeSlide, 'title', e.target.value); },
								placeholder: 'Enter slide title',
								style: {
									width: '100%',
									padding: '8px',
									border: '1px solid #ddd',
									borderRadius: '4px',
									fontSize: '13px',
									boxSizing: 'border-box',
								},
							}
						)
					),
					// Description input
					wp.element.createElement(
						'div',
						{ style: { marginBottom: '15px' } },
						wp.element.createElement(
							'label',
							{ style: { display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500', color: '#555' } },
							'Description'
						),
						wp.element.createElement(
							'textarea',
							{
								value: currentSlideData.description,
								onChange: function(e) { updateSlide(activeSlide, 'description', e.target.value); },
								placeholder: 'Add your description here',
								style: {
									width: '100%',
									padding: '8px',
									border: '1px solid #ddd',
									borderRadius: '4px',
									fontSize: '13px',
									boxSizing: 'border-box',
									resize: 'vertical',
									minHeight: '80px',
									fontFamily: 'inherit',
								},
							}
						)
					),
					// Image section
					wp.element.createElement(
						'div',
						{
							style: {
								marginBottom: '20px',
								padding: '15px',
								backgroundColor: '#f9f9f9',
								border: '1px solid #e0e0e0',
								borderRadius: '4px',
							},
						},
						wp.element.createElement(
							'h3',
							{ style: { margin: '0 0 15px 0', fontSize: '14px', fontWeight: '600', color: '#333', textTransform: 'uppercase' } },
							'Background Image'
						),
						wp.element.createElement(
							'div',
							{
								style: {
									position: 'relative',
									width: '100%',
									height: '150px',
									backgroundColor: '#f5f5f5',
									border: currentSlideData.imageUrl ? '2px solid #0066cc' : '2px dashed #ccc',
									borderRadius: '4px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									marginBottom: '10px',
									overflow: 'hidden',
								},
							},
							currentSlideData.imageUrl ? wp.element.createElement(
								'img',
								{
									src: currentSlideData.imageUrl,
									alt: 'Slide background',
									style: { maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' },
								}
							) : 'No image selected'
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
									padding: '8px 16px',
									backgroundColor: '#0066cc',
									color: '#ffffff',
									border: 'none',
									borderRadius: '4px',
									cursor: 'pointer',
									fontSize: '13px',
									fontWeight: '500',
								},
							},
							currentSlideData.imageUrl ? 'Change Image' : 'Upload Image'
						),
						currentSlideData.imageUrl ? wp.element.createElement(
							'button',
							{
								onClick: function() { removeImage(activeSlide); },
								style: {
									marginLeft: '10px',
									padding: '8px 16px',
									backgroundColor: '#cccccc',
									color: '#cc0000',
									border: 'none',
									borderRadius: '4px',
									cursor: 'pointer',
									fontSize: '13px',
									fontWeight: '500',
								},
							},
							'Remove Image'
						) : null
					),
					// Button settings section
					wp.element.createElement(
						'div',
						{
							style: {
								marginBottom: '20px',
								padding: '15px',
								backgroundColor: '#f9f9f9',
								border: '1px solid #e0e0e0',
								borderRadius: '4px',
							},
						},
						wp.element.createElement(
							'h3',
							{ style: { margin: '0 0 15px 0', fontSize: '14px', fontWeight: '600', color: '#333', textTransform: 'uppercase' } },
							'Button Settings'
						),
						wp.element.createElement(
							'div',
							{ style: { marginBottom: '15px' } },
							wp.element.createElement(
								'label',
								{ style: { display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500', color: '#555' } },
								'Button Link URL'
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
										padding: '8px',
										border: '1px solid #ddd',
										borderRadius: '4px',
										fontSize: '13px',
										boxSizing: 'border-box',
									},
								}
							)
						),
						wp.element.createElement(
							'div',
							{ style: { marginBottom: '15px' } },
							wp.element.createElement(
								'label',
								{ style: { display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500', color: '#555' } },
								'Button Text'
							),
							wp.element.createElement(
								'input',
								{
									type: 'text',
									value: currentSlideData.buttonText,
									onChange: function(e) { updateSlide(activeSlide, 'buttonText', e.target.value); },
									onFocus: function(e) {
										if (e.target.value === 'Button content...') {
											updateSlide(activeSlide, 'buttonText', '');
										}
									},
									onBlur: function(e) {
										if (e.target.value === '') {
											updateSlide(activeSlide, 'buttonText', 'Button content...');
										}
									},
									placeholder: 'Button content...',
									style: {
										width: '100%',
										padding: '8px',
										border: '1px solid #ddd',
										borderRadius: '4px',
										fontSize: '13px',
										boxSizing: 'border-box',
									},
								}
							)
						),
						wp.element.createElement(
							'div',
							{ style: { marginBottom: '15px' } },
							wp.element.createElement(
								'label',
								{ style: { display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500', color: '#555' } },
								'Button Style'
							),
							wp.element.createElement(
								'select',
								{
									value: currentSlideData.buttonStyle || 'primary',
									onChange: function(e) { updateSlide(activeSlide, 'buttonStyle', e.target.value); },
									style: {
										width: '100%',
										padding: '8px',
										border: '1px solid #ddd',
										borderRadius: '4px',
										fontSize: '13px',
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
							{ style: { display: 'flex', alignItems: 'center', gap: '8px' } },
							wp.element.createElement(
								'input',
								{
									type: 'checkbox',
									checked: currentSlideData.buttonTarget,
									onChange: function(e) { updateSlide(activeSlide, 'buttonTarget', e.target.checked); },
									style: { width: 'auto', margin: 0 },
								}
							),
							wp.element.createElement(
								'label',
								{ style: { fontSize: '13px', fontWeight: '500', color: '#555', margin: 0, cursor: 'pointer' } },
								'Open in New Tab'
							)
						)
					)
				)
			);
		},

		/**
		 * Block save function
		 * Returns null to use PHP render callback for server-side rendering
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

	/**
	 * Initialize carousel when DOM is ready
	 */
	document.addEventListener('DOMContentLoaded', function() {
		initializeCarousels();
	});

	/**
	 * Initialize all carousels present on the page
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
			 * Display specific slide by index
			 * @param {number} n - The slide index to display
			 */
			var showSlide = function(n) {
				// Remove active class from all slides and titles
				slides.forEach(function(slide) {
					slide.classList.remove('active', 'prev');
					slide.setAttribute('aria-hidden', 'true');
				});

				titleItems.forEach(function(item) {
					item.classList.remove('active');
					item.setAttribute('aria-selected', 'false');
				});

				// Add active class to current slide and title
				slides[n].classList.add('active');
				slides[n].setAttribute('aria-hidden', 'false');
				titleItems[n].classList.add('active');
				titleItems[n].setAttribute('aria-selected', 'true');

				currentSlideIndex = n;
			};

			/**
			 * Move to next slide in carousel
			 */
			var nextSlide = function() {
				var n = (currentSlideIndex + 1) % slides.length;
				showSlide(n);
			};

			/**
			 * Move to previous slide in carousel
			 */
			var prevSlide = function() {
				var n = (currentSlideIndex - 1 + slides.length) % slides.length;
				showSlide(n);
			};

			/**
			 * Go to specific slide by index
			 * @param {number} n - The slide index
			 */
			var goToSlide = function(n) {
				if (n >= 0 && n < slides.length) {
					showSlide(n);
				}
			};

			// Initialize carousel by showing first slide
			showSlide(0);

			// Add click handlers to all title items
			titleItems.forEach(function(item, index) {
				item.addEventListener('click', function() {
					goToSlide(index);
				});

				// Keyboard support for title items (Enter and Space keys)
				item.addEventListener('keydown', function(e) {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						goToSlide(index);
					}
				});
			});

			// Keyboard navigation with arrow keys
			container.addEventListener('keydown', function(e) {
				if (e.key === 'ArrowLeft') {
					prevSlide();
				} else if (e.key === 'ArrowRight') {
					nextSlide();
				}
			});

			// Store carousel instance for external JavaScript access
			wrapper.carouselInstance = {
				nextSlide: nextSlide,
				prevSlide: prevSlide,
				goToSlide: goToSlide,
				getCurrentSlide: function() { return currentSlideIndex; }
			};

			/**
			 * OPTIONAL: Enable automatic slide rotation
			 * Uncomment the code below to enable auto-rotation every 10 seconds
			 * 
			 * setInterval(function() {
			 *     nextSlide();
			 * }, 10000);
			 */
		});
	}

	/**
	 * Re-initialize carousels when content is dynamically added to page
	 * Uses MutationObserver to detect DOM changes
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
