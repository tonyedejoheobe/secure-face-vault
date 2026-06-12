import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

// Vite config optimized for Netlify deployment
export default defineConfig({
  plugins: [TanStackRouterVite({ autoCodeSplitting: true }), tailwindcss(), react(), tsconfigPaths()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: false,

    rollupOptions: {
      // TanStack Start uses Node-only modules in SSR code paths.
      // Vite 7 + modern dependency graphs can attempt to bundle these
      // into the client build, causing errors like:
      // "AsyncLocalStorage is not exported by __vite-browser-external".
      // Treat node:* as browser externals for client builds.
      external: ['node:async_hooks'],
    },
  },
  server: {
    port: 3000,
  },
});
