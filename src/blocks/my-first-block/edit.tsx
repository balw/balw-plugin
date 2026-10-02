import { RichText, useBlockProps } from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

import type { Attributes } from './types';

/**
 * Render the block's editable text.
 *
 * @param props               Block editor properties.
 * @param props.attributes    Current block attributes.
 * @param props.setAttributes Update the block attributes.
 * @return The editor element.
 */
export default function Edit( {
	attributes,
	setAttributes,
}: BlockEditProps< Attributes > ) {
	return (
		<RichText
			{ ...useBlockProps() }
			tagName="p"
			value={ attributes.content }
			onChange={ ( content ) => setAttributes( { content } ) }
			placeholder={ __( 'Write some text…', 'balw-plugin' ) }
		/>
	);
}
