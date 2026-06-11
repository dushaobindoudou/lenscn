import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  server: { port: 5181 },
  plugins: [react()],
  resolve: {
    alias: {
      // The registry lives at the repo root; bare imports inside those
      // files need to resolve from the demo's own node_modules tree.
      react: path.resolve(here, 'node_modules/react'),
      'react-dom': path.resolve(here, 'node_modules/react-dom'),
      '@lenscn/react': path.resolve(here, '../../packages/react/src'),
      lenscn: path.resolve(here, '../../packages/lenscn/src'),
    },
  },
})
