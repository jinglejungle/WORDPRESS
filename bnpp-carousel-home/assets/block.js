/**
 * BNPP Carousel Block
 * save() generates the actual HTML that gets stored
 */

( function() {
    if ( ! wp.blocks || ! wp.blockEditor || ! wp.element ) return;

    var el = wp.element.createElement;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var PanelBody = wp.components.PanelBody;

    registerBlockType( 'bnpp/carousel-homepage', {
        title: 'Carousel Homepage',
        icon: 'slides',
        category: 'media',
        
        edit: function( props ) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var slides = attributes.slides || [];
            var autoplaySpeed = attributes.autoplaySpeed || 4;
            var currentSlide = attributes.currentSlide || 0;

            // Init slides if empty
            if ( slides.length === 0 ) {
                setAttributes( {
                    slides: [
                        { title: 'Slide 1', description: 'Description 1', background: '', link: { text: 'Learn more', url: '#', class: 'primary' } },
                        { title: 'Slide 2', description: 'Description 2', background: '', link: { text: 'Learn more', url: '#', class: 'primary' } },
                        { title: 'Slide 3', description: 'Description 3', background: '', link: { text: 'Learn more', url: '#', class: 'primary' } }
                    ]
                } );
                return el( 'div', null, 'Initializing...' );
            }

            var updateSlide = function( idx, key, value ) {
                var newSlides = slides.slice();
                if ( key === 'link' ) {
                    newSlides[ idx ].link = Object.assign( {}, newSlides[ idx ].link, value );
                } else {
                    newSlides[ idx ][ key ] = value;
                }
                setAttributes( { slides: newSlides } );
            };

            var slide = slides[ currentSlide ];

            // Preview
            var previewElements = [];
            previewElements.push(
                el( 'div', { key: 'carousel', style: { position: 'relative', width: '100%', height: '400px', background: '#000', overflow: 'hidden', borderRadius: '4px', marginBottom: '20px' } },
                    // Slide
                    el( 'div', { style: { width: '100%', height: '100%', backgroundImage: slide.background ? 'url(' + slide.background + ')' : 'none', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                        el( 'div', { style: { backgroundColor: 'rgba(0,0,0,0.65)', color: '#fff', padding: '30px', textAlign: 'center', maxWidth: '600px', borderRadius: '8px' } },
                            el( 'h2', { style: { margin: '0 0 15px 0', fontSize: '2em', fontWeight: 'bold' } }, slide.title ),
                            el( 'p', { style: { margin: '15px 0' } }, slide.description ),
                            el( 'a', { href: slide.link.url, style: { display: 'inline-block', marginTop: '15px', padding: '12px 28px', backgroundColor: '#007bff', color: '#fff', borderRadius: '4px', fontWeight: 'bold', textDecoration: 'none' } }, slide.link.text )
                        )
                    ),
                    // Nav buttons
                    el( 'div', { style: { position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' } },
                        slides.map( function( s, i ) {
                            return el( 'button', { key: i, onClick: function() { setAttributes( { currentSlide: i } ); }, style: { background: i === currentSlide ? '#fff' : 'rgba(0,0,0,0.5)', color: i === currentSlide ? '#000' : '#fff', border: '2px solid #fff', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85em' } }, s.title );
                        } )
                    )
                )
            );

            // Slide selectors
            var selectorsPanel = el( 'div', { style: { display: 'flex', gap: '10px', marginBottom: '20px' } },
                slides.map( function( s, i ) {
                    return el( 'button', { key: i, onClick: function() { setAttributes( { currentSlide: i } ); }, style: { flex: 1, padding: '12px', background: i === currentSlide ? '#007bff' : '#f0f0f0', color: i === currentSlide ? '#fff' : '#000', border: i === currentSlide ? '2px solid #007bff' : '2px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' } }, ( i + 1 ) );
                } )
            );

            // Settings
            var settingsElements = [];
            settingsElements.push( el( 'h3', { style: { margin: '0 0 15px 0' } }, 'Slide ' + ( currentSlide + 1 ) ) );

            // Title
            settingsElements.push( el( 'div', { style: { marginBottom: '15px' } },
                el( 'label', { style: { fontWeight: 'bold', display: 'block', marginBottom: '5px' } }, 'Title' ),
                el( 'input', { type: 'text', value: slide.title, onInput: function( e ) { updateSlide( currentSlide, 'title', e.target.value ); }, style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' } } )
            ) );

            // Description
            settingsElements.push( el( 'div', { style: { marginBottom: '15px' } },
                el( 'label', { style: { fontWeight: 'bold', display: 'block', marginBottom: '5px' } }, 'Description' ),
                el( 'textarea', { value: slide.description, onInput: function( e ) { updateSlide( currentSlide, 'description', e.target.value ); }, style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '80px', boxSizing: 'border-box', fontFamily: 'inherit' } } )
            ) );

            // Background
            settingsElements.push( el( 'div', { style: { marginBottom: '15px' } },
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
            ) );

            // Button text
            settingsElements.push( el( 'div', { style: { marginBottom: '15px' } },
                el( 'label', { style: { fontWeight: 'bold', display: 'block', marginBottom: '5px' } }, 'Button Text' ),
                el( 'input', { type: 'text', value: slide.link.text, onInput: function( e ) { updateSlide( currentSlide, 'link', { text: e.target.value } ); }, style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' } } )
            ) );

            // Button URL
            settingsElements.push( el( 'div', { style: { marginBottom: '15px' } },
                el( 'label', { style: { fontWeight: 'bold', display: 'block', marginBottom: '5px' } }, 'Button URL' ),
                el( 'input', { type: 'url', value: slide.link.url, onInput: function( e ) { updateSlide( currentSlide, 'link', { url: e.target.value } ); }, style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' } } )
            ) );

            // Button style
            settingsElements.push( el( 'div', { style: { marginBottom: '15px' } },
                el( 'label', { style: { fontWeight: 'bold', display: 'block', marginBottom: '10px' } }, 'Button Style' ),
                el( 'div', { style: { display: 'flex', gap: '8px' } },
                    [ 'primary', 'secondary', 'tertiary', 'ghost' ].map( function( style ) {
                        return el( 'button', { key: style, onClick: function() { updateSlide( currentSlide, 'link', { class: style } ); }, style: { flex: 1, padding: '8px', border: slide.link.class === style ? '2px solid #007bff' : '2px solid #ccc', background: slide.link.class === style ? '#007bff' : '#fff', color: slide.link.class === style ? '#fff' : '#000', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9em' } }, style.charAt( 0 ).toUpperCase() + style.slice( 1 ) );
                    } )
                )
            ) );

            // Duration
            settingsElements.push( el( 'div', { style: { marginBottom: '15px', paddingTop: '15px', borderTop: '1px solid #ccc' } },
                el( 'label', { style: { fontWeight: 'bold', display: 'block', marginBottom: '5px' } }, 'Duration (seconds)' ),
                el( 'input', { type: 'number', value: autoplaySpeed, onInput: function( e ) { setAttributes( { autoplaySpeed: parseInt( e.target.value ) || 4 } ); }, min: 1, max: 60, style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' } } )
            ) );

            var rightPanel = el( InspectorControls, null,
                el( PanelBody, { title: 'Slide Selection', initialOpen: true }, selectorsPanel ),
                el( PanelBody, { title: 'Slide Settings', initialOpen: true }, settingsElements )
            );

            return el( wp.element.Fragment, null, rightPanel, previewElements );
        },

        save: function( props ) {
            var slides = props.attributes.slides || [];
            var autoplaySpeed = props.attributes.autoplaySpeed || 4;

            var slideElements = slides.map( function( slide, idx ) {
                return el( 'div', { key: idx, className: 'bnpp-slide', style: { backgroundImage: slide.background ? 'url(' + slide.background + ')' : 'none' } },
                    el( 'div', { className: 'bnpp-overlay' },
                        el( 'h2', null, slide.title ),
                        el( 'p', null, slide.description ),
                        el( 'a', { href: slide.link.url, className: 'bnpp-btn bnpp-btn-' + slide.link.class }, slide.link.text )
                    )
                );
            } );

            var navButtons = slides.map( function( slide, idx ) {
                return el( 'button', { key: idx, role: 'tab', 'aria-selected': idx === 0 ? 'true' : 'false' }, slide.title );
            } );

            return el( 'section', { className: 'bnpp-carousel-wrapper', role: 'region', 'aria-roledescription': 'carousel' },
                el( 'div', { className: 'bnpp-carousel' }, slideElements ),
                el( 'div', { className: 'bnpp-carousel-nav', role: 'tablist' }, navButtons ),
                el( 'button', { className: 'bnpp-pause-btn', 'aria-pressed': 'false' }, 'Pause' ),
                el( 'div', { className: 'sr-only', 'aria-live': 'polite', id: 'bnpp-carousel-status' } ),
                el( 'script', { type: 'application/json', className: 'bnpp-carousel-config' }, JSON.stringify( { autoplaySpeed: autoplaySpeed * 1000, totalSlides: slides.length } ) )
            );
        }
    } );

} )();

// Frontend
document.addEventListener( 'DOMContentLoaded', function() {
    document.querySelectorAll( '.bnpp-carousel-wrapper' ).forEach( function( wrapper ) {
        var carousel = wrapper.querySelector( '.bnpp-carousel' );
        if ( ! carousel ) return;

        var slides = carousel.querySelectorAll( '.bnpp-slide' );
        var navButtons = wrapper.querySelectorAll( '.bnpp-carousel-nav button' );
        var pauseBtn = wrapper.querySelector( '.bnpp-pause-btn' );
        var configScript = wrapper.querySelector( '.bnpp-carousel-config' );

        if ( slides.length === 0 ) return;

        var config = { autoplaySpeed: 4000 };
        if ( configScript ) {
            try { config = JSON.parse( configScript.textContent ); } catch ( e ) {}
        }

        var currentSlide = 0;
        var isPlaying = true;
        var autoplayInterval;

        var showSlide = function( idx ) {
            slides.forEach( function( s, i ) { s.classList.toggle( 'active', i === idx ); } );
            navButtons.forEach( function( b, i ) { b.setAttribute( 'aria-selected', i === idx ? 'true' : 'false' ); } );
            currentSlide = idx;
        };

        var next = function() { showSlide( ( currentSlide + 1 ) % slides.length ); };
        var prev = function() { showSlide( ( currentSlide - 1 + slides.length ) % slides.length ); };
        var start = function() { autoplayInterval = setInterval( next, config.autoplaySpeed ); isPlaying = true; };
        var stop = function() { clearInterval( autoplayInterval ); isPlaying = false; };

        showSlide( 0 );
        start();

        navButtons.forEach( function( btn, idx ) { btn.addEventListener( 'click', function() { showSlide( idx ); } ); } );
        if ( pauseBtn ) pauseBtn.addEventListener( 'click', function() { isPlaying ? stop() : start(); pauseBtn.textContent = isPlaying ? 'Pause' : 'Play'; } );
        document.addEventListener( 'keydown', function( e ) { if ( e.key === 'ArrowRight' ) next(); if ( e.key === 'ArrowLeft' ) prev(); } );
        carousel.addEventListener( 'mouseenter', function() { if ( isPlaying ) stop(); } );
        carousel.addEventListener( 'mouseleave', function() { if ( isPlaying ) start(); } );
    } );
} );
