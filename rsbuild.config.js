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
      }
      return entryMap[entryName]
    },
    title: ({ entryName }) => {
      const titleMap = {
        icons: 'Icons',
        index: 'Myukee-Mania',
      }
      return titleMap[entryName]
    },
  },
  source: {
    entry: {
      index: './src/entries/index.js',
      icons: './src/entries/icons.js',
    },
    assetsInclude: /\.json$/,
  },
  server: {
    publicDir: {
      name: path.resolve(__dirname, './public'),
    },
    strictPort: true,
  },
  output: {
    distPath: '../myukee-mania-build',
  },
})
