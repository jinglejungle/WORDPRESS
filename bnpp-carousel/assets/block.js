/**
 * BNPP Carousel Block
 * JavaScript for Gutenberg editor and frontend functionality
 */

(function() {
	'use strict';

	/**
	 * ==========================================
	 * Editor Block Implementation
	 * ==========================================
	 */

	const { registerBlockType } = wp.blocks;
	const { useBlockProps, InspectorControls, BlockControls, RichText, MediaUpload, MediaUploadCheck } = wp.blockEditor;
	const { PanelBody, Button, SelectControl, ToggleControl, TextControl, TextareaControl } = wp.components;
	const { Fragment, useState, useCallback } = wp.element;
	const { RawHTML } = wp.element;

	/**
	 * Register the carousel block
	 */
	registerBlockType('bnpp/carousel-homepage', {
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
		 */
		edit: function(props) {
			const { attributes, setAttributes } = props;
			const { slides = [], activeSlide = 0 } = attributes;

			// Ensure we have 3 slides
			const normalizedSlides = [...slides];
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

			const blockProps = useBlockProps({
				className: 'bnpp-carousel-editor-wrapper',
			});

			/**
			 * Update slide data at a specific index
			 */
			const updateSlide = useCallback((slideIndex, fieldName, value) => {
				const updatedSlides = [...normalizedSlides];
				updatedSlides[slideIndex] = {
					...updatedSlides[slideIndex],
					[fieldName]: value,
				};
				setAttributes({ slides: updatedSlides });
			}, [normalizedSlides]);

			/**
			 * Set the active slide for editing
			 */
			const setActiveSlide = useCallback((index) => {
				setAttributes({ activeSlide: index });
			}, []);

			/**
			 * Handle media selection for slide image
			 */
			const onSelectImage = useCallback((media, slideIndex) => {
				if (!media || !media.url) {
					updateSlide(slideIndex, 'imageId', 0);
					updateSlide(slideIndex, 'imageUrl', '');
					return;
				}
				updateSlide(slideIndex, 'imageId', media.id);
				updateSlide(slideIndex, 'imageUrl', media.url);
			}, [updateSlide]);

			/**
			 * Remove image from slide
			 */
			const removeImage = useCallback((slideIndex) => {
				updateSlide(slideIndex, 'imageId', 0);
				updateSlide(slideIndex, 'imageUrl', '');
			}, [updateSlide]);

			const currentSlide = normalizedSlides[activeSlide] || normalizedSlides[0];

			return Fragment(
				{},
				// Block editor preview
				wp.element.createElement(
					'div',
					blockProps,
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
						normalizedSlides.map((slide, index) => {
							const isActive = index === activeSlide;
							return wp.element.createElement(
								'div',
								{
									key: 'slide-' + index,
									className: 'diapositive' + (isActive ? ' active' : ''),
									onClick: () => setActiveSlide(index),
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
										onClick: (e) => {
											e.stopPropagation();
											setActiveSlide(index);
										},
									},
									wp.element.createElement(
										'h3',
										{
											style: {
												margin: '0 0 12px 0',
												fontSize: '24px',
												fontWeight: '600',
												color: '#333',
											},
										},
										slide.title
									),
									wp.element.createElement(
										'p',
										{
											style: {
												margin: 0,
												fontSize: '14px',
												color: '#666',
												lineHeight: '1.5',
											},
										},
										slide.description
									)
								),
								// Button
								wp.element.createElement(
									'div',
									{
										className: 'button-wrapper',
										style: {
											position: 'absolute',
											top: '585px',
											left: '40px',
											zIndex: 20,
										},
										onClick: (e) => {
											e.stopPropagation();
											setActiveSlide(index);
										},
									},
									wp.element.createElement(
										'a',
										{
											className: 'bnpp-button ' + (slide.buttonStyle || 'primary'),
											href: '#',
											onClick: (e) => {
												e.preventDefault();
												e.stopPropagation();
												setActiveSlide(index);
											},
											style: {
												display: (slide.buttonUrl && slide.buttonText !== 'Button content...') ? 'inline-block' : 'none',
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
								)
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
							normalizedSlides.map((slide, index) => {
								const isActive = index === activeSlide;
								const itemWidth = (100 - (286 / 1920 * 100)) / normalizedSlides.length;
								return wp.element.createElement(
									'div',
									{
										key: 'title-' + index,
										className: 'bnpp-carousel-title-item' + (isActive ? ' active' : ''),
										onClick: () => setActiveSlide(index),
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
				// Inspector panel
				wp.element.createElement(
					InspectorControls,
					{},
					wp.element.createElement(
						PanelBody,
						{
							title: 'Slide Settings',
							initialOpen: true,
						},
						// Slide selector buttons
						wp.element.createElement(
							'div',
							{
								className: 'bnpp-carousel-slide-selector',
								style: {
									display: 'flex',
									gap: '10px',
									marginBottom: '20px',
									flexWrap: 'wrap',
								},
							},
							normalizedSlides.map((slide, index) => {
								return wp.element.createElement(
									Button,
									{
										key: 'slide-btn-' + index,
										className: 'bnpp-carousel-slide-button' + (index === activeSlide ? ' active' : ''),
										onClick: () => setActiveSlide(index),
										variant: index === activeSlide ? 'primary' : 'secondary',
									},
									'Slide ' + (index + 1)
								);
							})
						),
						// Slide content editor
						wp.element.createElement(
							Fragment,
							{},
							// Title input
							wp.element.createElement(
								TextControl,
								{
									label: 'Slide Title',
									value: currentSlide.title,
									onChange: (value) => updateSlide(activeSlide, 'title', value),
									placeholder: 'Enter slide title',
								}
							),
							// Description input
							wp.element.createElement(
								TextareaControl,
								{
									label: 'Description',
									value: currentSlide.description,
									onChange: (value) => updateSlide(activeSlide, 'description', value),
									placeholder: 'Add your description here',
									rows: 4,
								}
							),
							// Image upload
							wp.element.createElement(
								'div',
								{
									className: 'bnpp-carousel-inspector-section',
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
									{
										style: {
											margin: '0 0 15px 0',
											fontSize: '14px',
											fontWeight: '600',
											color: '#333',
											textTransform: 'uppercase',
										},
									},
									'Background Image'
								),
								wp.element.createElement(
									'div',
									{
										className: 'bnpp-carousel-image-preview' + (currentSlide.imageUrl ? ' has-image' : ''),
										style: {
											position: 'relative',
											width: '100%',
											height: '150px',
											backgroundColor: '#f5f5f5',
											border: currentSlide.imageUrl ? '2px solid #0066cc' : '2px dashed #ccc',
											borderRadius: '4px',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											marginBottom: '10px',
											overflow: 'hidden',
										},
									},
									currentSlide.imageUrl ? wp.element.createElement(
										'img',
										{
											src: currentSlide.imageUrl,
											alt: 'Slide background',
											style: {
												maxWidth: '100%',
												maxHeight: '100%',
												objectFit: 'cover',
											},
										}
									) : 'No image selected'
								),
								wp.element.createElement(
									MediaUploadCheck,
									{},
									wp.element.createElement(
										MediaUpload,
										{
											onSelect: (media) => onSelectImage(media, activeSlide),
											allowedTypes: ['image'],
											render: ({ open }) => {
												return wp.element.createElement(
													Button,
													{
														onClick: open,
														variant: 'primary',
													},
													currentSlide.imageUrl ? 'Change Image' : 'Upload Image'
												);
											},
										}
									)
								),
								currentSlide.imageUrl && wp.element.createElement(
									Button,
									{
										onClick: () => removeImage(activeSlide),
										variant: 'secondary',
										style: {
											marginLeft: '10px',
											color: '#cc0000',
										},
									},
									'Remove Image'
								)
							),
							// Button settings section
							wp.element.createElement(
								'div',
								{
									className: 'bnpp-carousel-inspector-section',
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
									{
										style: {
											margin: '0 0 15px 0',
											fontSize: '14px',
											fontWeight: '600',
											color: '#333',
											textTransform: 'uppercase',
										},
									},
									'Button Settings'
								),
								// Button URL
								wp.element.createElement(
									TextControl,
									{
										label: 'Button Link URL',
										type: 'url',
										value: currentSlide.buttonUrl,
										onChange: (value) => updateSlide(activeSlide, 'buttonUrl', value),
										placeholder: 'https://example.com',
									}
								),
								// Button text
								wp.element.createElement(
									TextControl,
									{
										label: 'Button Text',
										value: currentSlide.buttonText,
										onChange: (value) => updateSlide(activeSlide, 'buttonText', value),
										placeholder: 'Button content...',
										onFocus: (e) => {
											if (e.target.value === 'Button content...') {
												e.target.value = '';
												updateSlide(activeSlide, 'buttonText', '');
											}
										},
										onBlur: (e) => {
											if (e.target.value === '') {
												updateSlide(activeSlide, 'buttonText', 'Button content...');
											}
										},
									}
								),
								// Button style
								wp.element.createElement(
									SelectControl,
									{
										label: 'Button Style',
										value: currentSlide.buttonStyle || 'primary',
										options: [
											{ label: 'Primary', value: 'primary' },
											{ label: 'Secondary', value: 'secondary' },
											{ label: 'Tertiary', value: 'tertiary' },
											{ label: 'Ghost', value: 'ghost' },
										],
										onChange: (value) => updateSlide(activeSlide, 'buttonStyle', value),
									}
								),
								// Button target
								wp.element.createElement(
									ToggleControl,
									{
										label: 'Open in New Tab',
										checked: currentSlide.buttonTarget,
										onChange: (value) => updateSlide(activeSlide, 'buttonTarget', value),
									}
								)
							)
						)
					)
				)
			);
		},

		/**
		 * Block save function
		 * Returns null to use PHP render callback
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
		const initializeCarousels = () => {
			const carouselWrappers = document.querySelectorAll('.bnpp-carousel-wrapper');

			carouselWrappers.forEach((wrapper) => {
				const container = wrapper.querySelector('.bnpp-carousel-container');
				const slides = container.querySelectorAll('.diapositive');
				const titleItems = wrapper.querySelectorAll('.bnpp-carousel-title-item');
				let currentSlide = 0;

				/**
				 * Show slide at specific index
				 */
				const showSlide = (n) => {
					// Remove active class from all slides and titles
					slides.forEach((slide) => {
						slide.classList.remove('active', 'prev');
						slide.setAttribute('aria-hidden', 'true');
					});
					titleItems.forEach((item) => {
						item.classList.remove('active');
						item.setAttribute('aria-selected', 'false');
					});

					// Add active class to current slide and title
					slides[n].classList.add('active');
					slides[n].setAttribute('aria-hidden', 'false');
					titleItems[n].classList.add('active');
					titleItems[n].setAttribute('aria-selected', 'true');

					currentSlide = n;
				};

				/**
				 * Next slide
				 */
				const nextSlide = () => {
					let n = (currentSlide + 1) % slides.length;
					showSlide(n);
				};

				/**
				 * Previous slide
				 */
				const prevSlide = () => {
					let n = (currentSlide - 1 + slides.length) % slides.length;
					showSlide(n);
				};

				/**
				 * Go to slide
				 */
				const goToSlide = (n) => {
					showSlide(n);
				};

				// Initialize: show first slide
				showSlide(0);

				// Add click handlers to title items
				titleItems.forEach((item, index) => {
					item.addEventListener('click', () => {
						goToSlide(index);
					});
					item.addEventListener('keydown', (e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							goToSlide(index);
						}
					});
				});

				// Optional: Auto-rotate carousel every 10 seconds
				// Uncomment below to enable auto-rotation
				/*
				setInterval(() => {
					nextSlide();
				}, 10000);
				*/

				// Keyboard navigation
				document.addEventListener('keydown', (e) => {
					if (container.contains(document.activeElement) || container === document.activeElement) {
						if (e.key === 'ArrowLeft') {
							prevSlide();
						} else if (e.key === 'ArrowRight') {
							nextSlide();
						}
					}
				});

				// Store functions in data attribute for external access
				wrapper.dataset.carouselInstance = {
					nextSlide: nextSlide,
					prevSlide: prevSlide,
					goToSlide: goToSlide,
					currentSlide: currentSlide,
				};
			});
		};

		// Initialize carousels
		initializeCarousels();

		// Re-initialize on dynamic content loads
		if (window.MutationObserver) {
			const observer = new MutationObserver(() => {
				initializeCarousels();
			});

			observer.observe(document.body, {
				childList: true,
				subtree: true,
			});
		}
	});

})();
