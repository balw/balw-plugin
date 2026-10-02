import { expect, test } from 'vitest';

import metadata from '../block.json';

test( 'defines the block name and default content', () => {
	expect( metadata.name ).toBe( 'balw-plugin/my-first-block' );
	expect( metadata.attributes.content.default ).toBe( '' );
} );
