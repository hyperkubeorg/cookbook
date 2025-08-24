import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { Copy, Check, Link } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';

interface CodeBlockProps {
  children: string;
  className?: string;
  inline?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ children, className, inline }) => {
  const [copied, setCopied] = useState(false);
  
  // Enhanced parsing to support filename syntax like "yaml:deployment.yaml" or "yaml filename=deployment.yaml"
  const parseCodeInfo = (className: string) => {
    if (!className) return { language: '', filename: '' };
    
    // Match patterns like "language-yaml:filename.yaml" or "language-yaml filename=filename.yaml"
    const colonMatch = /language-(\w+):(.+)/.exec(className);
    if (colonMatch) {
      return { language: colonMatch[1], filename: colonMatch[2] };
    }
    
    const filenameMatch = /language-(\w+)\s+filename=(.+)/.exec(className);
    if (filenameMatch) {
      return { language: filenameMatch[1], filename: filenameMatch[2] };
    }
    
    // Standard language-only syntax
    const languageMatch = /language-(\w+)/.exec(className);
    return { 
      language: languageMatch ? languageMatch[1] : '', 
      filename: '' 
    };
  };
  
  const { language, filename } = parseCodeInfo(className || '');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return (
      <code
        style={{
          backgroundColor: 'rgba(110, 118, 129, 0.4)',
          padding: '2px 4px',
          borderRadius: '3px',
          fontSize: '0.85em',
        }}
      >
        {children}
      </code>
    );
  }

  return (
    <Box position="relative" mb={2} sx={{ maxWidth: '100%' }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          backgroundColor: '#1e1e1e',
          borderTopLeftRadius: '6px',
          borderTopRightRadius: '6px',
          px: 2,
          py: 1,
          borderBottom: '1px solid #333',
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="caption" color="text.secondary">
            {language || 'text'}
          </Typography>
          {filename && (
            <>
              <Typography variant="caption" color="text.disabled">
                •
              </Typography>
              <Typography variant="caption" color="text.primary" sx={{ fontWeight: 500 }}>
                {filename}
              </Typography>
            </>
          )}
        </Box>
        <Tooltip title={copied ? 'Copied!' : 'Copy code'}>
          <IconButton
            size="small"
            onClick={handleCopy}
            sx={{ color: 'text.secondary' }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ 
        overflow: 'auto', // Enable horizontal scrolling for code blocks
        maxWidth: '100%',
        '& pre': {
          margin: '0 !important',
        }
      }}>
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={language}
          showLineNumbers
          customStyle={{
            margin: 0,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            borderBottomLeftRadius: '6px',
            borderBottomRightRadius: '6px',
            minWidth: 'max-content', // Ensure content doesn't wrap
          }}
        >
          {children}
        </SyntaxHighlighter>
      </Box>
    </Box>
  );
};

// Utility function to generate URL-safe slugs from header text
const generateSlug = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

// Header component with hash link
interface HeaderProps {
  children: React.ReactNode;
  level: 1 | 2 | 3 | 4;
  variant: 'h3' | 'h4' | 'h5' | 'h6';
  component: 'h1' | 'h2' | 'h3' | 'h4';
  sx?: any;
}

const HeaderWithLink: React.FC<HeaderProps> = ({ children, level, variant, component, sx }) => {
  const [showLink, setShowLink] = useState(false);
  const text = React.Children.toArray(children).join('');
  const slug = generateSlug(text);

  const handleLinkClick = () => {
    const url = new URL(window.location.href);
    url.hash = slug;
    window.history.pushState({}, '', url.toString());
    
    // Scroll to the element
    const element = document.getElementById(slug);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box
      id={slug}
      onMouseEnter={() => setShowLink(true)}
      onMouseLeave={() => setShowLink(false)}
      sx={{ 
        position: 'relative',
        scrollMarginTop: '80px', // Offset for any fixed headers
        ...sx
      }}
    >
      <Typography 
        variant={variant} 
        component={component} 
        gutterBottom 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          mt: level === 1 ? 4 : level === 2 ? 3 : 2,
          mb: level <= 2 ? 2 : 1
        }}
      >
        {children}
        <IconButton
          size="small"
          onClick={handleLinkClick}
          sx={{
            opacity: showLink ? 1 : 0,
            transition: 'opacity 0.2s ease-in-out',
            color: 'text.secondary',
            ml: 0.5,
            '&:hover': {
              color: 'primary.main',
            },
          }}
          aria-label={`Link to ${text}`}
        >
          <Link size={16} />
        </IconButton>
      </Typography>
    </Box>
  );
};

// Custom Link component that handles internal and external links appropriately
interface CustomLinkProps {
  href?: string;
  children: React.ReactNode;
}

const CustomLink: React.FC<CustomLinkProps> = ({ href, children }) => {
  // Check if it's an internal link (starts with /, doesn't start with http, doesn't contain :)
  const isInternalLink = href && (
    href.startsWith('/') || 
    (!href.includes('://') && !href.includes('mailto:') && !href.includes('#'))
  );

  if (isInternalLink) {
    return (
      <Typography
        component={RouterLink}
        to={href!}
        sx={{
          color: 'primary.main',
          textDecoration: 'underline',
          '&:hover': {
            textDecoration: 'none',
          },
        }}
      >
        {children}
      </Typography>
    );
  }

  // External link - use regular anchor tag
  return (
    <Typography
      component="a"
      href={href}
      target={href?.startsWith('#') ? undefined : '_blank'}
      rel={href?.startsWith('#') ? undefined : 'noopener noreferrer'}
      sx={{
        color: 'primary.main',
        textDecoration: 'underline',
        '&:hover': {
          textDecoration: 'none',
        },
      }}
    >
      {children}
    </Typography>
  );
};

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Handle hash navigation on component mount and hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash) {
        // Small delay to ensure the element is rendered
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    };

    // Handle initial hash on mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <Box sx={{ 
      '& img': { maxWidth: '100%', height: 'auto' },
      width: '100%',
      overflow: 'hidden', // Prevent markdown content from overflowing
      scrollBehavior: 'smooth', // Enable smooth scrolling
    }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: ({ className, children, ...props }) => {
            const isInline = !className || !className.startsWith('language-');
            return (
              <CodeBlock
                inline={isInline}
                className={className}
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </CodeBlock>
            );
          },
          h1: ({ children }) => (
            <HeaderWithLink level={1} variant="h3" component="h1">
              {children}
            </HeaderWithLink>
          ),
          h2: ({ children }) => (
            <HeaderWithLink level={2} variant="h4" component="h2">
              {children}
            </HeaderWithLink>
          ),
          h3: ({ children }) => (
            <HeaderWithLink level={3} variant="h5" component="h3">
              {children}
            </HeaderWithLink>
          ),
          h4: ({ children }) => (
            <HeaderWithLink level={4} variant="h6" component="h4">
              {children}
            </HeaderWithLink>
          ),
          p: ({ children }) => (
            <Typography variant="body1" paragraph>
              {children}
            </Typography>
          ),
          a: ({ href, children }) => (
            <CustomLink href={href}>
              {children}
            </CustomLink>
          ),
          ul: ({ children }) => (
            <Box component="ul" sx={{ pl: 2, mb: 2 }}>
              {children}
            </Box>
          ),
          ol: ({ children }) => (
            <Box component="ol" sx={{ pl: 2, mb: 2 }}>
              {children}
            </Box>
          ),
          li: ({ children }) => (
            <Typography component="li" variant="body1" sx={{ mb: 0.5 }}>
              {children}
            </Typography>
          ),
          blockquote: ({ children }) => (
            <Box
              sx={{
                borderLeft: '4px solid',
                borderColor: 'primary.main',
                bgcolor: 'rgba(144, 202, 249, 0.08)',
                p: 2,
                my: 2,
                borderRadius: 1,
              }}
            >
              {children}
            </Box>
          ),
          table: ({ children }) => (
            <Box sx={{ overflowX: 'auto', mb: 2 }}>
              <Box
                component="table"
                sx={{
                  minWidth: '100%',
                  borderCollapse: 'collapse',
                  '& th, & td': {
                    border: '1px solid',
                    borderColor: 'divider',
                    p: 1,
                  },
                  '& th': {
                    bgcolor: 'background.paper',
                    fontWeight: 'bold',
                  },
                }}
              >
                {children}
              </Box>
            </Box>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
};

export default MarkdownRenderer;
