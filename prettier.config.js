/** @type {import('prettier').Config} */
export default {
  printWidth: 100,
  semi: false,
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: true,
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  endOfLine: 'auto',
  embeddedLanguageFormatting: 'auto',
  overrides: [
    {
      files: '*.{js,jsx,ts,tsx}',
      options: {
        parser: 'typescript',
      },
    },
    {
      files: '*.{json,jsonc}',
      options: {
        parser: 'json',
      },
    },
    {
      files: '*.{scss,css}',
      options: {
        parser: 'scss',
      },
    },
  ],
}
