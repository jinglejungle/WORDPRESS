var wpData = window.wp && window.wp.data;
var wpBlocks = window.wp && window.wp.blocks;
var wpBlocksEditor = window.wp && window.wp.blockEditor;
var wpComponents = window.wp && window.wp.components;
var wpElement = window.wp && window.wp.element;

if ( ! wpBlocks || ! wpBlocksEditor ) {
    console.log( 'WordPress APIs not ready' );
} else {
    wpBlocks.registerBlockType( 'bnpp/carousel-homepage', {
        title: 'Carousel Homepage',
        icon: 'slides',
        category: 'media',
        
        edit: function( props ) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var slides = attributes.slides || [];
            var autoplaySpeed = attributes.autoplaySpeed || 4;
            var currentSlideIndex = attributes.currentSlideIndex || 0;

            if ( ! slides.length ) {
                setAttributes( {
                    slides: [
                        { title: 'Slide 1', description: 'Description 1', background: '', link: { text: 'Learn more', url: '#', class: 'primary' } },
                        { title: 'Slide 2', description: 'Description 2', background: '', link: { text: 'Learn more', url: '#', class: 'primary' } },
                        { title: 'Slide 3', description: 'Description 3', background: '', link: { text: 'Learn more', url: '#', class: 'primary' } }
                    ]
                } );
                return 'Initializing...';
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

            var slide = slides[ currentSlideIndex ];

            // Create elements using WordPress API
            var preview = wpElement.createElement( 'div', { 
                style: { position: 'relative', width: '100%', height: '400px', background: '#000', overflow: 'hidden', borderRadius: '4px', marginBottom: '20px' } 
            },
                wpElement.createElement( 'div', { 
                    style: { width: '100%', height: '100%', backgroundImage: slide.background ? 'url(' + slide.background + ')' : 'none', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' } 
                },
                    wpElement.createElement( 'div', { style: { backgroundColor: 'rgba(0,0,0,0.65)', color: '#fff', padding: '30px', textAlign: 'center', maxWidth: '600px', borderRadius: '8px' } },
                        wpElement.createElement( 'h2', { style: { margin: '0 0 15px 0', fontSize: '2em', fontWeight: 'bold' } }, slide.title ),
                        wpElement.createElement( 'p', { style: { margin: '15px 0' } }, slide.description ),
                        wpElement.createElement( 'a', { href: slide.link.url, style: { display: 'inline-block', marginTop: '15px', padding: '12px 28px', backgroundColor: '#007bff', color: '#fff', borderRadius: '4px', fontWeight: 'bold', textDecoration: 'none' } }, slide.link.text )
                    )
                ),
                wpElement.createElement( 'div', { style: { position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' } },
                    slides.map( function( s, i ) {
                        return wpElement.createElement( 'button', { key: i, onClick: function() { setAttributes( { currentSlideIndex: i } ); }, style: { background: i === currentSlideIndex ? '#fff' : 'rgba(0,0,0,0.5)', color: i === currentSlideIndex ? '#000' : '#fff', border: '2px solid #fff', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' } }, s.title );
                    } )
                )
            );

            var selectors = wpElement.createElement( 'div', { style: { display: 'flex', gap: '10px', marginBottom: '20px' } },
                slides.map( function( s, i ) {
                    return wpElement.createElement( 'button', { key: i, onClick: function() { setAttributes( { currentSlideIndex: i } ); }, style: { flex: 1, padding: '12px', background: i === currentSlideIndex ? '#007bff' : '#f0f0f0', color: i === currentSlideIndex ? '#fff' : '#000', border: '2px solid ' + ( i === currentSlideIndex ? '#007bff' : '#ccc' ), borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' } }, String( i + 1 ) );
                } )
            );

            var settingsContent = [
                wpElement.createElement( 'h3', { key: 'title-h', style: { margin: '0 0 15px 0' } }, 'Slide ' + ( currentSlideIndex + 1 ) + ' Settings' ),
                
                wpElement.createElement( 'div', { key: 'title-div', style: { marginBottom: '15px' } },
                    wpElement.createElement( 'label', { style: { fontWeight: 'bold', display: 'block', marginBottom: '5px' } }, 'Title' ),
                    wpElement.createElement( 'input', { type: 'text', value: slide.title, onInput: function( e ) { updateSlide( currentSlideIndex, 'title', e.target.value ); }, style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' } } )
                ),

                wpElement.createElement( 'div', { key: 'desc-div', style: { marginBottom: '15px' } },
                    wpElement.createElement( 'label', { style: { fontWeight: 'bold', display: 'block', marginBottom: '5px' } }, 'Description' ),
                    wpElement.createElement( 'textarea', { value: slide.description, onInput: function( e ) { updateSlide( currentSlideIndex, 'description', e.target.value ); }, style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '80px', boxSizing: 'border-box', fontFamily: 'inherit' } } )
                ),

                wpElement.createElement( 'div', { key: 'bg-div', style: { marginBottom: '15px' } },
                    wpElement.createElement( 'label', { style: { fontWeight: 'bold', display: 'block', marginBottom: '5px' } }, 'Background Image URL' ),
                    wpElement.createElement( 'input', { type: 'url', value: slide.background, onInput: function( e ) { updateSlide( currentSlideIndex, 'background', e.target.value ); }, placeholder: 'https://example.com/image.jpg', style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' } } )
                ),

                wpElement.createElement( 'div', { key: 'text-div', style: { marginBottom: '15px' } },
                    wpElement.createElement( 'label', { style: { fontWeight: 'bold', display: 'block', marginBottom: '5px' } }, 'Button Text' ),
                    wpElement.createElement( 'input', { type: 'text', value: slide.link.text, onInput: function( e ) { updateSlide( currentSlideIndex, 'link', { text: e.target.value } ); }, style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' } } )
                ),

                wpElement.createElement( 'div', { key: 'url-div', style: { marginBottom: '15px' } },
                    wpElement.createElement( 'label', { style: { fontWeight: 'bold', display: 'block', marginBottom: '5px' } }, 'Button URL' ),
                    wpElement.createElement( 'input', { type: 'url', value: slide.link.url, onInput: function( e ) { updateSlide( currentSlideIndex, 'link', { url: e.target.value } ); }, style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' } } )
                ),

                wpElement.createElement( 'div', { key: 'style-div', style: { marginBottom: '15px' } },
                    wpElement.createElement( 'label', { style: { fontWeight: 'bold', display: 'block', marginBottom: '10px' } }, 'Button Style' ),
                    wpElement.createElement( 'div', { style: { display: 'flex', gap: '8px' } },
                        [ 'primary', 'secondary', 'tertiary', 'ghost' ].map( function( style ) {
                            return wpElement.createElement( 'button', { key: style, onClick: function() { updateSlide( currentSlideIndex, 'link', { class: style } ); }, style: { flex: 1, padding: '8px', border: '2px solid ' + ( slide.link.class === style ? '#007bff' : '#ccc' ), background: slide.link.class === style ? '#007bff' : '#fff', color: slide.link.class === style ? '#fff' : '#000', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' } }, style.charAt( 0 ).toUpperCase() + style.slice( 1 ) );
                        } )
                    )
                ),

                wpElement.createElement( 'div', { key: 'duration-div', style: { marginBottom: '15px', paddingTop: '15px', borderTop: '1px solid #ccc' } },
                    wpElement.createElement( 'label', { style: { fontWeight: 'bold', display: 'block', marginBottom: '5px' } }, 'Duration (seconds)' ),
                    wpElement.createElement( 'input', { type: 'number', value: autoplaySpeed, onInput: function( e ) { setAttributes( { autoplaySpeed: parseInt( e.target.value ) || 4 } ); }, min: 1, max: 60, style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' } } )
                )
            ];

            var rightPanel = wpElement.createElement( wpBlocksEditor.InspectorControls, null,
                wpElement.createElement( wpComponents.PanelBody, { title: 'Slide Selection', initialOpen: true }, selectors ),
                wpElement.createElement( wpComponents.PanelBody, { title: 'Slide Settings', initialOpen: true }, settingsContent )
            );

            return wpElement.createElement( wpElement.Fragment, null, rightPanel, preview );
        },

        save: function() {
            return null;
        }
    } );
}

// Frontend
document.addEventListener( 'DOMContentLoaded', function() {
    document.querySelectorAll( '.bnpp-carousel-wrapper' ).forEach( function( wrapper ) {
        var carousel = wrapper.querySelector( '.bnpp-carousel' );
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
