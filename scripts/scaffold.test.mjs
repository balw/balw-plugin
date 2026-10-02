import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath( new URL( './scaffold.mjs', import.meta.url ) );
function generate( destination, ...flags ) {
	return spawnSync( process.execPath, [ script, destination, '--yes', ...flags ], { encoding: 'utf8' } );
}

test( 'generates a consistently named plugin with dependencies and local files excluded', async ( t ) => {
	const temporary = await mkdtemp( path.join( os.tmpdir(), 'plugin-scaffold-' ) );
	t.after( () => rm( temporary, { recursive: true, force: true } ) );
	const destination = path.join( temporary, 'my-plugin' );
	const result = generate( destination, '--name', 'Widgets & Tools', '--namespace', 'Vendor\\MyPlugin',
		'--package', 'vendor/my-plugin', '--author', 'Your Name', '--email', 'dev@example.com' );
	assert.equal( result.status, 0, result.stderr );
	const json = async ( file ) => JSON.parse( await readFile( path.join( destination, file ), 'utf8' ) );
	const text = async ( file ) => readFile( path.join( destination, file ), 'utf8' );
	const npm = await json( 'package.json' );
	assert.equal( npm.name, 'my-plugin' );
	assert.equal( npm.scripts.scaffold, undefined );
	assert.match( npm.scripts[ 'test:integration' ], /plugins\/my-plugin/u );
	assert.deepEqual( ( await json( 'composer.json' ) ).autoload[ 'psr-4' ], { 'Vendor\\MyPlugin\\': 'inc/' } );
	assert.equal( ( await json( 'composer.json' ) ).name, 'vendor/my-plugin' );
	assert.equal( ( await json( 'package-lock.json' ) ).packages[ '' ].name, 'my-plugin' );
	assert.match( await text( 'plugin.php' ), /Plugin Name: +Widgets & Tools/u );
	assert.doesNotMatch( await text( 'plugin.php' ), /[\t ]+$/mu );
	assert.match( await text( 'inc/Bootstrap.php' ), /namespace Vendor\\MyPlugin;/u );
	assert.match( await text( 'phpcs.xml.dist' ), /name="Widgets &amp; Tools"/u );
	assert.match( await text( 'phpcs.xml.dist' ), /value="my_plugin"/u );
	assert.match( await text( 'phpcs.xml.dist' ), /value="Vendor\\MyPlugin"/u );
	assert.equal( ( await json( 'src/blocks/my-first-block/block.json' ) ).name, 'my-plugin/my-first-block' );
	assert.match( await text( 'tests/e2e/my-first-block.spec.ts' ), /activatePlugin\( 'my-plugin' \)/u );
	assert.match( await text( 'tests/integration/bootstrap.php' ), /\$my_plugin_wp_tests_dir/u );
	assert.doesNotMatch( await text( 'README.md' ), /## Generating a plugin/u );
	const entries = await readdir( destination );
	for ( const excluded of [ '.git', 'node_modules', 'vendor', 'build', 'artifacts', 'scripts' ] ) {
		assert.ok( ! entries.includes( excluded ), `${ excluded } should not be copied` );
	}
} );

test( 'defaults to a vendor-prefixed namespace and configures its PHPCS prefix', async ( t ) => {
	const temporary = await mkdtemp( path.join( os.tmpdir(), 'plugin-scaffold-' ) );
	t.after( () => rm( temporary, { recursive: true, force: true } ) );
	const destination = path.join( temporary, 'my-plugin' );
	const result = generate( destination );
	assert.equal( result.status, 0, result.stderr );
	const composer = JSON.parse( await readFile( path.join( destination, 'composer.json' ), 'utf8' ) );
	assert.deepEqual( composer.autoload[ 'psr-4' ], { 'Vendor\\MyPlugin\\': 'inc/' } );
	assert.equal( composer.name, 'vendor/my-plugin' );
	assert.match( await readFile( path.join( destination, 'inc/Bootstrap.php' ), 'utf8' ), /namespace Vendor\\MyPlugin;/u );
	assert.match( await readFile( path.join( destination, 'tests/unit/PluginTest.php' ), 'utf8' ), /namespace Vendor\\MyPlugin\\Tests\\Unit;/u );
	assert.match( await readFile( path.join( destination, 'phpcs.xml.dist' ), 'utf8' ), /value="Vendor\\MyPlugin"/u );
} );

test( 'rejects invalid metadata before creating the destination', async ( t ) => {
	const temporary = await mkdtemp( path.join( os.tmpdir(), 'plugin-scaffold-' ) );
	t.after( () => rm( temporary, { recursive: true, force: true } ) );
	const destination = path.join( temporary, 'my-plugin' );
	for ( const flags of [ [ '--namespace', 'Bad\\Class' ], [ '--slug', 'different-slug' ],
		[ '--package', 'Invalid' ], [ '--description', 'Bad */ header' ] ] ) {
		assert.notEqual( generate( destination, ...flags ).status, 0 );
	}
	assert.deepEqual( await readdir( temporary ), [] );
} );

test( 'refuses an existing destination without changing its contents', async ( t ) => {
	const temporary = await mkdtemp( path.join( os.tmpdir(), 'plugin-scaffold-' ) );
	t.after( () => rm( temporary, { recursive: true, force: true } ) );
	await writeFile( path.join( temporary, 'keep.txt' ), 'existing work' );
	const result = generate( temporary );
	assert.notEqual( result.status, 0 );
	assert.match( result.stderr, /already exists/u );
	assert.equal( await readFile( path.join( temporary, 'keep.txt' ), 'utf8' ), 'existing work' );
} );
