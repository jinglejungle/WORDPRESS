/**
 * BNPP Carousel Block
 * Full Gutenberg and Frontend implementation
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
			var slides = (attr.slides || []).slice();
			
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
					buttonTarget: false,
				});
			}

			var updateSlide = function(idx, field, val) {
				var updated = slides.map(function(s, i) {
					var newSlide = {};
					for (var k in s) newSlide[k] = s[k];
					if (i === idx) newSlide[field] = val;
					return newSlide;
				});
				setAttr({ slides: updated });
			};

			var activeSlide = attr.activeSlide || 0;
			var current = slides[activeSlide];

			return wp.element.createElement(
				wp.element.Fragment,
				null,

				// CAROUSEL PREVIEW
				wp.element.createElement('div', {style: {position: 'relative'}},
					wp.element.createElement('div', {
						className: 'bnpp-carousel-container',
						style: {
							position: 'relative', width: '100%', maxWidth: '1920px', height: '640px',
							backgroundColor: '#f5f5f5', overflow: 'hidden', border: '2px solid #0066cc', margin: '0 auto',
						},
					},
						slides.map(function(slide, idx) {
							var isActive = idx === activeSlide;

							return wp.element.createElement('div', {
								key: 'slide-' + idx,
								className: 'diapositive' + (isActive ? ' active' : ''),
								onClick: function() { setAttr({ activeSlide: idx }); },
								style: {
									position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
									opacity: isActive ? 1 : 0, transition: 'opacity 0.3s ease',
									backgroundImage: slide.imageUrl ? 'url(' + slide.imageUrl + ')' : 'none',
									backgroundSize: 'cover', backgroundPosition: 'center',
									zIndex: isActive ? 10 : 1, border: isActive ? '3px solid #0066cc' : '1px solid #ccc',
								},
							},
								// DESCRIPTION BOX
								wp.element.createElement('div', {
									className: 'diapositive-description',
									onClick: function(e) { e.stopPropagation(); setAttr({ activeSlide: idx }); },
									style: {
										position: 'absolute', top: '180px', left: '40px', width: '689px', maxHeight: '285px',
										backgroundColor: 'rgba(255,255,255,0.95)', padding: '20px', boxSizing: 'border-box',
										borderRadius: '4px', zIndex: 20, border: isActive ? '2px solid #0066cc' : 'none',
										boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
									},
								},
									// TITLE
									wp.element.createElement('div', null,
										wp.element.createElement('h3', {
											contentEditable: true,
											suppressContentEditableWarning: true,
											onInput: function(e) {
												var txt = e.currentTarget.textContent.substring(0, 70);
												e.currentTarget.textContent = txt;
												updateSlide(idx, 'title', txt);
											},
											onKeyDown: function(e) {
												if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); }
												if (e.currentTarget.textContent.length >= 70 && 'Backspace Delete'.indexOf(e.key) === -1) {
													e.preventDefault();
												}
											},
											onClick: function(e) { e.stopPropagation(); },
											style: {margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600', color: '#333', outline: 'none'},
										}, slide.title),
										wp.element.createElement('small', {style: {fontSize: '11px', color: '#999', display: 'block', marginBottom: '8px'}},
											slide.title.length + ' / 70'
										)
									),
									// DESCRIPTION
									wp.element.createElement('div', null,
										wp.element.createElement('p', {
											contentEditable: true,
											suppressContentEditableWarning: true,
											onInput: function(e) {
												var txt = e.currentTarget.textContent.substring(0, 100);
												e.currentTarget.textContent = txt;
												updateSlide(idx, 'description', txt);
											},
											onKeyDown: function(e) {
												if (e.currentTarget.textContent.length >= 100 && 'Backspace Delete Enter'.indexOf(e.key) === -1) {
													e.preventDefault();
												}
											},
											onClick: function(e) { e.stopPropagation(); },
											style: {margin: '0', fontSize: '14px', color: '#666', lineHeight: '1.5', outline: 'none'},
										}, slide.description),
										wp.element.createElement('small', {style: {fontSize: '11px', color: '#999', display: 'block', marginTop: '4px'}},
											slide.description.length + ' / 100'
										)
									)
								),
								// BUTTON (ALWAYS VISIBLE)
								wp.element.createElement('div', {
									style: {position: 'absolute', top: '525px', left: '40px', zIndex: 20},
									onClick: function(e) { e.stopPropagation(); setAttr({ activeSlide: idx, activeEditSection: 'button' }); },
								},
									wp.element.createElement('a', {
										className: 'bnpp-button ' + (slide.buttonStyle || 'primary'),
										href: '#',
										onClick: function(e) { e.preventDefault(); e.stopPropagation(); setAttr({ activeEditSection: 'button' }); },
										contentEditable: true,
										suppressContentEditableWarning: true,
										onInput: function(e) {
											updateSlide(idx, 'buttonText', e.currentTarget.textContent);
										},
										onKeyDown: function(e) {
											if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); }
										},
										onBlur: function(e) {
											updateSlide(idx, 'buttonText', e.currentTarget.textContent);
										},
										style: {
											display: 'inline-block', padding: '12px 24px', textDecoration: 'none', borderRadius: '4px',
											fontSize: '14px', fontWeight: '600', cursor: 'text', outline: 'none', minWidth: '140px',
											backgroundColor: slide.buttonUrl ? undefined : 'rgba(224,224,224,0.8)',
											color: slide.buttonUrl ? undefined : '#666',
											border: slide.buttonUrl ? 'none' : '2px solid #ccc',
										},
									}, slide.buttonText)
								)
							);
						}),
						// TITLE INDICATORS
						wp.element.createElement('div', {
							className: 'bnpp-carousel-titles',
							style: {position: 'absolute', bottom: 0, left: 0, right: 0, height: '154px', backgroundColor: '#f5f5f5', display: 'flex', zIndex: 15},
						},
							slides.map(function(slide, idx) {
								var isActive = idx === activeSlide;
								return wp.element.createElement('div', {
									key: 'title-' + idx,
									className: 'bnpp-carousel-title-item' + (isActive ? ' active' : ''),
									onClick: function() { setAttr({ activeSlide: idx }); },
									style: {
										flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
										textAlign: 'center', cursor: 'pointer', backgroundColor: isActive ? '#ffffff' : '#ececec',
										borderLeft: isActive ? '4px solid #0066cc' : '1px solid #ddd', fontSize: '16px',
										fontWeight: isActive ? '700' : '600', color: isActive ? '#0066cc' : '#333',
										userSelect: 'none', marginLeft: idx === 0 ? '286px' : '0', paddingLeft: isActive ? '16px' : '20px',
									},
								}, slide.title);
							})
						),
						// PLAY/PAUSE BUTTON
						(attr.showPlayButton !== false) ? wp.element.createElement('button', {
							style: {
								position: 'absolute', top: '10px', right: '10px', padding: '8px 12px',
								backgroundColor: attr.enableAutoPlay ? '#cc0000' : '#0066cc', color: '#ffffff',
								border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', zIndex: 30,
							},
							onClick: function(e) { e.stopPropagation(); setAttr({ enableAutoPlay: !attr.enableAutoPlay }); },
						}, attr.enableAutoPlay ? '⏸ Pause' : '▶ Play') : null
					)
				),

				// INSPECTOR PANEL
				wp.blockEditor.InspectorControls ? wp.element.createElement(
					wp.blockEditor.InspectorControls, null,
					// SLIDE BUTTONS
					wp.element.createElement('div', {style: {padding: '15px', borderBottom: '1px solid #e0e0e0'}},
						wp.element.createElement('h3', {style: {margin: '0 0 10px 0', fontSize: '13px', fontWeight: '600'}}, 'Slide Settings'),
						wp.element.createElement('div', {style: {display: 'flex', gap: '8px', flexWrap: 'wrap'}},
							slides.map(function(s, idx) {
								return wp.element.createElement('button', {
									key: 'btn-' + idx,
									onClick: function() { setAttr({ activeSlide: idx }); },
									style: {
										flex: '1', minWidth: '60px', padding: '8px 12px',
										backgroundColor: idx === activeSlide ? '#0066cc' : '#e0e0e0',
										color: idx === activeSlide ? '#ffffff' : '#333',
										border: idx === activeSlide ? '2px solid #0066cc' : '2px solid #ccc',
										borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: idx === activeSlide ? '600' : 'normal',
									},
								}, 'Slide ' + (idx + 1));
							})
						)
					),
					// TITLE
					wp.element.createElement('div', {style: {padding: '15px', borderBottom: '1px solid #e0e0e0'}},
						wp.element.createElement('label', {style: {display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase'}}, 'Title (Max 70)'),
						wp.element.createElement('input', {
							type: 'text', value: current.title,
							onChange: function(e) { var v = e.target.value.substring(0, 70); updateSlide(activeSlide, 'title', v); e.target.value = v; },
							style: {width: '100%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px', boxSizing: 'border-box', marginBottom: '5px'},
						}),
						wp.element.createElement('small', {style: {fontSize: '11px', color: '#999'}}, current.title.length + ' / 70')
					),
					// DESCRIPTION
					wp.element.createElement('div', {style: {padding: '15px', borderBottom: '1px solid #e0e0e0'}},
						wp.element.createElement('label', {style: {display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase'}}, 'Description (Max 100)'),
						wp.element.createElement('textarea', {
							value: current.description,
							onChange: function(e) { var v = e.target.value.substring(0, 100); updateSlide(activeSlide, 'description', v); e.target.value = v; },
							style: {width: '100%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical', minHeight: '60px', marginBottom: '5px'},
						}),
						wp.element.createElement('small', {style: {fontSize: '11px', color: '#999'}}, current.description.length + ' / 100')
					),
					// IMAGE
					wp.element.createElement('div', {style: {padding: '15px', borderBottom: '1px solid #e0e0e0'}},
						wp.element.createElement('h3', {style: {margin: '0 0 10px 0', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase'}}, 'Background Image'),
						wp.element.createElement('div', {style: {width: '100%', height: '100px', backgroundColor: '#f5f5f5', border: current.imageUrl ? '2px solid #0066cc' : '2px dashed #ccc', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', overflow: 'hidden'}},
							current.imageUrl ? wp.element.createElement('img', {src: current.imageUrl, alt: 'Bg', style: {maxWidth: '100%', maxHeight: '100%', objectFit: 'cover'}}) : 'No image'
						),
						wp.element.createElement('button', {
							onClick: function() { if (wp.media) { var frame = wp.media({title: 'Select Image', button: {text: 'Use'}, multiple: false, library: {type: 'image'}}); frame.on('select', function() { var att = frame.state().get('selection').first().toJSON(); if (att && att.url) updateSlide(activeSlide, 'imageUrl', att.url); }); frame.open(); } },
							style: {width: '100%', padding: '6px 8px', backgroundColor: '#0066cc', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', marginBottom: current.imageUrl ? '8px' : '0'},
						}, current.imageUrl ? 'Change' : 'Upload'),
						current.imageUrl ? wp.element.createElement('button', {onClick: function() { updateSlide(activeSlide, 'imageUrl', ''); }, style: {width: '100%', padding: '6px 8px', backgroundColor: '#e0e0e0', color: '#cc0000', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px'}}, 'Remove') : null
					),
					// BUTTON SETTINGS (HIGHLIGHTED WHEN EDITING)
					wp.element.createElement('div', {
						style: {padding: '15px', borderBottom: '1px solid #e0e0e0', backgroundColor: attr.activeEditSection === 'button' ? '#e3f2fd' : '#fff', border: attr.activeEditSection === 'button' ? '2px solid #0066cc' : '1px solid #e0e0e0'},
					},
						wp.element.createElement('h3', {style: {margin: '0 0 10px 0', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase'}}, 'Button Settings'),
						wp.element.createElement('div', {style: {marginBottom: '10px'}},
							wp.element.createElement('label', {style: {display: 'block', marginBottom: '5px', fontSize: '11px', fontWeight: '600'}}, 'URL'),
							wp.element.createElement('input', {type: 'url', value: current.buttonUrl, onChange: function(e) { updateSlide(activeSlide, 'buttonUrl', e.target.value); }, placeholder: 'https://example.com', style: {width: '100%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px', boxSizing: 'border-box'}})
						),
						wp.element.createElement('div', {style: {marginBottom: '10px'}},
							wp.element.createElement('label', {style: {display: 'block', marginBottom: '5px', fontSize: '11px', fontWeight: '600'}}, 'Text'),
							wp.element.createElement('input', {type: 'text', value: current.buttonText, onChange: function(e) { updateSlide(activeSlide, 'buttonText', e.target.value); }, placeholder: 'Button content...', style: {width: '100%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px', boxSizing: 'border-box'}})
						),
						wp.element.createElement('div', {style: {marginBottom: '10px'}},
							wp.element.createElement('label', {style: {display: 'block', marginBottom: '5px', fontSize: '11px', fontWeight: '600'}}, 'Style'),
							wp.element.createElement('select', {value: current.buttonStyle || 'primary', onChange: function(e) { updateSlide(activeSlide, 'buttonStyle', e.target.value); }, style: {width: '100%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px', boxSizing: 'border-box'}},
								wp.element.createElement('option', {value: 'primary'}, 'Primary'),
								wp.element.createElement('option', {value: 'secondary'}, 'Secondary'),
								wp.element.createElement('option', {value: 'tertiary'}, 'Tertiary'),
								wp.element.createElement('option', {value: 'ghost'}, 'Ghost')
							)
						),
						wp.element.createElement('div', {style: {display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px'}},
							wp.element.createElement('input', {type: 'checkbox', checked: current.buttonTarget, onChange: function(e) { updateSlide(activeSlide, 'buttonTarget', e.target.checked); }, style: {width: 'auto', margin: 0, cursor: 'pointer'}}),
							wp.element.createElement('label', {style: {fontSize: '11px', fontWeight: '600', margin: 0, cursor: 'pointer'}}, 'New Tab')
						),
						current.buttonUrl ? wp.element.createElement('button', {onClick: function() { updateSlide(activeSlide, 'buttonUrl', ''); updateSlide(activeSlide, 'buttonText', 'Button content...'); }, style: {width: '100%', padding: '6px 8px', backgroundColor: '#e0e0e0', color: '#cc0000', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px'}}, 'Delete Button') : null
					),
					// CAROUSEL SETTINGS
					wp.element.createElement('div', {style: {padding: '15px'}},
						wp.element.createElement('h3', {style: {margin: '0 0 10px 0', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase'}}, 'Carousel Settings'),
						wp.element.createElement('div', {style: {marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px'}},
							wp.element.createElement('input', {type: 'checkbox', checked: attr.showPlayButton !== false, onChange: function(e) { setAttr({ showPlayButton: e.target.checked }); }, style: {width: 'auto', margin: 0, cursor: 'pointer'}}),
							wp.element.createElement('label', {style: {fontSize: '11px', fontWeight: '600', margin: 0, cursor: 'pointer'}}, 'Show Play/Pause Button')
						),
						wp.element.createElement('div', {style: {display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px'}},
							wp.element.createElement('input', {type: 'checkbox', checked: attr.enableAutoPlay, onChange: function(e) { setAttr({ enableAutoPlay: e.target.checked }); }, style: {width: 'auto', margin: 0, cursor: 'pointer'}}),
							wp.element.createElement('label', {style: {fontSize: '11px', fontWeight: '600', margin: 0, cursor: 'pointer'}}, 'Enable AutoPlay')
						),
						attr.enableAutoPlay ? wp.element.createElement('div', null,
							wp.element.createElement('label', {style: {display: 'block', marginBottom: '5px', fontSize: '11px', fontWeight: '600'}}, 'Duration (seconds)'),
							wp.element.createElement('input', {type: 'number', value: attr.autoPlayDuration || 4, onChange: function(e) { setAttr({ autoPlayDuration: parseInt(e.target.value) || 4 }); }, min: 1, max: 30, style: {width: '100%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: '3px', fontSize: '12px', boxSizing: 'border-box'}})
						) : null
					)
				) : null
			);
		},
		save: function() { return null; },
	});

	// ==========================================
	// FRONTEND CAROUSEL
	// ==========================================

	function initCarousels() {
		document.querySelectorAll('.bnpp-carousel-wrapper').forEach(function(wrapper) {
			var container = wrapper.querySelector('.bnpp-carousel-container');
			if (!container) return;

			var slides = container.querySelectorAll('.diapositive');
			var titles = wrapper.querySelectorAll('.bnpp-carousel-title-item');
			var playBtn = wrapper.querySelector('.bnpp-carousel-play-button');
			var current = 0;
			var autoInterval = null;
			var autoplay = wrapper.getAttribute('data-autoplay') === 'true';
			var duration = parseInt(wrapper.getAttribute('data-duration')) || 4;

			var show = function(n) {
				slides.forEach(function(s) { s.classList.remove('active'); s.setAttribute('aria-hidden', 'true'); });
				titles.forEach(function(t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
				slides[n].classList.add('active');
				slides[n].setAttribute('aria-hidden', 'false');
				titles[n].classList.add('active');
				titles[n].setAttribute('aria-selected', 'true');
				current = n;
			};

			var next = function() { show((current + 1) % slides.length); };
			var startAuto = function() {
				if (autoInterval) clearInterval(autoInterval);
				autoInterval = setInterval(next, duration * 1000);
				if (playBtn) { playBtn.textContent = '⏸ Pause'; playBtn.setAttribute('data-playing', 'true'); }
			};
			var stopAuto = function() {
				if (autoInterval) { clearInterval(autoInterval); autoInterval = null; }
				if (playBtn) { playBtn.textContent = '▶ Play'; playBtn.setAttribute('data-playing', 'false'); }
			};

			show(0);
			if (autoplay) startAuto();

			titles.forEach(function(t, idx) { 
				t.addEventListener('click', function() { show(idx); stopAuto(); }); 
			});

			if (playBtn) {
				playBtn.addEventListener('click', function(e) {
					e.stopPropagation();
					if (autoInterval) stopAuto(); else startAuto();
				});
			}

			container.addEventListener('keydown', function(e) { 
				if (e.key === 'ArrowLeft') show((current - 1 + slides.length) % slides.length); 
				else if (e.key === 'ArrowRight') next(); 
			});

			wrapper.carouselInstance = { next: next, current: current };
		});
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initCarousels); else initCarousels();
	if (window.MutationObserver) new MutationObserver(initCarousels).observe(document.body, {childList: true, subtree: true});

})();
