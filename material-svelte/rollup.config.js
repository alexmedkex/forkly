import svelte from 'rollup-plugin-svelte';
import sveltePreprocessor from 'svelte-preprocess'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from 'rollup-plugin-babel'
import typescript from "rollup-plugin-typescript2"
import typescriptCompiler from "typescript"

export default {
    input: 'src/main.js',
    output: {
        file: 'public/bundle.js',
        format: 'iife'
    },
    plugins: [

        svelte({
            include: ['src/**/*.svelte', 'src/main.js'],
            preprocess: sveltePreprocessor(),
        }),

        resolve({
            browser: true,
            dedupe: ['svelte']
        }),

        typescript({ typescript: typescriptCompiler }),

        commonjs(),

        babel({
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
    ]


}