import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { powerApps } from "@microsoft/power-apps-vite/plugin"

export default defineConfig({
  plugins: [react(), powerApps()],
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    rollupOptions: {
      treeshake: 'smallest',
      output: {
        generatedCode: 'es2015',
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
        },
      },
    },
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
})
