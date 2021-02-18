/* eslint-disable */ 
module.exports = {
	root: true,
	env: {
		node: true
	},
	extends: [
		"airbnb-base",
		"plugin:import/errors",
		"plugin:import/warnings",
		"plugin:import/typescript",
		"plugin:@typescript-eslint/recommended",
        "prettier/@typescript-eslint",
        "plugin:prettier/recommended"
	],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: ['./typescript/tsconfig.eslint.json'],
		sourceType: "module",
        tsconfigRootDir: __dirname
	},
	plugins: [
		"import",
		"@typescript-eslint",
        "prettier"
	],
	rules: {
		"@typescript-eslint/no-non-null-assertion": "off",
		"@typescript-eslint/naming-convention": [
			"error",
			{
				"selector": "interface",
				"format": ["PascalCase"],
				"prefix": ["I"]
			}
		],
		"@typescript-eslint/ban-ts-comment": ["error", {
			"ts-ignore": false
		}],
		"@typescript-eslint/indent": ["off"],
		"@typescript-eslint/semi": ["error"],
		"import/extensions": ["error", "ignorePackages", {
			"js": "never",
			"ts": "never"
		}],
		"import/prefer-default-export": "off",
        "import/no-default-export": ["error"],
        "import/no-cycle": "off",
        "import/no-unresolved": "off",
		"no-restricted-syntax": ["error", "WithStatement"],
		"linebreak-style": ["error", "unix"],
		"comma-dangle": ["error", "never"],
		"no-param-reassign": ["error", {
			"props": false
		}],
		"no-dupe-class-members": "off",
		"no-await-in-loop": "off",
		"arrow-parens": "off",
		"no-continue": "off",
		"no-tabs": ["error", {
			"allowIndentationTabs": true
        }],
		"indent": "off",
        "eol-last": "off",
        "max-len": ["error", { "code": 150 }],
        "no-shadow": "off"
	},
	overrides: [
		{
			files: ["{apps,packages,tools}/*/test/**/*.test.ts"],
			env: {
				jest: true
			}
		}
	]
}
