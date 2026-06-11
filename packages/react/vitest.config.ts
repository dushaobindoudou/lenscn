import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      // Registry components live at the repo root; resolve their bare
      // imports from this package's node_modules so vitest can find them.
      react: path.resolve(here, 'node_modules/react'),
      'react-dom': path.resolve(here, 'node_modules/react-dom'),
      '@lenscn/react': path.resolve(here, 'src'),
      lenscn: path.resolve(here, '../../packages/lenscn/src'),
    },
  },
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
