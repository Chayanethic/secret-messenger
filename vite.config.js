import { defineConfig } from 'vite';
import { resolve } from 'path';
import dotenv from 'dotenv';

dotenv.config(); // Load .env explicitly

export default defineConfig({
  root: 'public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html'),
        writer: resolve(__dirname, 'public/writer.html')
      }
    }
  },
  server: {
    port: 5173
  },
  resolve: {
    alias: {
      '/app.js': resolve(__dirname, 'src/app.js'),
      '/writer.js': resolve(__dirname, 'src/writer.js'),
      '/firebase.js': resolve(__dirname, 'src/firebase.js')
    }
  }
});