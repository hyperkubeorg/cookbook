import '@/App.css'

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import { Routes, Route, BrowserRouter } from "react-router-dom";

import NotFoundPage from '@/components/pages/404';
import DocPage from '@/components/pages/DocPage';
import BlogPage from '@/components/pages/BlogPage';
import ScrollToTop from '@/components/layout/ScrollToTop';
import { getBasePath } from '@/utils/basePath';

const theme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: '#90caf9',
        },
        background: {
            default: '#121212',
            paper: '#1e1e1e',
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
    },
});

export default function App() {
    const basePath = getBasePath();
    
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter basename={basePath}>
                <ScrollToTop />
                <Routes>
                    {/* Root redirects to getting-started */}
                    <Route path="/" element={<DocPage />} />
                    
                    {/* Blog routes - support both with and without trailing slash */}
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/blog/" element={<BlogPage />} />
                    <Route path="/blog/:slug" element={<BlogPage />} />
                    <Route path="/blog/:slug/" element={<BlogPage />} />
                    
                    {/* Dynamic documentation routes - support both with and without trailing slash */}
                    <Route path="/:slug" element={<DocPage />} />
                    <Route path="/:slug/" element={<DocPage />} />

                    {/* Explicit 404 route */}
                    <Route path="/404" element={<NotFoundPage />} />
                    <Route path="/404/" element={<NotFoundPage />} />

                    {/* Catch-all 404 Route - MUST REMAIN AT BOTTOM */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}
