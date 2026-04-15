import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    historyApiFallback: true,
    proxy: {
      "/api": {
        target:       "http://localhost:5000",
        changeOrigin: true,
        secure:       false,
      },
    },
  },
  build: {
    outDir:    "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:  ["react", "react-dom", "react-router-dom"],
          clerk:   ["@clerk/clerk-react"],
        },
      },
    },
  },
});