/**
 * BNPP Carousel Homepage Block
 * Gutenberg editor with live preview and settings panel
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
    var PanelBody = wp.components.PanelBody;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var RangeControl = wp.components.RangeControl;
    var Button = wp.components.Button;

    /**
     * Register the Gutenberg block
     */
    registerBlockType( 'bnpp/carousel-homepage', {
        title: 'Carousel Homepage',
        icon: 'slides',
        category: 'media',
        description: 'An accessible carousel with advanced slide editing',
        keywords: [ 'carousel', 'slider', 'banner' ],
        
        edit: function( props ) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var slides = attributes.slides || [];
            var autoplaySpeed = attributes.autoplaySpeed || 4;
            var currentSlideIndex = attributes.currentSlideIndex !== undefined ? attributes.currentSlideIndex : 0;

            // Update slide property
            var updateSlide = function( index, field, value ) {
                var newSlides = slides.slice();
                if ( ! newSlides[ index ] ) {
                    newSlides[ index ] = { title: '', description: '', link: { text: '', url: '#', class: 'primary' } };
                }
                if ( field === 'link' ) {
                    newSlides[ index ].link = Object.assign( {}, newSlides[ index ].link, value );
                } else {
                    newSlides[ index ][ field ] = value;
                }
                setAttributes( { slides: newSlides } );
            };

            // Add new slide
            var addSlide = function() {
                var newSlides = slides.slice();
                newSlides.push( {
                    title: 'New slide',
                    description: 'Slide description',
                    link: { text: 'Learn more', url: '#', class: 'primary' }
                } );
                setAttributes( { slides: newSlides } );
            };

            // Delete slide
            var deleteSlide = function( index ) {
                var newSlides = slides.filter( function( s, i ) { return i !== index; } );
                setAttributes( { slides: newSlides } );
            };

            // Render a single slide in preview
            var renderSlidePreview = function( slide, index ) {
                var isActive = index === currentSlideIndex;
                return createElement(
                    'div',
                    {
                        key: index,
                        className: 'bnpp-slide' + ( isActive ? ' active' : '' ),
                        style: {
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
                        }
                    },
                    createElement(
                        'div',
                        { className: 'bnpp-overlay', style: { backgroundColor: 'rgba(0,0,0,0.65)', color: '#fff', padding: '30px', textAlign: 'center', maxWidth: '600px', borderRadius: '8px' } },
                        createElement( 'h2', { style: { fontSize: '2em', margin: '0 0 15px 0', fontWeight: 'bold' } }, slide.title || '(No title)' ),
                        createElement( 'p', { style: { fontSize: '1.1em', margin: '15px 0' } }, slide.description || '(No description)' ),
                        slide.link && slide.link.text ? createElement(
                            'a',
                            {
                                href: slide.link.url || '#',
                                className: 'bnpp-btn bnpp-btn-' + ( slide.link.class || 'primary' ),
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

            // Render navigation buttons
            var renderNavButtons = function() {
                return createElement(
                    'div',
                    { style: { position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 } },
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
                                    margin: '0 6px',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                    fontWeight: 'bold'
                                }
                            },
                            ( index + 1 ).toString()
                        );
                    } )
                );
            };

            // Render slide editor for right panel
            var renderSlideEditor = function( slide, index ) {
                return createElement(
                    'div',
                    { key: index, style: { background: '#f0f0f0', padding: '20px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #ddd' } },
                    createElement( 'h3', { style: { margin: '0 0 15px 0' } }, 'Slide ' + ( index + 1 ) ),
                    
                    // Title
                    createElement(
                        'div',
                        { style: { marginBottom: '15px' } },
                        createElement( 'label', { style: { fontWeight: 'bold', marginBottom: '5px', display: 'block' } }, 'Title' ),
                        createElement( 'input', {
                            type: 'text',
                            value: slide.title || '',
                            onChange: function( e ) { updateSlide( index, 'title', e.target.value ); },
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
                            onChange: function( e ) { updateSlide( index, 'description', e.target.value ); },
                            placeholder: 'Slide description',
                            style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '80px', fontFamily: 'inherit' }
                        } )
                    ),

                    // Button text
                    createElement(
                        'div',
                        { style: { marginBottom: '15px' } },
                        createElement( 'label', { style: { fontWeight: 'bold', marginBottom: '5px', display: 'block' } }, 'Button Text' ),
                        createElement( 'input', {
                            type: 'text',
                            value: ( slide.link && slide.link.text ) || '',
                            onChange: function( e ) { updateSlide( index, 'link', { text: e.target.value } ); },
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
                            onChange: function( e ) { updateSlide( index, 'link', { url: e.target.value } ); },
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
                                        onClick: function() { updateSlide( index, 'link', { class: style } ); },
                                        style: {
                                            padding: '8px 16px',
                                            border: ( slide.link && slide.link.class ) === style ? '2px solid #007bff' : '2px solid #ccc',
                                            background: ( slide.link && slide.link.class ) === style ? '#007bff' : '#fff',
                                            color: ( slide.link && slide.link.class ) === style ? '#fff' : '#000',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }
                                    },
                                    style.charAt( 0 ).toUpperCase() + style.slice( 1 )
                                );
                            } )
                        )
                    ),

                    // Delete button
                    slides.length > 1 ? createElement(
                        'button',
                        {
                            onClick: function() { deleteSlide( index ); },
                            style: {
                                padding: '8px 16px',
                                backgroundColor: '#d32f2f',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                width: '100%'
                            }
                        },
                        'Delete Slide'
                    ) : null
                );
            };

            // Right panel
            var rightPanel = createElement(
                InspectorControls,
                null,
                createElement(
                    PanelBody,
                    { title: 'Carousel Settings', initialOpen: true },
                    createElement(
                        'div',
                        null,
                        createElement( 'label', { style: { fontWeight: 'bold', marginBottom: '5px', display: 'block' } }, 'Duration between slides (seconds)' ),
                        createElement( 'input', {
                            type: 'number',
                            value: autoplaySpeed,
                            onChange: function( e ) { setAttributes( { autoplaySpeed: parseInt( e.target.value ) || 4 } ); },
                            min: 1,
                            max: 60,
                            style: { width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px' }
                        } )
                    )
                ),
                createElement(
                    PanelBody,
                    { title: 'Slide Settings', initialOpen: true },
                    slides.map( renderSlideEditor ),
                    createElement(
                        'button',
                        {
                            onClick: addSlide,
                            style: {
                                width: '100%',
                                padding: '12px',
                                background: '#007bff',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }
                        },
                        '+ Add Slide'
                    )
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
