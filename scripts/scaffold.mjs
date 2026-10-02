import { cp, lstat, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';

const template = path.resolve( fileURLToPath( new URL( '..', import.meta.url ) ) );
const fields = [
	[ 'name', 'Plugin name' ],
	[ 'slug', 'Plugin slug' ],
	[ 'namespace', 'PHP namespace' ],
	[ 'package', 'Composer package' ],
	[ 'description', 'Description' ],
	[ 'author', 'Author name' ],
	[ 'email', 'Author email' ],
	[ 'plugin-uri', 'Plugin URI (optional)' ],
	[ 'author-uri', 'Author URI (optional)' ],
];
const excluded = new Set( [
	'.git', 'node_modules', 'vendor', 'build', 'artifacts', '.phpcs-cache',
	'.phpstan-cache', '.phpunit.cache', '.phpunit.result.cache',
	'.wp-env.override.json', '.DS_Store',
] );

function pascalCase( value ) {
	return value.split( '-' ).filter( Boolean ).map( ( part ) => part[ 0 ].toUpperCase() + part.slice( 1 ) ).join( '' );
}

function validate( values, destination ) {
	for ( const [ key, value ] of Object.entries( values ) ) {
		if ( /[\r\n\x00-\x1f\x7f]|\*\//u.test( value ) ) {
			throw new Error( `Invalid ${ key }: use a single line without comment terminators.` );
		}
	}
	if ( ! values.name || ! values.description || ! values.author ) {
		throw new Error( 'Plugin name, description, and author are required.' );
	}
	if ( ! /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u.test( values.slug ) ) {
		throw new Error( 'Plugin slug must start with a letter and contain lowercase letters, numbers, and single hyphens.' );
	}
	if ( path.basename( destination ) !== values.slug ) {
		throw new Error( 'The destination folder name must match the plugin slug.' );
	}
	const reserved = new Set( [ 'class', 'trait', 'interface', 'enum', 'namespace', 'function', 'extends', 'implements', 'new', 'self', 'parent', 'static', 'abstract', 'final', 'public', 'protected', 'private', 'null', 'true', 'false', 'int', 'float', 'bool', 'string', 'void', 'never', 'mixed', 'object', 'array', 'callable', 'iterable', 'match', 'readonly', 'use', 'const', 'return', 'if', 'else', 'echo', 'print', 'default', 'switch', 'case', 'break', 'continue', 'while', 'do', 'for', 'foreach', 'try', 'catch', 'finally', 'throw', 'yield', 'global', 'isset', 'empty', 'unset', 'include', 'include_once', 'require', 'require_once', 'eval', 'exit', 'die', 'list', 'as', 'instanceof', 'insteadof', 'goto', 'declare', 'enddeclare', 'endif', 'endfor', 'endforeach', 'endswitch', 'endwhile', 'and', 'or', 'xor', '__halt_compiler' ] );
	if ( ! /^[A-Za-z_][A-Za-z0-9_]*(?:\\[A-Za-z_][A-Za-z0-9_]*)*$/u.test( values.namespace ) ||
		values.namespace.split( '\\' ).some( ( part ) => reserved.has( part.toLowerCase() ) ) ) {
		throw new Error( 'PHP namespace must contain valid, non-reserved identifiers separated by backslashes.' );
	}
	if ( ! /^[a-z0-9]+(?:[_.-][a-z0-9]+)*\/[a-z0-9]+(?:[_.-][a-z0-9]+)*$/u.test( values.package ) ) {
		throw new Error( 'Composer package must use the lowercase vendor/package format.' );
	}
	if ( ! /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test( values.email ) ) {
		throw new Error( 'Enter a valid author email.' );
	}
	for ( const key of [ 'plugin-uri', 'author-uri' ] ) {
		if ( values[ key ] && ! /^https?:\/\//u.test( values[ key ] ) ) {
			throw new Error( `${ key } must be an HTTP(S) URL or empty.` );
		}
		if ( values[ key ] ) {
			new URL( values[ key ] );
		}
	}
}

async function writeJson( directory, file, transform ) {
	const filename = path.join( directory, file );
	const data = JSON.parse( await readFile( filename, 'utf8' ) );
	transform( data );
	await writeFile( filename, JSON.stringify( data, null, '\t' ) + '\n' );
}

function replaceTokens( text, replacements ) {
	const escape = ( value ) => value.replace( /[.*+?^${}()|[\]\\]/gu, '\\$&' );
	const pattern = Object.keys( replacements ).sort( ( a, b ) => b.length - a.length ).map( escape ).join( '|' );
	return text.replace( new RegExp( pattern, 'gu' ), ( match ) => replacements[ match ] );
}

function xml( value ) {
	return value.replace( /[&<>"']/gu, ( character ) => ( {
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
	} )[ character ] );
}

async function customize( directory, values ) {
	const prefix = values.slug.replaceAll( '-', '_' );
	await writeJson( directory, 'package.json', ( data ) => {
		data.name = values.slug;
		data.description = values.description;
		data.author = values.author;
		delete data.scripts.scaffold;
		delete data.scripts[ 'test:scaffold' ];
		data.scripts[ 'test:integration' ] = data.scripts[ 'test:integration' ].replace( 'plugins/balw-plugin', `plugins/${ values.slug }` );
	} );
	await writeJson( directory, 'package-lock.json', ( data ) => {
		data.name = values.slug;
		data.packages[ '' ].name = values.slug;
	} );
	await writeJson( directory, 'composer.json', ( data ) => {
		data.name = values.package;
		data.description = values.description;
		data.authors = [ { name: values.author, email: values.email } ];
		data.autoload[ 'psr-4' ] = { [ `${ values.namespace }\\` ]: 'inc/' };
	} );
	const replacements = {
		'Balw\\BalwPlugin': values.namespace,
		'balw-plugin': values.slug,
		'base-plugin': values.slug,
		'balw_wp_tests_dir': `${ prefix }_wp_tests_dir`,
	};
	async function visit( folder ) {
		for ( const entry of await readdir( folder, { withFileTypes: true } ) ) {
			const filename = path.join( folder, entry.name );
			if ( entry.isDirectory() ) {
				await visit( filename );
			} else if ( /\.(?:php|tsx?|[cm]?js|scss|json|md|dist)$/u.test( entry.name ) &&
				! [ 'package.json', 'package-lock.json', 'composer.json', 'composer.lock' ].includes( entry.name ) ) {
				let text = await readFile( filename, 'utf8' );
				if ( filename === path.join( directory, 'plugin.php' ) ) {
					const headers = {
						'Plugin Name': values.name, 'Plugin URI': values[ 'plugin-uri' ],
						Description: values.description, Author: values.author,
						'Author URI': values[ 'author-uri' ],
					};
					text = replaceTokens( text, replacements );
					for ( const [ header, value ] of Object.entries( headers ) ) {
						text = text.replace( new RegExp( `^( \\* ${ header }: +).*$`, 'mu' ), ( match, start ) => ( start + value ).trimEnd() );
					}
				} else if ( filename === path.join( directory, 'phpcs.xml.dist' ) ) {
					text = replaceTokens( text, replacements );
					text = text.replace( 'name="Balw Plugin"', `name="${ xml( values.name ) }"` )
						.replace( '<element value="balw"/>', `<element value="${ prefix }"/>` )
						.replace( '<element value="balw_plugin"/>', `<element value="${ xml( values.namespace ) }"/>` );
				} else {
					text = replaceTokens( text, replacements );
				}
				if ( filename === path.join( directory, 'README.md' ) ) {
					text = text.replace( '# Base WordPress Plugin', `# ${ values.name }` );
					text = text.replace( /## Generating a plugin[\s\S]*?(?=## Getting started)/u, '' );
					text = text.replace( '\ncomposer install\n', '\ncomposer update --lock --no-install\ncomposer install\n' );
				}
				await writeFile( filename, text );
			}
		}
	}
	await visit( directory );
}

async function main() {
	const { values: options, positionals } = parseArgs( {
		allowPositionals: true,
		options: Object.fromEntries( [
			...fields.map( ( [ key ] ) => [ key, { type: 'string' } ] ),
			[ 'yes', { type: 'boolean', default: false } ],
			[ 'help', { type: 'boolean', default: false } ],
		] ),
	} );
	if ( options.help ) {
		console.log( 'Usage: npm run scaffold -- <destination> [--yes] [options]\n\nOptions:\n' +
			fields.map( ( [ key, label ] ) => `  --${ key } <value>  ${ label }` ).join( '\n' ) +
			'\n  --yes  Use defaults for omitted options (no prompts).' );
		return;
	}
	if ( positionals.length !== 1 ) {
		throw new Error( 'Provide one destination, e.g. npm run scaffold -- ../my-plugin' );
	}
	const destination = path.resolve( positionals[ 0 ] );
	const relative = path.relative( template, destination );
	if ( ! relative || ( ! relative.startsWith( `..${ path.sep }` ) && relative !== '..' && ! path.isAbsolute( relative ) ) ) {
		throw new Error( 'Choose a destination outside the skeleton.' );
	}
	try {
		await lstat( destination );
		throw new Error( 'Destination already exists; choose a new directory.' );
	} catch ( error ) {
		if ( error.code !== 'ENOENT' ) {
			throw error;
		}
	}
	if ( ! options.yes && ! process.stdin.isTTY ) {
		throw new Error( 'Use an interactive terminal or pass --yes and metadata flags.' );
	}
	const values = {};
	const prompt = options.yes ? null : createInterface( { input: process.stdin, output: process.stdout } );
	try {
		for ( const [ key, label ] of fields ) {
			const slug = values.slug || path.basename( destination );
			const defaults = {
				name: pascalCase( path.basename( destination ) ).replace( /([a-z0-9])([A-Z])/gu, '$1 $2' ),
				slug: path.basename( destination ), namespace: `Vendor\\${ pascalCase( slug ) }`,
				package: `vendor/${ slug }`, description: 'A custom WordPress plugin',
				author: 'Your Name', email: 'dev@example.com', 'plugin-uri': '', 'author-uri': '',
			};
			values[ key ] = options[ key ] ?? ( prompt
				? ( await prompt.question( `${ label } [${ defaults[ key ] }]: ` ) ).trim() || defaults[ key ]
				: defaults[ key ] );
		}
	} finally {
		prompt?.close();
	}
	validate( values, destination );
	// Create exclusively before copying so an existing directory is never overwritten.
	await mkdir( destination );
	try {
		await cp( template, destination, {
			recursive: true,
			filter: async ( source ) => {
				const relativeSource = path.relative( template, source );
				return ! excluded.has( path.basename( source ) ) &&
					! relativeSource.startsWith( `scripts${ path.sep }` ) && relativeSource !== 'scripts' &&
					! relativeSource.startsWith( `tests${ path.sep }_output` ) &&
					! source.endsWith( '.tsbuildinfo' ) && ! ( await lstat( source ) ).isSymbolicLink();
			},
		} );
		await customize( destination, values );
	} catch ( error ) {
		await rm( destination, { recursive: true, force: true } );
		throw error;
	}
	console.log( `Created ${ values.name } in ${ destination }\n\nNext steps (inside the new directory):\n` +
		'npm ci\ncomposer update --lock --no-install\ncomposer install\nnpm run build\n\n' +
		'composer update --lock refreshes root metadata without updating locked dependency versions.' );
}

main().catch( ( error ) => {
	console.error( `Scaffold failed: ${ error.message }` );
	process.exitCode = 1;
} );
