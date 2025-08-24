import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import ViewSource from '@/components/ViewSource';
import MainLayout from '@/components/layout/MainLayout';
import type { DocPage as DocPageType } from '@/utils/markdownUtils';
import { 
  loadAllMarkdownFiles, 
  buildMenuSections, 
  findPageByPath, 
  processMarkdownLinks,
  getDocSourceUrl,
  getLandingPage,
  filterPagesForSearch
} from '@/utils/markdownUtils';

const DocPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const [allPages, setAllPages] = useState<DocPageType[]>([]);
  const [searchPages, setSearchPages] = useState<DocPageType[]>([]);
  const [menuSections, setMenuSections] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<DocPageType | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset current page when slug changes to prevent showing old content
    setCurrentPage(null);
    setLoading(true);
    setError(null);
    
    loadAllMarkdownFiles()
      .then(async (pages) => {
        setAllPages(pages);
        
        // Filter pages for search
        const filteredSearchPages = await filterPagesForSearch(pages);
        setSearchPages(filteredSearchPages);
        
        // Build menu sections from YAML config
        const sections = await buildMenuSections(pages);
        setMenuSections(sections);
        
        // Handle root path redirect
        if (!slug && window.location.pathname === '/') {
          const landingPage = await getLandingPage();
          navigate(landingPage, { replace: true });
          return;
        }
        
        // Find the current page based on the slug
        const path = slug ? `/${slug}` : '/getting-started';
        const page = findPageByPath(pages, path);
        
        if (page) {
          setCurrentPage(page);
          
          // Load source URL for this page
          const url = await getDocSourceUrl(page.id);
          setSourceUrl(url);
          
          // Scroll to top after content is loaded
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        } else {
          // Page not found, redirect to 404
          navigate('/404', { replace: true });
          return;
        }
        
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load markdown files:', err);
        setError('Failed to load documentation');
        setLoading(false);
      });
  }, [slug, navigate]);

  if (loading) {
    return (
      <MainLayout menuSections={[]} allPages={[]} searchPages={[]}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout menuSections={menuSections} allPages={allPages} searchPages={searchPages}>
        <Alert severity="error">{error}</Alert>
      </MainLayout>
    );
  }

  if (!currentPage) {
    return (
      <MainLayout menuSections={menuSections} allPages={allPages} searchPages={searchPages}>
        <Box textAlign="center" py={8}>
          <Typography variant="h4" gutterBottom>
            Page Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            The requested documentation page could not be found.
          </Typography>
        </Box>
      </MainLayout>
    );
  }

  const processedContent = processMarkdownLinks(currentPage.content);

  return (
    <MainLayout menuSections={menuSections} allPages={allPages} searchPages={searchPages}>
      <Box 
        maxWidth="800px" 
        sx={{ 
          width: '100%',
          overflow: 'hidden', // Prevent content from overflowing
        }}
      >
        <MarkdownRenderer content={processedContent} />
        <ViewSource sourceUrl={sourceUrl} />
      </Box>
    </MainLayout>
  );
};

export default DocPage;
