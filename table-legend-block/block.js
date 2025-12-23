(function(wp) {
    var el = wp.element.createElement;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var Button = wp.components.Button;
    var TextControl = wp.components.TextControl;
    var SelectControl = wp.components.SelectControl;

    registerBlockType('custom/table-legend', {
        title: 'Tableau avec Légende',
        icon: 'grid-view',
        category: 'common',
        attributes: {
            showLegend: {
                type: 'boolean',
                default: true
            },
            rows: {
                type: 'array',
                default: [
                    { col1: '', col2: '', col3: '', color: '' }
                ]
            }
        },

        edit: function(props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;

            function updateRow(index, field, value) {
                var newRows = attributes.rows.slice();
                newRows[index][field] = value;
                setAttributes({ rows: newRows });
            }

            function addRow() {
                var newRows = attributes.rows.slice();
                newRows.push({ col1: '', col2: '', col3: '', color: '' });
                setAttributes({ rows: newRows });
            }

            function removeRow(index) {
                if (attributes.rows.length > 1) {
                    var newRows = attributes.rows.slice();
                    newRows.splice(index, 1);
                    setAttributes({ rows: newRows });
                }
            }

            return [
                el(InspectorControls, {},
                    el(PanelBody, { title: 'Paramètres du tableau', initialOpen: true },
                        el(ToggleControl, {
                            label: 'Afficher la légende',
                            checked: attributes.showLegend,
                            onChange: function(value) {
                                setAttributes({ showLegend: value });
                            }
                        })
                    )
                ),
                el('div', { className: 'table-legend-block-editor' },
                    attributes.showLegend && el('div', { 
                        className: 'table-legend',
                        style: { 
                            padding: '10px',
                            backgroundColor: '#f0f0f0',
                            marginBottom: '15px',
                            borderRadius: '4px'
                        }
                    },
                        el('strong', {}, 'Légende : '),
                        'Ce tableau présente des informations importantes organisées en colonnes.'
                    ),
                    el('table', { 
                        className: 'custom-table',
                        style: { 
                            width: '100%',
                            borderCollapse: 'collapse',
                            border: '1px solid #ddd'
                        }
                    },
                        el('thead', {},
                            el('tr', { 
                                className: 'header-row',
                                style: { backgroundColor: '#999', color: 'white' }
                            },
                                el('th', { style: { padding: '10px', border: '1px solid #ddd' } }, 'Colonne 1'),
                                el('th', { style: { padding: '10px', border: '1px solid #ddd' } }, 'Colonne 2'),
                                el('th', { style: { padding: '10px', border: '1px solid #ddd' } }, 'Colonne 3')
                            )
                        ),
                        el('tbody', {},
                            attributes.rows.map(function(row, index) {
                                return el('tr', { key: index, className: 'content-row' },
                                    el('td', { style: { padding: '10px', border: '1px solid #ddd' } },
                                        el(TextControl, {
                                            value: row.col1,
                                            onChange: function(value) {
                                                updateRow(index, 'col1', value);
                                            },
                                            placeholder: 'Contenu colonne 1'
                                        })
                                    ),
                                    el('td', { 
                                        style: { 
                                            padding: '10px', 
                                            border: '1px solid #ddd',
                                            backgroundColor: row.color || 'transparent'
                                        }
                                    },
                                        el(TextControl, {
                                            value: row.col2,
                                            onChange: function(value) {
                                                updateRow(index, 'col2', value);
                                            },
                                            placeholder: 'Contenu colonne 2'
                                        }),
                                        el(SelectControl, {
                                            label: 'Couleur de fond',
                                            value: row.color,
                                            options: [
                                                { label: 'Aucune', value: '' },
                                                { label: 'Bleu clair', value: '#E3F2FD' },
                                                { label: 'Vert clair', value: '#E8F5E9' },
                                                { label: 'Jaune clair', value: '#FFF9C4' }
                                            ],
                                            onChange: function(value) {
                                                updateRow(index, 'color', value);
                                            }
                                        })
                                    ),
                                    el('td', { style: { padding: '10px', border: '1px solid #ddd' } },
                                        el('div', { style: { display: 'flex', gap: '10px', alignItems: 'flex-start' } },
                                            el(TextControl, {
                                                value: row.col3,
                                                onChange: function(value) {
                                                    updateRow(index, 'col3', value);
                                                },
                                                placeholder: 'Contenu colonne 3',
                                                style: { flex: '1' }
                                            }),
                                            attributes.rows.length > 1 && el(Button, {
                                                isDestructive: true,
                                                isSmall: true,
                                                onClick: function() {
                                                    removeRow(index);
                                                }
                                            }, '✕')
                                        )
                                    )
                                );
                            })
                        )
               s     ),
                    el('div', { style: { marginTop: '10px' } },
                        el(Button, {
                            isPrimary: true,
                            onClick: addRow
                        }, 'Ajouter une ligne')
                    )
                )
            ];
        },

        save: function() {
            return null; // Rendu côté serveur
        }
    });
})(window.wp);