/**
 * BNPP Carousel Homepage Block
 * Pure vanilla JavaScript - no React, no JSX
 * Scripts for Gutenberg editor and frontend
 */

( function() {
    // Only register block if WordPress is available
    if ( typeof wp === 'undefined' || ! wp.blocks ) {
        return;
    }

    var registerBlockType = wp.blocks.registerBlockType;
    var Fragment = wp.element.Fragment;
    var createElement = wp.element.createElement;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelBody = wp.components.PanelBody;
    var Button = wp.components.Button;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var NumberControl = wp.components.NumberControl;

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

            /**
             * Update a slide property
             */
            var updateSlide = function( index, field, value ) {
                var newSlides = slides.map( function( slide, i ) {
                    if ( i === index ) {
                        if ( field === 'link' ) {
                            return Object.assign( {}, slide, {
                                link: Object.assign( {}, slide.link, value )
                            } );
                        } else {
                            var updated = {};
                            updated[ field ] = value;
                            return Object.assign( {}, slide, updated );
                        }
                    }
                    return slide;
                } );
                setAttributes( { slides: newSlides } );
            };

            /**
             * Add a new slide
             */
            var addSlide = function() {
                var newSlides = slides.concat( {
                    title: 'New slide',
                    description: 'Slide description',
                    link: { text: 'Learn more', url: '#', class: 'primary' }
                } );
                setAttributes( { slides: newSlides } );
            };

            /**
             * Delete a slide
             */
            var deleteSlide = function( index ) {
                var newSlides = slides.filter( function( slide, i ) {
                    return i !== index;
                } );
                setAttributes( { slides: newSlides } );
            };

            /**
             * Update button style
             */
            var updateLinkClass = function( index, buttonClass ) {
                updateSlide( index, 'link', { class: buttonClass } );
            };

            /**
             * Create edit interface
             */
            var editPanel = createElement(
                'div',
                { className: 'bnpp-carousel-editor' },
                createElement( 'h2', { style: { marginBottom: '20px' } }, 'Carousel Slides' ),
                slides.map( function( slide, index ) {
                    return createElement(
                        'div',
                        { key: index, className: 'bnpp-carousel-editor-slide' },
                        createElement(
                            'div',
                            { className: 'bnpp-carousel-editor-slide-header' },
                            createElement( 'h3', null, 'Slide ' + ( index + 1 ) ),
                            slides.length > 1 ? createElement(
                                'button',
                                {
                                    onClick: function() { deleteSlide( index ); },
                                    className: 'bnpp-style-btn delete',
                                    title: 'Delete this slide'
                                },
                                'Delete'
                            ) : null
                        ),
                        createElement(
                            'div',
                            { className: 'bnpp-carousel-editor-controls' },
                            // Title field
                            createElement(
                                'div',
                                null,
                                createElement( 'label', { htmlFor: 'slide-title-' + index }, 'Title' ),
                                createElement( 'input', {
                                    id: 'slide-title-' + index,
                                    type: 'text',
                                    value: slide.title || '',
                                    onChange: function( e ) { updateSlide( index, 'title', e.target.value ); },
                                    placeholder: 'Slide title'
                                } )
                            ),
                            // Description field
                            createElement(
                                'div',
                                null,
                                createElement( 'label', { htmlFor: 'slide-desc-' + index }, 'Description' ),
                                createElement( 'textarea', {
                                    id: 'slide-desc-' + index,
                                    value: slide.description || '',
                                    onChange: function( e ) { updateSlide( index, 'description', e.target.value ); },
                                    placeholder: 'Slide description'
                                } )
                            ),
                            // Link editor
                            createElement(
                                'div',
                                { className: 'bnpp-link-editor' },
                                createElement( 'h4', null, 'Link and Button' ),
                                // Button text
                                createElement(
                                    'div',
                                    null,
                                    createElement( 'label', { htmlFor: 'link-text-' + index }, 'Button Text' ),
                                    createElement( 'input', {
                                        id: 'link-text-' + index,
                                        type: 'text',
                                        value: ( slide.link && slide.link.text ) || '',
                                        onChange: function( e ) { updateSlide( index, 'link', { text: e.target.value } ); },
                                        placeholder: 'Button text'
                                    } )
                                ),
                                // Button URL
                                createElement(
                                    'div',
                                    { style: { marginTop: '10px' } },
                                    createElement( 'label', { htmlFor: 'link-url-' + index }, 'URL' ),
                                    createElement( 'input', {
                                        id: 'link-url-' + index,
                                        type: 'url',
                                        value: ( slide.link && slide.link.url ) || '',
                                        onChange: function( e ) { updateSlide( index, 'link', { url: e.target.value } ); },
                                        placeholder: 'https://example.com'
                                    } )
                                ),
                                // Button style selection
                                createElement(
                                    'div',
                                    { style: { marginTop: '10px' } },
                                    createElement( 'label', null, 'Button Style' ),
                                    createElement(
                                        'div',
                                        { className: 'bnpp-style-buttons' },
                                        [ 'primary', 'secondary', 'tertiary', 'ghost' ].map( function( buttonClass ) {
                                            return createElement(
                                                'button',
                                                {
                                                    key: buttonClass,
                                                    className: 'bnpp-style-btn' + ( ( slide.link && slide.link.class === buttonClass ) ? ' active' : '' ),
                                                    onClick: function() { updateLinkClass( index, buttonClass ); },
                                                    title: buttonClass + ' style'
                                                },
                                                buttonClass.charAt( 0 ).toUpperCase() + buttonClass.slice( 1 )
                                            );
                                        } )
                                    )
                                )
                            )
                        )
                    );
                } ),
                createElement(
                    'button',
                    {
                        onClick: addSlide,
                        className: 'bnpp-add-slide-btn'
                    },
                    '+ Add Slide'
                )
            );

            /**
             * Create settings panel
             */
            var settingsPanel = createElement(
                InspectorControls,
                null,
                createElement(
                    PanelBody,
                    { title: 'Carousel Settings', initialOpen: true },
                    createElement(
                        'div',
                        null,
                        createElement( 'label', null, 'Duration between slides (seconds)' ),
                        createElement( 'input', {
                            type: 'number',
                            value: autoplaySpeed,
                            onChange: function( e ) { setAttributes( { autoplaySpeed: parseInt( e.target.value ) } ); },
                            min: 1,
                            max: 60,
                            style: { width: '100%', padding: '8px', marginTop: '5px' }
                        } )
                    )
                )
            );

            /**
             * Return the edit interface
             */
            return createElement(
                Fragment,
                null,
                settingsPanel,
                editPanel
            );
        },

        save: function() {
            // Server-side rendering - return null
            return null;
        }
    } );

} )();

/**
 * Frontend JavaScript - Interactive carousel
 * Pure vanilla JavaScript, no frameworks
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

        /**
         * Display a specific slide
         */
        var showSlide = function( index ) {
            // Hide all slides
            slides.forEach( function( slide, i ) {
                if ( i === index ) {
                    slide.classList.add( 'active' );
                } else {
                    slide.classList.remove( 'active' );
                }
            } );

            // Update navigation buttons
            navButtons.forEach( function( btn, i ) {
                btn.setAttribute( 'aria-selected', i === index ? 'true' : 'false' );
            } );

            // Update status for screen readers
            if ( statusDiv ) {
                statusDiv.textContent = 'Slide ' + ( index + 1 ) + ' of ' + slides.length;
            }

            currentSlide = index;
        };

        /**
         * Next slide
         */
        var nextSlide = function() {
            currentSlide = ( currentSlide + 1 ) % slides.length;
            showSlide( currentSlide );
        };

        /**
         * Previous slide
         */
        var prevSlide = function() {
            currentSlide = ( currentSlide - 1 + slides.length ) % slides.length;
            showSlide( currentSlide );
        };

        /**
         * Start autoplay
         */
        var startAutoplay = function() {
            if ( autoplayInterval ) {
                clearInterval( autoplayInterval );
            }
            autoplayInterval = setInterval( nextSlide, config.autoplaySpeed );
            isPlaying = true;
        };

        /**
         * Stop autoplay
         */
        var stopAutoplay = function() {
            if ( autoplayInterval ) {
                clearInterval( autoplayInterval );
            }
            isPlaying = false;
        };

        // Initialization
        showSlide( 0 );
        startAutoplay();

        // Navigation via buttons
        navButtons.forEach( function( btn, index ) {
            btn.addEventListener( 'click', function() {
                showSlide( index );
            } );
        } );

        // Pause/Play button
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

        // Keyboard navigation
        document.addEventListener( 'keydown', function( e ) {
            if ( e.key === 'ArrowRight' ) {
                nextSlide();
            }
            if ( e.key === 'ArrowLeft' ) {
                prevSlide();
            }
        } );

        // Pause on hover
        carousel.addEventListener( 'mouseenter', function() {
            if ( isPlaying ) {
                stopAutoplay();
            }
        } );

        carousel.addEventListener( 'mouseleave', function() {
            if ( isPlaying ) {
                startAutoplay();
            }
        } );
    } );
} );
