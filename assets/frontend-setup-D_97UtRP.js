const n=`# Frontend Setup

- JSX Kit: [Vite](https://vite.dev/) + [React](https://react.dev/)
- UI/UX: [Material UI](https://mui.com/material-ui/)
- Supporting Packages: [Material Icons](https://mui.com/material-ui/material-icons/), [Lucide](https://lucide.dev/), [React Markdown](https://www.npmjs.com/package/react-markdown)


\`\`\`bash
npm create vite@latest frontend -- --template react-ts
\`\`\`
\`\`\`bash
npm install -D @types/node @mui/material @emotion/react @emotion/styled @mui/icons-material @fontsource/roboto react-router-dom lucide lucide-react react-markdown
\`\`\`
\`\`\`bash
echo '/* App Component CSS */' > frontend/src/App.css
echo '/* Global Site CSS */' > frontend/src/index.css
rm -rf public/vite.svg
\`\`\`

\`\`\`typescript:frontend/vite.config.ts
import path from "path"

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
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
                // rewrite: (path) => path.replace(/^\\/api/, ''),
            },
        },
    },
})
\`\`\`

\`\`\`json:frontend/tsconfig.json
{
    "files": [],
    "references": [
        {
            "path": "./tsconfig.app.json"
        },
        {
            "path": "./tsconfig.node.json"
        }
    ],
    "compilerOptions": {
        "baseUrl": ".",
        "paths": {
            "@/*": [
                "./src/*"
            ]
        }
    }
}
\`\`\`

\`\`\`typescript:frontend/tsconfig.app.json
{
    "compilerOptions": {
        "baseUrl": ".",
        "paths": {
            "@/*": [
                "./src/*"
            ]
        },
        "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
        "target": "ES2020",
        "useDefineForClassFields": true,
        "lib": [
            "ES2020",
            "DOM",
            "DOM.Iterable"
        ],
        "module": "ESNext",
        "skipLibCheck": true,
        /* Bundler mode */
        "moduleResolution": "bundler",
        "allowImportingTsExtensions": true,
        "verbatimModuleSyntax": true,
        "moduleDetection": "force",
        "noEmit": true,
        "jsx": "react-jsx",
        /* Linting */
        "strict": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "erasableSyntaxOnly": true,
        "noFallthroughCasesInSwitch": true,
        "noUncheckedSideEffectImports": true
    },
    "include": [
        "src"
    ]
}
\`\`\`

\`\`\`typescript:frontend/src/App.tsx
import '@/App.css'

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import { Routes, Route, BrowserRouter } from "react-router-dom";

import NotFoundPage from '@/components/pages/404';
import TodoPage from '@/components/pages/todo';
import ScrollToTop from '@/components/layout/ScrollToTop';

const theme = createTheme({
    palette: {
        mode: "dark",
    },
});

export default function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <ScrollToTop />
                <Routes>
                    <Route path="/" element={<TodoPage />} />

                    {/* Catch-all 404 Route - MUST REMAIN AT BOTTOM */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}
\`\`\`

\`\`\`typescript:frontend/src/components/layout/ScrollToTop.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}
\`\`\`

\`\`\`typescript:skeleton/frontend/src/components/pages/404.tsx
import { useState } from 'react'
import { Box, Typography, Button } from '@mui/material';

export default function TodoPage() {
    const [count, setCount] = useState(0);

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
            <Typography variant="h3" gutterBottom>Vite + React + Material UI</Typography>
            <Box className="card" mb={2} display="flex" flexDirection="column" alignItems="center">
                <Button variant="contained" onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </Button>
                <Typography variant="body1" mt={2}>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </Typography>
            </Box>
            <Typography className="read-the-docs" color="textSecondary">
                Click on the Vite and React logos to learn more
            </Typography>
        </Box>
    );
}
\`\`\`

\`\`\`typescript:skeleton/frontend/src/components/pages/404.tsx
import { Box, Typography } from '@mui/material';

export default function NotFoundPage() {
    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
            <Typography variant="h2" color="error" gutterBottom>404 - Page Not Found</Typography>
            <Typography variant="body1">Sorry, the page you are looking for does not exist.</Typography>
        </Box>
    );
}
\`\`\``;export{n as default};
