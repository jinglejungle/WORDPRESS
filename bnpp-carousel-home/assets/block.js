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
                    { title: 'Slide 1', background: '', link: { text: 'Learn more', url: '#', class: 'primary' } },
                    { title: 'Slide 2', background: '', link: { text: 'Learn more', url: '#', class: 'primary' } },
                    { title: 'Slide 3', background: '', link: { text: 'Learn more', url: '#', class: 'primary' } }
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

            // Track truncation message state
            if ( ! window.bnppTruncationState ) {
                window.bnppTruncationState = {};
            }
            var truncationKey = 'slide_' + currentSlideIndex;
            var showTruncationMsg = window.bnppTruncationState[ truncationKey ] || false;

            if ( ! slides || ! slides.length ) {
                setAttributes( {
                    slides: [
                        { title: 'Slide 1', background: '', link: { text: 'Learn more', url: '#', class: 'primary' } },
                        { title: 'Slide 2', background: '', link: { text: 'Learn more', url: '#', class: 'primary' } },
                        { title: 'Slide 3', background: '', link: { text: 'Learn more', url: '#', class: 'primary' } }
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

            // Title validation helpers
            var hasAsianChars = function( text ) {
                return /[\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/.test( text );
            };

            var getCharLimit = function( text ) {
                return hasAsianChars( text ) ? 50 : 70;
            };

            var getDisplayLength = function( text ) {
                return text.length;
            };

            var currentCharCount = getDisplayLength( slide.title );
            var currentLimit = getCharLimit( slide.title );
            var isAtLimit = currentCharCount >= currentLimit;

            var handleTitleChange = function( newValue ) {
                var limit = getCharLimit( newValue );
                if ( newValue.length > limit ) {
                    newValue = newValue.substring( 0, limit );
                }
                updateSlide( currentSlideIndex, 'title', newValue );
            };

            var handleTitlePaste = function( e ) {
                var pastedText = ( e.clipboardData || window.clipboardData ).getData( 'text' );
                var limit = getCharLimit( pastedText );
                if ( pastedText.length > limit ) {
                    e.preventDefault();
                    var truncated = pastedText.substring( 0, limit );
                    updateSlide( currentSlideIndex, 'title', truncated );
                    
                    // Show truncation message
                    window.bnppTruncationState[ truncationKey ] = true;
                    // Force re-render by triggering an update
                    setAttributes( { currentSlideIndex: currentSlideIndex } );
                    
                    // Hide message after 3 seconds
                    setTimeout( function() {
                        window.bnppTruncationState[ truncationKey ] = false;
                        setAttributes( { currentSlideIndex: currentSlideIndex } );
                    }, 3000 );
                }
            };

            // Settings content
            var settingsContent = [];

            settingsContent.push( el( 'div', { key: 'title', style: { marginBottom: '15px' } },
                el( 'label', { style: { fontWeight: 'bold', display: 'block', marginBottom: '5px' } }, 'Title' ),
                el( 'textarea', {
                    value: slide.title,
                    onInput: function( e ) { handleTitleChange( e.target.value ); },
                    onPaste: handleTitlePaste,
                    style: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' },
                    maxLength: 70
                } ),
                el( 'div', { style: { marginTop: '5px', fontSize: '12px', color: '#666' } },
                    el( 'span', null, currentCharCount + ' / ' + currentLimit + ' characters' ),
                    isAtLimit ? el( 'span', { style: { marginLeft: '10px', color: '#f87171' } }, '(max reached)' ) : null
                ),
                showTruncationMsg ? el( 'div', { style: { marginTop: '5px', fontSize: '12px', color: '#f97316', fontWeight: 'bold' } }, 'Text was truncated to fit the character limit.' ) : null
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
                el( 'div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
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
                        color: '#fff',
                        opacity: i === currentSlideIndex ? '1' : '0.75',
                        cursor: 'pointer',
                        background: 'transparent',
                        fontFamily: '"BNPP Sans Condensed"',
                        fontSize: '40px',
                        fontWeight: '400',
                        lineHeight: '45px',
                        height: '90px',
                        width: '393px',
                        paddingLeft: '22px',
                        textAlign: 'left',
                        border: '0px solid transparent',
                        borderLeft: i === currentSlideIndex ? '2px solid #ffffff' : '2px solid #C8CED1',
                        transition: 'all 0.3s ease'
                    },
                    'aria-selected': i === currentSlideIndex ? 'true' : 'false'
                }, s.title );
            } );

            var preview = el( 'div', {
                style: { position: 'relative', width: '100%', height: '75vh', minHeight: '648px', background: '#000', overflow: 'hidden', borderRadius: '4px', marginBottom: '20px' }
            },
                el( 'div', {
                    style: {
                        width: '100%',
                        height: '100%',
                        backgroundImage: slide.background ? 'linear-gradient(270deg, rgba(12, 39, 40, 0.03) 38.74%, rgba(12, 39, 40, 0.70) 57.43%), url(' + slide.background + ')' : 'linear-gradient(270deg, rgba(12, 39, 40, 0.03) 38.74%, rgba(12, 39, 40, 0.70) 57.43%)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                        position: 'relative'
                    }
                },
                    el( 'div', { 
                        className: 'bnpp-overlay dark',
                        style: { 
                            background: 'transparent',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start'
                        } 
                    },
                        el( 'div', {
                            style: {
                                position: 'relative',
                                margin: '15px 0',
                                width: '689px',
                                fontFamily: '"BNPP Sans Condensed"',
                                fontSize: '100px',
                                fontStyle: 'normal',
                                fontWeight: '400',
                                lineHeight: '95px',
                                minHeight: '95px'
                            }
                        },
                            el( 'p', {
                                style: {
                                    position: 'relative',
                                    margin: '0',
                                    padding: '0',
                                    lineHeight: '1.2',
                                    width: '689px',
                                    fontFamily: '"BNPP Sans Condensed"',
                                    fontSize: '100px',
                                    fontStyle: 'normal',
                                    fontWeight: '400',
                                    color: '#fff',
                                    whiteSpace: 'normal',
                                    wordWrap: 'break-word',
                                    overflow: 'hidden'
                                }
                            }, slide.title ),
                            el( 'input', {
                                type: 'text',
                                value: slide.title,
                                onInput: function( e ) { handleTitleChange( e.target.value ); },
                                onPaste: handleTitlePaste,
                                style: {
                                    position: 'absolute',
                                    top: '0',
                                    left: '0',
                                    width: '689px',
                                    height: '100%',
                                    fontSize: '100px',
                                    fontWeight: '400',
                                    fontFamily: '"BNPP Sans Condensed"',
                                    background: 'transparent',
                                    color: '#fff',
                                    border: 'none',
                                    outline: 'none',
                                    padding: '0',
                                    margin: '0',
                                    zIndex: '10',
                                    lineHeight: '95px'
                                },
                                maxLength: 70
                            } )
                        ),
                        el( 'a', { href: slide.link.url, className: 'bnpp-button ' + slide.link.class }, slide.link.text )
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

        // Init - show first slide and start
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
            pauseBtn.addEventListener( 'click', function( e ) { 
                e.preventDefault();
                if ( isPlaying ) {
                    stopAutoplay();
                } else {
                    startAutoplay();
                }
            } );
        }

        // Hover - pause on enter
        carousel.addEventListener( 'mouseenter', function() { 
            stopAutoplay();
        } );

        // Hover - resume on leave only if it was playing before
        carousel.addEventListener( 'mouseleave', function() { 
            startAutoplay();
        } );
    } );
} );
