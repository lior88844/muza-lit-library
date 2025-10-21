import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import flowbiteReact from 'flowbite-react/plugin/vite'
import eslint from 'vite-plugin-eslint'

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths(), flowbiteReact(), eslint({ fix: true })],
})
