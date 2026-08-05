import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

/**
 * Edit view for a single accordion list column.
 * Holds one list of accordion modules. The parent Accordion Block can
 * render either one or two of these side by side.
 */
const Edit = () => {
    const blockProps = useBlockProps({
        className: 'rebrand-accordion-column',
    });

    return (
        <div {...blockProps}>
            <InnerBlocks
                allowedBlocks={['bnpp-custom-blocks/bnpp-rebrand-accordion-module']}
                renderAppender={() => <InnerBlocks.ButtonBlockAppender />}
                template={[['bnpp-custom-blocks/bnpp-rebrand-accordion-module', {}]]}
            />
        </div>
    );
};

export default Edit;
