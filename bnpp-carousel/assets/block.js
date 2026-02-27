/**
 * BNPP Carousel Block
 */

(function() {
	'use strict';

	// Check if Gutenberg is available
	if (!window.wp || !window.wp.blocks) {
		return;
	}

	// Register block
	window.wp.blocks.registerBlockType('bnpp/carousel-homepage', {
		title: 'BNPP Carousel Homepage',
		icon: 'images-alt2',
		category: 'media',
		
		edit: function(props) {
			var attributes = props.attributes;
			var setAttributes = props.setAttributes;
			var slides = attributes.slides || [];
			var activeSlide = attributes.activeSlide || 0;
			
			// Ensure 3 slides
			while (slides.length < 3) {
				slides.push({
					id: slides.length,
					title: 'Slide ' + (slides.length + 1),
					description: 'Add your description here',
					imageId: 0,
					imageUrl: '',
					buttonUrl: '',
					buttonText: 'Button content...',
					buttonStyle: 'primary',
					buttonTarget: false
				});
			}
			
			setAttributes({ slides: slides });
			
			var current = slides[activeSlide];
			var el = window.wp.element.createElement;
			
			// Simple preview
			return el('div', { style: { padding: '20px', backgroundColor: '#f9f9f9' } },
				el('h2', null, 'BNPP Carousel Block'),
				el('p', null, 'Slide ' + (activeSlide + 1) + ': ' + current.title),
				el('p', null, 'Description: ' + current.description),
				current.buttonUrl ? el('p', null, 'Button: ' + current.buttonText + ' -> ' + current.buttonUrl) : el('p', null, 'No button set'),
				
				// Slide selector buttons
				el('div', { style: { marginTop: '20px' } },
					el('p', null, 'Select Slide:'),
					el('div', null,
						slides.map(function(slide, idx) {
							return el('button', {
								key: 'slide-' + idx,
								onClick: function() { setAttributes({ activeSlide: idx }); },
								style: {
									padding: '10px 15px',
									marginRight: '10px',
									backgroundColor: idx === activeSlide ? '#0066cc' : '#ddd',
									color: idx === activeSlide ? '#fff' : '#333',
									border: 'none',
									borderRadius: '4px',
									cursor: 'pointer'
								}
							}, 'Slide ' + (idx + 1));
						})
					)
				),
				
				// Inspector-like panel
				el('div', { style: { marginTop: '20px', padding: '15px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '4px' } },
					el('h3', null, 'Edit Slide'),
					el('label', { style: { display: 'block', marginBottom: '10px' } },
						'Title: ',
						el('input', {
							type: 'text',
							value: current.title,
							onChange: function(e) {
								var newSlides = slides.slice();
								newSlides[activeSlide].title = e.target.value.substring(0, 70);
								setAttributes({ slides: newSlides });
							},
							style: { width: '100%', padding: '5px', marginTop: '5px' }
						})
					),
					el('label', { style: { display: 'block', marginBottom: '10px' } },
						'Description: ',
						el('textarea', {
							value: current.description,
							onChange: function(e) {
								var newSlides = slides.slice();
								newSlides[activeSlide].description = e.target.value.substring(0, 100);
								setAttributes({ slides: newSlides });
							},
							style: { width: '100%', padding: '5px', marginTop: '5px', minHeight: '80px' }
						})
					),
					el('label', { style: { display: 'block', marginBottom: '10px' } },
						'Button URL: ',
						el('input', {
							type: 'url',
							value: current.buttonUrl,
							onChange: function(e) {
								var newSlides = slides.slice();
								newSlides[activeSlide].buttonUrl = e.target.value;
								setAttributes({ slides: newSlides });
							},
							style: { width: '100%', padding: '5px', marginTop: '5px' }
						})
					),
					el('label', { style: { display: 'block', marginBottom: '10px' } },
						'Button Text: ',
						el('input', {
							type: 'text',
							value: current.buttonText,
							onChange: function(e) {
								var newSlides = slides.slice();
								newSlides[activeSlide].buttonText = e.target.value;
								setAttributes({ slides: newSlides });
							},
							style: { width: '100%', padding: '5px', marginTop: '5px' }
						})
					),
					el('label', { style: { display: 'block', marginBottom: '10px' } },
						'Button Style: ',
						el('select', {
							value: current.buttonStyle || 'primary',
							onChange: function(e) {
								var newSlides = slides.slice();
								newSlides[activeSlide].buttonStyle = e.target.value;
								setAttributes({ slides: newSlides });
							},
							style: { width: '100%', padding: '5px', marginTop: '5px' }
						},
							el('option', { value: 'primary' }, 'Primary'),
							el('option', { value: 'secondary' }, 'Secondary'),
							el('option', { value: 'tertiary' }, 'Tertiary'),
							el('option', { value: 'ghost' }, 'Ghost')
						)
					),
					el('label', { style: { display: 'block', marginBottom: '10px' } },
						el('input', {
							type: 'checkbox',
							checked: current.buttonTarget,
							onChange: function(e) {
								var newSlides = slides.slice();
								newSlides[activeSlide].buttonTarget = e.target.checked;
								setAttributes({ slides: newSlides });
							}
						}),
						' Open in New Tab'
					),
					el('label', { style: { display: 'block', marginBottom: '10px' } },
						'Background Image URL: ',
						el('input', {
							type: 'text',
							value: current.imageUrl,
							onChange: function(e) {
								var newSlides = slides.slice();
								newSlides[activeSlide].imageUrl = e.target.value;
								setAttributes({ slides: newSlides });
							},
							placeholder: 'https://example.com/image.jpg',
							style: { width: '100%', padding: '5px', marginTop: '5px' }
						})
					)
				)
			);
		},
		
		save: function() {
			return null;
		}
	});

	// Frontend carousel
	function initCarousel() {
		var wrappers = document.querySelectorAll('.bnpp-carousel-wrapper');
		
		for (var i = 0; i < wrappers.length; i++) {
			(function(wrapper) {
				var container = wrapper.querySelector('.bnpp-carousel-container');
				if (!container) return;
				
				var slides = container.querySelectorAll('.diapositive');
				var titles = wrapper.querySelectorAll('.bnpp-carousel-title-item');
				var current = 0;
				
				var showSlide = function(n) {
					for (var j = 0; j < slides.length; j++) {
						slides[j].classList.remove('active');
						titles[j].classList.remove('active');
					}
					if (slides[n]) {
						slides[n].classList.add('active');
						titles[n].classList.add('active');
					}
					current = n;
				};
				
				showSlide(0);
				
				for (var j = 0; j < titles.length; j++) {
					(function(idx) {
						titles[idx].addEventListener('click', function() {
							showSlide(idx);
						});
					})(j);
				}
			})(wrappers[i]);
		}
	}
	
	// Initialize on DOM ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initCarousel);
	} else {
		initCarousel();
	}

})();
