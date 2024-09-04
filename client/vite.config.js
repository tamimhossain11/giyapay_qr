import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react(),nodePolyfills({
    include: ['crypto', 'process', 'stream', 'util'],
    globals: { global: true, process: true },
  }),],
  optimizeDeps: {
    include: ['jwt-decode'],
  },
});
