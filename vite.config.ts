import { reactRouter } from '@react-router/dev/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
// @ts-expect-error No types for vite-plugin-eslint
import eslint from 'vite-plugin-eslint'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [
    reactRouter(),
    tsconfigPaths(),
    eslint({ fix: true }),
    tailwindcss(),
    svgr({
      svgrOptions: {
        exportType: 'default',
      },
    }),
  ],
})
