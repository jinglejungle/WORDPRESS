/**
 * BNPP Carousel Homepage Block
 * Scripts for Gutenberg editor and frontend
 */

const { registerBlockType } = wp.blocks;
const { InspectorControls } = wp.blockEditor;
const { PanelBody, Button, TextControl, TextareaControl, NumberControl } = wp.components;
const { Fragment } = wp.element;

/**
 * Register the Gutenberg block
 */
registerBlockType( 'bnpp/carousel-homepage', {
    title: 'Carousel Homepage',
    icon: 'slides',
    category: 'media',
    description: 'An accessible carousel with advanced slide editing capabilities',
    keywords: [ 'carousel', 'slider', 'banner' ],
    
    edit: function( props ) {
        const { attributes, setAttributes } = props;
        const { slides = [], autoplaySpeed = 4 } = attributes;

        const updateSlide = ( index, field, value ) => {
            const newSlides = [ ...slides ];
            if ( ! newSlides[ index ] ) {
                newSlides[ index ] = {
                    title: '',
                    description: '',
                    link: { text: '', url: '#', class: 'primary' }
                };
            }

            if ( field === 'link' ) {
                newSlides[ index ].link = { ...newSlides[ index ].link, ...value };
            } else {
                newSlides[ index ][ field ] = value;
            }

            setAttributes( { slides: newSlides } );
        };

        const addSlide = () => {
            const newSlides = [ ...slides ];
            newSlides.push( {
                title: 'New slide',
                description: 'Slide description',
                link: { text: 'Learn more', url: '#', class: 'primary' }
            } );
            setAttributes( { slides: newSlides } );
        };

        const deleteSlide = ( index ) => {
            const newSlides = slides.filter( ( _, i ) => i !== index );
            setAttributes( { slides: newSlides } );
        };

        const updateLinkClass = ( index, buttonClass ) => {
            updateSlide( index, 'link', { class: buttonClass } );
        };

        return (
            <Fragment>
                <InspectorControls>
                    <PanelBody title="Carousel Settings" initialOpen={ true }>
                        <NumberControl
                            label="Duration between slides (seconds)"
                            value={ autoplaySpeed }
                            onChange={ ( value ) => setAttributes( { autoplaySpeed: value } ) }
                            min={ 1 }
                            max={ 60 }
                        />
                    </PanelBody>
                </InspectorControls>

                <div className="bnpp-carousel-editor">
                    <h2 style={ { marginBottom: '20px' } }>Carousel Slides</h2>

                    { slides.map( ( slide, index ) => (
                        <div key={ index } className="bnpp-carousel-editor-slide">
                            <div className="bnpp-carousel-editor-slide-header">
                                <h3>Slide { index + 1 }</h3>
                                { slides.length > 1 && (
                                    <button
                                        onClick={ () => deleteSlide( index ) }
                                        className="bnpp-style-btn delete"
                                        title="Delete this slide"
                                    >
                                        Delete
                                    </button>
                                ) }
                            </div>

                            <div className="bnpp-carousel-editor-controls">
                                {/* Title */}
                                <div>
                                    <label htmlFor={ `slide-title-${ index }` }>Title</label>
                                    <input
                                        id={ `slide-title-${ index }` }
                                        type="text"
                                        value={ slide.title || '' }
                                        onChange={ ( e ) => updateSlide( index, 'title', e.target.value ) }
                                        placeholder="Slide title"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label htmlFor={ `slide-desc-${ index }` }>Description</label>
                                    <textarea
                                        id={ `slide-desc-${ index }` }
                                        value={ slide.description || '' }
                                        onChange={ ( e ) => updateSlide( index, 'description', e.target.value ) }
                                        placeholder="Slide description"
                                    />
                                </div>

                                {/* Link Editor */}
                                <div className="bnpp-link-editor">
                                    <h4>Link and Button</h4>

                                    {/* Link Text */}
                                    <div>
                                        <label htmlFor={ `link-text-${ index }` }>Button Text</label>
                                        <input
                                            id={ `link-text-${ index }` }
                                            type="text"
                                            value={ slide.link?.text || '' }
                                            onChange={ ( e ) => updateSlide( index, 'link', { text: e.target.value } ) }
                                            placeholder="Button text"
                                        />
                                    </div>

                                    {/* Link URL */}
                                    <div style={ { marginTop: '10px' } }>
                                        <label htmlFor={ `link-url-${ index }` }>URL</label>
                                        <input
                                            id={ `link-url-${ index }` }
                                            type="url"
                                            value={ slide.link?.url || '' }
                                            onChange={ ( e ) => updateSlide( index, 'link', { url: e.target.value } ) }
                                            placeholder="https://example.com"
                                        />
                                    </div>

                                    {/* Button Style Selection */}
                                    <div style={ { marginTop: '10px' } }>
                                        <label>Button Style</label>
                                        <div className="bnpp-style-buttons">
                                            { [ 'primary', 'secondary', 'tertiary', 'ghost' ].map( ( buttonClass ) => (
                                                <button
                                                    key={ buttonClass }
                                                    className={ `bnpp-style-btn ${ slide.link?.class === buttonClass ? 'active' : '' }` }
                                                    onClick={ () => updateLinkClass( index, buttonClass ) }
                                                    title={ `${ buttonClass } style` }
                                                >
                                                    { buttonClass.charAt( 0 ).toUpperCase() + buttonClass.slice( 1 ) }
                                                </button>
                                            ) ) }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) ) }

                    {/* Add Slide Button */}
                    <button onClick={ addSlide } className="bnpp-add-slide-btn">
                        + Add Slide
                    </button>
                </div>
            </Fragment>
        );
    },

    save: function() {
        return null; // Server-side rendering
    }
} );

/**
 * Frontend JavaScript - Interactive carousel
 */
document.addEventListener( 'DOMContentLoaded', function() {
    const carousels = document.querySelectorAll( '.bnpp-carousel-wrapper' );

    carousels.forEach( ( wrapper ) => {
        const carousel = wrapper.querySelector( '.bnpp-carousel' );
        const slides = carousel.querySelectorAll( '.bnpp-slide' );
        const navButtons = wrapper.querySelectorAll( '.bnpp-carousel-nav button' );
        const pauseBtn = wrapper.querySelector( '.bnpp-pause-btn' );
        const statusDiv = wrapper.querySelector( '#bnpp-carousel-status' );
        const configScript = wrapper.querySelector( '.bnpp-carousel-config' );

        if ( ! carousel || slides.length === 0 ) {
            return;
        }

        // Configuration
        let config = { autoplaySpeed: 4000, totalSlides: slides.length };
        if ( configScript ) {
            try {
                config = JSON.parse( configScript.textContent );
            } catch ( e ) {
                console.error( 'Error parsing config:', e );
            }
        }

        let currentSlide = 0;
        let isPlaying = true;
        let autoplayInterval;

        /**
         * Display a specific slide
         */
        const showSlide = ( index ) => {
            // Hide all slides
            slides.forEach( ( slide, i ) => {
                if ( i === index ) {
                    slide.classList.add( 'active' );
                } else {
                    slide.classList.remove( 'active' );
                }
            } );

            // Update navigation buttons
            navButtons.forEach( ( btn, i ) => {
                btn.setAttribute( 'aria-selected', i === index ? 'true' : 'false' );
            } );

            // Update status for screen readers
            if ( statusDiv ) {
                statusDiv.textContent = `Slide ${ index + 1 } of ${ slides.length }`;
            }

            currentSlide = index;
        };

        /**
         * Next slide
         */
        const nextSlide = () => {
            currentSlide = ( currentSlide + 1 ) % slides.length;
            showSlide( currentSlide );
        };

        /**
         * Previous slide
         */
        const prevSlide = () => {
            currentSlide = ( currentSlide - 1 + slides.length ) % slides.length;
            showSlide( currentSlide );
        };

        /**
         * Start autoplay
         */
        const startAutoplay = () => {
            if ( autoplayInterval ) {
                clearInterval( autoplayInterval );
            }
            autoplayInterval = setInterval( nextSlide, config.autoplaySpeed );
            isPlaying = true;
        };

        /**
         * Stop autoplay
         */
        const stopAutoplay = () => {
            if ( autoplayInterval ) {
                clearInterval( autoplayInterval );
            }
            isPlaying = false;
        };

        // Initialization
        showSlide( 0 );
        startAutoplay();

        // Navigation via buttons
        navButtons.forEach( ( btn, index ) => {
            btn.addEventListener( 'click', () => {
                showSlide( index );
            } );
        } );

        // Pause/Play button
        if ( pauseBtn ) {
            pauseBtn.addEventListener( 'click', () => {
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
        document.addEventListener( 'keydown', ( e ) => {
            if ( e.key === 'ArrowRight' ) nextSlide();
            if ( e.key === 'ArrowLeft' ) prevSlide();
        } );

        // Pause on hover
        carousel.addEventListener( 'mouseenter', () => {
            if ( isPlaying ) {
                stopAutoplay();
            }
        } );

        carousel.addEventListener( 'mouseleave', () => {
            if ( isPlaying ) {
                startAutoplay();
            }
        } );
    } );
} );
