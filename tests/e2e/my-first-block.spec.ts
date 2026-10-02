import { expect, test } from '@wordpress/e2e-test-utils-playwright';

test( 'a post displays the saved My First Block content', async ( {
	admin,
	editor,
	page,
	requestUtils,
} ) => {
	await requestUtils.activateTheme( 'twentytwentyfive' );
	await requestUtils.activatePlugin( 'base-plugin' );

	const title = `E2E My First Block ${ Date.now() }`;
	await admin.createNewPost( { title } );
	await editor.insertBlock( { name: 'balw-plugin/my-first-block' } );
	await editor.canvas
		.locator( '[data-type="balw-plugin/my-first-block"]' )
		.fill( 'Playwright verifies this block.' );

	const postId = await editor.publishPost();
	expect( postId ).not.toBeNull();

	try {
		await page.goto( `/wp-admin/post.php?post=${ postId }&action=edit` );
		await expect(
			editor.canvas.locator( '[data-type="balw-plugin/my-first-block"]' )
		).toContainText( 'Playwright verifies this block.' );

		const post = await requestUtils.rest< { link: string } >( {
			path: `/wp/v2/posts/${ postId }`,
		} );
		await page.goto( post.link );
		await expect(
			page.locator( '.wp-block-balw-plugin-my-first-block' )
		).toContainText( 'Playwright verifies this block.' );
	} finally {
		if ( postId ) {
			await requestUtils.rest( {
				path: `/wp/v2/posts/${ postId }`,
				method: 'DELETE',
				params: { force: true },
			} );
		}
	}
} );
