import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Card, 
  CardContent, 
  CardActionArea,
  Chip
} from '@mui/material';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import ViewSource from '@/components/ViewSource';
import MainLayout from '@/components/layout/MainLayout';
import type { DocPage, BlogPost } from '@/utils/markdownUtils';
import { 
  loadAllMarkdownFiles, 
  loadAllBlogPosts,
  buildMenuSections, 
  findBlogPostByPath, 
  processMarkdownLinks,
  getBlogSourceUrl,
  filterPagesForSearch
} from '@/utils/markdownUtils';

const BlogPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const [allPages, setAllPages] = useState<DocPage[]>([]);
  const [searchPages, setSearchPages] = useState<DocPage[]>([]);
  const [menuSections, setMenuSections] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when slug changes
    setCurrentPost(null);
    setSourceUrl(null);
    setLoading(true);
    setError(null);
    
    Promise.all([
      loadAllMarkdownFiles(),
      loadAllBlogPosts()
    ])
      .then(async ([pages, posts]) => {
        setAllPages(pages);
        setAllPosts(posts);
        
        // Filter pages for search
        const filteredSearchPages = await filterPagesForSearch(pages);
        setSearchPages(filteredSearchPages);
        
        // Build menu sections from YAML config
        const sections = await buildMenuSections(pages);
        setMenuSections(sections);
        
        if (slug) {
          // Find the specific blog post
          const path = `/blog/${slug}`;
          const post = findBlogPostByPath(posts, path);
          
          if (post) {
            setCurrentPost(post);
            
            // Load source URL for this blog post
            const url = await getBlogSourceUrl(post.id);
            setSourceUrl(url);
            
            // Scroll to top after content is loaded
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          } else {
            // Post not found, redirect to 404
            navigate('/404', { replace: true });
            return;
          }
        } else {
          // On blog listing page, ensure currentPost is null
          setCurrentPost(null);
          setSourceUrl(null);
        }
        
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load blog content:', err);
        setError('Failed to load blog content');
        setLoading(false);
      });
  }, [slug, navigate]);

  const handlePostClick = (post: BlogPost) => {
    navigate(post.path);
  };

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

  // Show individual blog post
  if (currentPost) {
    const processedContent = processMarkdownLinks(currentPost.content);
    
    return (
      <MainLayout menuSections={menuSections} allPages={allPages} searchPages={searchPages}>
        <Box 
          maxWidth="800px" 
          sx={{ 
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <MarkdownRenderer content={processedContent} />
          <ViewSource sourceUrl={sourceUrl} />
        </Box>
      </MainLayout>
    );
  }

  // Show blog listing
  return (
    <MainLayout menuSections={menuSections} allPages={allPages} searchPages={searchPages}>
      <Box maxWidth="800px" sx={{ width: '100%' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4 }}>
          Blog
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Thoughts, experiences, and lessons learned from working with Kubernetes and cloud-native technologies.
        </Typography>

        <Box sx={{ mt: 4 }}>
          {allPosts.map((post) => (
            <Card 
              key={post.id} 
              sx={{ 
                mb: 3, 
                '&:hover': { 
                  boxShadow: (theme) => theme.shadows[4] 
                } 
              }}
            >
              <CardActionArea onClick={() => handlePostClick(post)}>
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {post.title}
                  </Typography>
                  
                  {post.date && (
                    <Chip 
                      label={post.date} 
                      size="small" 
                      sx={{ mb: 2 }}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  
                  {post.excerpt && (
                    <Typography variant="body2" color="text.secondary">
                      {post.excerpt}
                    </Typography>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
          
          {allPosts.length === 0 && (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" color="text.secondary">
                No blog posts yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Check back soon for new content!
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </MainLayout>
  );
};

export default BlogPage;
