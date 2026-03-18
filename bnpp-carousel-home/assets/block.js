var wpBlocks = window.wp && window.wp.blocks;
var wpBlocksEditor = window.wp && window.wp.blockEditor;
var wpComponents = window.wp && window.wp.components;
var wpElement = window.wp && window.wp.element;

if ( wpBlocks && wpBlocksEditor && wpElement ) {
    var el = wpElement.createElement;
    var Fragment = wpElement.Fragment;

    wpBlocks.registerBlockType( 'bnpp/carousel-homepage', {
        title: 'Carousel Homepage',
        icon: 'slides',
        category: 'media',
        
        attributes: {
            slides: {
                type: 'array',
                default: [
                    { title: 'Slide 1', description: 'Description 1', background: '', link: { text: 'Learn more', url: '#', class: 'primary' } },
                    { title: 'Slide 2', description: 'Description 2', background: '', link: { text: 'Learn more', url: '#', class: 'primary' } },
                    { title: 'Slide 3', description: 'Description 3', background: '', link: { text: 'Learn more', url: '#', class: 'primary' } }
                ]
            },
            autoplaySpeed: {
                type: 'number',
                default: 4
            },
            currentSlideIndex: {
                type: 'number',
                default: 0
            }
        },
        
        edit: function( props ) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var slides = attributes.slides;
            var autoplaySpeed = attributes.autoplaySpeed;
            var currentSlideIndex = attributes.currentSlideIndex;

            if ( ! slides || ! slides.length ) {
                setAttributes( {
                    slides: [
                        { title: 'Slide 1', description: 'Description 1', background: '', link: { text: 'Learn more', url: '#', class: 'primary' } },
                        { title: 'Slide 2', description: 'Description 2', background: '', link: { text: 'Learn more', url: '#', class: 'primary' } },
                        { title: 'Slide 3', description: 'Description 3', background: '', link: { text: 'Learn more', url: '#', class: 'primary' } }
                    ]
                } );
                return 'Loading...';
            }

            var updateSlide = function( idx, key, value ) {
                var newSlides = JSON.parse( JSON.stringify( slides ) );
                if ( key === 'link' ) {
                    newSlides[ idx ].link = Object.assign( {}, newSlides[ idx ].link, value );
                } else {
                    newSlides[ idx ][ key ] = value;
                }
                setAttributes( { slides: newSlides } );
            };

            var slide = slides[ currentSlideIndex ];

            // Slide selector buttons
            var slideSelectorButtons = slides.map( function( s, i ) {
                return el( 'button', {
                    key: i,
                    onClick: function() { setAttributes( { currentSlideIndex: i } ); },
                    style: {
                        flex: 1,
                        padding: '12px',
                        background: i === currentSlideIndex ? '#007bff' : '#f0f0f0',
                        color: i === currentSlideIndex ? '#fff' : '#000',
                        border: '2px solid ' + ( i === currentSlideIndex ? '#007bff' : '#ccc' ),
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }
                }, String( i + 1 ) );
            } );

            var slideSelectorPanel = el( wpComponents.PanelBody, { title: 'Slide Selection', initialOpen: true },
                el( 'div', { style: { display: 'flex', gap: '10px' } }, slideSelectorButtons )
            );

            // Settings content
            var settingsContent = [];

            settingsContent.push( el( 'div', { key: 'title', style: { marginBottom: '15px' } },
                el( 'label', { style: { fontWeight: 'bold', display: 'block', marginBottom: '5px' } }, 'Title' ),
                el( 'input', {
                    type: 'text',
                    value: slide.title,
                    onInput: function( e ) { updateSlide( currentSlideIndex, 'title', e.target.value ); },
                    style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }
                } )
            ) );

            settingsContent.push( el( 'div', { key: 'desc', style: { marginBottom: '15px' } },
                el( 'label', { style: { fontWeight: 'bold', display: 'block', marginBottom: '5px' } }, 'Description' ),
                el( 'textarea', {
                    value: slide.description,
                    onInput: function( e ) { updateSlide( currentSlideIndex, 'description', e.target.value ); },
                    style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '80px', boxSizing: 'border-box', fontFamily: 'inherit' }
                } )
            ) );

            settingsContent.push( el( 'div', { key: 'bg', style: { marginBottom: '15px' } },
                el( 'label', { style: { fontWeight: 'bold', display: 'block', marginBottom: '5px' } }, 'Background Image' ),
                el( wpBlocksEditor.MediaUpload, {
                    onSelect: function( media ) { updateSlide( currentSlideIndex, 'background', media.url ); },
                    allowedTypes: [ 'image' ],
                    render: function( obj ) {
                        return el( 'div', null,
                            el( 'button', {
                                onClick: obj.open,
                                style: { width: '100%', padding: '10px', background: '#f0f0f0', border: '2px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }
                            }, slide.background ? 'Change Image' : 'Select Image' ),
                            slide.background ? el( 'div', { style: { marginTop: '10px' } },
                                el( 'img', { src: slide.background, style: { maxWidth: '100%', height: 'auto', borderRadius: '4px' } } ),
                                el( 'button', {
                                    onClick: function() { updateSlide( currentSlideIndex, 'background', '' ); },
                                    style: { width: '100%', marginTop: '10px', padding: '8px', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }
                                }, 'Remove Image' )
                            ) : null
                        );
                    }
                } )
            ) );

            settingsContent.push( el( 'div', { key: 'btn-text', style: { marginBottom: '15px' } },
                el( 'label', { style: { fontWeight: 'bold', display: 'block', marginBottom: '5px' } }, 'Button Text' ),
                el( 'input', {
                    type: 'text',
                    value: slide.link.text,
                    onInput: function( e ) { updateSlide( currentSlideIndex, 'link', { text: e.target.value } ); },
                    style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }
                } )
            ) );

            settingsContent.push( el( 'div', { key: 'btn-url', style: { marginBottom: '15px' } },
                el( 'label', { style: { fontWeight: 'bold', display: 'block', marginBottom: '5px' } }, 'Button URL' ),
                el( 'input', {
                    type: 'url',
                    value: slide.link.url,
                    onInput: function( e ) { updateSlide( currentSlideIndex, 'link', { url: e.target.value } ); },
                    style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }
                } )
            ) );

            settingsContent.push( el( 'div', { key: 'btn-style', style: { marginBottom: '15px' } },
                el( 'label', { style: { fontWeight: 'bold', display: 'block', marginBottom: '10px' } }, 'Button Style' ),
                el( 'div', { style: { display: 'flex', gap: '8px' } },
                    [ 'primary', 'secondary', 'tertiary', 'ghost' ].map( function( style ) {
                        return el( 'button', {
                            key: style,
                            onClick: function() { updateSlide( currentSlideIndex, 'link', { class: style } ); },
                            style: {
                                flex: 1,
                                padding: '8px',
                                border: '2px solid ' + ( slide.link.class === style ? '#007bff' : '#ccc' ),
                                background: slide.link.class === style ? '#007bff' : '#fff',
                                color: slide.link.class === style ? '#fff' : '#000',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }
                        }, style.charAt( 0 ).toUpperCase() + style.slice( 1 ) );
                    } )
                )
            ) );

            settingsContent.push( el( 'div', { key: 'duration', style: { marginBottom: '15px', paddingTop: '15px', borderTop: '1px solid #ccc' } },
                el( 'label', { style: { fontWeight: 'bold', display: 'block', marginBottom: '5px' } }, 'Duration (seconds)' ),
                el( 'input', {
                    type: 'number',
                    value: autoplaySpeed,
                    onInput: function( e ) { setAttributes( { autoplaySpeed: parseInt( e.target.value ) || 4 } ); },
                    min: 1,
                    max: 60,
                    style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }
                } )
            ) );

            var settingsPanel = el( wpComponents.PanelBody, { title: 'Slide Settings', initialOpen: true }, settingsContent );

            var rightPanel = el( wpBlocksEditor.InspectorControls, null, slideSelectorPanel, settingsPanel );

            // Preview
            var previewNavButtons = slides.map( function( s, i ) {
                return el( 'button', {
                    key: i,
                    onClick: function() { setAttributes( { currentSlideIndex: i } ); },
                    style: {
                        background: i === currentSlideIndex ? '#fff' : 'rgba(0,0,0,0.5)',
                        color: i === currentSlideIndex ? '#000' : '#fff',
                        border: '2px solid #fff',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.85em'
                    }
                }, s.title );
            } );

            var preview = el( 'div', {
                style: { position: 'relative', width: '100%', height: '400px', background: '#000', overflow: 'hidden', borderRadius: '4px', marginBottom: '20px' }
            },
                el( 'div', {
                    style: {
                        width: '100%',
                        height: '100%',
                        backgroundImage: slide.background ? 'url(' + slide.background + ')' : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }
                },
                    el( 'div', { style: { backgroundColor: 'rgba(0,0,0,0.65)', color: '#fff', padding: '30px', textAlign: 'center', maxWidth: '600px', borderRadius: '8px' } },
                        el( 'p', { style: { margin: '15px 0' } }, slide.description ),
                        el( 'a', { href: slide.link.url, style: { display: 'inline-block', marginTop: '15px', padding: '12px 28px', backgroundColor: '#007bff', color: '#fff', borderRadius: '4px', fontWeight: 'bold', textDecoration: 'none' } }, slide.link.text )
                    )
                ),
                el( 'div', { style: { position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' } }, previewNavButtons )
            );

            return el( Fragment, null, rightPanel, preview );
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
        var autoplayInterval = null;

        var showSlide = function( idx ) {
            slides.forEach( function( s, i ) { s.classList.toggle( 'active', i === idx ); } );
            navButtons.forEach( function( b, i ) { b.setAttribute( 'aria-selected', i === idx ? 'true' : 'false' ); } );
            currentSlide = idx;
        };

        var next = function() { showSlide( ( currentSlide + 1 ) % slides.length ); };
        var prev = function() { showSlide( ( currentSlide - 1 + slides.length ) % slides.length ); };
        
        var startAutoplay = function() {
            if ( autoplayInterval ) clearInterval( autoplayInterval );
            autoplayInterval = setInterval( next, config.autoplaySpeed );
            isPlaying = true;
            if ( pauseBtn ) pauseBtn.textContent = 'Pause';
        };

        var stopAutoplay = function() {
            if ( autoplayInterval ) clearInterval( autoplayInterval );
            autoplayInterval = null;
            isPlaying = false;
            if ( pauseBtn ) pauseBtn.textContent = 'Play';
        };

        // Init
        showSlide( 0 );
        startAutoplay();

        // Navigation buttons
        navButtons.forEach( function( btn, idx ) { 
            btn.addEventListener( 'click', function() { 
                showSlide( idx );
                startAutoplay();
            } ); 
        } );

        // Pause/Play button
        if ( pauseBtn ) {
            pauseBtn.addEventListener( 'click', function() { 
                if ( isPlaying ) {
                    stopAutoplay();
                } else {
                    startAutoplay();
                }
            } );
        }

        // Keyboard
        document.addEventListener( 'keydown', function( e ) { 
            if ( e.key === 'ArrowRight' ) { next(); startAutoplay(); }
            if ( e.key === 'ArrowLeft' ) { prev(); startAutoplay(); }
        } );

        // Hover - pause on enter, resume on leave
        carousel.addEventListener( 'mouseenter', function() { 
            if ( isPlaying ) stopAutoplay(); 
        } );

        carousel.addEventListener( 'mouseleave', function() { 
            if ( ! isPlaying ) return;
            startAutoplay(); 
        } );
    } );
} );
