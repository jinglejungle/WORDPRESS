/**
 * BNPP Carousel Homepage Block
 * Gutenberg editor with live preview
 * 3 slides maximum, background support
 * Pure JavaScript - no React, no JSX
 */

( function() {
    // Check if WordPress API is available
    if ( typeof wp === 'undefined' || ! wp.blocks ) {
        return;
    }

    var registerBlockType = wp.blocks.registerBlockType;
    var Fragment = wp.element.Fragment;
    var createElement = wp.element.createElement;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var PanelBody = wp.components.PanelBody;
    var Button = wp.components.Button;

    /**
     * Register the Gutenberg block
     */
    registerBlockType( 'bnpp/carousel-homepage', {
        title: 'Carousel Homepage',
        icon: 'slides',
        category: 'media',
        description: 'An accessible carousel with 3 slides and background images',
        keywords: [ 'carousel', 'slider', 'banner' ],
        
        edit: function( props ) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var slides = attributes.slides || [];
            var autoplaySpeed = attributes.autoplaySpeed || 4;
            var currentSlideIndex = attributes.currentSlideIndex !== undefined ? attributes.currentSlideIndex : 0;

            // Ensure exactly 3 slides
            if ( slides.length === 0 ) {
                slides = [
                    { title: 'Slide 1', description: 'Description 1', background: '', link: { text: 'Learn more', url: '#', class: 'primary' } },
                    { title: 'Slide 2', description: 'Description 2', background: '', link: { text: 'Learn more', url: '#', class: 'primary' } },
                    { title: 'Slide 3', description: 'Description 3', background: '', link: { text: 'Learn more', url: '#', class: 'primary' } }
                ];
                setAttributes( { slides: slides } );
            }

            // Update slide property
            var updateSlide = function( index, field, value ) {
                var newSlides = slides.slice();
                if ( field === 'link' ) {
                    newSlides[ index ].link = Object.assign( {}, newSlides[ index ].link, value );
                } else {
                    newSlides[ index ][ field ] = value;
                }
                setAttributes( { slides: newSlides } );
            };

            // Render slide preview in carousel
            var renderSlidePreview = function( slide, index ) {
                var isActive = index === currentSlideIndex;
                var backgroundStyle = slide.background ? { backgroundImage: 'url(' + slide.background + ')' } : {};

                return createElement(
                    'div',
                    {
                        key: index,
                        className: 'bnpp-slide' + ( isActive ? ' active' : '' ),
                        style: Object.assign( {
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            left: 0,
                            top: 0,
                            opacity: isActive ? 1 : 0,
                            transition: 'opacity 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#f0f0f0',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }, backgroundStyle )
                    },
                    createElement(
                        'div',
                        { className: 'bnpp-overlay', style: { backgroundColor: 'rgba(0,0,0,0.65)', color: '#fff', padding: '30px', textAlign: 'center', maxWidth: '600px', borderRadius: '8px' } },
                        createElement( 'h2', { style: { fontSize: '2em', margin: '0 0 15px 0', fontWeight: 'bold' } }, slide.title || 'Slide ' + ( index + 1 ) ),
                        createElement( 'p', { style: { fontSize: '1.1em', margin: '15px 0' } }, slide.description || '' ),
                        slide.link && slide.link.text ? createElement(
                            'a',
                            {
                                href: slide.link.url || '#',
                                style: {
                                    display: 'inline-block',
                                    marginTop: '15px',
                                    padding: '12px 28px',
                                    backgroundColor: slide.link.class === 'primary' ? '#007bff' : slide.link.class === 'secondary' ? '#6c757d' : 'transparent',
                                    color: '#fff',
                                    border: slide.link.class === 'tertiary' ? '2px solid #fff' : 'none',
                                    textDecoration: slide.link.class === 'ghost' ? 'underline' : 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }
                            },
                            slide.link.text
                        ) : null
                    )
                );
            };

            // Render navigation buttons with slide titles
            var renderNavButtons = function() {
                return createElement(
                    'div',
                    { style: { position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: '6px' } },
                    slides.map( function( slide, index ) {
                        return createElement(
                            'button',
                            {
                                key: index,
                                onClick: function() { setAttributes( { currentSlideIndex: index } ); },
                                style: {
                                    background: index === currentSlideIndex ? '#fff' : 'rgba(0,0,0,0.5)',
                                    color: index === currentSlideIndex ? '#000' : '#fff',
                                    border: '2px solid #fff',
                                    padding: '8px 14px',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                    fontWeight: 'bold',
                                    maxWidth: '80px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontSize: '0.85em'
                                },
                                title: slide.title
                            },
                            slide.title || 'Slide ' + ( index + 1 )
                        );
                    } )
                );
            };

            // Render slide selector buttons for right panel
            var renderSlideSelectors = function() {
                return createElement(
                    'div',
                    { style: { display: 'flex', gap: '10px', marginBottom: '20px' } },
                    slides.map( function( slide, index ) {
                        return createElement(
                            'button',
                            {
                                key: index,
                                onClick: function() { setAttributes( { currentSlideIndex: index } ); },
                                style: {
                                    flex: 1,
                                    padding: '12px',
                                    background: index === currentSlideIndex ? '#007bff' : '#f0f0f0',
                                    color: index === currentSlideIndex ? '#fff' : '#000',
                                    border: index === currentSlideIndex ? '2px solid #007bff' : '2px solid #ccc',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    fontSize: '1.1em'
                                }
                            },
                            ( index + 1 ).toString()
                        );
                    } )
                );
            };

            // Render slide editor for currently selected slide
            var renderCurrentSlideEditor = function() {
                var slide = slides[ currentSlideIndex ];
                if ( ! slide ) return null;

                return createElement(
                    'div',
                    null,
                    createElement( 'h3', { style: { margin: '20px 0 15px 0' } }, 'Slide ' + ( currentSlideIndex + 1 ) + ' Settings' ),

                    // Title
                    createElement(
                        'div',
                        { style: { marginBottom: '15px' } },
                        createElement( 'label', { style: { fontWeight: 'bold', marginBottom: '5px', display: 'block' } }, 'Title' ),
                        createElement( 'input', {
                            type: 'text',
                            value: slide.title || '',
                            onChange: function( e ) { updateSlide( currentSlideIndex, 'title', e.target.value ); },
                            placeholder: 'Slide title',
                            style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }
                        } )
                    ),

                    // Description
                    createElement(
                        'div',
                        { style: { marginBottom: '15px' } },
                        createElement( 'label', { style: { fontWeight: 'bold', marginBottom: '5px', display: 'block' } }, 'Description' ),
                        createElement( 'textarea', {
                            value: slide.description || '',
                            onChange: function( e ) { updateSlide( currentSlideIndex, 'description', e.target.value ); },
                            placeholder: 'Slide description',
                            style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '80px', fontFamily: 'inherit' }
                        } )
                    ),

                    // Background image
                    createElement(
                        'div',
                        { style: { marginBottom: '15px' } },
                        createElement( 'label', { style: { fontWeight: 'bold', marginBottom: '5px', display: 'block' } }, 'Background Image' ),
                        createElement(
                            MediaUpload,
                            {
                                onSelect: function( media ) { updateSlide( currentSlideIndex, 'background', media.url ); },
                                allowedTypes: [ 'image' ],
                                render: function( obj ) {
                                    return createElement(
                                        'div',
                                        null,
                                        createElement(
                                            'button',
                                            {
                                                onClick: obj.open,
                                                style: {
                                                    width: '100%',
                                                    padding: '10px',
                                                    background: '#f0f0f0',
                                                    border: '2px solid #ccc',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold'
                                                }
                                            },
                                            slide.background ? 'Change Image' : 'Select Image'
                                        ),
                                        slide.background ? createElement(
                                            'div',
                                            { style: { marginTop: '10px' } },
                                            createElement( 'img', { src: slide.background, style: { maxWidth: '100%', height: 'auto', borderRadius: '4px' } } ),
                                            createElement(
                                                'button',
                                                {
                                                    onClick: function() { updateSlide( currentSlideIndex, 'background', '' ); },
                                                    style: {
                                                        width: '100%',
                                                        marginTop: '10px',
                                                        padding: '8px',
                                                        background: '#d32f2f',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontWeight: 'bold'
                                                    }
                                                },
                                                'Remove Image'
                                            )
                                        ) : null
                                    );
                                }
                            }
                        )
                    ),

                    // Button text
                    createElement(
                        'div',
                        { style: { marginBottom: '15px' } },
                        createElement( 'label', { style: { fontWeight: 'bold', marginBottom: '5px', display: 'block' } }, 'Button Text' ),
                        createElement( 'input', {
                            type: 'text',
                            value: ( slide.link && slide.link.text ) || '',
                            onChange: function( e ) { updateSlide( currentSlideIndex, 'link', { text: e.target.value } ); },
                            placeholder: 'Button text',
                            style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }
                        } )
                    ),

                    // Button URL
                    createElement(
                        'div',
                        { style: { marginBottom: '15px' } },
                        createElement( 'label', { style: { fontWeight: 'bold', marginBottom: '5px', display: 'block' } }, 'Button URL' ),
                        createElement( 'input', {
                            type: 'url',
                            value: ( slide.link && slide.link.url ) || '',
                            onChange: function( e ) { updateSlide( currentSlideIndex, 'link', { url: e.target.value } ); },
                            placeholder: 'https://example.com',
                            style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }
                        } )
                    ),

                    // Button style
                    createElement(
                        'div',
                        { style: { marginBottom: '15px' } },
                        createElement( 'label', { style: { fontWeight: 'bold', marginBottom: '10px', display: 'block' } }, 'Button Style' ),
                        createElement(
                            'div',
                            { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
                            [ 'primary', 'secondary', 'tertiary', 'ghost' ].map( function( style ) {
                                return createElement(
                                    'button',
                                    {
                                        key: style,
                                        onClick: function() { updateSlide( currentSlideIndex, 'link', { class: style } ); },
                                        style: {
                                            flex: 1,
                                            padding: '8px',
                                            border: ( slide.link && slide.link.class ) === style ? '2px solid #007bff' : '2px solid #ccc',
                                            background: ( slide.link && slide.link.class ) === style ? '#007bff' : '#fff',
                                            color: ( slide.link && slide.link.class ) === style ? '#fff' : '#000',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            fontSize: '0.9em'
                                        }
                                    },
                                    style.charAt( 0 ).toUpperCase() + style.slice( 1 )
                                );
                            } )
                        )
                    ),

                    // Duration setting
                    createElement(
                        'div',
                        { style: { marginBottom: '15px', paddingTop: '15px', borderTop: '1px solid #ccc' } },
                        createElement( 'label', { style: { fontWeight: 'bold', marginBottom: '5px', display: 'block' } }, 'Duration between slides (seconds)' ),
                        createElement( 'input', {
                            type: 'number',
                            value: autoplaySpeed,
                            onChange: function( e ) { setAttributes( { autoplaySpeed: parseInt( e.target.value ) || 4 } ); },
                            min: 1,
                            max: 60,
                            style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }
                        } )
                    )
                );
            };

            // Right panel
            var rightPanel = createElement(
                InspectorControls,
                null,
                createElement(
                    PanelBody,
                    { title: 'Slide Selection', initialOpen: true },
                    renderSlideSelectors()
                ),
                createElement(
                    PanelBody,
                    { title: 'Slide Settings', initialOpen: true },
                    renderCurrentSlideEditor()
                )
            );

            // Main carousel preview
            var carouselPreview = createElement(
                'div',
                {
                    style: {
                        position: 'relative',
                        width: '100%',
                        height: '400px',
                        background: '#000',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        marginBottom: '20px'
                    }
                },
                slides.map( renderSlidePreview ),
                renderNavButtons()
            );

            // Return the edit interface
            return createElement(
                Fragment,
                null,
                rightPanel,
                carouselPreview
            );
        },

        save: function() {
            // Server-side rendering
            return null;
        }
    } );

} )();

/**
 * Frontend - Interactive carousel
 */
document.addEventListener( 'DOMContentLoaded', function() {
    var carousels = document.querySelectorAll( '.bnpp-carousel-wrapper' );

    carousels.forEach( function( wrapper ) {
        var carousel = wrapper.querySelector( '.bnpp-carousel' );
        var slides = carousel.querySelectorAll( '.bnpp-slide' );
        var navButtons = wrapper.querySelectorAll( '.bnpp-carousel-nav button' );
        var pauseBtn = wrapper.querySelector( '.bnpp-pause-btn' );
        var statusDiv = wrapper.querySelector( '#bnpp-carousel-status' );
        var configScript = wrapper.querySelector( '.bnpp-carousel-config' );

        if ( ! carousel || slides.length === 0 ) {
            return;
        }

        // Configuration
        var config = { autoplaySpeed: 4000, totalSlides: slides.length };
        if ( configScript ) {
            try {
                config = JSON.parse( configScript.textContent );
            } catch ( e ) {
                console.error( 'Error parsing config:', e );
            }
        }

        var currentSlide = 0;
        var isPlaying = true;
        var autoplayInterval;

        // Display specific slide
        var showSlide = function( index ) {
            slides.forEach( function( slide, i ) {
                if ( i === index ) {
                    slide.classList.add( 'active' );
                } else {
                    slide.classList.remove( 'active' );
                }
            } );

            navButtons.forEach( function( btn, i ) {
                btn.setAttribute( 'aria-selected', i === index ? 'true' : 'false' );
            } );

            if ( statusDiv ) {
                statusDiv.textContent = 'Slide ' + ( index + 1 ) + ' of ' + slides.length;
            }

            currentSlide = index;
        };

        // Navigation
        var nextSlide = function() {
            currentSlide = ( currentSlide + 1 ) % slides.length;
            showSlide( currentSlide );
        };

        var prevSlide = function() {
            currentSlide = ( currentSlide - 1 + slides.length ) % slides.length;
            showSlide( currentSlide );
        };

        // Autoplay
        var startAutoplay = function() {
            if ( autoplayInterval ) {
                clearInterval( autoplayInterval );
            }
            autoplayInterval = setInterval( nextSlide, config.autoplaySpeed );
            isPlaying = true;
        };

        var stopAutoplay = function() {
            if ( autoplayInterval ) {
                clearInterval( autoplayInterval );
            }
            isPlaying = false;
        };

        // Initialization
        showSlide( 0 );
        startAutoplay();

        // Button clicks
        navButtons.forEach( function( btn, index ) {
            btn.addEventListener( 'click', function() {
                showSlide( index );
            } );
        } );

        // Pause button
        if ( pauseBtn ) {
            pauseBtn.addEventListener( 'click', function() {
                if ( isPlaying ) {
                    stopAutoplay();
                    pauseBtn.setAttribute( 'aria-pressed', 'true' );
                    pauseBtn.textContent = 'Play';
                } else {
                    startAutoplay();
                    pauseBtn.setAttribute( 'aria-pressed', 'false' );
                    pauseBtn.textContent = 'Pause';
                }
            } );
        }

        // Keyboard
        document.addEventListener( 'keydown', function( e ) {
            if ( e.key === 'ArrowRight' ) nextSlide();
            if ( e.key === 'ArrowLeft' ) prevSlide();
        } );

        // Hover
        carousel.addEventListener( 'mouseenter', function() {
            if ( isPlaying ) stopAutoplay();
        } );

        carousel.addEventListener( 'mouseleave', function() {
            if ( isPlaying ) startAutoplay();
        } );
    } );
} );
