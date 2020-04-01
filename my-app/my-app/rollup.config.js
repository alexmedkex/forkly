import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import commonjs from '@rollup/plugin-commonjs'
import svelte from 'rollup-plugin-svelte'
import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'
import config from 'sapper/config/rollup.js'
import pkg from './package.json'
import postcss from 'rollup-plugin-postcss'
import sveltePreprocess from 'svelte-preprocess'
import typescript from "rollup-plugin-typescript2"
import typescriptCompiler from "typescript"

const preprocess = sveltePreprocess({
	scss: {
		includePaths: ['src', 'node_modules'],
	},
	postcss: {
		plugins: [require('autoprefixer')],
	},
});

const mode = process.env.NODE_ENV;
const dev = mode === 'development';
const legacy = !!process.env.SAPPER_LEGACY_BUILD;

const onwarn = (warning, onwarn) => (warning.code === 'CIRCULAR_DEPENDENCY' && /[/\\]@sapper[/\\]/.test(warning.message)) || onwarn(warning);

export default {
	client: {
		input: config.client.input(),
		output: config.client.output(),
		plugins: [
			replace({
				'process.browser': true,
				'process.env.NODE_ENV': JSON.stringify(mode)
			}),

			svelte({
				dev,
				hydratable: true,
				preprocess
			}),
			resolve({
				browser: true,
				dedupe: importee => importee === 'svelte' || importee.startsWith('svelte/')
			}),

			typescript({ typescript: typescriptCompiler }),

			commonjs(),

			legacy && babel({
				extensions: ['.js', '.mjs', '.html', '.svelte'],
				runtimeHelpers: true,
				exclude: ['node_modules/@babel/**'],
				presets: [
					['@babel/preset-env', {
						targets: '> 0.25%, not dead'
					}]
				],
				plugins: [
					'@babel/plugin-syntax-dynamic-import',
					['@babel/plugin-transform-runtime', {
						useESModules: true
					}]
				]
			}),

			!dev && terser({
				module: true
			}),

			postcss({
				extract: true,
				minimize: true,
				use: [
					['sass', {
						includePaths: [
							'./theme',
							'./node_modules'
						]
					}]
				]
			})
		],

		onwarn,
	},

	server: {
		input: config.server.input(),
		output: config.server.output(),
		plugins: [
			replace({
				'process.browser': false,
				'process.env.NODE_ENV': JSON.stringify(mode)
			}),

			svelte({
				generate: 'ssr',
				dev,
				preprocess
			}),
			resolve({
				dedupe: importee => importee === 'svelte' || importee.startsWith('svelte/')
			}),

			typescript({ typescript: typescriptCompiler }),
			
			commonjs(),

			postcss({
				extract: true,
				minimize: true,
				use: [
					['sass', {
						includePaths: [
							'./theme',
							'./node_modules'
						]
					}]
				]
			})
		],
		external: Object.keys(pkg.dependencies).concat(
			require('module').builtinModules || Object.keys(process.binding('natives'))
		),

		onwarn,
	},

	serviceworker: {
		input: config.serviceworker.input(),
		output: config.serviceworker.output(),
		plugins: [
			resolve(),
			replace({
				'process.browser': true,
				'process.env.NODE_ENV': JSON.stringify(mode)
			}),
			commonjs(),
			!dev && terser(),
		],

		onwarn,
	}
};