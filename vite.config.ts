import { reactRouter } from '@react-router/dev/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
// @ts-expect-error No types for vite-plugin-eslint
import eslint from 'vite-plugin-eslint'

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths(), eslint({ fix: true })],
})
