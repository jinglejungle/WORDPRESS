/**
 * Campaign Block – Gutenberg block (vanilla JS, no JSX/React build step).
 *
 * WP dependencies : wp-blocks, wp-block-editor, wp-components, wp-i18n, wp-element
 */
( function ( blocks, blockEditor, components, i18n, element ) {
    'use strict';

    var el            = element.createElement;
    var __            = i18n.__;
    var useState      = element.useState;
    var useEffect     = element.useEffect;

    var InspectorControls = blockEditor.InspectorControls;
    var MediaUpload       = blockEditor.MediaUpload;
    var MediaUploadCheck  = blockEditor.MediaUploadCheck;
    var useBlockProps     = blockEditor.useBlockProps;

    var PanelBody    = components.PanelBody;
    var TextControl  = components.TextControl;
    var TextareaControl = components.TextareaControl;
    var RadioControl = components.RadioControl;
    var Button       = components.Button;
    var Notice       = components.Notice;

    /* ── Character limits ────────────────────────────────────────────── */
    var TITLE_MAX_LATIN  = 55;
    var TITLE_MAX_ASIAN  = 25;
    var DESC_MAX         = 195;

    /* Detects if the text contains CJK (Asian) characters */
    function containsAsian( str ) {
        return /[\u3000-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF\u3400-\u4DBF]/.test( str );
    }

    function getTitleMax( str ) {
        return containsAsian( str ) ? TITLE_MAX_ASIAN : TITLE_MAX_LATIN;
    }

    /* ── Block registration ──────────────────────────────────────────── */
    blocks.registerBlockType( 'bnpp/campaign', {

        title:       __( 'Campaign Block', 'bnpp-campaign' ),
        description: __( 'Campaign block with positioned image and description.', 'bnpp-campaign' ),
        category:    'media',
        icon:        'megaphone',
        supports: {
            html: false,
        },

        attributes: {
            title:       { type: 'string',  default: '' },
            description: { type: 'string',  default: '' },
            imageUrl:    { type: 'string',  default: '' },
            imageId:     { type: 'integer', default: 0  },
            imageAlt:    { type: 'string',  default: '' },
            imageAlign:  { type: 'string',  default: 'left' },
        },

        /* ── EDIT ─────────────────────────────────────────────────────── */
        edit: function ( props ) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;

            var title       = attributes.title;
            var description = attributes.description;
            var imageUrl    = attributes.imageUrl;
            var imageId     = attributes.imageId;
            var imageAlt    = attributes.imageAlt;
            var imageAlign  = attributes.imageAlign;

            var titleMax    = getTitleMax( title );
            var titleOver   = title.length > titleMax;
            var descOver    = description.length > DESC_MAX;

            var blockProps = useBlockProps( {
                className: 'campaign_container image-align-' + imageAlign,
            } );

            var boxClass = imageAlign === 'left' ? 'boxDescription box-align-right' : 'boxDescription box-align-left';

            /* Sidebar panel (InspectorControls) */
            var inspector = el(
                InspectorControls,
                { key: 'inspector' },

                el( PanelBody, { title: __( 'Content', 'bnpp-campaign' ), initialOpen: true },

                    /* ── Title ── */
                    el( TextControl, {
                        label: __( 'Title', 'bnpp-campaign' ),
                        help:  titleOver
                            ? el( 'span', { className: 'bnpp-campaign__notice bnpp-campaign__notice--error' },
                                __( 'Character limit reached: ' + titleMax + ' characters max.', 'bnpp-campaign' )
                              )
                            : el( 'span', { className: 'bnpp-campaign__char-count' },
                                title.length + ' / ' + titleMax
                              ),
                        value:    title,
                        onChange: function ( val ) {
                            setAttributes( { title: val } );
                        },
                        className: titleOver ? 'bnpp-campaign__field--error' : '',
                    } ),

                    /* ── Description ── */
                    el( TextareaControl, {
                        label: __( 'Description', 'bnpp-campaign' ),
                        help:  descOver
                            ? el( 'span', { className: 'bnpp-campaign__notice bnpp-campaign__notice--error' },
                                __( 'Character limit reached: ' + DESC_MAX + ' characters max.', 'bnpp-campaign' )
                              )
                            : el( 'span', { className: 'bnpp-campaign__char-count' },
                                description.length + ' / ' + DESC_MAX
                              ),
                        value:    description,
                        rows:     4,
                        onChange: function ( val ) {
                            setAttributes( { description: val } );
                        },
                        className: descOver ? 'bnpp-campaign__field--error' : '',
                    } )
                ),

                el( PanelBody, { title: __( 'Image', 'bnpp-campaign' ), initialOpen: true },

                    /* ── Image upload ── */
                    el( MediaUploadCheck, null,
                        el( MediaUpload, {
                            onSelect: function ( media ) {
                                setAttributes( {
                                    imageUrl: media.url,
                                    imageId:  media.id,
                                    imageAlt: media.alt || '',
                                } );
                            },
                            allowedTypes: [ 'image' ],
                            value: imageId,
                            render: function ( ref ) {
                                var open = ref.open;
                                return el(
                                    'div',
                                    { className: 'bnpp-campaign__media-upload' },
                                    imageUrl
                                        ? el( 'div', { className: 'bnpp-campaign__image-preview' },
                                            el( 'img', {
                                                src:   imageUrl,
                                                alt:   imageAlt,
                                                style: { maxWidth: '100%', height: 'auto', display: 'block', marginBottom: '8px' },
                                            } ),
                                            el( Button, {
                                                onClick:    open,
                                                variant:    'secondary',
                                                isSmall:    true,
                                            }, __( 'Replace image', 'bnpp-campaign' ) ),
                                            el( Button, {
                                                onClick: function () {
                                                    setAttributes( { imageUrl: '', imageId: 0, imageAlt: '' } );
                                                },
                                                variant:     'link',
                                                isDestructive: true,
                                                isSmall:     true,
                                                style:       { marginLeft: '8px' },
                                            }, __( 'Remove', 'bnpp-campaign' ) )
                                          )
                                        : el( Button, {
                                              onClick:  open,
                                              variant:  'primary',
                                              isSmall:  true,
                                          }, __( 'Choose an image', 'bnpp-campaign' ) )
                                );
                            },
                        } )
                    ),

                    /* ── Image alignment ── */
                    el( RadioControl, {
                        label:    __( 'Image position', 'bnpp-campaign' ),
                        selected: imageAlign,
                        options: [
                            { label: __( 'Left', 'bnpp-campaign' ), value: 'left'  },
                            { label: __( 'Right', 'bnpp-campaign' ), value: 'right' },
                        ],
                        onChange: function ( val ) {
                            setAttributes( { imageAlign: val } );
                        },
                    } )
                )
            );

            /* Editor preview */
            var preview = el(
                'section',
                Object.assign( {}, blockProps, { key: 'preview' } ),

                imageUrl && el(
                    'div',
                    {
                        className:    'campaign_image-wrapper',
                        'aria-hidden': 'true',
                    },
                    el( 'img', {
                        src:     imageUrl,
                        alt:     imageAlt,
                        className: 'campaign_image',
                    } )
                ),

                el( 'div', { className: boxClass },
                    title && el( 'h2', { className: 'boxDescription__title' }, title ),
                    description && el( 'p',  { className: 'boxDescription__text' }, description )
                )
            );

            return [ inspector, preview ];
        },

        /* ── SAVE (PHP render via render_callback, returns null) ── */
        save: function () {
            return null;
        },
    } );

} (
    window.wp.blocks,
    window.wp.blockEditor,
    window.wp.components,
    window.wp.i18n,
    window.wp.element
) );
