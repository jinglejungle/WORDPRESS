( function ( wp ) {
	var blocks      = wp.blocks;
	var element     = wp.element;
	var blockEditor = wp.blockEditor;
	var components  = wp.components;
	var i18n        = wp.i18n;

	var el = element.createElement;
	var __ = i18n.__;

	var useBlockProps     = blockEditor.useBlockProps;
	var RichText          = blockEditor.RichText;
	var InspectorControls = blockEditor.InspectorControls;

	var PanelBody      = components.PanelBody;
	var SelectControl  = components.SelectControl;
	var NumberControl  = components.__experimentalNumberControl || components.NumberControl;
	var Tooltip        = components.Tooltip;
	var Button         = components.Button;
	var Flex           = components.Flex;
	var FlexItem       = components.FlexItem;

	var blockName = 'bnpp-custom-blocks/bnpp-rebrand-statistics-module';

	// Lego brick style icon.
	var brickIcon = el(
		'svg',
		{ width: 24, height: 24, viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
		el( 'rect', { x: 3.5, y: 9, width: 17, height: 10.5, rx: 1.5, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 } ),
		el( 'rect', { x: 6.5, y: 5, width: 4, height: 4, rx: 1, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 } ),
		el( 'rect', { x: 13.5, y: 5, width: 4, height: 4, rx: 1, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 } )
	);

	// Inline info icon (avoids a dependency on the wp-icons script).
	var infoIcon = el(
		'svg',
		{ width: 24, height: 24, viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
		el( 'path', { d: 'M12 3.2c-4.8 0-8.8 3.9-8.8 8.8 0 4.8 3.9 8.8 8.8 8.8 4.8 0 8.8-3.9 8.8-8.8 0-4.8-4-8.8-8.8-8.8zm0 16c-4 0-7.2-3.3-7.2-7.2C4.8 8 8 4.8 12 4.8s7.2 3.3 7.2 7.2c0 4-3.2 7.2-7.2 7.2zM11 17h2v-6h-2v6zm0-8h2V7h-2v2z' } )
	);

	var blockAttributes = {
		title: { type: 'string', default: '' },
		statisticUnit: { type: 'string', default: '' },
		value: { type: 'string', default: '' },
		statistic: { type: 'number', default: 0 },
		prefixText: { type: 'string', default: '' },
		displayType: { type: 'string', default: 'default', enum: [ 'default', 'animated' ] }
	};

	function Edit( props ) {
		var attributes    = props.attributes;
		var setAttributes = props.setAttributes;
		var isSelected    = props.isSelected;

		var title         = attributes.title;
		var statisticUnit = attributes.statisticUnit;
		var prefixText    = attributes.prefixText;
		var value         = attributes.value;
		var displayType   = attributes.displayType;
		var statistic     = attributes.statistic;

		var blockProps = useBlockProps( { className: 'bnpp-statistics-module' } );

		var inspector = el(
			InspectorControls,
			null,
			el(
				PanelBody,
				{ title: __( 'Statistics Settings', 'bnpp' ) },
				el( SelectControl, {
					label: __( 'Display type', 'bnpp' ),
					value: displayType,
					options: [
						{ label: __( 'Default', 'bnpp' ), value: 'default' },
						{ label: __( 'Animated', 'bnpp' ), value: 'animated' }
					],
					onChange: function ( newVal ) {
						setAttributes( { displayType: newVal } );
					}
				} ),
				displayType === 'animated' && el( NumberControl, {
					label: el(
						Flex,
						{ align: 'center', justify: 'flex-start' },
						el( FlexItem, null, __( 'Number', 'bnpp-custom-blocks' ) ),
						el(
							FlexItem,
							null,
							el(
								Tooltip,
								{
									text: __( 'Set the number to be animated here. This cannot be edited directly in the module.', 'bnpp-custom-blocks' ),
									delay: 0
								},
								el( Button, {
									icon: infoIcon,
									label: __( 'Heading Label Info', 'bnpp-custom-blocks' ),
									style: { marginLeft: '8px' }
								} )
							)
						)
					),
					value: statistic,
					onChange: function ( num ) {
						setAttributes( { statistic: Number( num ) || 0 } );
					},
					isDragEnabled: false
				} )
			)
		);

		var prefixRichText = el( RichText, {
			tagName: 'h3',
			value: prefixText,
			onChange: function ( v ) {
				setAttributes( { prefixText: v } );
			},
			placeholder: __( 'Prefix (e.g. €)', 'bnpp' ),
			allowedFormats: [],
			className: 'bnpp-statistics-module-prefix'
		} );

		var unitRichText = el( RichText, {
			tagName: 'h3',
			value: statisticUnit,
			onChange: function ( v ) {
				setAttributes( { statisticUnit: v } );
			},
			placeholder: __( 'Suffix (e.g. %)', 'bnpp' ),
			allowedFormats: [],
			className: 'bnpp-statistics-module-unit'
		} );

		var titleRichText = el( RichText, {
			tagName: 'h3',
			value: title,
			onChange: function ( v ) {
				setAttributes( { title: v } );
			},
			placeholder: __( 'Statistics text', 'bnpp' ),
			allowedFormats: [ 'core/link', 'core/subscript', 'core/superscript' ],
			className: 'bnpp-statistics-module-value'
		} );

		var titleContainerChildren = [];

		if ( displayType === 'animated' ) {
			if ( isSelected && ! prefixText ) {
				titleContainerChildren.push( prefixRichText );
			} else if ( prefixText ) {
				titleContainerChildren.push( prefixRichText );
			}

			titleContainerChildren.push(
				el( 'h3', null, el( 'span', { className: 'bnpp-statistics-module-number' }, statistic ) )
			);

			if ( isSelected && ! statisticUnit ) {
				titleContainerChildren.push( unitRichText );
			} else if ( statisticUnit ) {
				titleContainerChildren.push( unitRichText );
			}
		}

		if ( displayType === 'default' ) {
			titleContainerChildren.push( titleRichText );
		}

		var titleContainer = el.apply(
			null,
			[ 'div', { className: 'bnpp-statistics-module-title-container' } ].concat( titleContainerChildren )
		);

		var valueRichText = el( RichText, {
			tagName: 'p',
			value: value,
			onChange: function ( v ) {
				setAttributes( { value: v } );
			},
			placeholder: __( 'Statistics value', 'bnpp' ),
			allowedFormats: [ 'core/link', 'core/subscript', 'core/superscript' ],
			className: 'bnpp-statistics-module-value'
		} );

		return el(
			'div',
			blockProps,
			inspector,
			titleContainer,
			valueRichText
		);
	}

	blocks.registerBlockType( blockName, {
		apiVersion: 2,
		title: __( 'Rebrand statistic Module', 'bnpp' ),
		description: __( 'BNPP Statistics Module', 'bnpp' ),
		category: 'new-modules',
		icon: brickIcon,
		attributes: blockAttributes,
		supports: { html: true },
		edit: Edit,
		save: function () {
			return null;
		}
	} );
} )( window.wp );
