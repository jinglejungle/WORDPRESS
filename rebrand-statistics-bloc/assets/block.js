( function ( wp ) {
	var blocks      = wp.blocks;
	var element     = wp.element;
	var blockEditor = wp.blockEditor;
	var components  = wp.components;
	var i18n        = wp.i18n;

	var el       = element.createElement;
	var Fragment = element.Fragment;
	var __       = i18n.__;

	var useBlockProps     = blockEditor.useBlockProps;
	var RichText          = blockEditor.RichText;
	var InnerBlocks       = blockEditor.InnerBlocks;
	var BlockControls     = blockEditor.BlockControls;
	var InspectorControls = blockEditor.InspectorControls;

	var ToolbarGroup        = components.ToolbarGroup;
	var ToolbarButton       = components.ToolbarButton;
	var ToolbarDropdownMenu = components.ToolbarDropdownMenu;
	var Icon                = components.Icon;
	var PanelBody           = components.PanelBody;
	var SelectControl       = components.SelectControl;
	var TextControl         = components.TextControl;
	var ToggleControl       = components.ToggleControl;

	var blockName = 'bnpp-custom-blocks/bnpp-rebrand-statistics-bloc';

	// Child block that this container allows to be inserted.
	var ALLOWED_BLOCKS = [ 'bnpp-custom-blocks/bnpp-rebrand-statistics-module' ];

	var blockAttributes = {
		cover: { type: 'string', default: '' },
		colourDisplay: { type: 'string', default: 'light' },
		layout: { type: 'string', default: '' },
		columnLayout: { type: 'string', default: 'double' },
		heading: { type: 'string', default: '' },
		headingLevel: { type: 'number', default: 2 },
		text: { type: 'string', default: '' },
		buttonOptions: {
			type: 'object',
			default: {
				buttonText: '',
				buttonUrl: '',
				openInNewTab: '',
				showButtonIcon: false,
				buttonColorScheme: 'primary',
				buttonAriaLabel: ''
			}
		},
		anchor: { type: 'string', default: '' }
	};

	// Faithful reproduction of the original Column Layout toolbar control.
	function ColumnLayoutControl( props ) {
		var attributes    = props.attributes;
		var setAttributes = props.setAttributes;
		var columnLayout  = attributes.columnLayout;

		var columnLayoutTypes = [
			{ key: 'double', label: __( 'Double', 'bnpp-custom-blocks' ) },
			{ key: 'single', label: __( 'Single', 'bnpp-custom-blocks' ) }
		];

		var currentType = columnLayoutTypes.filter( function ( columnObj ) {
			return columnObj.key === columnLayout;
		} )[ 0 ];
		var currentTypeLabel = currentType ? currentType.label : '';

		return el(
			BlockControls,
			{ group: 'other' },
			el(
				ToolbarDropdownMenu,
				{
					icon: el( 'span', null, currentTypeLabel ),
					label: __( 'Update Column Layout Type', 'bnpp-custom-blocks' ),
					controls: columnLayoutTypes.map( function ( columnData ) {
						return {
							title: el(
								Fragment,
								null,
								columnData.label,
								columnLayout === columnData.key
									? el( Icon, { style: { marginLeft: '5px' }, icon: 'yes', className: 'has-column-type-indicator' } )
									: null
							),
							onClick: function () {
								setAttributes( { columnLayout: columnData.key } );
							},
							isActive: columnLayout === columnData.key
						};
					} )
				},
				__( 'Column Type', 'bnpp-custom-blocks' )
			)
		);
	}

	// The controls below replace components imported from '../../components'
	// in the original block (ColorDisplayControl, ContainerLayoutControl,
	// ButtonComponent, HtmlAnchorControl). They keep every attribute editable.
	function SettingsControls( props ) {
		var attributes    = props.attributes;
		var setAttributes = props.setAttributes;
		var colourDisplay = attributes.colourDisplay;
		var layout        = attributes.layout;
		var anchor        = attributes.anchor;
		var buttonOptions = attributes.buttonOptions || {};

		function updateButtonOption( key, value ) {
			var next = Object.assign( {}, buttonOptions );
			next[ key ] = value;
			setAttributes( { buttonOptions: next } );
		}

		return el(
			InspectorControls,
			null,
			el(
				PanelBody,
				{ title: __( 'Settings', 'bnpp-custom-blocks' ) },
				el( SelectControl, {
					label: __( 'Colour Display', 'bnpp-custom-blocks' ),
					value: colourDisplay,
					options: [
						{ label: 'light', value: 'light' },
						{ label: 'dark', value: 'dark' },
						{ label: 'green', value: 'green' },
						{ label: 'charcoal', value: 'charcoal' },
						{ label: 'off-white', value: 'off-white' },
						{ label: 'blueDianneLightMode', value: 'blueDianneLightMode' },
						{ label: 'blueDianneDarkMode', value: 'blueDianneDarkMode' },
						{ label: 'silverTreeLightMode', value: 'silverTreeLightMode' },
						{ label: 'silverTreeDarkMode', value: 'silverTreeDarkMode' },
						{ label: 'aquaBlueLightMode', value: 'aquaBlueLightMode' },
						{ label: 'aquaBlueDarkMode', value: 'aquaBlueDarkMode' },
						{ label: 'paleGreyLightMode', value: 'paleGreyLightMode' },
						{ label: 'paleGreyDarkMode', value: 'paleGreyDarkMode' },
						{ label: 'paleBlueLilyLightMode', value: 'paleBlueLilyLightMode' },
						{ label: 'paleBlueLilyDarkMode', value: 'paleBlueLilyDarkMode' },
						{ label: 'darkGreyLightMode', value: 'darkGreyLightMode' },
						{ label: 'darkGreyDarkMode', value: 'darkGreyDarkMode' }
					],
					onChange: function ( value ) {
						setAttributes( { colourDisplay: value } );
					}
				} ),
				el( SelectControl, {
					label: __( 'Container Layout', 'bnpp-custom-blocks' ),
					value: layout,
					options: [
						{ label: 'default', value: '' },
						{ label: 'contained', value: 'contained' },
						{ label: 'full-width', value: 'full-width' },
						{ label: 'narrow', value: 'narrow' }
					],
					onChange: function ( value ) {
						setAttributes( { layout: value } );
					}
				} )
			),
			el(
				PanelBody,
				{ title: __( 'Button', 'bnpp-custom-blocks' ), initialOpen: false },
				el( TextControl, {
					label: __( 'Button Text', 'bnpp-custom-blocks' ),
					value: buttonOptions.buttonText || '',
					onChange: function ( value ) {
						updateButtonOption( 'buttonText', value );
					}
				} ),
				el( TextControl, {
					label: __( 'Button URL', 'bnpp-custom-blocks' ),
					value: buttonOptions.buttonUrl || '',
					onChange: function ( value ) {
						updateButtonOption( 'buttonUrl', value );
					}
				} ),
				el( TextControl, {
					label: __( 'Button Aria Label', 'bnpp-custom-blocks' ),
					value: buttonOptions.buttonAriaLabel || '',
					onChange: function ( value ) {
						updateButtonOption( 'buttonAriaLabel', value );
					}
				} ),
				el( SelectControl, {
					label: __( 'Button Color Scheme', 'bnpp-custom-blocks' ),
					value: buttonOptions.buttonColorScheme || 'primary',
					options: [
						{ label: 'primary', value: 'primary' },
						{ label: 'secondary', value: 'secondary' },
						{ label: 'tertiary', value: 'tertiary' }
					],
					onChange: function ( value ) {
						updateButtonOption( 'buttonColorScheme', value );
					}
				} ),
				el( ToggleControl, {
					label: __( 'Open In New Tab', 'bnpp-custom-blocks' ),
					checked: !! buttonOptions.openInNewTab,
					onChange: function ( value ) {
						updateButtonOption( 'openInNewTab', value ? '_blank' : '' );
					}
				} ),
				el( ToggleControl, {
					label: __( 'Show Button Icon', 'bnpp-custom-blocks' ),
					checked: !! buttonOptions.showButtonIcon,
					onChange: function ( value ) {
						updateButtonOption( 'showButtonIcon', value );
					}
				} )
			),
			el(
				PanelBody,
				{ title: __( 'HTML Anchor', 'bnpp-custom-blocks' ), initialOpen: false },
				el( TextControl, {
					label: __( 'HTML Anchor', 'bnpp-custom-blocks' ),
					value: anchor,
					onChange: function ( value ) {
						setAttributes( { anchor: value } );
					}
				} )
			)
		);
	}

	function Edit( props ) {
		var attributes    = props.attributes;
		var setAttributes = props.setAttributes;

		var headingLevel  = attributes.headingLevel;
		var cover         = attributes.cover;
		var colourDisplay = attributes.colourDisplay;
		var layout        = attributes.layout;
		var heading       = attributes.heading;
		var text          = attributes.text;
		var columnLayout  = attributes.columnLayout;

		var blockProps = useBlockProps( {
			className: 'statistics-block ' + layout + ' ' + colourDisplay + ' ' + columnLayout
		} );

		var HeadingTag = 'h' + ( headingLevel || 2 );

		if ( cover ) {
			return el( 'img', { src: cover, width: '100%' } );
		}

		var headingToolbar = el(
			BlockControls,
			null,
			el(
				ToolbarGroup,
				null,
				el(
					ToolbarButton,
					{
						icon: 'heading',
						label: __( 'H2' ),
						isActive: headingLevel === 2 || ! headingLevel,
						onClick: function () {
							setAttributes( { headingLevel: 2 } );
						}
					},
					'H2'
				),
				el(
					ToolbarButton,
					{
						icon: 'heading',
						label: __( 'H3' ),
						isActive: headingLevel === 3,
						onClick: function () {
							setAttributes( { headingLevel: 3 } );
						}
					},
					'H3'
				)
			)
		);

		var content = el(
			'div',
			{ className: 'statistics-block__content' },
			el( RichText, {
				tagName: HeadingTag,
				className: 'statistics-block__heading',
				value: heading,
				onChange: function ( newHeading ) {
					setAttributes( { heading: newHeading } );
				},
				placeholder: __( 'Heading...' ),
				allowedFormats: []
			} ),
			el( RichText, {
				tagName: 'p',
				className: 'statistics-block__text',
				value: text,
				onChange: function ( newText ) {
					setAttributes( { text: newText } );
				},
				placeholder: __( 'Text content...' ),
				allowedFormats: [ 'core/link', 'core/subscript', 'core/superscript' ]
			} )
		);

		var statistics = el(
			'div',
			{ className: 'statistics-block__statistics' },
			el( InnerBlocks, { allowedBlocks: ALLOWED_BLOCKS } )
		);

		var container = el(
			'div',
			{ className: 'bnpp-container' },
			content,
			statistics
		);

		return el(
			'section',
			blockProps,
			headingToolbar,
			el( ColumnLayoutControl, props ),
			el( SettingsControls, props ),
			container
		);
	}

	function Save() {
		return el( InnerBlocks.Content, null );
	}

	blocks.registerBlockType( blockName, {
		apiVersion: 2,
		title: __( 'Rebrand Statistic Bloc', 'bnpp-custom-blocks' ),
		description: __( 'A block to show statistics', 'bnpp-custom-blocks' ),
		category: 'new-blocks',
		icon: 'editor-ol-rtl',
		attributes: blockAttributes,
		supports: { anchor: false, inserter: true },
		edit: Edit,
		save: Save
	} );
} )( window.wp );
