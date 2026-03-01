( function ( wp ) {

    const { registerBlockType } = wp.blocks;
    const { 
        RichText, 
        MediaUpload, 
        InspectorControls 
    } = wp.blockEditor;
    const { 
        PanelBody, 
        TextControl, 
        Button 
    } = wp.components;
    const { Fragment, useState } = wp.element;

    registerBlockType( 'bnpp/carousel-homepage', {

        title: 'Carousel Homepage',
        icon: 'slides',
        category: 'media',

        // ✅ ATTRIBUTES CORRECTEMENT DÉCLARÉS
        attributes: {
            slides: {
                type: 'array',
                default: [
                    {
                        title: 'Slide 1',
                        description: 'Description 1',
                        background: '',
                        link: {
                            text: 'Learn more',
                            url: '#',
                            class: 'primary'
                        }
                    },
                    {
                        title: 'Slide 2',
                        description: 'Description 2',
                        background: '',
                        link: {
                            text: 'Learn more',
                            url: '#',
                            class: 'primary'
                        }
                    },
                    {
                        title: 'Slide 3',
                        description: 'Description 3',
                        background: '',
                        link: {
                            text: 'Learn more',
                            url: '#',
                            class: 'primary'
                        }
                    }
                ]
            },
            autoplaySpeed: {
                type: 'number',
                default: 4
            }
        },

        edit: ( props ) => {

            const { attributes, setAttributes } = props;
            const { slides, autoplaySpeed } = attributes;

            // ✅ État interne (non sauvegardé)
            const [ currentSlideIndex, setCurrentSlideIndex ] = useState(0);

            const updateSlide = ( index, field, value ) => {
                const newSlides = [ ...slides ];
                newSlides[index][field] = value;
                setAttributes({ slides: newSlides });
            };

            const updateLink = ( index, field, value ) => {
                const newSlides = [ ...slides ];
                newSlides[index].link[field] = value;
                setAttributes({ slides: newSlides });
            };

            return (
                <Fragment>

                    <InspectorControls>
                        <PanelBody title="Carousel Settings">
                            <TextControl
                                label="Autoplay speed (seconds)"
                                type="number"
                                value={ autoplaySpeed }
                                onChange={ ( value ) => 
                                    setAttributes({ autoplaySpeed: parseInt(value) }) 
                                }
                            />
                        </PanelBody>
                    </InspectorControls>

                    <div className="bnpp-carousel-editor">

                        <div className="carousel-tabs">
                            { slides.map(( slide, index ) => (
                                <Button
                                    key={ index }
                                    isPrimary={ index === currentSlideIndex }
                                    onClick={ () => setCurrentSlideIndex(index) }
                                >
                                    Slide { index + 1 }
                                </Button>
                            ))}
                        </div>

                        <div className="carousel-slide-editor">

                            <RichText
                                tagName="h2"
                                value={ slides[currentSlideIndex].title }
                                onChange={ ( value ) => 
                                    updateSlide(currentSlideIndex, 'title', value)
                                }
                                placeholder="Slide title"
                            />

                            <RichText
                                tagName="p"
                                value={ slides[currentSlideIndex].description }
                                onChange={ ( value ) => 
                                    updateSlide(currentSlideIndex, 'description', value)
                                }
                                placeholder="Slide description"
                            />

                            <MediaUpload
                                onSelect={ ( media ) => 
                                    updateSlide(currentSlideIndex, 'background', media.url)
                                }
                                allowedTypes={ ['image'] }
                                render={ ( { open } ) => (
                                    <Button onClick={ open } isSecondary>
                                        { slides[currentSlideIndex].background 
                                            ? 'Change Background' 
                                            : 'Select Background' }
                                    </Button>
                                )}
                            />

                            { slides[currentSlideIndex].background && (
                                <img
                                    src={ slides[currentSlideIndex].background }
                                    style={{ 
                                        width: '100%', 
                                        marginTop: '10px' 
                                    }}
                                    alt=""
                                />
                            )}

                            <TextControl
                                label="Button Text"
                                value={ slides[currentSlideIndex].link.text }
                                onChange={ ( value ) => 
                                    updateLink(currentSlideIndex, 'text', value)
                                }
                            />

                            <TextControl
                                label="Button URL"
                                value={ slides[currentSlideIndex].link.url }
                                onChange={ ( value ) => 
                                    updateLink(currentSlideIndex, 'url', value)
                                }
                            />

                        </div>

                    </div>

                </Fragment>
            );
        },

        // ✅ Bloc dynamique
        save: () => null

    });

} )( window.wp );