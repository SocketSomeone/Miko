module.exports = {
	root: true,
	env: {
		node: true,
		jest: true
	},
	extends: [
		'airbnb-base',
		'plugin:import/errors',
		'plugin:import/warnings',
		'plugin:import/typescript',
		'plugin:@typescript-eslint/recommended',
		'plugin:prettier/recommended',
		'prettier'
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: ['./typescript/tsconfig.eslint.json'],
		sourceType: 'module',
		tsconfigRootDir: __dirname
	},
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly'
	},
	plugins: ['import', '@typescript-eslint', '@typescript-eslint/eslint-plugin', 'prettier'],
	rules: {
		'@typescript-eslint/no-non-null-assertion': 'off',
		'@typescript-eslint/naming-convention': [
			'error',
			{
				selector: 'interface',
				format: ['PascalCase'],
				prefix: ['I']
			}
		],
		'@typescript-eslint/ban-ts-comment': [
			'error',
			{
				'ts-ignore': false
			}
		],
		'@typescript-eslint/ban-types': ['off'],
		'@typescript-eslint/indent': ['error', 'tab'],
		'@typescript-eslint/semi': ['error'],
		'@typescript-eslint/consistent-type-imports': ['warn'],
		'@typescript-eslint/no-inferrable-types': ['error', 'ignore-params'],
		'import/extensions': [
			'error',
			'ignorePackages',
			{
				js: 'never',
				ts: 'never'
			}
		],
		'import/prefer-default-export': 'off',
		'import/no-extraneous-dependencies': 'off',
		'import/no-cycle': ['off'],
		'no-restricted-syntax': ['error', 'WithStatement'],
		'class-methods-use-this': 'off',
		'linebreak-style': ['error', 'unix'],
		'comma-dangle': ['error', 'never'],
		'no-param-reassign': [
			'error',
			{
				props: false
			}
		],
		'no-dupe-class-members': 'off',
		'no-await-in-loop': 'off',
		'arrow-parens': 'off',
		'no-continue': 'off',
		'no-tabs': [
			'error',
			{
				allowIndentationTabs: true
			}
		],
		indent: 'off',
		'eol-last': ['off'],
		'max-len': ['error', { code: 150 }],
		'no-shadow': 'off',
		'function-paren-newline': 'off',
		'consistent-return': 'off',
		'no-useless-return': 'off',
		'no-useless-constructor': 'off',
		'prettier/prettier': [
			'error',
			{
				parser: 'typescript',
				trailingComma: 'none',
				printWidth: 120,
				useTabs: true,
				tabWidth: 2,
				bracketSpacing: true,
				singleQuote: true,
				semi: true,
				arrowParens: 'avoid',
				endOfLine: 'auto'
			}
		]
	},
	overrides: [
		{
			files: ['{apps,packages}/*/test/**/*.test.ts'],
			env: {
				jest: true
			}
		}
	]
};
