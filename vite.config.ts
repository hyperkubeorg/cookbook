import path from "path"
import fs from "fs"
import yaml from 'js-yaml'

import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Function to automatically discover routes from docs and blog files
function discoverRoutes(): string[] {
    const routes = [
        '/',      // Home page
        '/blog',  // Blog index
        '/404'    // 404 page
    ];
    
    try {
        // Get all doc files and create routes
        const docsDir = path.join(__dirname, 'src/docs');
        if (fs.existsSync(docsDir)) {
            const docFiles = fs.readdirSync(docsDir)
                .filter(file => file.endsWith('.md'))
                .map(file => `/${file.replace('.md', '')}`);
            routes.push(...docFiles);
        }
        
        // Get all blog files and create routes
        const blogDir = path.join(__dirname, 'src/blog');
        if (fs.existsSync(blogDir)) {
            const blogFiles = fs.readdirSync(blogDir)
                .filter(file => file.endsWith('.md'))
                .map(file => `/blog/${file.replace('.md', '')}`);
            routes.push(...blogFiles);
        }
    } catch (error) {
        console.warn('Error discovering routes:', error);
    }
    
    console.log('Auto-discovered routes:', routes);
    return routes;
}

// Simple plugin to copy index.html to all discovered routes
function createStaticFilesPlugin(): Plugin {
    return {
        name: 'create-static-files',
        closeBundle() {
            const routes = discoverRoutes();
            const distDir = path.join(__dirname, 'dist');
            const indexHtml = path.join(distDir, 'index.html');
            
            if (!fs.existsSync(indexHtml)) {
                console.warn('index.html not found in dist directory');
                return;
            }
            
            const indexContent = fs.readFileSync(indexHtml, 'utf-8');
            
            routes.forEach(route => {
                if (route === '/') return; // Skip root, already handled
                
                const routeDir = path.join(distDir, route);
                const routeFile = path.join(routeDir, 'index.html');
                
                // Create directory if it doesn't exist
                fs.mkdirSync(routeDir, { recursive: true });
                
                // Copy index.html to route directory
                fs.writeFileSync(routeFile, indexContent);
                console.log(`Created: ${routeFile}`);
            });
        }
    };
}

// Load base path from menu configuration
function getBasePathFromConfig(): string {
    try {
        const menuYamlPath = path.join(__dirname, 'src/config/menu.yaml');
        const menuYaml = fs.readFileSync(menuYamlPath, 'utf8');
        const config = yaml.load(menuYaml) as any;
        const basePath = config?.settings?.basePath || '/';
        console.log(`Loaded base path from menu.yaml: ${basePath}`);
        return basePath;
    } catch (error) {
        console.warn(`Failed to load base path from menu.yaml: ${error}, using default: /`);
        return '/';
    }
}

const BASE_PATH = getBasePathFromConfig();

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        createStaticFilesPlugin()
    ],
    // Base path for deployment - configured at top of file
    base: BASE_PATH,
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
