import prettier from 'eslint-plugin-prettier'
import globals from 'globals'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
	baseDirectory: import.meta.url,
	recommendedConfig: js.configs.recommended
})

export default [
	{
		ignores: ['lib/**/*', 'generated/**/*', 'scripts/**/*']
	},
	...compat.extends(
		'eslint:recommended',
		'plugin:import/errors',
		'plugin:import/warnings',
		'plugin:import/typescript',
		'plugin:@typescript-eslint/recommended',
		'plugin:prettier/recommended'
	),
	{
		files: ['**/*.js', '**/*.ts'],
		plugins: {
			prettier: prettier
		},
		languageOptions: {
			globals: {
				...globals.node
			},
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module'
			}
		},
		rules: {
			'import/no-unresolved': 0,
			'prettier/prettier': ['error', { usePrettierrc: true }]
		}
	}
]
