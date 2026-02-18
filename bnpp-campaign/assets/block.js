/**
 * Campaign Block – Editor Script
 * 
 * VRAIE SOLUTION : Implémenter maxLength directement sur RichText
 * en interceptant les changements à la source et en tronquant immédiatement
 *
 * @package CampaignBlock
 */

( function () {
	'use strict';

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
	var Button             = wp.components.Button;

	var TITLE_MAX_LATIN = 55;
	var TITLE_MAX_ASIAN = 25;
	var DESC_MAX        = 195;

	var BUTTON_STYLES = [
		{ value: 'primary',   label: 'Primary'   },
		{ value: 'secondary', label: 'Secondary' },
		{ value: 'tertiary',  label: 'Tertiary'  },
	];

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

	function containsAsianCharacters( text ) {
		return /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF]/.test( text );
	}

	function getTitleMax( value ) {
		return containsAsianCharacters( value ) ? TITLE_MAX_ASIAN : TITLE_MAX_LATIN;
	}

	function hexToRgba( hex, opacity ) {
		var full = hex.replace( /^#([a-f\d])([a-f\d])([a-f\d])$/i, '#$1$1$2$2$3$3' );
		var r = parseInt( full.slice( 1, 3 ), 16 );
		var g = parseInt( full.slice( 3, 5 ), 16 );
		var b = parseInt( full.slice( 5, 7 ), 16 );
		if ( isNaN( r ) || isNaN( g ) || isNaN( b ) ) {
			return 'rgba(0,0,0,' + opacity + ')';
		}
		return 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')';
	}

	/* ================================================================ */
	/*  CUSTOM RICHTEXT AVEC LIMITE DE CARACTÈRES APPLIQUÉE            */
	/* ================================================================ */

	/**
	 * Composant RichText personnalisé qui respecte une limite de caractères
	 * @param {Object} props - Props incluant value, onChange, maxLength, etc.
	 */
	function LimitedRichText( props ) {
		var value = props.value || '';
		var onChange = props.onChange;
		var maxLength = props.maxLength || 999999;
		var internalValueRef = useRef( value );

		// Mettre à jour la ref quand la valeur change de l'extérieur
		useEffect( function () {
			internalValueRef.current = value;
		}, [ value ] );

		/**
		 * Handler qui tronque IMMÉDIATEMENT si on dépasse
		 */
		function handleChange( newValue ) {
			internalValueRef.current = newValue;

			if ( newValue.length > maxLength ) {
				// Tronquer
				var truncated = newValue.substring( 0, maxLength );
				internalValueRef.current = truncated;
				onChange( truncated );
			} else {
				onChange( newValue );
			}
		}

		// Passer tous les props sauf value et onChange au RichText réel
		var richTextProps = Object.assign( {}, props, {
			value: value,
			onChange: handleChange
		} );

		return el( RichText, richTextProps );
	}

	/* ================================================================ */
	/*  BLOCK REGISTRATION                                              */
	/* ================================================================ */

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

		attributes: {
			title:          { type: 'string',  default: '' },
			description:    { type: 'string',  default: '' },
			imageId:        { type: 'integer', default: 0  },
			imageUrl:       { type: 'string',  default: '' },
			imageAlt:       { type: 'string',  default: '' },
			imageAlignment: { type: 'string',  default: 'left' },
			boxBgColor:     { type: 'string',  default: DEFAULT_BG    },
			boxTextColor:   { type: 'string',  default: DEFAULT_COLOR },
			buttonUrl:      { type: 'string',  default: '' },
			buttonText:     { type: 'string',  default: 'Button content...' },
			buttonTarget:   { type: 'boolean', default: false },
			buttonStyle:    { type: 'string',  default: 'primary' },
		},

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
			var buttonUrl    = attributes.buttonUrl    || '';
			var buttonText   = attributes.buttonText   || 'Button content...';
			var buttonTarget = attributes.buttonTarget || false;
			var buttonStyle  = attributes.buttonStyle  || 'primary';

			var imageBorderColor = hexToRgba( boxBgColor, 0.3 );

			var titleMax      = getTitleMax( title );
			var titleLen      = title.length;
			var titleAtLimit  = titleLen === titleMax;
			var descLen       = description.length;
			var descAtLimit   = descLen === DESC_MAX;

			var imagePanelState   = useState( true );
			var imagePanelOpen    = imagePanelState[ 0 ];
			var setImagePanelOpen = imagePanelState[ 1 ];
			var imagePanelRef = useRef( null );

			var buttonPanelState   = useState( true );
			var buttonPanelOpen    = buttonPanelState[ 0 ];
			var setButtonPanelOpen = buttonPanelState[ 1 ];
			var buttonPanelRef = useRef( null );

			/* ---- Handlers ---- */

			function onTitleChange( newValue ) {
				// Le LimitedRichText gère déjà la limite, mais on la garantit aussi ici
				var max = getTitleMax( newValue );
				var truncated = newValue.length > max ? newValue.substring( 0, max ) : newValue;
				setAttributes( { title: truncated } );
			}

			function onDescriptionChange( newValue ) {
				var truncated = newValue.length > DESC_MAX ? newValue.substring( 0, DESC_MAX ) : newValue;
				setAttributes( { description: truncated } );
			}

			function onSelectImage( media ) {
				setAttributes( { imageId: media.id, imageUrl: media.url, imageAlt: media.alt || '' } );
			}

			function onRemoveImage() {
				setAttributes( { imageId: 0, imageUrl: '', imageAlt: '' } );
			}

			function onImageClick() {
				setImagePanelOpen( true );
				setTimeout( function () {
					if ( imagePanelRef.current ) {
						imagePanelRef.current.scrollIntoView( { behavior: 'smooth', block: 'start' } );
					}
				}, 150 );
			}

			function onButtonClick( e ) {
				e.preventDefault();
				setButtonPanelOpen( true );
				setTimeout( function () {
					if ( buttonPanelRef.current ) {
						buttonPanelRef.current.scrollIntoView( { behavior: 'smooth', block: 'start' } );
					}
				}, 150 );
			}

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

				/* ---- Image ---- */
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
							style:     { outline: '3px solid ' + imageBorderColor, outlineOffset: '-3px' },
						} ),
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

					/* Inline title – AVEC LIMITE */
					el( LimitedRichText, {
						tagName:                      'h2',
						className:                    'campaign-title',
						value:                        title,
						onChange:                     onTitleChange,
						maxLength:                    titleMax,  // ← CLÉE
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
							style:       { color: hexToRgba( boxTextColor, 0.7 ) },
						},
						titleAtLimit
							? __( 'Maximum number of characters reached.', 'campaign-block' )
							: ( titleLen + ' / ' + titleMax + ' ' + __( 'characters', 'campaign-block' ) )
					),

					/* Inline description – AVEC LIMITE */
					el( LimitedRichText, {
						tagName:                      'p',
						className:                    'campaign-description',
						value:                        description,
						onChange:                     onDescriptionChange,
						maxLength:                    DESC_MAX,  // ← CLÉE
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
							style:       { color: hexToRgba( boxTextColor, 0.7 ) },
						},
						descAtLimit
							? __( 'Maximum number of characters reached.', 'campaign-block' )
							: ( descLen + ' / ' + DESC_MAX + ' ' + __( 'characters', 'campaign-block' ) )
					),

					/* ---- Button ---- */
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

			var inspectorControls = el(
				InspectorControls,
				{},

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

		save: function () { return null; },
	} );

}() );
