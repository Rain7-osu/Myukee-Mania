// @ts-check
import { defineConfig } from '@rsbuild/core'
import path from 'node:path'

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  html: {
    template: ({ entryName }) => {
      const entryMap = {
        index: './entries/index.html',
        icons: './entries/icons.html',
        input: './entries/input.html',
      }
      return entryMap[entryName]
    },
    title: ({ entryName }) => {
      const titleMap = {
        icons: 'Icons',
        index: 'Myukee-Mania',
        input: 'Input',
      }
      return titleMap[entryName]
    },
  },
  source: {
    entry: {
      index: './src/entries/index.ts',
      icons: './src/entries/icons.ts',
      input: './src/entries/input.ts',
    },
    assetsInclude: /\.json$/,
  },
  server: {
    publicDir: {
      name: path.resolve(__dirname, './public'),
    },
    strictPort: true,
    port: 3000,
  },
  output: {
    distPath: '../myukee-mania-build',
  },
})
