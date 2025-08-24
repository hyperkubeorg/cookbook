import { useEffect, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import type { DocPage } from '@/utils/markdownUtils';
import { loadAllMarkdownFiles, buildMenuSections, filterPagesForSearch } from '@/utils/markdownUtils';

export default function NotFoundPage() {
    const navigate = useNavigate();
    const [allPages, setAllPages] = useState<DocPage[]>([]);
    const [searchPages, setSearchPages] = useState<DocPage[]>([]);
    const [menuSections, setMenuSections] = useState<any[]>([]);

    useEffect(() => {
        loadAllMarkdownFiles()
            .then(async (pages) => {
                setAllPages(pages);
                
                // Filter pages for search
                const filteredSearchPages = await filterPagesForSearch(pages);
                setSearchPages(filteredSearchPages);
                
                // Build menu sections from YAML config
                const sections = await buildMenuSections(pages);
                setMenuSections(sections);
            })
            .catch((err) => {
                console.error('Failed to load pages for 404:', err);
            });
    }, []);

    const handleGoHome = () => {
        navigate('/getting-started');
    };

    return (
        <MainLayout menuSections={menuSections} allPages={allPages} searchPages={searchPages}>
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="50vh" textAlign="center">
                <Typography variant="h2" color="error" gutterBottom>
                    404 - Page Not Found
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    Sorry, the page you are looking for does not exist in the Hyperkube Cookbook.
                </Typography>
                <Button 
                    variant="contained" 
                    onClick={handleGoHome}
                    sx={{ mt: 2 }}
                >
                    Go to Getting Started
                </Button>
            </Box>
        </MainLayout>
    );
}
