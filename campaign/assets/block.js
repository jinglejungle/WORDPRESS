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

( function (editor) {
	'use strict';

	/* ------------------------------------------------------------------ */
	/*  Destructure WordPress globals                                       */
	/* ------------------------------------------------------------------ */
	
	// ADD dark mode in the toolbar
	const { BlockControls, LinkControl } = wp.blockEditor;
	const {  ToolbarGroup, ToolbarItem, ToolbarButton, SelectControl, ToolbarDropdownMenu, MenuItem } = wp.components;	

	var registerBlockType  = wp.blocks.registerBlockType;
	var el                 = wp.element.createElement;
	var Fragment           = wp.element.Fragment;
	var useRef             = wp.element.useRef;
	var useState           = wp.element.useState;
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
		{ value: 'ghost',  label: 'Ghost'  },
		
	];

	/* ------------------------------------------------------------------ */
	/*  Background colors                                                */
	/* ------------------------------------------------------------------ */
	const backgroundColor = [
		{ value: 'light'     , label: 'Light' },
		{ value: 'dark'      , label: 'Dark' },
		{ value: 'mintMode'  , label: 'Mint'  },
		{ value: 'kaki2Mode' , label: 'Kaki 2'},
		{ value: 'jade1Mode' , label: 'Jade 1'},
		{ value: 'jade2Mode' , label: 'Jade 2'},
		{ value: 'jade3Mode' , label: 'Jade 3'}, 
	];

	/* ------------------------------------------------------------------ */
	/*  Predefined color palette for the description box                   */
	/* ------------------------------------------------------------------ */
	var COLOR_PALETTE = [
		{ bg: '#008252', color: '#ffffff', label: 'Green'      },
		{ bg: '#ffdcee', color: '#000000', label: 'Pink'       },
		{ bg: '#66B498', color: '#000000', label: 'Sage'       },
		{ bg: '#D9ECE5', color: '#000000', label: 'Mint'       },
		{ bg: '#CEEFFF', color: '#000000', label: 'Light blue' },
		{ bg: '#0C2728', color: '#ffffff', label: 'Dark Teal'      },
		{ bg: '#832E5A', color: '#ffffff', label: 'Deep Magenta'       },
		{ bg: '#12494B', color: '#ffffff', label: 'Dark Cyan'       },
		{ bg: '#61696E', color: '#ffffff', label: 'Slate Gray'       },
		{ bg: '#153340', color: '#ffffff', label: 'Midnight Blue'  },
		{ bg: '#E7FFD9', color: '#000000', label: 'Leaf' },
		{ bg: '#E8FCF2', color: '#000000', label: 'Off Mint' },
		{ bg: '#465843', color: '#ffffff', label: 'Kaki2'      },
		{ bg: '#001B15', color: '#ffffff', label: 'Jade1'      },
		{ bg: '#082D23', color: '#ffffff', label: 'Jade2'      },
		{ bg: '#003F29', color: '#ffffff', label: 'Jade3'      },

	];
    var darkColor = [ '#0C2728','#832E5A','#12494B', '#61696E','#153340'];
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
	registerBlockType( 'gl-campaign-block/campaign', {

		title:       __( 'GL Campaign Block', 'gl-campaign-block' ),
		description: __( 'Display a campaign with a title, description and an image.', 'gl-campaign-block' ),
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
			background:     { type: 'string',  default: 'light' },
			boxBgColor:     { type: 'string',  default: DEFAULT_BG    },
			boxTextColor:   { type: 'string',  default: DEFAULT_COLOR },
			// Button attributes
			buttonText:     { type: 'string',  default: 'Button content...' },
			buttonTarget:   { type: 'boolean', default: false },
			iconShow:     { type: 'boolean', default: false },
			buttonStyle:    { type: 'string',  default: 'primary' },
		    darkLight:      { type:'Boolean', default: false},
			sizeButton: { type: 'string', default: '' },

			//button with auto completion
			link: { type: 'string', default:  '' },
			linkbis: { type: 'object', default:  null },
		},

		/* ---------------------------------------------------------------- */
		/*  edit()                                                           */
		/* ---------------------------------------------------------------- */
		edit: function ( props ) {

			if (props.attributes.darkLight == true) {
                $(props.class).css("background-color", "#0C2728");
                $(".campaign-container").css("border", "#0C2728");							
                $("[data-type=\"gl-campaign-block/campaign\"]").css("background-color", "#0C2728");							
            }

			var attributes    = props.attributes;
			console.log(attributes.background);
			var setAttributes = props.setAttributes;

			var title          = attributes.title;
			var description    = attributes.description;
			var background    = attributes.background;
			var imageUrl       = attributes.imageUrl;
			var imageAlt       = attributes.imageAlt;
			var imageAlignment = attributes.imageAlignment;
			var boxBgColor     = attributes.boxBgColor   || DEFAULT_BG;
			var boxTextColor   = attributes.boxTextColor || DEFAULT_COLOR;
			// Button
			var link         = attributes.link    || '';
			var linkbis         = attributes.linkbis    || '';
			var buttonText   = attributes.buttonText   || 'Button content...';
			var buttonTarget = attributes.buttonTarget || false;
			var iconShow   = attributes.iconShow || false;
			var sizeButton = attributes.sizeButton;
			
			var buttonStyle  = attributes.buttonStyle  || 'primary';

			/* Border color for the image: boxBgColor at 30% opacity. */
			//var imageBorderColor = hexToRgba( boxBgColor, 0.3 );

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
				if ( newValue.length <= getTitleMax( newValue ) ) {
					setAttributes( { title: newValue } );
				}
				if ( newValue.length > getTitleMax( newValue ) ) {
					setAttributes( { title: newValue.slice( 0, getTitleMax( newValue )) } );
				}
			}

			function onDescriptionChange( newValue ) {
					
				if ( newValue.length <= DESC_MAX ) {
					setAttributes( { description: newValue } );
				}
				if ( newValue.length > DESC_MAX ){
					setAttributes( { description: newValue.slice(0, DESC_MAX) } );
				}
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
					'aria-label': __( 'Campaign preview', 'gl-campaign-block' ),
					style:        { width: '100%', maxWidth: '1130px' },
				},
					el(
						BlockControls,
						null,
						el(
							ToolbarGroup,
							null,
						
				        		el( ToolbarItem,
									{
										as: SelectControl,
										label: __( 'Background color', 'gl-campaign-block' ),
										value: background,
										options: backgroundColor.map( function ( color ) {
											return { label: color.label, value: color.value };
										} ),
										onChange: function ( value ) {
											setAttributes( { background: value } );
										},
									}
								),
								el(
									ToolbarButton,
									{
										icon: props.attributes.darkLight=== true ? 'star-filled' : 'star-empty',
										label: 'Bouton Dark/light',
										style: {display: 'flex', alignItems: 'center', gap: '8px',width: '100px'},
										onClick: function() {
											let value = true;
											
											if (props.attributes.darkLight == true) {
												props.setAttributes({ darkLight: !value });
												$("[data-type=\"gl-campaign-block/campaign\"]").css("background-color", "#ffffff");
											
											} else {
												props.setAttributes({ darkLight: value });
												$("[data-type=\"gl-campaign-block/campaign\"]").css("background-color", "#0C2728");												
											}
										},
									},
	
									el(
										'span',
										null,
										'Dark/Light'
									),
								),
						),
					),
				/* ---- Image (clickable) or placeholder ---- */
				imageUrl
					? el(
						'div',
						{   
							style:     { boxShadow:  '5px 5px 5px ' + boxBgColor+'4D'},
							className:    'campaign-image-wrapper campaign-image-wrapper--clickable',
							onClick:      onImageClick,
							role:         'button',
							tabIndex:     0,
							title:        __( 'Click to edit image settings', 'gl-campaign-block' ),
							'aria-label': __( 'Edit image – opens image settings panel', 'gl-campaign-block' ),
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
							/*style:     { outline: '3px solid ' + imageBorderColor, outlineOffset: '-3px' },*/
						   
						} ),
						/* Hover overlay hint */
						el( 'span', { className: 'campaign-image-edit-hint', 'aria-hidden': 'true' },
							__( '✎ Edit image', 'gl-campaign-block' )
						)
					)
					: el(
						'div',
						{
							className:    'campaign-image-placeholder campaign-image-wrapper--clickable',
							onClick:      onImageClick,
							role:         'button',
							tabIndex:     0,
							'aria-label': __( 'Select an image – opens image settings panel', 'gl-campaign-block' ),
							/* outline instead of border: consistent with the image variant. */
							/*style:        { outline: '3px solid ' + imageBorderColor, outlineOffset: '-3px' },*/
							
							onKeyDown: function ( e ) {
								if ( e.key === 'Enter' || e.key === ' ' ) { e.preventDefault(); onImageClick(); }
							},
						},
						el( 'span', {}, __( 'Click to select an image', 'gl-campaign-block' ) )
					),

				/* ---- Description box ---- */
				el(
					'div',
					{
						id:        'boxDescription',
						className: 'campaign-box-description '+ (  darkColor.includes(boxBgColor)  ? ' dark' : ' ' ),
						style:     { backgroundColor: boxBgColor, color: boxTextColor },
					},

					/* Inline title */
					el( 'input', {
						type: 'text',
						className: 'campaign-title',
						value: title,
						onChange: function ( e ) { onTitleChange( e.target.value ); },
						placeholder: __( 'Campaign title…', 'gl-campaign-block' ),
						maxLength: titleMax,
						'aria-label': __( 'Campaign title', 'gl-campaign-block' ),
						style: { color: boxTextColor, width: '100%', border: 'none', padding: 0, fontSize: 'inherit', fontWeight: 'bold' },
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
							? __( 'Maximum number of characters reached. If you pasted text, it has been truncated to fit the character limit', 'gl-campaign-block' )
							: ( titleLen + ' / ' + titleMax + ' ' + __( 'characters', 'gl-campaign-block' ) )
					),

					/* Inline description */
					el( 'textarea', {
						className: 'campaign-description',
						value: description,
						onChange: function ( e ) { onDescriptionChange( e.target.value ); },
						placeholder: __( 'Campaign description…', 'gl-campaign-block' ),
						maxLength: DESC_MAX,
						'aria-label': __( 'Campaign description', 'gl-campaign-block' ),
						style: { color: boxTextColor, backgroundColor: boxBgColor, width: '100%', border: 'none', padding: 0, fontSize: 'inherit', resize: 'none', fontFamily: 'inherit' },
						rows: 5,
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
							? __( 'Maximum number of characters reached. If you pasted text, it has been truncated to fit the character limit', 'gl-campaign-block' )
							: ( descLen + ' / ' + DESC_MAX + ' ' + __( 'characters', 'gl-campaign-block' ) )
					),

				/* ---- Button preview inside boxDescription ---- */
				( link && buttonText && buttonText !== 'Button content...' )
					? el(
						'a',
						{
							href:         '#',
							className:    'bnpp-button campaign-button-preview ' + buttonStyle +' '+ sizeButton,
							onClick:      onButtonClick,
							title:        __( 'Click to edit button settings', 'gl-campaign-block' ),
							'aria-label': __( 'Edit button – opens button settings panel', 'gl-campaign-block' ),
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
							'aria-label': __( 'Configure button – opens button settings panel', 'gl-campaign-block' ),
							onKeyDown: function ( e ) {
								if ( e.key === 'Enter' || e.key === ' ' ) { e.preventDefault(); onButtonClick( e ); }
							},
						},
						__( '＋ Add a button', 'gl-campaign-block' )
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
					{ title: __( 'Content', 'gl-campaign-block' ), initialOpen: true },

					el( TextControl, {
						label:    __( 'Title', 'gl-campaign-block' ),
						value:    title,
						onChange: onTitleChange,
					} ),
					el( 'p', {
						className:   'campaign-char-count' + ( titleAtLimit ? ' campaign-char-count--limit' : '' ),
						role:        titleAtLimit ? 'alert' : undefined,
						'aria-live': 'polite',
					},
						titleAtLimit
							? __( 'Maximum number of characters reached.', 'gl-campaign-block' )
							: ( titleLen + ' / ' + titleMax + ' ' + __( 'characters', 'gl-campaign-block' ) )
					),

					el( TextareaControl, {
						label:    __( 'Description', 'gl-campaign-block' ),
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
							? __( 'Maximum number of characters reached.', 'gl-campaign-block' )
							: ( descLen + ' / ' + DESC_MAX + ' ' + __( 'characters', 'gl-campaign-block' ) )
					)
				),

				/* ==== Appearance panel (color palette) ==== */
				el(
					PanelBody,
					{ title: __( 'Appearance', 'gl-campaign-block' ), initialOpen: true },

					el( 'p', { className: 'campaign-palette-label' },
						__( 'Description box color', 'gl-campaign-block' )
					),

					el(
						'div',
						{
							className:    'campaign-palette',
							role:         'radiogroup',
							'aria-label': __( 'Description box background color', 'gl-campaign-block' ),
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
									'aria-label':   entry.label + ( isSelected ? ' – ' + __( 'selected', 'gl-campaign-block' ) : '' ),
									'aria-pressed': isSelected,
									onClick: function () {
										setAttributes( { boxBgColor: entry.bg});
										setAttributes( { boxTextColor: entry.color } );
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
						__( 'Preview', 'gl-campaign-block' ) + ' — Aa'
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
							title:    __( 'Image', 'gl-campaign-block' ),
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
												? __( 'Replace image', 'gl-campaign-block' )
												: __( 'Select / upload image', 'gl-campaign-block' )
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
											}, __( 'Remove image', 'gl-campaign-block' ) )
										) : null
									);
								},
							} )
						),

						/* Image position – toggle group */
						el( 'div', { className: 'campaign-toggle-group-wrap' },
							el( 'p', { className: 'campaign-toggle-group-label' }, __( 'Image position', 'gl-campaign-block' ) ),
							el( 'div', { className: 'campaign-toggle-group', role: 'group', 'aria-label': __( 'Image position', 'gl-campaign-block' ) },
								[ { label: __( 'Left',  'gl-campaign-block' ), value: 'left'  },
								  { label: __( 'Right', 'gl-campaign-block' ), value: 'right' } ]
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
							title:    __( 'Button', 'gl-campaign-block' ),
							opened:   buttonPanelOpen,
							onToggle: function ( next ) { setButtonPanelOpen( next ); },
						},

						el( TextControl, {
							label:    __( 'Button text', 'gl-campaign-block' ),
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
							help:     __( 'Default: "Button content…". Change this text to display the button.', 'gl-campaign-block' ),
						} ),

						/* ==== Search Link with autocompletion ==== */
						el('div',        {
								style: {
									width: '1OO%',      // largeur voulue
									maxWidth: '100%',       // annule le min‑width du core
									overflow: 'hidden',    // empêche le flex‑grow du sidebar
								},
							},
							el(LinkControl, {
								placeholder: 'link',
								value: attributes.linkbis,
								onChange: (value) => {
									setAttributes({link: value.url});
									setAttributes({linkbis: value});
								},
							}),
						),

						/* ==== Open in – custom toggle group ==== */
						el( 'div', { className: 'campaign-toggle-group-wrap' },
							el( 'p', { className: 'campaign-toggle-group-label' }, __( 'Open in', 'gl-campaign-block' ) ),
							el( 'div', { className: 'campaign-toggle-group', role: 'group', 'aria-label': __( 'Open in', 'gl-campaign-block' ) },
								[ { label: __( 'Same tab', 'gl-campaign-block' ), value: '_self' },
								  { label: __( 'New tab',  'gl-campaign-block' ), value: '_blank' } ]
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
					   /* ==== show icon – custom toggle group ==== */
						el( 'div', { className: 'campaign-toggle-group-wrap' },
							el( 'p', { className: 'campaign-toggle-group-label' }, __( 'Show Icon ', 'gl-campaign-block' ) ),
							el( 'div', { className: 'campaign-toggle-group', role: 'group', 'aria-label': __( 'Show Icon', 'gl-campaign-block' ) },
								[ { label: __( 'Hide', 'gl-campaign-block' ), value: false },
								  { label: __( 'Show',  'gl-campaign-block' ), value: true } ]
								.map( function( opt ) {
									var isActive = ( iconShow ? true : false ) === opt.value;
									return el( 'button', {
										key:           opt.value,
										type:          'button',
										className:     'campaign-toggle-btn' + ( isActive ? ' is-active' : '' ),
										'aria-pressed': isActive,
										onClick: function() { setAttributes( { iconShow: opt.value === true } ); },
									}, opt.label );
								} )
							)
						),

						/* ==== Button style – custom toggle group ==== */
						el( 'div', { className: 'campaign-toggle-group-wrap' },
							el( 'p', { className: 'campaign-toggle-group-label' }, __( 'Button style', 'gl-campaign-block' ) ),
							el(SelectControl, {
								label: '',
								value: props.attributes.sizeButton,
								options: [
									{ label: __('Default'), value: '' },
									{ label: __('Small'), value: 'bnpp-button--small' },
								],
								onChange: function( value ) {
									props.setAttributes({ sizeButton : value });
								}
							}),
							el( 'div', { className: 'campaign-toggle-group', role: 'group', 'aria-label': __( 'Button style', 'gl-campaign-block' ) },
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
						),
					)
				)
			);

			return el( Fragment, {}, inspectorControls, editorPreview );
		},

		/* save() – server-side render */
		save: function () { 
			return null; 
		},
	} );

}() );