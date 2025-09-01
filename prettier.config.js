/** @type {import('prettier').Config} */
export default {
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  useTabs: false,
  printWidth: 80,
  trailingComma: "es5",
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "avoid",
  endOfLine: "lf",
  plugins: ["prettier-plugin-tailwindcss"],
  // tailwindcss
  tailwindAttributes: ["theme"],
  tailwindFunctions: ["twMerge", "createTheme"],
  overrides: [
    {
      files: "*.{js,jsx,ts,tsx}",
      options: {
        parser: "typescript",
      },
    },
    {
      files: "*.{json,jsonc}",
      options: {
        parser: "json",
      },
    },
    {
      files: "*.{scss,css}",
      options: {
        parser: "scss",
      },
    },
  ],
};
