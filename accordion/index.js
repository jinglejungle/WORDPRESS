import { registerBlockType } from '@wordpress/blocks';
import edit from './edit';
import save from './save';
import metadata from './block.json';
import './style.scss';
import './editor.scss';
import coverImg from './cover.png';

registerBlockType(metadata.name, {
    ...metadata,
    example: {
        attributes: {
            cover: coverImg,
        },
    },
    edit,
    save,
});