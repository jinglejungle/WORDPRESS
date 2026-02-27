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
		 * Uses vanilla JavaScript DOM manipulation instead of React
		 */
		edit: function(props) {
			var attributes = props.attributes;
			var setAttributes = props.setAttributes;
			var slides = attributes.slides || [];
			var activeSlide = attributes.activeSlide || 0;

			// Ensure we have exactly 3 slides
			if (slides.length < 3) {
				var normalizedSlides = [];
				for (var i = 0; i < slides.length; i++) {
					normalizedSlides.push(slides[i]);
				}
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
				slides = normalizedSlides;
				setAttributes({ slides: normalizedSlides });
			}

			/**
			 * Update a specific slide property
			 * @param {number} slideIndex - The index of the slide to update
			 * @param {string} fieldName - The name of the field to update
			 * @param {*} value - The new value for the field
			 */
			var updateSlide = function(slideIndex, fieldName, value) {
				var updatedSlides = [];
				for (var i = 0; i < slides.length; i++) {
					if (i === slideIndex) {
						var updated = {};
						for (var key in slides[i]) {
							if (slides[i].hasOwnProperty(key)) {
								updated[key] = slides[i][key];
							}
						}
						updated[fieldName] = value;
						updatedSlides.push(updated);
					} else {
						updatedSlides.push(slides[i]);
					}
				}
				setAttributes({ slides: updatedSlides });
			};

			/**
			 * Set active slide for editing in inspector panel
			 * @param {number} index - The slide index to activate
			 */
			var setActiveSlideHandler = function(index) {
				setAttributes({ activeSlide: index });
			};

			/**
			 * Handle media upload for slide background image
			 * @param {object} media - The media object from WordPress media upload
			 * @param {number} slideIndex - The slide index to apply the image to
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
			 * @param {number} slideIndex - The slide index
			 */
			var removeImage = function(slideIndex) {
				updateSlide(slideIndex, 'imageId', 0);
				updateSlide(slideIndex, 'imageUrl', '');
			};

			var currentSlideData = slides[activeSlide] || slides[0];

			// Create main wrapper container
			var wrapper = document.createElement('div');
			wrapper.className = 'bnpp-carousel-editor-wrapper';

			// Create carousel preview container
			var previewContainer = document.createElement('div');
			previewContainer.className = 'bnpp-carousel-container';
			previewContainer.style.position = 'relative';
			previewContainer.style.width = '100%';
			previewContainer.style.maxWidth = '1920px';
			previewContainer.style.height = '640px';
			previewContainer.style.backgroundColor = '#f5f5f5';
			previewContainer.style.overflow = 'hidden';
			previewContainer.style.margin = '0 auto';
			previewContainer.style.border = '2px solid #0066cc';

			// Render all slides
			for (var slideIndex = 0; slideIndex < slides.length; slideIndex++) {
				var slide = slides[slideIndex];
				var isActive = slideIndex === activeSlide;

				// Create individual slide div
				var slideDiv = document.createElement('div');
				slideDiv.className = 'diapositive' + (isActive ? ' active' : '');
				slideDiv.style.position = 'absolute';
				slideDiv.style.top = '0';
				slideDiv.style.left = '0';
				slideDiv.style.width = '100%';
				slideDiv.style.height = '100%';
				slideDiv.style.opacity = isActive ? '1' : '0';
				slideDiv.style.transition = 'opacity 0.3s ease';
				slideDiv.style.backgroundImage = slide.imageUrl ? 'url(' + slide.imageUrl + ')' : 'none';
				slideDiv.style.backgroundSize = 'cover';
				slideDiv.style.backgroundPosition = 'center';
				slideDiv.style.cursor = 'pointer';
				slideDiv.style.zIndex = isActive ? '10' : '1';
				slideDiv.style.border = isActive ? '3px solid #0066cc' : '1px solid #ccc';

				// Create description box
				var descDiv = document.createElement('div');
				descDiv.className = 'diapositive-description';
				descDiv.style.position = 'absolute';
				descDiv.style.top = '280px';
				descDiv.style.left = '40px';
				descDiv.style.width = '689px';
				descDiv.style.maxHeight = '285px';
				descDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
				descDiv.style.padding = '20px';
				descDiv.style.boxSizing = 'border-box';
				descDiv.style.borderRadius = '4px';
				descDiv.style.zIndex = '20';
				descDiv.style.cursor = 'pointer';
				descDiv.style.border = 'none';
				descDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';

				// Add title heading
				var titleH3 = document.createElement('h3');
				titleH3.style.margin = '0 0 12px 0';
				titleH3.style.fontSize = '24px';
				titleH3.style.fontWeight = '600';
				titleH3.style.color = '#333';
				titleH3.textContent = slide.title;
				descDiv.appendChild(titleH3);

				// Add description paragraph
				var descP = document.createElement('p');
				descP.style.margin = '0';
				descP.style.fontSize = '14px';
				descP.style.color = '#666';
				descP.style.lineHeight = '1.5';
				descP.textContent = slide.description;
				descDiv.appendChild(descP);

				// Add click handler to description box
				(function(idx) {
					descDiv.addEventListener('click', function(e) {
						e.stopPropagation();
						setActiveSlideHandler(idx);
					});
				})(slideIndex);

				slideDiv.appendChild(descDiv);

				// Create button if URL and text are provided
				var showButton = slide.buttonUrl && slide.buttonText !== 'Button content...';
				if (showButton) {
					var buttonDiv = document.createElement('div');
					buttonDiv.style.position = 'absolute';
					buttonDiv.style.top = '585px';
					buttonDiv.style.left = '40px';
					buttonDiv.style.zIndex = '20';

					var buttonLink = document.createElement('a');
					buttonLink.className = 'bnpp-button ' + (slide.buttonStyle || 'primary');
					buttonLink.href = '#';
					buttonLink.style.display = 'inline-block';
					buttonLink.style.padding = '12px 24px';
					buttonLink.style.textDecoration = 'none';
					buttonLink.style.borderRadius = '4px';
					buttonLink.style.fontSize = '14px';
					buttonLink.style.fontWeight = '600';
					buttonLink.style.cursor = 'pointer';
					buttonLink.textContent = slide.buttonText;

					(function(idx) {
						buttonLink.addEventListener('click', function(e) {
							e.preventDefault();
							e.stopPropagation();
							setActiveSlideHandler(idx);
						});
					})(slideIndex);

					buttonDiv.appendChild(buttonLink);
					slideDiv.appendChild(buttonDiv);
				}

				// Add click handler to entire slide
				(function(idx) {
					slideDiv.addEventListener('click', function() {
						setActiveSlideHandler(idx);
					});
				})(slideIndex);

				previewContainer.appendChild(slideDiv);
			}

			// Create title indicators at bottom
			var titlesDiv = document.createElement('div');
			titlesDiv.className = 'bnpp-carousel-titles';
			titlesDiv.style.position = 'absolute';
			titlesDiv.style.bottom = '0';
			titlesDiv.style.left = '0';
			titlesDiv.style.right = '0';
			titlesDiv.style.height = '154px';
			titlesDiv.style.backgroundColor = '#f5f5f5';
			titlesDiv.style.display = 'flex';
			titlesDiv.style.alignItems = 'stretch';
			titlesDiv.style.zIndex = '15';
			titlesDiv.style.marginTop = '-154px';

			for (var titleIdx = 0; titleIdx < slides.length; titleIdx++) {
				var slide = slides[titleIdx];
				var isActive = titleIdx === activeSlide;
				var titleItem = document.createElement('div');
				titleItem.className = 'bnpp-carousel-title-item' + (isActive ? ' active' : '');
				titleItem.style.flex = '1';
				titleItem.style.display = 'flex';
				titleItem.style.alignItems = 'center';
				titleItem.style.justifyContent = 'center';
				titleItem.style.padding = '20px';
				titleItem.style.textAlign = 'center';
				titleItem.style.cursor = 'pointer';
				titleItem.style.backgroundColor = isActive ? '#ffffff' : '#ececec';
				titleItem.style.border = '1px solid #ddd';
				titleItem.style.borderBottom = isActive ? '3px solid #0066cc' : '1px solid #ddd';
				titleItem.style.fontSize = '16px';
				titleItem.style.fontWeight = isActive ? '700' : '600';
				titleItem.style.color = isActive ? '#0066cc' : '#333';
				titleItem.style.userSelect = 'none';
				if (titleIdx === 0) {
					titleItem.style.marginLeft = '286px';
				}
				titleItem.textContent = slide.title;

				(function(idx) {
					titleItem.addEventListener('click', function() {
						setActiveSlideHandler(idx);
					});
				})(titleIdx);

				titlesDiv.appendChild(titleItem);
			}

			previewContainer.appendChild(titlesDiv);
			wrapper.appendChild(previewContainer);

			// Create inspector panel on the right
			var inspectorPanel = document.createElement('div');
			inspectorPanel.className = 'bnpp-carousel-inspector-wrapper';
			inspectorPanel.style.padding = '15px';
			inspectorPanel.style.backgroundColor = '#ffffff';
			inspectorPanel.style.borderRadius = '4px';

			// Slide selector buttons section
			var slideButtonsContainer = document.createElement('div');
			slideButtonsContainer.className = 'bnpp-carousel-slide-selector';
			slideButtonsContainer.style.display = 'flex';
			slideButtonsContainer.style.gap = '10px';
			slideButtonsContainer.style.marginBottom = '20px';
			slideButtonsContainer.style.flexWrap = 'wrap';

			for (var btnIdx = 0; btnIdx < slides.length; btnIdx++) {
				var btn = document.createElement('button');
				btn.className = 'bnpp-carousel-slide-button' + (btnIdx === activeSlide ? ' active' : '');
				btn.textContent = 'Slide ' + (btnIdx + 1);
				btn.style.padding = '10px 15px';
				btn.style.backgroundColor = btnIdx === activeSlide ? '#0066cc' : '#e0e0e0';
				btn.style.color = btnIdx === activeSlide ? '#ffffff' : '#333';
				btn.style.border = '2px solid ' + (btnIdx === activeSlide ? '#0066cc' : '#999');
				btn.style.borderRadius = '4px';
				btn.style.cursor = 'pointer';
				btn.style.fontSize = '14px';
				btn.style.fontWeight = btnIdx === activeSlide ? '600' : 'normal';
				btn.style.transition = 'all 0.2s ease';

				(function(idx) {
					btn.addEventListener('click', function() {
						setActiveSlideHandler(idx);
					});
				})(btnIdx);

				slideButtonsContainer.appendChild(btn);
			}

			inspectorPanel.appendChild(slideButtonsContainer);

			// Title input field
			var titleFieldContainer = document.createElement('div');
			titleFieldContainer.className = 'bnpp-carousel-inspector-field';
			titleFieldContainer.style.marginBottom = '15px';

			var titleLabel = document.createElement('label');
			titleLabel.textContent = 'Slide Title';
			titleLabel.style.display = 'block';
			titleLabel.style.marginBottom = '5px';
			titleLabel.style.fontSize = '13px';
			titleLabel.style.fontWeight = '500';
			titleLabel.style.color = '#555';

			var titleInput = document.createElement('input');
			titleInput.type = 'text';
			titleInput.value = currentSlideData.title;
			titleInput.placeholder = 'Enter slide title';
			titleInput.style.width = '100%';
			titleInput.style.padding = '8px';
			titleInput.style.border = '1px solid #ddd';
			titleInput.style.borderRadius = '4px';
			titleInput.style.fontSize = '13px';
			titleInput.style.boxSizing = 'border-box';

			titleInput.addEventListener('change', function() {
				updateSlide(activeSlide, 'title', this.value);
			});

			titleFieldContainer.appendChild(titleLabel);
			titleFieldContainer.appendChild(titleInput);
			inspectorPanel.appendChild(titleFieldContainer);

			// Description textarea field
			var descFieldContainer = document.createElement('div');
			descFieldContainer.className = 'bnpp-carousel-inspector-field';
			descFieldContainer.style.marginBottom = '15px';

			var descLabel = document.createElement('label');
			descLabel.textContent = 'Description';
			descLabel.style.display = 'block';
			descLabel.style.marginBottom = '5px';
			descLabel.style.fontSize = '13px';
			descLabel.style.fontWeight = '500';
			descLabel.style.color = '#555';

			var descTextarea = document.createElement('textarea');
			descTextarea.value = currentSlideData.description;
			descTextarea.placeholder = 'Add your description here';
			descTextarea.style.width = '100%';
			descTextarea.style.padding = '8px';
			descTextarea.style.border = '1px solid #ddd';
			descTextarea.style.borderRadius = '4px';
			descTextarea.style.fontSize = '13px';
			descTextarea.style.boxSizing = 'border-box';
			descTextarea.style.resize = 'vertical';
			descTextarea.style.minHeight = '80px';
			descTextarea.style.fontFamily = 'inherit';

			descTextarea.addEventListener('change', function() {
				updateSlide(activeSlide, 'description', this.value);
			});

			descFieldContainer.appendChild(descLabel);
			descFieldContainer.appendChild(descTextarea);
			inspectorPanel.appendChild(descFieldContainer);

			// Background image section
			var imageSection = document.createElement('div');
			imageSection.className = 'bnpp-carousel-inspector-section';
			imageSection.style.marginBottom = '20px';
			imageSection.style.padding = '15px';
			imageSection.style.backgroundColor = '#f9f9f9';
			imageSection.style.border = '1px solid #e0e0e0';
			imageSection.style.borderRadius = '4px';

			var imageTitle = document.createElement('h3');
			imageTitle.textContent = 'Background Image';
			imageTitle.style.margin = '0 0 15px 0';
			imageTitle.style.fontSize = '14px';
			imageTitle.style.fontWeight = '600';
			imageTitle.style.color = '#333';
			imageTitle.style.textTransform = 'uppercase';
			imageSection.appendChild(imageTitle);

			// Image preview container
			var imagePreview = document.createElement('div');
			imagePreview.className = 'bnpp-carousel-image-preview' + (currentSlideData.imageUrl ? ' has-image' : '');
			imagePreview.style.position = 'relative';
			imagePreview.style.width = '100%';
			imagePreview.style.height = '150px';
			imagePreview.style.backgroundColor = '#f5f5f5';
			imagePreview.style.border = currentSlideData.imageUrl ? '2px solid #0066cc' : '2px dashed #ccc';
			imagePreview.style.borderRadius = '4px';
			imagePreview.style.display = 'flex';
			imagePreview.style.alignItems = 'center';
			imagePreview.style.justifyContent = 'center';
			imagePreview.style.marginBottom = '10px';
			imagePreview.style.overflow = 'hidden';

			if (currentSlideData.imageUrl) {
				var previewImg = document.createElement('img');
				previewImg.src = currentSlideData.imageUrl;
				previewImg.alt = 'Slide background';
				previewImg.style.maxWidth = '100%';
				previewImg.style.maxHeight = '100%';
				previewImg.style.objectFit = 'cover';
				imagePreview.appendChild(previewImg);
			} else {
				imagePreview.textContent = 'No image selected';
			}

			imageSection.appendChild(imagePreview);

			// Upload image button
			var uploadBtn = document.createElement('button');
			uploadBtn.textContent = currentSlideData.imageUrl ? 'Change Image' : 'Upload Image';
			uploadBtn.style.padding = '8px 16px';
			uploadBtn.style.backgroundColor = '#0066cc';
			uploadBtn.style.color = '#ffffff';
			uploadBtn.style.border = 'none';
			uploadBtn.style.borderRadius = '4px';
			uploadBtn.style.cursor = 'pointer';
			uploadBtn.style.fontSize = '13px';
			uploadBtn.style.fontWeight = '500';

			(function(idx) {
				uploadBtn.addEventListener('click', function() {
					// Open WordPress media uploader
					if (wp.media) {
						var frame = wp.media({
							title: 'Select Background Image',
							button: {
								text: 'Use this image'
							},
							multiple: false,
							library: {
								type: 'image'
							}
						});

						frame.on('select', function() {
							var attachment = frame.state().get('selection').first().toJSON();
							if (attachment && attachment.url) {
								onSelectImage(attachment, idx);
							}
						});

						frame.open();
					}
				});
			})(activeSlide);

			imageSection.appendChild(uploadBtn);

			// Remove image button (if image exists)
			if (currentSlideData.imageUrl) {
				var removeBtn = document.createElement('button');
				removeBtn.textContent = 'Remove Image';
				removeBtn.style.marginLeft = '10px';
				removeBtn.style.padding = '8px 16px';
				removeBtn.style.backgroundColor = '#cccccc';
				removeBtn.style.color = '#cc0000';
				removeBtn.style.border = 'none';
				removeBtn.style.borderRadius = '4px';
				removeBtn.style.cursor = 'pointer';
				removeBtn.style.fontSize = '13px';
				removeBtn.style.fontWeight = '500';

				(function(idx) {
					removeBtn.addEventListener('click', function() {
						removeImage(idx);
					});
				})(activeSlide);

				imageSection.appendChild(removeBtn);
			}

			inspectorPanel.appendChild(imageSection);

			// Button settings section
			var buttonSection = document.createElement('div');
			buttonSection.className = 'bnpp-carousel-inspector-section';
			buttonSection.style.marginBottom = '20px';
			buttonSection.style.padding = '15px';
			buttonSection.style.backgroundColor = '#f9f9f9';
			buttonSection.style.border = '1px solid #e0e0e0';
			buttonSection.style.borderRadius = '4px';

			var buttonTitle = document.createElement('h3');
			buttonTitle.textContent = 'Button Settings';
			buttonTitle.style.margin = '0 0 15px 0';
			buttonTitle.style.fontSize = '14px';
			buttonTitle.style.fontWeight = '600';
			buttonTitle.style.color = '#333';
			buttonTitle.style.textTransform = 'uppercase';
			buttonSection.appendChild(buttonTitle);

			// Button URL field
			var buttonUrlContainer = document.createElement('div');
			buttonUrlContainer.className = 'bnpp-carousel-inspector-field';
			buttonUrlContainer.style.marginBottom = '15px';

			var buttonUrlLabel = document.createElement('label');
			buttonUrlLabel.textContent = 'Button Link URL';
			buttonUrlLabel.style.display = 'block';
			buttonUrlLabel.style.marginBottom = '5px';
			buttonUrlLabel.style.fontSize = '13px';
			buttonUrlLabel.style.fontWeight = '500';
			buttonUrlLabel.style.color = '#555';

			var buttonUrlInput = document.createElement('input');
			buttonUrlInput.type = 'url';
			buttonUrlInput.value = currentSlideData.buttonUrl;
			buttonUrlInput.placeholder = 'https://example.com';
			buttonUrlInput.style.width = '100%';
			buttonUrlInput.style.padding = '8px';
			buttonUrlInput.style.border = '1px solid #ddd';
			buttonUrlInput.style.borderRadius = '4px';
			buttonUrlInput.style.fontSize = '13px';
			buttonUrlInput.style.boxSizing = 'border-box';

			buttonUrlInput.addEventListener('change', function() {
				updateSlide(activeSlide, 'buttonUrl', this.value);
			});

			buttonUrlContainer.appendChild(buttonUrlLabel);
			buttonUrlContainer.appendChild(buttonUrlInput);
			buttonSection.appendChild(buttonUrlContainer);

			// Button text field
			var buttonTextContainer = document.createElement('div');
			buttonTextContainer.className = 'bnpp-carousel-inspector-field';
			buttonTextContainer.style.marginBottom = '15px';

			var buttonTextLabel = document.createElement('label');
			buttonTextLabel.textContent = 'Button Text';
			buttonTextLabel.style.display = 'block';
			buttonTextLabel.style.marginBottom = '5px';
			buttonTextLabel.style.fontSize = '13px';
			buttonTextLabel.style.fontWeight = '500';
			buttonTextLabel.style.color = '#555';

			var buttonTextInput = document.createElement('input');
			buttonTextInput.type = 'text';
			buttonTextInput.value = currentSlideData.buttonText;
			buttonTextInput.placeholder = 'Button content...';
			buttonTextInput.style.width = '100%';
			buttonTextInput.style.padding = '8px';
			buttonTextInput.style.border = '1px solid #ddd';
			buttonTextInput.style.borderRadius = '4px';
			buttonTextInput.style.fontSize = '13px';
			buttonTextInput.style.boxSizing = 'border-box';

			buttonTextInput.addEventListener('focus', function() {
				if (this.value === 'Button content...') {
					this.value = '';
					updateSlide(activeSlide, 'buttonText', '');
				}
			});

			buttonTextInput.addEventListener('blur', function() {
				if (this.value === '') {
					this.value = 'Button content...';
					updateSlide(activeSlide, 'buttonText', 'Button content...');
				}
			});

			buttonTextInput.addEventListener('change', function() {
				if (this.value !== '') {
					updateSlide(activeSlide, 'buttonText', this.value);
				}
			});

			buttonTextContainer.appendChild(buttonTextLabel);
			buttonTextContainer.appendChild(buttonTextInput);
			buttonSection.appendChild(buttonTextContainer);

			// Button style select dropdown
			var buttonStyleContainer = document.createElement('div');
			buttonStyleContainer.className = 'bnpp-carousel-inspector-field';
			buttonStyleContainer.style.marginBottom = '15px';

			var buttonStyleLabel = document.createElement('label');
			buttonStyleLabel.textContent = 'Button Style';
			buttonStyleLabel.style.display = 'block';
			buttonStyleLabel.style.marginBottom = '5px';
			buttonStyleLabel.style.fontSize = '13px';
			buttonStyleLabel.style.fontWeight = '500';
			buttonStyleLabel.style.color = '#555';

			var buttonStyleSelect = document.createElement('select');
			buttonStyleSelect.style.width = '100%';
			buttonStyleSelect.style.padding = '8px';
			buttonStyleSelect.style.border = '1px solid #ddd';
			buttonStyleSelect.style.borderRadius = '4px';
			buttonStyleSelect.style.fontSize = '13px';
			buttonStyleSelect.style.boxSizing = 'border-box';

			var styles = ['primary', 'secondary', 'tertiary', 'ghost'];
			for (var styleIdx = 0; styleIdx < styles.length; styleIdx++) {
				var style = styles[styleIdx];
				var option = document.createElement('option');
				option.value = style;
				option.textContent = style.charAt(0).toUpperCase() + style.slice(1);
				option.selected = currentSlideData.buttonStyle === style;
				buttonStyleSelect.appendChild(option);
			}

			buttonStyleSelect.addEventListener('change', function() {
				updateSlide(activeSlide, 'buttonStyle', this.value);
			});

			buttonStyleContainer.appendChild(buttonStyleLabel);
			buttonStyleContainer.appendChild(buttonStyleSelect);
			buttonSection.appendChild(buttonStyleContainer);

			// Button target checkbox
			var buttonTargetContainer = document.createElement('div');
			buttonTargetContainer.className = 'bnpp-carousel-inspector-checkbox';
			buttonTargetContainer.style.display = 'flex';
			buttonTargetContainer.style.alignItems = 'center';
			buttonTargetContainer.style.gap = '8px';

			var buttonTargetCheckbox = document.createElement('input');
			buttonTargetCheckbox.type = 'checkbox';
			buttonTargetCheckbox.checked = currentSlideData.buttonTarget;
			buttonTargetCheckbox.style.width = 'auto';
			buttonTargetCheckbox.style.margin = '0';

			buttonTargetCheckbox.addEventListener('change', function() {
				updateSlide(activeSlide, 'buttonTarget', this.checked);
			});

			var buttonTargetLabel = document.createElement('label');
			buttonTargetLabel.textContent = 'Open in New Tab';
			buttonTargetLabel.style.fontSize = '13px';
			buttonTargetLabel.style.fontWeight = '500';
			buttonTargetLabel.style.color = '#555';
			buttonTargetLabel.style.margin = '0';
			buttonTargetLabel.style.cursor = 'pointer';

			buttonTargetContainer.appendChild(buttonTargetCheckbox);
			buttonTargetContainer.appendChild(buttonTargetLabel);
			buttonSection.appendChild(buttonTargetContainer);

			inspectorPanel.appendChild(buttonSection);

			// Build complete editor layout (left column + right panel)
			var mainEditor = document.createElement('div');
			mainEditor.style.display = 'flex';
			mainEditor.style.gap = '20px';

			var leftColumn = document.createElement('div');
			leftColumn.style.flex = '1';
			leftColumn.appendChild(wrapper);

			var rightColumn = document.createElement('div');
			rightColumn.style.width = '280px';
			rightColumn.style.maxHeight = '600px';
			rightColumn.style.overflowY = 'auto';
			rightColumn.style.paddingRight = '10px';
			rightColumn.appendChild(inspectorPanel);

			mainEditor.appendChild(leftColumn);
			mainEditor.appendChild(rightColumn);

			// Return the compiled HTML structure
			return mainEditor.outerHTML;
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
