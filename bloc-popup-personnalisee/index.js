import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import metadata from './block.json';

registerBlockType(metadata.name, {
  ...metadata,
  edit: Edit,
  save: () => null, // Utilise render.php pour le rendu
});
