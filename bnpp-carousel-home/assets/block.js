/**
 * BNPP Carousel Homepage Block
 * Simplified version - proper attribute handling
 */

( function() {
    if ( typeof wp === 'undefined' || ! wp.blocks ) {
        return;
    }

    var registerBlockType = wp.blocks.registerBlockType;
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var PanelBody = wp.components.PanelBody;

    registerBlockType( 'bnpp/carousel-homepage', {
        title: 'Carousel Homepage',
        icon: 'slides',
        category: 'media',
        description: 'A carousel with 3 slides',
        keywords: [ 'carousel', 'slider' ],
        
        edit: function( props ) {
            var slides = props.attributes.slides;
            var autoplaySpeed = props.attributes.autoplaySpeed;
            var currentSlide = props.attributes.currentSlide || 0;

            // Ensure we have 3 slides
            if ( ! slides || slides.length === 0 ) {
                props.setAttributes( {
                    slides: [
                        { title: 'Slide 1', description: 'Description 1', background: '', link: { text: 'Learn more', url: '#', class: 'primary' } },
                        { title: 'Slide 2', description: 'Description 2', background: '', link: { text: 'Learn more', url: '#', class: 'primary' } },
                        { title: 'Slide 3', description: 'Description 3', background: '', link: { text: 'Learn more', url: '#', class: 'primary' } }
                    ]
                } );
                return el( 'div', null, 'Loading...' );
            }

            var updateSlide = function( index, key, value ) {
                var newSlides = slides.slice();
                if ( key === 'link' ) {
                    newSlides[ index ].link = Object.assign( {}, newSlides[ index ].link, value );
                } else {
                    newSlides[ index ][ key ] = value;
                }
                props.setAttributes( { slides: newSlides } );
            };

            var slide = slides[ currentSlide ];

            // Render preview
            var preview = el(
                'div',
                { style: { position: 'relative', width: '100%', height: '400px', background: '#000', overflow: 'hidden', marginBottom: '20px', borderRadius: '4px' } },
                el(
                    'div',
                    { style: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: slide.background ? 'url(' + slide.background + ')' : 'none', backgroundSize: 'cover', backgroundPosition: 'center' } },
                    el(
                        'div',
                        { style: { backgroundColor: 'rgba(0,0,0,0.65)', color: '#fff', padding: '30px', textAlign: 'center', maxWidth: '600px', borderRadius: '8px' } },
                        el( 'h2', { style: { margin: '0 0 15px 0', fontSize: '2em', fontWeight: 'bold' } }, slide.title ),
                        el( 'p', { style: { margin: '15px 0', fontSize: '1.1em' } }, slide.description ),
                        slide.link && slide.link.text ? el( 'a', { href: slide.link.url, style: { display: 'inline-block', marginTop: '15px', padding: '12px 28px', backgroundColor: '#007bff', color: '#fff', borderRadius: '4px', fontWeight: 'bold' } }, slide.link.text ) : null
                    )
                ),
                // Navigation buttons
                el(
                    'div',
                    { style: { position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px', zIndex: 10 } },
                    slides.map( function( s, idx ) {
                        return el( 'button', { key: idx, onClick: function() { props.setAttributes( { currentSlide: idx } ); }, style: { background: idx === currentSlide ? '#fff' : 'rgba(0,0,0,0.5)', color: idx === currentSlide ? '#000' : '#fff', border: '2px solid #fff', padding: '8px 12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85em' } }, s.title || 'Slide ' + ( idx + 1 ) );
                    } )
                )
            );

            // Slide selector buttons
            var selectors = el(
                'div',
                { style: { display: 'flex', gap: '10px', marginBottom: '20px' } },
                slides.map( function( s, idx ) {
                    return el( 'button', { key: idx, onClick: function() { props.setAttributes( { currentSlide: idx } ); }, style: { flex: 1, padding: '12px', background: idx === currentSlide ? '#007bff' : '#f0f0f0', color: idx === currentSlide ? '#fff' : '#000', border: idx === currentSlide ? '2px solid #007bff' : '2px solid #ccc', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1em' } }, ( idx + 1 ).toString() );
                } )
            );

            // Slide settings panel
            var settingsPanel = el(
                'div',
                null,
                el( 'h3', { style: { margin: '20px 0 15px 0' } }, 'Slide ' + ( currentSlide + 1 ) + ' Settings' ),
                
                // Title
                el( 'div', { style: { marginBottom: '15px' } },
                    el( 'label', { style: { fontWeight: 'bold', display: 'block', marginBottom: '5px' } }, 'Title' ),
                    el( 'input', { type: 'text', value: slide.title, onInput: function( e ) { updateSlide( currentSlide, 'title', e.target.value ); }, style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' } } )
                ),

                // Description
                el( 'div', { style: { marginBottom: '15px' } },
                    el( 'label', { style: { fontWeight: 'bold', display: 'block', marginBottom: '5px' } }, 'Description' ),
                    el( 'textarea', { value: slide.description, onInput: function( e ) { updateSlide( currentSlide, 'description', e.target.value ); }, style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '80px', boxSizing: 'border-box', fontFamily: 'inherit' } } )
                ),

                // Background image
                el( 'div', { style: { marginBottom: '15px' } },
                    el( 'label', { style: { fontWeight: 'bold', display: 'block', marginBottom: '5px' } }, 'Background Image' ),
                    el( MediaUpload, { onSelect: function( media ) { updateSlide( currentSlide, 'background', media.url ); }, allowedTypes: [ 'image' ], render: function( obj ) {
                        return el( 'div', null,
                            el( 'button', { onClick: obj.open, style: { width: '100%', padding: '10px', background: '#f0f0f0', border: '2px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' } }, slide.background ? 'Change Image' : 'Select Image' ),
                            slide.background ? el( 'div', { style: { marginTop: '10px' } },
                                el( 'img', { src: slide.background, style: { maxWidth: '100%', height: 'auto', borderRadius: '4px' } } ),
                                el( 'button', { onClick: function() { updateSlide( currentSlide, 'background', '' ); }, style: { width: '100%', marginTop: '10px', padding: '8px', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' } }, 'Remove Image' )
                            ) : null
                        );
                    } } )
                ),

                // Button text
                el( 'div', { style: { marginBottom: '15px' } },
                    el( 'label', { style: { fontWeight: 'bold', display: 'block', marginBottom: '5px' } }, 'Button Text' ),
                    el( 'input', { type: 'text', value: slide.link.text, onInput: function( e ) { updateSlide( currentSlide, 'link', { text: e.target.value } ); }, style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' } } )
                ),

                // Button URL
                el( 'div', { style: { marginBottom: '15px' } },
                    el( 'label', { style: { fontWeight: 'bold', display: 'block', marginBottom: '5px' } }, 'Button URL' ),
                    el( 'input', { type: 'url', value: slide.link.url, onInput: function( e ) { updateSlide( currentSlide, 'link', { url: e.target.value } ); }, style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' } } )
                ),

                // Button style
                el( 'div', { style: { marginBottom: '15px' } },
                    el( 'label', { style: { fontWeight: 'bold', display: 'block', marginBottom: '10px' } }, 'Button Style' ),
                    el( 'div', { style: { display: 'flex', gap: '8px' } },
                        [ 'primary', 'secondary', 'tertiary', 'ghost' ].map( function( s ) {
                            return el( 'button', { key: s, onClick: function() { updateSlide( currentSlide, 'link', { class: s } ); }, style: { flex: 1, padding: '8px', border: slide.link.class === s ? '2px solid #007bff' : '2px solid #ccc', background: slide.link.class === s ? '#007bff' : '#fff', color: slide.link.class === s ? '#fff' : '#000', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' } }, s.charAt( 0 ).toUpperCase() + s.slice( 1 ) );
                        } )
                    )
                ),

                // Duration
                el( 'div', { style: { marginBottom: '15px', paddingTop: '15px', borderTop: '1px solid #ccc' } },
                    el( 'label', { style: { fontWeight: 'bold', display: 'block', marginBottom: '5px' } }, 'Duration (seconds)' ),
                    el( 'input', { type: 'number', value: autoplaySpeed, onInput: function( e ) { props.setAttributes( { autoplaySpeed: parseInt( e.target.value ) || 4 } ); }, min: 1, max: 60, style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' } } )
                )
            );

            // Right panel
            var rightPanel = el(
                InspectorControls,
                null,
                el( PanelBody, { title: 'Slide Selection', initialOpen: true }, selectors ),
                el( PanelBody, { title: 'Slide Settings', initialOpen: true }, settingsPanel )
            );

            return el( Fragment, null, rightPanel, preview );
        },

        save: function() {
            return null; // Server-side rendering
        }
    } );

} )();

/**
 * Frontend carousel
 */
document.addEventListener( 'DOMContentLoaded', function() {
    document.querySelectorAll( '.bnpp-carousel-wrapper' ).forEach( function( wrapper ) {
        var carousel = wrapper.querySelector( '.bnpp-carousel' );
        var slides = carousel.querySelectorAll( '.bnpp-slide' );
        var navButtons = wrapper.querySelectorAll( '.bnpp-carousel-nav button' );
        var pauseBtn = wrapper.querySelector( '.bnpp-pause-btn' );
        var configScript = wrapper.querySelector( '.bnpp-carousel-config' );

        if ( ! carousel || slides.length === 0 ) return;

        var config = { autoplaySpeed: 4000 };
        if ( configScript ) {
            try { config = JSON.parse( configScript.textContent ); } catch ( e ) {}
        }

        var currentSlide = 0;
        var isPlaying = true;
        var autoplayInterval;

        var showSlide = function( index ) {
            slides.forEach( function( slide, i ) {
                slide.classList.toggle( 'active', i === index );
            } );
            navButtons.forEach( function( btn, i ) {
                btn.setAttribute( 'aria-selected', i === index ? 'true' : 'false' );
            } );
            currentSlide = index;
        };

        var nextSlide = function() { showSlide( ( currentSlide + 1 ) % slides.length ); };
        var prevSlide = function() { showSlide( ( currentSlide - 1 + slides.length ) % slides.length ); };

        var startAutoplay = function() {
            autoplayInterval = setInterval( nextSlide, config.autoplaySpeed );
            isPlaying = true;
        };

        var stopAutoplay = function() {
            clearInterval( autoplayInterval );
            isPlaying = false;
        };

        showSlide( 0 );
        startAutoplay();

        navButtons.forEach( function( btn, index ) {
            btn.addEventListener( 'click', function() { showSlide( index ); } );
        } );

        if ( pauseBtn ) {
            pauseBtn.addEventListener( 'click', function() {
                if ( isPlaying ) {
                    stopAutoplay();
                    pauseBtn.textContent = 'Play';
                } else {
                    startAutoplay();
                    pauseBtn.textContent = 'Pause';
                }
            } );
        }

        document.addEventListener( 'keydown', function( e ) {
            if ( e.key === 'ArrowRight' ) nextSlide();
            if ( e.key === 'ArrowLeft' ) prevSlide();
        } );

        carousel.addEventListener( 'mouseenter', function() { if ( isPlaying ) stopAutoplay(); } );
        carousel.addEventListener( 'mouseleave', function() { if ( isPlaying ) startAutoplay(); } );
    } );
} );
