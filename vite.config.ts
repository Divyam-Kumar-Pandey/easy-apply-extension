import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy';
import tailwindcss from '@tailwindcss/vite' 
import hotReloadExtension from 'hot-reload-extension-vite';

export default defineConfig({
  plugins: [
    hotReloadExtension({
      log: true,
      backgroundPath: 'public/background.js' // relative path to background script file
    }),
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: ['public/manifest.json', 'public/content-script.js', 'public/background.js', 'public/icons'],
          dest: '.',
        },
      ],
    }),
  ],
  build: {
    outDir: 'build',
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
});