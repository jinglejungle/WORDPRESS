/**
 * Campaign Block – Editor Script
 *
 * Registers the block using the @wordpress/blocks API with plain JavaScript
 * (wp.element.createElement) – no JSX / React build step required.
 *
 * Structure
 * ─────────
 * • registerBlockType  – declares attributes + edit UI + save (dynamic block)
 * • edit()             – Inspector controls rendered in the right-hand panel
 * • save()             – returns null because rendering is handled server-side
 *
 * Character-limit rules
 * ─────────────────────
 * • Title       : 55 chars for Latin / non-Asian scripts; 25 for Asian scripts.
 * • Description : 195 chars always.
 *
 * Asian script detection uses Unicode ranges for:
 *   CJK Unified Ideographs, Hiragana, Katakana, Hangul, CJK Compatibility.
 *
 */

( function () {
	'use strict';

	/* ------------------------------------------------------------------ */
	/*  Destructure WordPress globals                                       */
	/* ------------------------------------------------------------------ */
	var registerBlockType = wp.blocks.registerBlockType;
	var el                = wp.element.createElement;
	var Fragment          = wp.element.Fragment;
	var __                = wp.i18n.__;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var MediaUpload       = wp.blockEditor.MediaUpload;
	var MediaUploadCheck  = wp.blockEditor.MediaUploadCheck;
	var PanelBody         = wp.components.PanelBody;
	var TextControl       = wp.components.TextControl;
	var TextareaControl   = wp.components.TextareaControl;
	var RadioControl      = wp.components.RadioControl;
	var Button            = wp.components.Button;
	var Notice            = wp.components.Notice;

	/* ------------------------------------------------------------------ */
	/*  Constants                                                           */
	/* ------------------------------------------------------------------ */
	var TITLE_MAX_LATIN = 55;   // Maximum characters for non-Asian scripts.
	var TITLE_MAX_ASIAN = 25;   // Maximum characters for Asian scripts.
	var DESC_MAX        = 195;  // Maximum characters for the description.

	/**
	 * Detect whether a string contains Asian characters.
	 *
	 * Covers CJK Unified Ideographs, CJK Extension A, Hiragana,
	 * Katakana, Hangul Syllables and CJK Compatibility Ideographs.
	 *
	 * @param  {string}  text - The string to inspect.
	 * @return {boolean}      - True if Asian characters are detected.
	 */
	function containsAsianCharacters( text ) {
		/* eslint-disable no-misleading-character-class */
		return /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF]/.test( text );
		/* eslint-enable no-misleading-character-class */
	}

	/**
	 * Return the applicable title character limit for the current value.
	 *
	 * @param  {string} value - Current title string.
	 * @return {number}       - 25 if Asian chars detected, 55 otherwise.
	 */
	function getTitleMax( value ) {
		return containsAsianCharacters( value ) ? TITLE_MAX_ASIAN : TITLE_MAX_LATIN;
	}

	/* ------------------------------------------------------------------ */
	/*  Block registration                                                  */
	/* ------------------------------------------------------------------ */
	registerBlockType( 'campaign-block/campaign', {

		/* ---- Metadata ---- */
		title:       __( 'Campaign Block', 'campaign-block' ),
		description: __( 'Display a campaign with a title, description and an image.', 'campaign-block' ),
		category:    'media',
		icon:        'megaphone',
		supports: {
			html:              false,
			reusable:          true,
			anchor:            false,
			align:             false,
			customClassName:   false,
		},

		/* ---- Attributes (must mirror src/init.php) ---- */
		attributes: {
			title: {
				type:    'string',
				default: '',
			},
			description: {
				type:    'string',
				default: '',
			},
			imageId: {
				type:    'integer',
				default: 0,
			},
			imageUrl: {
				type:    'string',
				default: '',
			},
			imageAlt: {
				type:    'string',
				default: '',
			},
			imageAlignment: {
				type:    'string',
				default: 'left',
			},
		},

		/* ---------------------------------------------------------------- */
		/*  edit() – rendered inside the block editor                        */
		/* ---------------------------------------------------------------- */
		edit: function ( props ) {
			var attributes = props.attributes;
			var setAttributes = props.setAttributes;

			var title          = attributes.title;
			var description    = attributes.description;
			var imageUrl       = attributes.imageUrl;
			var imageAlt       = attributes.imageAlt;
			var imageAlignment = attributes.imageAlignment;

			/* Compute live character limits for the current title value. */
			var titleMax     = getTitleMax( title );
			var titleLen     = title.length;
			var titleAtLimit = titleLen >= titleMax;

			var descLen     = description.length;
			var descAtLimit = descLen >= DESC_MAX;

			/* ---- Title change handler ---- */
			function onTitleChange( newValue ) {
				var max = getTitleMax( newValue );
				// Block further input once the limit is reached.
				if ( newValue.length <= max ) {
					setAttributes( { title: newValue } );
				}
			}

			/* ---- Description change handler ---- */
			function onDescriptionChange( newValue ) {
				if ( newValue.length <= DESC_MAX ) {
					setAttributes( { description: newValue } );
				}
			}

			/* ---- Media select handler ---- */
			function onSelectImage( media ) {
				setAttributes( {
					imageId:  media.id,
					imageUrl: media.url,
					imageAlt: media.alt || '',
				} );
			}

			/* ---- Image remove handler ---- */
			function onRemoveImage() {
				setAttributes( {
					imageId:  0,
					imageUrl: '',
					imageAlt: '',
				} );
			}

			/* ---- Preview inside the editor canvas ---- */
			var containerClass = 'campaign-container campaign-image-' + imageAlignment + ' campaign-editor-preview';

			var editorPreview = el(
				'div',
				{
					id:        'campaign_container',
					className: containerClass,
					role:      'region',
					'aria-label': __( 'Campaign preview', 'campaign-block' ),
				},
				/* Image wrapper */
				imageUrl ? el(
					'div',
					{ className: 'campaign-image-wrapper' },
					el( 'img', {
						src:     imageUrl,
						alt:     imageAlt,
						className: 'campaign-image',
						width:   700,
						height:  500,
					} )
				) : el(
					/* Placeholder when no image is selected */
					'div',
					{ className: 'campaign-image-placeholder', 'aria-hidden': 'true' },
					el( 'span', {}, __( 'No image selected', 'campaign-block' ) )
				),
				/* Description box */
				el(
					'div',
					{ id: 'boxDescription', className: 'campaign-box-description' },
					title       ? el( 'h2', { className: 'campaign-title' }, title )             : null,
					description ? el( 'p',  { className: 'campaign-description' }, description ) : null
				)
			);

			/* ---- Inspector (right-hand panel) controls ---- */
			var inspectorControls = el(
				InspectorControls,
				{},

				/* Panel: Content */
				el(
					PanelBody,
					{
						title:       __( 'Content', 'campaign-block' ),
						initialOpen: true,
					},

					/* ---- Title field ---- */
					el( TextControl, {
						label:    __( 'Title', 'campaign-block' ),
						value:    title,
						onChange: onTitleChange,
						help:     null, // help rendered separately below
					} ),
					/* Character counter / warning for title */
					el(
						'p',
						{
							className: 'campaign-char-count' + ( titleAtLimit ? ' campaign-char-count--limit' : '' ),
							role:      titleAtLimit ? 'alert' : undefined,
							'aria-live': 'polite',
						},
						titleAtLimit
							? __( 'Maximum number of characters reached.', 'campaign-block' )
							: ( titleLen + ' / ' + titleMax + ' ' + __( 'characters', 'campaign-block' ) )
					),

					/* ---- Description field ---- */
					el( TextareaControl, {
						label:    __( 'Description', 'campaign-block' ),
						value:    description,
						onChange: onDescriptionChange,
						rows:     4,
					} ),
					/* Character counter / warning for description */
					el(
						'p',
						{
							className: 'campaign-char-count' + ( descAtLimit ? ' campaign-char-count--limit' : '' ),
							role:      descAtLimit ? 'alert' : undefined,
							'aria-live': 'polite',
						},
						descAtLimit
							? __( 'Maximum number of characters reached.', 'campaign-block' )
							: ( descLen + ' / ' + DESC_MAX + ' ' + __( 'characters', 'campaign-block' ) )
					)
				),

				/* Panel: Image */
				el(
					PanelBody,
					{
						title:       __( 'Image', 'campaign-block' ),
						initialOpen: true,
					},

					/* Media upload / replace / remove controls */
					el(
						MediaUploadCheck,
						{},
						el( MediaUpload, {
							onSelect:    onSelectImage,
							allowedTypes: [ 'image' ],
							value:       attributes.imageId,
							render: function ( obj ) {
								return el(
									Fragment,
									{},
									/* Open media library button */
									el(
										Button,
										{
											onClick:   obj.open,
											variant:   'secondary',
											className: 'campaign-media-button',
										},
										imageUrl
											? __( 'Replace image', 'campaign-block' )
											: __( 'Select / upload image', 'campaign-block' )
									),
									/* Preview thumbnail */
									imageUrl ? el(
										'div',
										{ className: 'campaign-image-thumb-wrapper' },
										el( 'img', {
											src:       imageUrl,
											alt:       imageAlt,
											className: 'campaign-image-thumb',
										} ),
										/* Remove button */
										el(
											Button,
											{
												onClick:   onRemoveImage,
												variant:   'link',
												isDestructive: true,
												className: 'campaign-remove-image',
											},
											__( 'Remove image', 'campaign-block' )
										)
									) : null
								);
							},
						} )
					),

					/* Alt text field – only shown when an image is selected */
					imageUrl ? el( TextControl, {
						label:    __( 'Image alt text', 'campaign-block' ),
						value:    imageAlt,
						onChange: function ( val ) {
							setAttributes( { imageAlt: val } );
						},
						help:     __( 'Describe the image for screen readers and SEO.', 'campaign-block' ),
					} ) : null,

					/* ---- Image alignment ---- */
					el( RadioControl, {
						label:    __( 'Image position', 'campaign-block' ),
						selected: imageAlignment,
						options: [
							{ label: __( 'Left', 'campaign-block' ),  value: 'left'  },
							{ label: __( 'Right', 'campaign-block' ), value: 'right' },
						],
						onChange: function ( val ) {
							setAttributes( { imageAlignment: val } );
						},
					} )
				)
			);

			/* Return the combined output: Inspector + editor canvas preview */
			return el(
				Fragment,
				{},
				inspectorControls,
				editorPreview
			);
		},

		/* ---------------------------------------------------------------- */
		/*  save() – null because the block uses a server-side render        */
		/* ---------------------------------------------------------------- */
		save: function () {
			return null;
		},
	} );

}() );
