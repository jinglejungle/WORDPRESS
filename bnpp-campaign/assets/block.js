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
 * Container layout
 * ────────────────
 * • width: 100% (fluid), max-width: 1130 px.
 * • Image (700 × 500 px) and boxDescription (590 × min 360 px) keep fixed sizes above 460 px.
 * • As the container narrows below 1130 px, boxDescription slides toward the left edge.
 * • Below 460 px: mobile layout – image full-width on top, description below.
 *
 * Character-limit rules
 * ─────────────────────
 * • Title       : 55 chars for Latin / non-Asian scripts; 25 for Asian scripts.
 * • Description : 195 chars always.
 *
 * Color palette
 * ─────────────
 * Six predefined background/text color pairs selectable from the right panel.
 * Stored as boxBgColor + boxTextColor attributes and applied inline on the
 * description box (overriding the CSS default green).
 *
 * Image click behaviour
 * ─────────────────────
 * Clicking the image in the editor canvas scrolls the right panel to the
 * "Image" PanelBody and opens it if it was collapsed.
 *
 * @package CampaignBlock
 */

( function () {
	'use strict';

	/* ------------------------------------------------------------------ */
	/*  Destructure WordPress globals                                       */
	/* ------------------------------------------------------------------ */
	var registerBlockType  = wp.blocks.registerBlockType;
	var el                 = wp.element.createElement;
	var Fragment           = wp.element.Fragment;
	var useRef             = wp.element.useRef;
	var useState           = wp.element.useState;
	var useEffect          = wp.element.useEffect;
	var __                 = wp.i18n.__;
	var InspectorControls  = wp.blockEditor.InspectorControls;
	var RichText           = wp.blockEditor.RichText;
	var MediaUpload        = wp.blockEditor.MediaUpload;
	var MediaUploadCheck   = wp.blockEditor.MediaUploadCheck;
	var PanelBody          = wp.components.PanelBody;
	var TextControl        = wp.components.TextControl;
	var TextareaControl    = wp.components.TextareaControl;
	var RadioControl       = wp.components.RadioControl;
	var Button             = wp.components.Button;

	/* ------------------------------------------------------------------ */
	/*  Constants – character limits                                        */
	/* ------------------------------------------------------------------ */
	var TITLE_MAX_LATIN = 55;
	var TITLE_MAX_ASIAN = 25;
	var DESC_MAX        = 195;

	/* ------------------------------------------------------------------ */
	/*  Button style options                                                */
	/* ------------------------------------------------------------------ */
	var BUTTON_STYLES = [
		{ value: 'primary',   label: 'Primary'   },
		{ value: 'secondary', label: 'Secondary' },
		{ value: 'tertiary',  label: 'Tertiary'  },
	];

	/* ------------------------------------------------------------------ */
	/*  Predefined color palette for the description box                   */
	/* ------------------------------------------------------------------ */
	var COLOR_PALETTE = [
		{ bg: '#008252', color: '#ffffff', label: 'Green'      },
		{ bg: '#ffdcee', color: '#000000', label: 'Pink'       },
		{ bg: '#66B498', color: '#000000', label: 'Sage'       },
		{ bg: '#D9ECE5', color: '#000000', label: 'Mint'       },
		{ bg: '#12494B', color: '#ffffff', label: 'Dark teal'  },
		{ bg: '#CEEFFF', color: '#000000', label: 'Light blue' },
	];

	var DEFAULT_BG    = COLOR_PALETTE[ 0 ].bg;
	var DEFAULT_COLOR = COLOR_PALETTE[ 0 ].color;

	/* ------------------------------------------------------------------ */
	/*  Helpers                                                             */
	/* ------------------------------------------------------------------ */

	function containsAsianCharacters( text ) {
		/* eslint-disable no-misleading-character-class */
		return /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF]/.test( text );
		/* eslint-enable no-misleading-character-class */
	}

	function getTitleMax( value ) {
		return containsAsianCharacters( value ) ? TITLE_MAX_ASIAN : TITLE_MAX_LATIN;
	}

	/**
	 * Convert a hex color string (#rrggbb or #rgb) to an rgba() CSS value.
	 * Used to compute the image border color (boxBgColor at 30% opacity).
	 *
	 * @param  {string} hex     - Hex color, e.g. '#008252'.
	 * @param  {number} opacity - Opacity between 0 and 1.
	 * @return {string}         - CSS rgba() string, e.g. 'rgba(0,130,82,0.3)'.
	 */
	function hexToRgba( hex, opacity ) {
		// Expand shorthand #rgb to #rrggbb.
		var full = hex.replace( /^#([a-f\d])([a-f\d])([a-f\d])$/i, '#$1$1$2$2$3$3' );
		var r = parseInt( full.slice( 1, 3 ), 16 );
		var g = parseInt( full.slice( 3, 5 ), 16 );
		var b = parseInt( full.slice( 5, 7 ), 16 );
		// Guard against NaN if hex is malformed.
		if ( isNaN( r ) || isNaN( g ) || isNaN( b ) ) {
			return 'rgba(0,0,0,' + opacity + ')';
		}
		return 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')';
	}

	/* ------------------------------------------------------------------ */
	/*  Block registration                                                  */
	/* ------------------------------------------------------------------ */
	registerBlockType( 'campaign-block/campaign', {

		title:       __( 'Campaign Block', 'campaign-block' ),
		description: __( 'Display a campaign with a title, description and an image.', 'campaign-block' ),
		category:    'media',
		icon:        'megaphone',
		supports: {
			html:            false,
			reusable:        true,
			anchor:          false,
			align:           false,
			customClassName: false,
		},

		/* ---- Attributes ---- */
		attributes: {
			title:          { type: 'string',  default: '' },
			description:    { type: 'string',  default: '' },
			imageId:        { type: 'integer', default: 0  },
			imageUrl:       { type: 'string',  default: '' },
			imageAlt:       { type: 'string',  default: '' },
			imageAlignment: { type: 'string',  default: 'left' },
			boxBgColor:     { type: 'string',  default: DEFAULT_BG    },
			boxTextColor:   { type: 'string',  default: DEFAULT_COLOR },
			// Button attributes
			buttonUrl:      { type: 'string',  default: '' },
			buttonText:     { type: 'string',  default: 'Button content...' },
			buttonTarget:   { type: 'boolean', default: false },
			buttonStyle:    { type: 'string',  default: 'primary' },
		},

		/* ---------------------------------------------------------------- */
		/*  edit()                                                           */
		/* ---------------------------------------------------------------- */
		edit: function ( props ) {
			var attributes    = props.attributes;
			var setAttributes = props.setAttributes;

			var title          = attributes.title;
			var description    = attributes.description;
			var imageUrl       = attributes.imageUrl;
			var imageAlt       = attributes.imageAlt;
			var imageAlignment = attributes.imageAlignment;
			var boxBgColor     = attributes.boxBgColor   || DEFAULT_BG;
			var boxTextColor   = attributes.boxTextColor || DEFAULT_COLOR;
			// Button
			var buttonUrl    = attributes.buttonUrl    || '';
			var buttonText   = attributes.buttonText   || 'Button content...';
			var buttonTarget = attributes.buttonTarget || false;
			var buttonStyle  = attributes.buttonStyle  || 'primary';

			/* Border color for the image: boxBgColor at 30% opacity. */
			var imageBorderColor = hexToRgba( boxBgColor, 0.3 );

			var titleMax      = getTitleMax( title );
			var titleLen      = title.length;
			var titleAtLimit  = titleLen === titleMax;   /* avertissement rouge à la limite exacte */
			var descLen       = description.length;
			var descAtLimit   = descLen === DESC_MAX;    /* avertissement rouge à la limite exacte */

			/*
			 * imagePanelOpen controls the Image PanelBody open/closed state.
			 * Clicking the image in the canvas forces it open and scrolls to it.
			 */
			var imagePanelState   = useState( true );
			var imagePanelOpen    = imagePanelState[ 0 ];
			var setImagePanelOpen = imagePanelState[ 1 ];

			/* Ref for the div wrapping the Image PanelBody – used to scroll. */
			var imagePanelRef = useRef( null );

			/*
			 * buttonPanelOpen controls the Button PanelBody open/closed state.
			 * Clicking the button in the canvas forces it open and scrolls to it.
			 */
			var buttonPanelState   = useState( true );
			var buttonPanelOpen    = buttonPanelState[ 0 ];
			var setButtonPanelOpen = buttonPanelState[ 1 ];

			/* Ref for the div wrapping the Button PanelBody – used to scroll. */
			var buttonPanelRef = useRef( null );

			/* ---- Handlers ---- */
			function onTitleChange( newValue ) {
				/* Bloquer au-delà de la limite, autoriser jusqu'à la limite incluse */
				var max = getTitleMax( newValue );
				var truncated = newValue.length > max ? newValue.substring( 0, max ) : newValue;
				setAttributes( { title: truncated } );
			}

			function onDescriptionChange( newValue ) {
				/* Bloquer au-delà de la limite, autoriser jusqu'à la limite incluse */
				var truncated = newValue.length > DESC_MAX ? newValue.substring( 0, DESC_MAX ) : newValue;
				setAttributes( { description: truncated } );
			}

			function onSelectImage( media ) {
				setAttributes( { imageId: media.id, imageUrl: media.url, imageAlt: media.alt || '' } );
			}

			function onRemoveImage() {
				setAttributes( { imageId: 0, imageUrl: '', imageAlt: '' } );
			}

			/**
			 * Click on the canvas image → open Image panel + scroll sidebar to it.
			 */
			function onImageClick() {
				setImagePanelOpen( true );
				setTimeout( function () {
					if ( imagePanelRef.current ) {
						imagePanelRef.current.scrollIntoView( { behavior: 'smooth', block: 'start' } );
					}
				}, 150 );
			}

			/**
			 * Click on the canvas button → open Button panel + scroll sidebar to it.
			 */
			function onButtonClick( e ) {
				e.preventDefault();
				setButtonPanelOpen( true );
				setTimeout( function () {
					if ( buttonPanelRef.current ) {
						buttonPanelRef.current.scrollIntoView( { behavior: 'smooth', block: 'start' } );
					}
				}, 150 );
			}

			/* ---------------------------------------------------------------- */
			/*  Editor canvas preview                                            */
			/* ---------------------------------------------------------------- */
			var containerClass = 'campaign-container campaign-image-' + imageAlignment + ' campaign-editor-preview';

			var editorPreview = el(
				'div',
				{
					id:           'campaign_container',
					className:    containerClass,
					role:         'region',
					'aria-label': __( 'Campaign preview', 'campaign-block' ),
					style:        { width: '100%', maxWidth: '1130px' },
				},

				/* ---- Image (clickable) or placeholder ---- */
				imageUrl
					? el(
						'div',
						{
							className:    'campaign-image-wrapper campaign-image-wrapper--clickable',
							onClick:      onImageClick,
							role:         'button',
							tabIndex:     0,
							title:        __( 'Click to edit image settings', 'campaign-block' ),
							'aria-label': __( 'Edit image – opens image settings panel', 'campaign-block' ),
							onKeyDown: function ( e ) {
								if ( e.key === 'Enter' || e.key === ' ' ) { e.preventDefault(); onImageClick(); }
							},
						},
						el( 'img', {
							src:       imageUrl,
							alt:       imageAlt,
							className: 'campaign-image',
							width:     700,
							height:    500,
							/*
							 * outline is used instead of border so the stroke draws
							 * on top of the image itself (outside the box model) and
							 * is never clipped or hidden by the absolute positioning
							 * of the wrapper.
							 */
							style:     { outline: '3px solid ' + imageBorderColor, outlineOffset: '-3px' },
						} ),
						/* Hover overlay hint */
						el( 'span', { className: 'campaign-image-edit-hint', 'aria-hidden': 'true' },
							__( '✎ Edit image', 'campaign-block' )
						)
					)
					: el(
						'div',
						{
							className:    'campaign-image-placeholder campaign-image-wrapper--clickable',
							onClick:      onImageClick,
							role:         'button',
							tabIndex:     0,
							'aria-label': __( 'Select an image – opens image settings panel', 'campaign-block' ),
							/* outline instead of border: consistent with the image variant. */
							style:        { outline: '3px solid ' + imageBorderColor, outlineOffset: '-3px' },
							onKeyDown: function ( e ) {
								if ( e.key === 'Enter' || e.key === ' ' ) { e.preventDefault(); onImageClick(); }
							},
						},
						el( 'span', {}, __( 'Click to select an image', 'campaign-block' ) )
					),

				/* ---- Description box ---- */
				el(
					'div',
					{
						id:        'boxDescription',
						className: 'campaign-box-description',
						style:     { backgroundColor: boxBgColor, color: boxTextColor },
					},

					/* Inline title */
					el( RichText, {
						tagName:                      'h2',
						className:                    'campaign-title',
						value:                        title,
						onChange:                     onTitleChange,
						placeholder:                  __( 'Campaign title…', 'campaign-block' ),
						allowedFormats:               [],
						withoutInteractiveFormatting: true,
						'aria-label':                 __( 'Campaign title', 'campaign-block' ),
						style:                        { color: boxTextColor },
					} ),
					el(
						'span',
						{
							className:   'campaign-char-count campaign-char-count--inline' + ( titleAtLimit ? ' campaign-char-count--limit' : '' ),
							role:        titleAtLimit ? 'alert' : undefined,
							'aria-live': 'polite',
							/* Inherit text color from the chosen palette, with reduced opacity
							   so it is visually secondary to the actual content. */
							style:       { color: hexToRgba( boxTextColor, 0.7 ) },
						},
						titleAtLimit
							? __( 'Maximum number of characters reached.', 'campaign-block' )
							: ( titleLen + ' / ' + titleMax + ' ' + __( 'characters', 'campaign-block' ) )
					),

					/* Inline description */
					el( RichText, {
						tagName:                      'p',
						className:                    'campaign-description',
						value:                        description,
						onChange:                     onDescriptionChange,
						placeholder:                  __( 'Campaign description…', 'campaign-block' ),
						allowedFormats:               [],
						withoutInteractiveFormatting: true,
						'aria-label':                 __( 'Campaign description', 'campaign-block' ),
						style:                        { color: boxTextColor },
					} ),
					el(
						'span',
						{
							className:   'campaign-char-count campaign-char-count--inline' + ( descAtLimit ? ' campaign-char-count--limit' : '' ),
							role:        descAtLimit ? 'alert' : undefined,
							'aria-live': 'polite',
							/* Same color logic as the title counter. */
							style:       { color: hexToRgba( boxTextColor, 0.7 ) },
						},
						descAtLimit
							? __( 'Maximum number of characters reached.', 'campaign-block' )
							: ( descLen + ' / ' + DESC_MAX + ' ' + __( 'characters', 'campaign-block' ) )
					),

				/* ---- Button preview inside boxDescription ---- */
				( buttonUrl && buttonText && buttonText !== 'Button content...' )
					? el(
						'a',
						{
							href:         '#',
							className:    'bnpp-custom ' + buttonStyle + ( boxTextColor === '#ffffff' ? ' dark' : '' ) + ' campaign-button-preview',
							onClick:      onButtonClick,
							title:        __( 'Click to edit button settings', 'campaign-block' ),
							'aria-label': __( 'Edit button – opens button settings panel', 'campaign-block' ),
						},
						buttonText
					)
					: el(
						'div',
						{
							className:    'campaign-button-placeholder',
							onClick:      onButtonClick,
							role:         'button',
							tabIndex:     0,
							'aria-label': __( 'Configure button – opens button settings panel', 'campaign-block' ),
							onKeyDown: function ( e ) {
								if ( e.key === 'Enter' || e.key === ' ' ) { e.preventDefault(); onButtonClick( e ); }
							},
						},
						__( '＋ Add a button', 'campaign-block' )
					)
				)
			);

			/* ---------------------------------------------------------------- */
			/*  Inspector – right-hand sidebar                                  */
			/* ---------------------------------------------------------------- */
			var inspectorControls = el(
				InspectorControls,
				{},

				/* ==== Content panel ==== */
				el(
					PanelBody,
					{ title: __( 'Content', 'campaign-block' ), initialOpen: true },

					el( TextControl, {
						label:    __( 'Title', 'campaign-block' ),
						value:    title,
						onChange: onTitleChange,
					} ),
					el( 'p', {
						className:   'campaign-char-count' + ( titleAtLimit ? ' campaign-char-count--limit' : '' ),
						role:        titleAtLimit ? 'alert' : undefined,
						'aria-live': 'polite',
					},
						titleAtLimit
							? __( 'Maximum number of characters reached.', 'campaign-block' )
							: ( titleLen + ' / ' + titleMax + ' ' + __( 'characters', 'campaign-block' ) )
					),

					el( TextareaControl, {
						label:    __( 'Description', 'campaign-block' ),
						value:    description,
						onChange: onDescriptionChange,
						rows:     4,
					} ),
					el( 'p', {
						className:   'campaign-char-count' + ( descAtLimit ? ' campaign-char-count--limit' : '' ),
						role:        descAtLimit ? 'alert' : undefined,
						'aria-live': 'polite',
					},
						descAtLimit
							? __( 'Maximum number of characters reached.', 'campaign-block' )
							: ( descLen + ' / ' + DESC_MAX + ' ' + __( 'characters', 'campaign-block' ) )
					)
				),

				/* ==== Appearance panel (color palette) ==== */
				el(
					PanelBody,
					{ title: __( 'Appearance', 'campaign-block' ), initialOpen: true },

					el( 'p', { className: 'campaign-palette-label' },
						__( 'Description box color', 'campaign-block' )
					),

					el(
						'div',
						{
							className:    'campaign-palette',
							role:         'radiogroup',
							'aria-label': __( 'Description box background color', 'campaign-block' ),
						},
						COLOR_PALETTE.map( function ( entry ) {
							var isSelected = entry.bg === boxBgColor;
							return el(
								'button',
								{
									key:            entry.bg,
									type:           'button',
									className:      'campaign-palette__swatch' + ( isSelected ? ' is-selected' : '' ),
									style:          { backgroundColor: entry.bg },
									title:          entry.label,
									'aria-label':   entry.label + ( isSelected ? ' – ' + __( 'selected', 'campaign-block' ) : '' ),
									'aria-pressed': isSelected,
									onClick: function () {
										setAttributes( { boxBgColor: entry.bg, boxTextColor: entry.color } );
									},
								}
							);
						} )
					),

					/* Small live preview chip */
					el(
						'div',
						{
							className:    'campaign-palette-preview',
							style:        { backgroundColor: boxBgColor, color: boxTextColor },
							'aria-hidden': 'true',
						},
						__( 'Preview', 'campaign-block' ) + ' — Aa'
					)
				),

				/* ==== Image panel ==== */
				/*
				 * Wrapped in a plain div so we can attach a ref for scrollIntoView.
				 * PanelBody itself does not forward refs.
				 */
				el(
					'div',
					{ ref: imagePanelRef },
					el(
						PanelBody,
						{
							title:    __( 'Image', 'campaign-block' ),
							opened:   imagePanelOpen,
							onToggle: function ( next ) { setImagePanelOpen( next ); },
						},

						el(
							MediaUploadCheck,
							{},
							el( MediaUpload, {
								onSelect:     onSelectImage,
								allowedTypes: [ 'image' ],
								value:        attributes.imageId,
								render: function ( obj ) {
									return el(
										Fragment,
										{},
										el( Button, {
											onClick:   obj.open,
											variant:   'secondary',
											className: 'campaign-media-button',
										},
											imageUrl
												? __( 'Replace image', 'campaign-block' )
												: __( 'Select / upload image', 'campaign-block' )
										),
										imageUrl ? el(
											'div',
											{ className: 'campaign-image-thumb-wrapper' },
											el( 'img', { src: imageUrl, alt: imageAlt, className: 'campaign-image-thumb' } ),
											el( Button, {
												onClick:       onRemoveImage,
												variant:       'link',
												isDestructive: true,
												className:     'campaign-remove-image',
											}, __( 'Remove image', 'campaign-block' ) )
										) : null
									);
								},
							} )
						),

						/* Image position – toggle group */
						el( 'div', { className: 'campaign-toggle-group-wrap' },
							el( 'p', { className: 'campaign-toggle-group-label' }, __( 'Image position', 'campaign-block' ) ),
							el( 'div', { className: 'campaign-toggle-group', role: 'group', 'aria-label': __( 'Image position', 'campaign-block' ) },
								[ { label: __( 'Left',  'campaign-block' ), value: 'left'  },
								  { label: __( 'Right', 'campaign-block' ), value: 'right' } ]
								.map( function( opt ) {
									var isActive = imageAlignment === opt.value;
									return el( 'button', {
										key:            opt.value,
										type:           'button',
										className:      'campaign-toggle-btn' + ( isActive ? ' is-active' : '' ),
										'aria-pressed': isActive,
										onClick: function() { setAttributes( { imageAlignment: opt.value } ); },
									}, opt.label );
								} )
							)
						)
					)
				),

				/* ==== Button panel ==== */
				el(
					'div',
					{ ref: buttonPanelRef },
					el(
						PanelBody,
						{
							title:    __( 'Button', 'campaign-block' ),
							opened:   buttonPanelOpen,
							onToggle: function ( next ) { setButtonPanelOpen( next ); },
						},

						el( TextControl, {
							label:    __( 'Button text', 'campaign-block' ),
							value:    buttonText,
							onChange: function ( val ) { setAttributes( { buttonText: val } ); },
							onFocus:  function ( e ) {
								if ( e.target.value === 'Button content...' ) {
									setAttributes( { buttonText: '' } );
								}
							},
							onBlur:   function ( e ) {
								if ( e.target.value.trim() === '' ) {
									setAttributes( { buttonText: 'Button content...' } );
								}
							},
							help:     __( 'Default: "Button content…". Change this text to display the button.', 'campaign-block' ),
						} ),

						el( TextControl, {
							label:    __( 'Button URL', 'campaign-block' ),
							value:    buttonUrl,
							onChange: function ( val ) { setAttributes( { buttonUrl: val } ); },
							type:     'url',
							help:     __( 'The button is hidden if the URL is empty or the text is still the default.', 'campaign-block' ),
						} ),

						/* ==== Open in – custom toggle group ==== */
						el( 'div', { className: 'campaign-toggle-group-wrap' },
							el( 'p', { className: 'campaign-toggle-group-label' }, __( 'Open in', 'campaign-block' ) ),
							el( 'div', { className: 'campaign-toggle-group', role: 'group', 'aria-label': __( 'Open in', 'campaign-block' ) },
								[ { label: __( 'Same tab', 'campaign-block' ), value: '_self' },
								  { label: __( 'New tab',  'campaign-block' ), value: '_blank' } ]
								.map( function( opt ) {
									var isActive = ( buttonTarget ? '_blank' : '_self' ) === opt.value;
									return el( 'button', {
										key:           opt.value,
										type:          'button',
										className:     'campaign-toggle-btn' + ( isActive ? ' is-active' : '' ),
										'aria-pressed': isActive,
										onClick: function() { setAttributes( { buttonTarget: opt.value === '_blank' } ); },
									}, opt.label );
								} )
							)
						),

						/* ==== Button style – custom toggle group ==== */
						el( 'div', { className: 'campaign-toggle-group-wrap' },
							el( 'p', { className: 'campaign-toggle-group-label' }, __( 'Button style', 'campaign-block' ) ),
							el( 'div', { className: 'campaign-toggle-group', role: 'group', 'aria-label': __( 'Button style', 'campaign-block' ) },
								BUTTON_STYLES.map( function( opt ) {
									var isActive = buttonStyle === opt.value;
									return el( 'button', {
										key:            opt.value,
										type:           'button',
										className:      'campaign-toggle-btn' + ( isActive ? ' is-active' : '' ),
										'aria-pressed': isActive,
										onClick: function() { setAttributes( { buttonStyle: opt.value } ); },
									}, opt.label );
								} )
							)
						)
					)
				)
			);

			return el( Fragment, {}, inspectorControls, editorPreview );
		},

		/* save() – server-side render */
		save: function () { return null; },
	} );

}() );
