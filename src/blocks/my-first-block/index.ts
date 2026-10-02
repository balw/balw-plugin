import { registerBlockType } from '@wordpress/blocks';
import type { BlockConfiguration } from '@wordpress/blocks';

import metadata from './block.json';
import Edit from './edit';
import type { Attributes } from './types';

import './style.scss';
import './editor.scss';

registerBlockType< Attributes >( metadata as BlockConfiguration< Attributes >, {
	edit: Edit,
	save: () => null,
} );
