/**
 * BNPP Carousel Homepage Block
 * Scripts pour l'éditeur Gutenberg et le frontend
 */

const { registerBlockType } = wp.blocks;
const { RichText, InspectorControls } = wp.blockEditor;
const { PanelBody, Button, TextControl, TextareaControl, NumberControl } = wp.components;
const { Fragment } = wp.element;

/**
 * Enregistrement du bloc Gutenberg
 */
registerBlockType( 'bnpp/carousel-homepage', {
    title: 'BNPP Carousel Homepage',
    icon: 'slides',
    category: 'media',
    description: 'Un carousel accessible avec édition avancée des slides',
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
                title: 'Nouveau slide',
                description: 'Description du slide',
                link: { text: 'En savoir plus', url: '#', class: 'primary' }
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
                    <PanelBody title="Paramètres du carousel" initialOpen={ true }>
                        <NumberControl
                            label="Durée entre chaque slide (secondes)"
                            value={ autoplaySpeed }
                            onChange={ ( value ) => setAttributes( { autoplaySpeed: value } ) }
                            min={ 1 }
                            max={ 60 }
                        />
                    </PanelBody>
                </InspectorControls>

                <div className="bnpp-carousel-editor">
                    <h2 style={ { marginBottom: '20px' } }>Slides du Carousel</h2>

                    { slides.map( ( slide, index ) => (
                        <div key={ index } className="bnpp-carousel-editor-slide">
                            <div className="bnpp-carousel-editor-slide-header">
                                <h3>Slide { index + 1 }</h3>
                                { slides.length > 1 && (
                                    <button
                                        onClick={ () => deleteSlide( index ) }
                                        className="bnpp-style-btn delete"
                                        title="Supprimer ce slide"
                                    >
                                        Supprimer
                                    </button>
                                ) }
                            </div>

                            <div className="bnpp-carousel-editor-controls">
                                {/* Titre */}
                                <div>
                                    <label htmlFor={ `slide-title-${ index }` }>Titre</label>
                                    <input
                                        id={ `slide-title-${ index }` }
                                        type="text"
                                        value={ slide.title || '' }
                                        onChange={ ( e ) => updateSlide( index, 'title', e.target.value ) }
                                        placeholder="Titre du slide"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label htmlFor={ `slide-desc-${ index }` }>Description</label>
                                    <textarea
                                        id={ `slide-desc-${ index }` }
                                        value={ slide.description || '' }
                                        onChange={ ( e ) => updateSlide( index, 'description', e.target.value ) }
                                        placeholder="Description du slide"
                                    />
                                </div>

                                {/* Éditeur de lien */}
                                <div className="bnpp-link-editor">
                                    <h4>Lien et bouton</h4>

                                    {/* Texte du lien */}
                                    <div>
                                        <label htmlFor={ `link-text-${ index }` }>Texte du lien</label>
                                        <input
                                            id={ `link-text-${ index }` }
                                            type="text"
                                            value={ slide.link?.text || '' }
                                            onChange={ ( e ) => updateSlide( index, 'link', { text: e.target.value } ) }
                                            placeholder="Texte du bouton"
                                        />
                                    </div>

                                    {/* URL du lien */}
                                    <div style={ { marginTop: '10px' } }>
                                        <label htmlFor={ `link-url-${ index }` }>URL</label>
                                        <input
                                            id={ `link-url-${ index }` }
                                            type="url"
                                            value={ slide.link?.url || '' }
                                            onChange={ ( e ) => updateSlide( index, 'link', { url: e.target.value } ) }
                                            placeholder="https://exemple.com"
                                        />
                                    </div>

                                    {/* Sélection du style */}
                                    <div style={ { marginTop: '10px' } }>
                                        <label>Style du bouton</label>
                                        <div className="bnpp-style-buttons">
                                            { [ 'primary', 'secondary', 'tertiary', 'ghost' ].map( ( buttonClass ) => (
                                                <button
                                                    key={ buttonClass }
                                                    className={ `bnpp-style-btn ${ slide.link?.class === buttonClass ? 'active' : '' }` }
                                                    onClick={ () => updateLinkClass( index, buttonClass ) }
                                                    title={ `Style ${ buttonClass }` }
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

                    {/* Bouton ajouter un slide */}
                    <button onClick={ addSlide } className="bnpp-add-slide-btn">
                        + Ajouter un slide
                    </button>
                </div>
            </Fragment>
        );
    },

    save: function() {
        return null; // Le rendu est géré côté serveur
    }
} );

/**
 * JavaScript du frontend
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
                console.error( 'Erreur parsing config:', e );
            }
        }

        let currentSlide = 0;
        let isPlaying = true;
        let autoplayInterval;

        /**
         * Affiche un slide spécifique
         */
        const showSlide = ( index ) => {
            // Masquer tous les slides
            slides.forEach( ( slide, i ) => {
                if ( i === index ) {
                    slide.classList.add( 'active' );
                } else {
                    slide.classList.remove( 'active' );
                }
            } );

            // Mettre à jour les boutons de navigation
            navButtons.forEach( ( btn, i ) => {
                btn.setAttribute( 'aria-selected', i === index ? 'true' : 'false' );
            } );

            // Mettre à jour le statut pour les lecteurs d'écran
            if ( statusDiv ) {
                statusDiv.textContent = `Slide ${ index + 1 } sur ${ slides.length }`;
            }

            currentSlide = index;
        };

        /**
         * Slide suivant
         */
        const nextSlide = () => {
            currentSlide = ( currentSlide + 1 ) % slides.length;
            showSlide( currentSlide );
        };

        /**
         * Slide précédent
         */
        const prevSlide = () => {
            currentSlide = ( currentSlide - 1 + slides.length ) % slides.length;
            showSlide( currentSlide );
        };

        /**
         * Lance l'autoplay
         */
        const startAutoplay = () => {
            if ( autoplayInterval ) {
                clearInterval( autoplayInterval );
            }
            autoplayInterval = setInterval( nextSlide, config.autoplaySpeed );
            isPlaying = true;
        };

        /**
         * Arrête l'autoplay
         */
        const stopAutoplay = () => {
            if ( autoplayInterval ) {
                clearInterval( autoplayInterval );
            }
            isPlaying = false;
        };

        // Initialisation
        showSlide( 0 );
        startAutoplay();

        // Navigation par boutons
        navButtons.forEach( ( btn, index ) => {
            btn.addEventListener( 'click', () => {
                showSlide( index );
            } );
        } );

        // Bouton pause/play
        if ( pauseBtn ) {
            pauseBtn.addEventListener( 'click', () => {
                if ( isPlaying ) {
                    stopAutoplay();
                    pauseBtn.setAttribute( 'aria-pressed', 'true' );
                    pauseBtn.textContent = 'Lecture';
                } else {
                    startAutoplay();
                    pauseBtn.setAttribute( 'aria-pressed', 'false' );
                    pauseBtn.textContent = 'Pause';
                }
            } );
        }

        // Navigation au clavier
        document.addEventListener( 'keydown', ( e ) => {
            if ( e.key === 'ArrowRight' ) {
                nextSlide();
            }
            if ( e.key === 'ArrowLeft' ) {
                prevSlide();
            }
        } );

        // Pause au hover (si souhaité)
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
