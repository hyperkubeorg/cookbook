// Utility to get the base path for React Router
export function getBasePath(): string {
    // In production builds, Vite injects the base path as a global
    const viteBase = import.meta.env.BASE_URL;
    
    // Remove trailing slash for React Router basename (it handles that)
    return viteBase.endsWith('/') ? viteBase.slice(0, -1) : viteBase;
}