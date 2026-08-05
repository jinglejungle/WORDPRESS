import { __ } from '@wordpress/i18n';
import { useBlockProps, InnerBlocks, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, CheckboxControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { 
    ColorDisplayControl,
    Container,
    HtmlAnchorControl
 } from '../../components';


const Edit = (props) => {
    const { attributes, setAttributes } = props;
    const { 
        cover, 
        colourDisplay,
        fullWidth
    } = attributes;
    const blockProps = useBlockProps({
        className: `rebrand-accordion-block ${colourDisplay}`,
    });

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
                <HtmlAnchorControl {...props} />
            </InspectorControls>
            <ColorDisplayControl
                value={colourDisplay}
                onChange={(colourDisplay) => setAttributes({ colourDisplay })}
            />
            <Container>
                <div className="rebrand-accordion-block__list">
                    <InnerBlocks 
                        allowedBlocks={['bnpp-custom-blocks/bnpp-rebrand-accordion-module']} 
                        renderAppender={() => <InnerBlocks.ButtonBlockAppender />}
                        template={[['bnpp-custom-blocks/bnpp-rebrand-accordion-module', {}]]}
                    />
                </div>
            </Container>
        </section>
    );
};

export default Edit;