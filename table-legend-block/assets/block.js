(function(wp) {
    var el = wp.element.createElement;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var Button = wp.components.Button;
    var TextControl = wp.components.TextControl;
    var SelectControl = wp.components.SelectControl;

    registerBlockType('bnpp/table-legend', {
        title: 'BNPP Table with Legend',
        icon: 'editor-table',
        category: 'bnpp-blocks',
        attributes: {
            showLegend: {
                type: 'boolean',
                default: true
            },
            rows: {
                type: 'array',
                default: [{col1: '', col2: '', col3: '', color: ''}]
            }
        },

        edit: function(props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;

            // Update a specific field in a row
            function updateRow(index, field, value) {
                var newRows = attributes.rows.slice();
                newRows[index][field] = value;
                setAttributes({rows: newRows});
            }

            // Add a new row
            function addRow() {
                var newRows = attributes.rows.slice();
                newRows.push({col1: '', col2: '', col3: '', color: ''});
                setAttributes({rows: newRows});
            }

            // Remove a row (minimum 1 row required)
            function removeRow(index) {
                if (attributes.rows.length > 1) {
                    var newRows = attributes.rows.slice();
                    newRows.splice(index, 1);
                    setAttributes({rows: newRows});
                }
            }

            // Available color options for column 2
            var colorOptions = [
                {label: 'No color', value: ''},
                {label: 'Light red', value: '#ffcccc'},
                {label: 'Light green', value: '#ccffcc'},
                {label: 'Light blue', value: '#ccccff'}
            ];

            return [
                // Right panel controls
                el(InspectorControls, {key: 'inspector'},
                    el(PanelBody, {title: 'Table Settings'},
                        el(ToggleControl, {
                            label: 'Show Legend',
                            checked: attributes.showLegend,
                            onChange: function(value) {
                                setAttributes({showLegend: value});
                            }
                        })
                    )
                ),
                // Block content in editor
                el('div', {className: 'bnpp-table-legend-block', key: 'content'},
                    // Display legend if enabled
                    attributes.showLegend && el('div', {className: 'bnpp-table-legend'},
                        el('strong', {}, 'Table Legend:'),
                        el('br'),
                        'This is a static legend that explains the content of the table below.'
                    ),
                    // Table structure
                    el('table', {className: 'bnpp-custom-table'},
                        // Table header
                        el('thead', {},
                            el('tr', {className: 'bnpp-header-row'},
                                el('th', {}, 'Column 1'),
                                el('th', {}, 'Column 2'),
                                el('th', {}, 'Column 3')
                            )
                        ),
                        // Table body with content rows
                        el('tbody', {},
                            attributes.rows.map(function(row, index) {
                                return el('tr', {key: index, className: 'bnpp-content-row'},
                                    // Column 1
                                    el('td', {},
                                        el(TextControl, {
                                            value: row.col1,
                                            onChange: function(value) {
                                                updateRow(index, 'col1', value);
                                            },
                                            placeholder: 'Column 1 text'
                                        })
                                    ),
                                    // Column 2 with color selector
                                    el('td', {style: {backgroundColor: row.color}},
                                        el(TextControl, {
                                            value: row.col2,
                                            onChange: function(value) {
                                                updateRow(index, 'col2', value);
                                            },
                                            placeholder: 'Column 2 text'
                                        }),
                                        el(SelectControl, {
                                            value: row.color,
                                            options: colorOptions,
                                            onChange: function(value) {
                                                updateRow(index, 'color', value);
                                            },
                                            label: 'Background color'
                                        })
                                    ),
                                    // Column 3 with delete button
                                    el('td', {},
                                        el(TextControl, {
                                            value: row.col3,
                                            onChange: function(value) {
                                                updateRow(index, 'col3', value);
                                            },
                                            placeholder: 'Column 3 text'
                                        }),
                                        el(Button, {
                                            isDestructive: true,
                                            onClick: function() {
                                                removeRow(index);
                                            },
                                            disabled: attributes.rows.length === 1,
                                            style: {marginTop: '5px'}
                                        }, 'Delete')
                                    )
                                );
                            })
                        )
                    ),
                    // Add row button
                    el(Button, {
                        isPrimary: true,
                        onClick: addRow,
                        style: {marginTop: '10px'}
                    }, 'Add Row')
                )
            ];
        },

        save: function() {
            return null; // Server-side rendering
        }
    });
})(window.wp);