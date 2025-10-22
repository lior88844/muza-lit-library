import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
// @ts-expect-error No types for vite-plugin-eslint
import eslint from 'vite-plugin-eslint'

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths(), , eslint({ fix: true })],
})
