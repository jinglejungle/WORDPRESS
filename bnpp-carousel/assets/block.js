/**
 * BNPP Carousel Block
 * Stable version with button display
 */

(function() {
	'use strict';

	if (typeof wp === 'undefined' || !wp.blocks) return;

	wp.blocks.registerBlockType('bnpp/carousel-homepage', {
		title: 'BNPP Carousel Homepage',
		icon: 'images-alt2',
		category: 'media',
		edit: function(props) {
			var attr = props.attributes;
			var setAttr = props.setAttributes;
			var slides = attr.slides ? attr.slides.slice() : [];
			
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

			var updateSlide = function(idx, field, val) {
				var updated = slides.map(function(s, i) {
					if (i !== idx) return s;
					var copy = {};
					for (var k in s) copy[k] = s[k];
					copy[field] = val;
					return copy;
				});
				setAttr({ slides: updated });
			};

			var activeSlide = attr.activeSlide || 0;
			var current = slides[activeSlide];

			var el = wp.element.createElement;

			return el('div', null,
				// CAROUSEL PREVIEW
				el('div', {style: {position: 'relative', marginBottom: '20px'}},
					el('div', {
						className: 'bnpp-carousel-container',
						style: {
							position: 'relative',
							width: '100%',
							maxWidth: '1920px',
							height: '640px',
							backgroundColor: '#f5f5f5',
							overflow: 'hidden',
							border: '2px solid #0066cc',
							margin: '0 auto'
						}
					},
						slides.map(function(slide, idx) {
							var isActive = idx === activeSlide;

							return el('div', {
								key: 'slide-' + idx,
								className: 'diapositive' + (isActive ? ' active' : ''),
								onClick: function() { setAttr({ activeSlide: idx }); },
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
									border: isActive ? '3px solid #0066cc' : '1px solid #ccc'
								}
							},
								// DESCRIPTION BOX
								el('div', {
									className: 'diapositive-description',
									onClick: function(e) { e.stopPropagation(); setAttr({ activeSlide: idx }); },
									style: {
										position: 'absolute',
										top: '180px',
										left: '40px',
										width: '689px',
										maxHeight: '285px',
										backgroundColor: 'rgba(255,255,255,0.95)',
										padding: '20px',
										boxSizing: 'border-box',
										borderRadius: '4px',
										zIndex: 20,
										border: isActive ? '2px solid #0066cc' : 'none',
										boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
									}
								},
									el('h3', {style: {margin: '0 0 12px 0', fontSize: '24px', fontWeight: '600', color: '#333'}}, slide.title),
									el('small', {style: {fontSize: '11px', color: '#999', display: 'block', marginBottom: '12px'}}, slide.title.length + ' / 70'),
									el('p', {style: {margin: '0', fontSize: '14px', color: '#666', lineHeight: '1.5'}}, slide.description),
									el('small', {style: {fontSize: '11px', color: '#999', display: 'block', marginTop: '4px'}}, slide.description.length + ' / 100')
								),
								
								// BUTTON - ALWAYS VISIBLE AT 525px
								el('div', {
									style: {position: 'absolute', top: '525px', left: '40px', zIndex: 20},
									onClick: function(e) { e.stopPropagation(); setAttr({ activeSlide: idx, activeEditSection: 'button' }); }
								},
									el('a', {
										className: 'bnpp-button ' + (slide.buttonStyle || 'primary'),
										href: '#',
										onClick: function(e) { e.preventDefault(); e.stopPropagation(); },
										style: {
											display: 'inline-block',
											padding: '12px 24px',
											textDecoration: 'none',
											borderRadius: '4px',
											fontSize: '14px',
											fontWeight: '600',
											cursor: 'pointer',
											minWidth: '140px',
											backgroundColor: slide.buttonUrl ? undefined : 'rgba(224,224,224,0.8)',
											color: slide.buttonUrl ? undefined : '#666'
										}
									}, slide.buttonText)
								)
							);
						}),
						
						// TITLE INDICATORS
						el('div', {
							className: 'bnpp-carousel-titles',
							style: {position: 'absolute', bottom: 0, left: 0, right: 0, height: '154px', backgroundColor: '#f5f5f5', display: 'flex', zIndex: 15}
						},
							slides.map(function(slide, idx) {
								var isActive = idx === activeSlide;
								return el('div', {
									key: 'title-' + idx,
									className: 'bnpp-carousel-title-item' + (isActive ? ' active' : ''),
									onClick: function() { setAttr({ activeSlide: idx }); },
									style: {
										flex: 1,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										padding: '20px',
										textAlign: 'center',
										cursor: 'pointer',
										backgroundColor: isActive ? '#ffffff' : '#ececec',
										borderLeft: isActive ? '4px solid #0066cc' : '1px solid #ddd',
										fontSize: '16px',
										fontWeight: isActive ? '700' : '600',
										color: isActive ? '#0066cc' : '#333',
										userSelect: 'none',
										marginLeft: idx === 0 ? '286px' : '0',
										paddingLeft: isActive ? '16px' : '20px'
									}
								}, slide.title);
							})
						),
						
						// PLAY BUTTON
						(attr.showPlayButton !== false) ? el('button', {
							style: {
								position: 'absolute',
								top: '10px',
								right: '10px',
								padding: '8px 12px',
								backgroundColor: attr.enableAutoPlay ? '#cc0000' : '#0066cc',
								color: '#ffffff',
								border: 'none',
								borderRadius: '4px',
								cursor: 'pointer',
								fontSize: '12px',
								fontWeight: '600',
								zIndex: 30
							},
							onClick: function(e) { e.stopPropagation(); setAttr({ enableAutoPlay: !attr.enableAutoPlay }); }
						}, attr.enableAutoPlay ? '⏸ Pause' : '▶ Play') : null
					)
				),

				// INSPECTOR PANEL
				wp.blockEditor && wp.blockEditor.InspectorControls ? el(wp.blockEditor.InspectorControls, null,
					// SLIDE SELECTOR
					el('div', {style: {padding: '15px', borderBottom: '1px solid #e0e0e0'}},
						el('h3', {style: {margin: '0 0 10px 0', fontSize: '13px', fontWeight: '600'}}, 'Slide Settings'),
						el('div', {style: {display: 'flex', gap: '8px', flexWrap: 'wrap'}},
							slides.map(function(s, idx) {
								return el('button', {
									key: 'btn-' + idx,
									onClick: function() { setAttr({ activeSlide: idx }); },
									style: {
										flex: '1',
										minWidth: '60px',
										padding: '8px 12px',
										backgroundColor: idx === activeSlide ? '#0066cc' : '#e0e0e0',
										color: idx === activeSlide ? '#ffffff' : '#333',
										border: idx === activeSlide ? '2px solid #0066cc' : '2px solid #ccc',
										borderRadius: '4px',
										cursor: 'pointer',
										fontSize: '12px'
									}
								}, 'Slide ' + (idx + 1));
							})
						)
					),
					
					// TITLE
					el('div', {style: {padding: '15px', borderBottom: '1px solid #e0e0e0'}},
						el('label', {style: {display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '600'}}, 'Title (Max 70)'),
						el('input', {
							type: 'text',
							value: current.title,
							onChange: function(e) { updateSlide(activeSlide, 'title', e.target.value.substring(0, 70)); },
							style: {width: '100%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px', boxSizing: 'border-box', marginBottom: '5px'}
						}),
						el('small', {style: {fontSize: '11px', color: '#999'}}, current.title.length + ' / 70')
					),
					
					// DESCRIPTION
					el('div', {style: {padding: '15px', borderBottom: '1px solid #e0e0e0'}},
						el('label', {style: {display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '600'}}, 'Description (Max 100)'),
						el('textarea', {
							value: current.description,
							onChange: function(e) { updateSlide(activeSlide, 'description', e.target.value.substring(0, 100)); },
							style: {width: '100%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px', boxSizing: 'border-box', minHeight: '60px', marginBottom: '5px'}
						}),
						el('small', {style: {fontSize: '11px', color: '#999'}}, current.description.length + ' / 100')
					),
					
					// IMAGE
					el('div', {style: {padding: '15px', borderBottom: '1px solid #e0e0e0'}},
						el('h3', {style: {margin: '0 0 10px 0', fontSize: '12px', fontWeight: '600'}}, 'Background Image'),
						el('div', {style: {width: '100%', height: '100px', backgroundColor: '#f5f5f5', border: current.imageUrl ? '2px solid #0066cc' : '2px dashed #ccc', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', overflow: 'hidden', fontSize: '12px', color: '#666'}},
							current.imageUrl ? el('img', {src: current.imageUrl, alt: 'Bg', style: {maxWidth: '100%', maxHeight: '100%', objectFit: 'cover'}}) : 'No image'
						),
						el('button', {
							onClick: function() { if (wp.media) { var frame = wp.media({title: 'Select Image', button: {text: 'Use'}, multiple: false, library: {type: 'image'}}); frame.on('select', function() { var att = frame.state().get('selection').first().toJSON(); if (att && att.url) updateSlide(activeSlide, 'imageUrl', att.url); }); frame.open(); } },
							style: {width: '100%', padding: '6px 8px', backgroundColor: '#0066cc', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px', marginBottom: current.imageUrl ? '8px' : '0'}
						}, current.imageUrl ? 'Change' : 'Upload'),
						current.imageUrl ? el('button', {onClick: function() { updateSlide(activeSlide, 'imageUrl', ''); }, style: {width: '100%', padding: '6px 8px', backgroundColor: '#e0e0e0', color: '#cc0000', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px'}}, 'Remove') : null
					),
					
					// BUTTON SETTINGS
					el('div', {
						style: {
							padding: '15px',
							borderBottom: '1px solid #e0e0e0',
							backgroundColor: attr.activeEditSection === 'button' ? '#e3f2fd' : '#fff',
							border: attr.activeEditSection === 'button' ? '2px solid #0066cc' : '1px solid #e0e0e0'
						}
					},
						el('h3', {style: {margin: '0 0 10px 0', fontSize: '12px', fontWeight: '600'}}, 'Button Settings'),
						el('div', {style: {marginBottom: '10px'}},
							el('label', {style: {display: 'block', marginBottom: '5px', fontSize: '11px', fontWeight: '600'}}, 'URL'),
							el('input', {type: 'url', value: current.buttonUrl, onChange: function(e) { updateSlide(activeSlide, 'buttonUrl', e.target.value); }, placeholder: 'https://example.com', style: {width: '100%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px', boxSizing: 'border-box'}})
						),
						el('div', {style: {marginBottom: '10px'}},
							el('label', {style: {display: 'block', marginBottom: '5px', fontSize: '11px', fontWeight: '600'}}, 'Text'),
							el('input', {type: 'text', value: current.buttonText, onChange: function(e) { updateSlide(activeSlide, 'buttonText', e.target.value); }, placeholder: 'Button content...', style: {width: '100%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px', boxSizing: 'border-box'}})
						),
						el('div', {style: {marginBottom: '10px'}},
							el('label', {style: {display: 'block', marginBottom: '5px', fontSize: '11px', fontWeight: '600'}}, 'Style'),
							el('select', {value: current.buttonStyle || 'primary', onChange: function(e) { updateSlide(activeSlide, 'buttonStyle', e.target.value); }, style: {width: '100%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px', boxSizing: 'border-box'}},
								el('option', {value: 'primary'}, 'Primary'),
								el('option', {value: 'secondary'}, 'Secondary'),
								el('option', {value: 'tertiary'}, 'Tertiary'),
								el('option', {value: 'ghost'}, 'Ghost')
							)
						),
						el('div', {style: {display: 'flex', alignItems: 'center', gap: '8px'}},
							el('input', {type: 'checkbox', checked: current.buttonTarget, onChange: function(e) { updateSlide(activeSlide, 'buttonTarget', e.target.checked); }, style: {width: 'auto', margin: 0, cursor: 'pointer'}}),
							el('label', {style: {fontSize: '11px', fontWeight: '600', margin: 0, cursor: 'pointer'}}, 'New Tab')
						)
					),
					
					// CAROUSEL SETTINGS
					el('div', {style: {padding: '15px'}},
						el('h3', {style: {margin: '0 0 10px 0', fontSize: '12px', fontWeight: '600'}}, 'Carousel Settings'),
						el('div', {style: {marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px'}},
							el('input', {type: 'checkbox', checked: attr.showPlayButton !== false, onChange: function(e) { setAttr({ showPlayButton: e.target.checked }); }, style: {width: 'auto', margin: 0, cursor: 'pointer'}}),
							el('label', {style: {fontSize: '11px', fontWeight: '600', margin: 0, cursor: 'pointer'}}, 'Show Play/Pause')
						),
						el('div', {style: {display: 'flex', alignItems: 'center', gap: '8px'}},
							el('input', {type: 'checkbox', checked: attr.enableAutoPlay, onChange: function(e) { setAttr({ enableAutoPlay: e.target.checked }); }, style: {width: 'auto', margin: 0, cursor: 'pointer'}}),
							el('label', {style: {fontSize: '11px', fontWeight: '600', margin: 0, cursor: 'pointer'}}, 'Enable AutoPlay')
						)
					)
				) : null
			);
		},
		save: function() { return null; }
	});

	// FRONTEND
	function init() {
		document.querySelectorAll('.bnpp-carousel-wrapper').forEach(function(w) {
			var c = w.querySelector('.bnpp-carousel-container');
			if (!c) return;
			var s = c.querySelectorAll('.diapositive');
			var t = w.querySelectorAll('.bnpp-carousel-title-item');
			var idx = 0;
			var show = function(n) {
				for (var i = 0; i < s.length; i++) {
					s[i].classList.remove('active');
					t[i].classList.remove('active');
				}
				s[n].classList.add('active');
				t[n].classList.add('active');
				idx = n;
			};
			show(0);
			for (var i = 0; i < t.length; i++) {
				(function(j) {
					t[j].addEventListener('click', function() { show(j); });
				})(i);
			}
		});
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
	else init();

})();
