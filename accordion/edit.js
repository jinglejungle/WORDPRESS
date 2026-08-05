import { __ } from '@wordpress/i18n';
import { useBlockProps, InnerBlocks, InspectorControls, store as blockEditorStore } from '@wordpress/block-editor';
import { PanelBody, CheckboxControl, Button } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import { 
    ColorDisplayControl,
    Container,
    HtmlAnchorControl
 } from '../../components';


const Edit = (props) => {
    const { attributes, setAttributes, clientId } = props;
    const { 
        cover, 
        colourDisplay,
        fullWidth,
        twoColumns
    } = attributes;
    const blockProps = useBlockProps({
        className: `rebrand-accordion-block ${colourDisplay} ${twoColumns ? 'two-columns' : ''}`,
    });

    // Current "column" inner blocks, used to know how many lists are already present
    const columnBlocks = useSelect(
        (select) => select(blockEditorStore).getBlocks(clientId),
        [clientId]
    );
    const { insertBlock, removeBlock } = useDispatch(blockEditorStore);

    /**
     * Add or remove the second accordion list (column).
     * Adding inserts a new empty column block; removing deletes the last column block.
     */
    const toggleSecondList = () => {
        if (twoColumns) {
            const lastColumn = columnBlocks[columnBlocks.length - 1];
            if (lastColumn) {
                removeBlock(lastColumn.clientId, false);
            }
            setAttributes({ twoColumns: false });
        } else {
            const newColumn = createBlock('bnpp-custom-blocks/rebrand-accordion-column');
            insertBlock(newColumn, columnBlocks.length, clientId, false);
            setAttributes({ twoColumns: true });
        }
    };

    if ( cover ) {
        return <img src={ cover } width={"100%"}/>;
    }

    return (
        <section {...blockProps}>
            <InspectorControls>
                <PanelBody title={__('Accordion Size', 'bnpp-custom-blocks')}>
                    <CheckboxControl 
                        checked={fullWidth}
                        onChange={(value) => setAttributes({ fullWidth: value })}
                        label={__('Set accordion to be full width?', 'bnpp-custom-blocks')}
                    />
                </PanelBody>
                <PanelBody title={__('Accordion Lists', 'bnpp-custom-blocks')}>
                    <Button
                        variant="secondary"
                        onClick={toggleSecondList}
                    >
                        {twoColumns
                            ? __('Remove second list', 'bnpp-custom-blocks')
                            : __('Add second list', 'bnpp-custom-blocks')}
                    </Button>
                </PanelBody>
                <HtmlAnchorControl {...props} />
            </InspectorControls>
            <ColorDisplayControl
                value={colourDisplay}
                onChange={(colourDisplay) => setAttributes({ colourDisplay })}
            />
            <Container>
                <div
                    className="rebrand-accordion-block__list"
                    // In the editor, keep the two "column" blocks stacked at full width
                    // (single column) instead of the front-end side-by-side layout, so
                    // there's more room to edit content. The side-by-side display is a
                    // front-end-only concern, handled by render.php + style.scss.
                    style={twoColumns ? { gridTemplateColumns: '1fr' } : undefined}
                >
                    <InnerBlocks 
                        allowedBlocks={['bnpp-custom-blocks/rebrand-accordion-column']} 
                        template={[['bnpp-custom-blocks/rebrand-accordion-column', {}]]}
                    />
                </div>
            </Container>
        </section>
    );
};

export default Edit;
