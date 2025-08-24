import path from "path"

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    // Set base path based on deployment environment
    // For GitHub Pages: use '/cookbook/'
    // For custom domain: use '/'
    base: process.env.VITE_BASE_PATH || '/',
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        proxy: {
            // this is a proxy for the backend during development
            // it will forward requests from /api to the backend server
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                // strip the /api prefix
                // rewrite: (path) => path.replace(/^\/api/, ''),
            },
        },
    },
})
