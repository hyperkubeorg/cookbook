export interface DocPage {
  id: string;
  title: string;
  content: string;
  path: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  path: string;
  date?: string;
  excerpt?: string;
}

export interface MenuPage {
  id: string;
  title: string;
  path: string;
}

export interface MenuSection {
  title: string;
  type: 'section' | 'link';
  path?: string;
  showDivider: boolean;
  items?: MenuItemConfig[];
  exclude?: boolean;
}

export interface MenuItemConfig {
  id: string;
  label?: string;
  exclude?: boolean;
}

export interface MenuConfig {
  sections: MenuSection[];
  settings: {
    autoGenerateLabels: boolean;
    sortItems: boolean;
    showEmptySections: boolean;
    landingPage?: string;
    github?: {
      enabled: boolean;
      repo: string;
      branch: string;
    };
  };
}

export interface SearchConfig {
  exclusions: {
    sections: string[];
    ids: string[];
    patterns: string[];
  };
  settings: {
    enableSearch: boolean;
    maxResults: number;
    searchContent: boolean;
    caseSensitive: boolean;
  };
}

// Extract title from markdown content (first h1)
function extractTitle(content: string): string {
  const h1Match = content.match(/^#\s+(.+)$/m);
  return h1Match ? h1Match[1].trim() : 'Untitled';
}

// Extract date from blog post content (looks for "Published: Date" pattern)
function extractDate(content: string): string | undefined {
  const dateMatch = content.match(/\*Published:\s+([^*]+)\*/);
  return dateMatch ? dateMatch[1].trim() : undefined;
}

// Extract excerpt from blog post (first paragraph after title)
function extractExcerpt(content: string): string | undefined {
  const lines = content.split('\n');
  let foundTitle = false;
  
  for (const line of lines) {
    if (line.startsWith('# ') && !foundTitle) {
      foundTitle = true;
      continue;
    }
    
    if (foundTitle && line.trim() && !line.startsWith('*Published:')) {
      // Take first meaningful paragraph, limit to 200 chars
      const excerpt = line.trim();
      return excerpt.length > 200 ? excerpt.substring(0, 200) + '...' : excerpt;
    }
  }
  
  return undefined;
}

import yaml from 'js-yaml';

// Auto-import all markdown files using Vite's glob imports
const docModules = import.meta.glob('/src/docs/**/*.md', { 
  query: '?raw', 
  import: 'default',
  eager: false
});

const blogModules = import.meta.glob('/src/blog/**/*.md', { 
  query: '?raw', 
  import: 'default',
  eager: false
});

// Import markdown files automatically
async function importMarkdownFiles(): Promise<Record<string, string>> {
  const files: Record<string, string> = {};
  
  for (const [filePath, moduleLoader] of Object.entries(docModules)) {
    try {
      const content = await moduleLoader() as string;
      files[filePath] = content;
    } catch (error) {
      console.error(`Failed to load ${filePath}:`, error);
    }
  }
  
  return files;
}

// Import blog posts automatically
async function importBlogPosts(): Promise<Record<string, string>> {
  const files: Record<string, string> = {};
  
  for (const [filePath, moduleLoader] of Object.entries(blogModules)) {
    try {
      const content = await moduleLoader() as string;
      files[filePath] = content;
    } catch (error) {
      console.error(`Failed to load ${filePath}:`, error);
    }
  }
  
  return files;
}

// Extract numeric prefix from filename for sorting
function extractNumericPrefix(filePath: string): number {
  const filename = filePath.split('/').pop() || '';
  const match = filename.match(/^(\d{8})-/);
  return match ? parseInt(match[1], 10) : 0;
}

// Extract clean ID from filename (without numeric prefix)
function extractCleanId(filePath: string): string {
  const filename = filePath.split('/').pop() || '';
  // Remove .md extension and numeric prefix
  return filename.replace(/^(\d{8})-/, '').replace('.md', '');
}

// Load menu configuration from YAML
export async function loadMenuConfig(): Promise<MenuConfig> {
  try {
    const menuYaml = await import('/src/config/menu.yaml?raw');
    const config = yaml.load(menuYaml.default) as MenuConfig;
    return config;
  } catch (error) {
    console.error('Failed to load menu configuration:', error);
    // Return default configuration if YAML fails to load
    return {
      sections: [
        {
          title: "Documentation",
          type: "section" as const,
          showDivider: false,
          items: []
        },
        {
          title: "Blog",
          type: "link" as const,
          path: "/blog",
          showDivider: true
        }
      ],
      settings: {
        autoGenerateLabels: true,
        sortItems: false,
        showEmptySections: false,
        landingPage: "/getting-started",
        github: {
          enabled: false,
          repo: "",
          branch: "main"
        }
      }
    };
  }
}

// Load search configuration from YAML
export async function loadSearchConfig(): Promise<SearchConfig> {
  try {
    const searchYaml = await import('/src/config/search.yaml?raw');
    const rawConfig = yaml.load(searchYaml.default) as any;
    
    // Ensure all arrays exist and are not null
    const config: SearchConfig = {
      exclusions: {
        sections: rawConfig?.exclusions?.sections || [],
        ids: rawConfig?.exclusions?.ids || [],
        patterns: rawConfig?.exclusions?.patterns || []
      },
      settings: {
        enableSearch: rawConfig?.settings?.enableSearch ?? true,
        maxResults: rawConfig?.settings?.maxResults ?? 10,
        searchContent: rawConfig?.settings?.searchContent ?? true,
        caseSensitive: rawConfig?.settings?.caseSensitive ?? false
      }
    };
    
    return config;
  } catch (error) {
    console.error('Failed to load search configuration:', error);
    // Return default configuration if YAML fails to load
    return {
      exclusions: {
        sections: [],
        ids: [],
        patterns: []
      },
      settings: {
        enableSearch: true,
        maxResults: 10,
        searchContent: true,
        caseSensitive: false
      }
    };
  }
}

// Load all markdown files
export async function loadAllMarkdownFiles(): Promise<DocPage[]> {
  const pages: DocPage[] = [];
  
  try {
    const markdownFiles = await importMarkdownFiles();
    
    for (const [filePath, content] of Object.entries(markdownFiles)) {
      const title = extractTitle(content);
      const id = filePath.split('/').pop()?.replace('.md', '') || '';
      const path = '/' + id.toLowerCase() + '/';
      
      pages.push({
        id,
        title,
        content,
        path,
      });
    }
  } catch (error) {
    console.error('Failed to load markdown files:', error);
  }
  
  return pages.sort((a, b) => a.title.localeCompare(b.title));
}

// Load all blog posts
export async function loadAllBlogPosts(): Promise<BlogPost[]> {
  const posts: BlogPost[] = [];
  
  try {
    const blogFiles = await importBlogPosts();
    
    for (const [filePath, content] of Object.entries(blogFiles)) {
      const title = extractTitle(content);
      const date = extractDate(content);
      const excerpt = extractExcerpt(content);
      const cleanId = extractCleanId(filePath);
      const numericPrefix = extractNumericPrefix(filePath);
      const path = '/blog/' + cleanId.toLowerCase() + '/';
      
      posts.push({
        id: cleanId,
        title,
        content,
        path,
        date,
        excerpt,
        numericPrefix, // Add for sorting
      } as BlogPost & { numericPrefix: number });
    }
  } catch (error) {
    console.error('Failed to load blog posts:', error);
  }
  
  // Sort by numeric prefix (higher number = newer post)
  return posts.sort((a, b) => {
    const aPrefix = (a as any).numericPrefix || 0;
    const bPrefix = (b as any).numericPrefix || 0;
    return bPrefix - aPrefix; // Descending order (newest first)
  });
}

// Build menu sections from YAML configuration and available docs
export async function buildMenuSections(allPages: DocPage[]): Promise<MenuSection[]> {
  const config = await loadMenuConfig();
  const sections: MenuSection[] = [];
  
  for (const sectionConfig of config.sections) {
    // Skip excluded sections
    if (sectionConfig.exclude) continue;
    
    if (sectionConfig.type === 'link') {
      // Simple link section (like Blog)
      sections.push(sectionConfig);
    } else if (sectionConfig.type === 'section' && sectionConfig.items) {
      // Document section with items
      const menuItems: MenuPage[] = [];
      
      for (const itemConfig of sectionConfig.items) {
        // Skip excluded items
        if (itemConfig.exclude) continue;
        
        // Find the corresponding page
        const page = allPages.find(p => p.id === itemConfig.id);
        if (page) {
          menuItems.push({
            id: page.id,
            title: itemConfig.label || (config.settings.autoGenerateLabels ? page.title : itemConfig.id),
            path: page.path,
          });
        }
      }
      
      // Only add section if it has items or showEmptySections is true
      if (menuItems.length > 0 || config.settings.showEmptySections) {
        sections.push({
          ...sectionConfig,
          items: menuItems as any // Type assertion for now
        });
      }
    }
  }
  
  return sections;
}

// Filter pages for search based on search configuration
export async function filterPagesForSearch(allPages: DocPage[]): Promise<DocPage[]> {
  const searchConfig = await loadSearchConfig();
  const menuConfig = await loadMenuConfig();
  
  if (!searchConfig.settings.enableSearch) {
    return [];
  }
  
  // Get all section item IDs that should be excluded
  const excludedSectionIds = new Set<string>();
  
  // Safely iterate over sections array
  const sectionsToExclude = searchConfig.exclusions.sections || [];
  for (const sectionTitle of sectionsToExclude) {
    const section = menuConfig.sections.find(s => s.title === sectionTitle);
    if (section && section.items) {
      for (const item of section.items) {
        excludedSectionIds.add(item.id);
      }
    }
  }
  
  // Combine all exclusion rules
  const excludedIds = new Set([
    ...excludedSectionIds,
    ...(searchConfig.exclusions.ids || [])
  ]);
  
  // Filter pages
  return allPages.filter(page => {
    // Check if page ID is explicitly excluded
    if (excludedIds.has(page.id)) {
      return false;
    }
    
    // Check if page matches any exclusion patterns
    const patternsToCheck = searchConfig.exclusions.patterns || [];
    for (const pattern of patternsToCheck) {
      try {
        const regex = new RegExp(pattern, searchConfig.settings.caseSensitive ? 'g' : 'gi');
        if (regex.test(page.id) || regex.test(page.title)) {
          return false;
        }
      } catch (error) {
        console.warn(`Invalid regex pattern in search exclusions: ${pattern}`, error);
      }
    }
    
    return true;
  });
}

// Generate GitHub source URL for a file
export async function getGitHubSourceUrl(filePath: string): Promise<string | null> {
  try {
    const config = await loadMenuConfig();
    const github = config.settings.github;
    
    if (!github || !github.enabled || !github.repo || !github.branch) {
      return null;
    }
    
    // Convert relative file path to GitHub blob URL
    // Remove leading slash if present
    const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    return `https://github.com/${github.repo}/blob/${github.branch}/${cleanPath}`;
  } catch (error) {
    console.error('Failed to generate GitHub source URL:', error);
    return null;
  }
}

// Generate GitHub source URL for a documentation page
export async function getDocSourceUrl(docId: string): Promise<string | null> {
  return getGitHubSourceUrl(`src/docs/${docId}.md`);
}

// Generate GitHub source URL for a blog post (with numeric prefix)
export async function getBlogSourceUrl(blogId: string): Promise<string | null> {
  try {
    // Find the actual filename with numeric prefix
    const blogFiles = await importBlogPosts();
    for (const filePath of Object.keys(blogFiles)) {
      const cleanId = extractCleanId(filePath);
      if (cleanId === blogId) {
        // Convert to GitHub path (remove /src/ prefix that Vite uses)
        const githubPath = filePath.replace('/src/', 'src/');
        return getGitHubSourceUrl(githubPath);
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to generate blog source URL:', error);
    return null;
  }
}

// Legacy function for backward compatibility
export function getMenuPages(allPages: DocPage[]): MenuPage[] {
  // This will be replaced by YAML-based menu
  return allPages
    .filter(page => page.id !== 'advanced-concepts')
    .map(page => ({
      id: page.id,
      title: page.title,
      path: page.path,
    }));
}

// Find page by path
export function findPageByPath(pages: DocPage[], path: string): DocPage | undefined {
  return pages.find(page => page.path === path);
}

// Find blog post by path
export function findBlogPostByPath(posts: BlogPost[], path: string): BlogPost | undefined {
  return posts.find(post => post.path === path);
}

// Process markdown links to handle internal references
export function processMarkdownLinks(content: string): string {
  let processedContent = content;

  // Pattern 1: Relative links from docs to blog posts: ../blog/XXXXXXXX-filename.md
  processedContent = processedContent.replace(
    /\[([^\]]+)\]\(\.\.\/blog\/(\d{8}-[^)]+\.md)\)/g,
    (_, text, filename) => {
      // Extract clean filename without numeric prefix
      const cleanFilename = filename.replace(/^\d{8}-/, '').replace('.md', '');
      const targetPath = '/blog/' + cleanFilename.toLowerCase();
      return `[${text}](${targetPath})`;
    }
  );

  // Pattern 2: Relative links from blog to docs: ../docs/filename.md
  processedContent = processedContent.replace(
    /\[([^\]]+)\]\(\.\.\/docs\/([^)]+\.md)\)/g,
    (_, text, filename) => {
      const targetPath = '/' + filename.replace('.md', '').toLowerCase();
      return `[${text}](${targetPath})`;
    }
  );

  // Pattern 3: Same-directory relative links: ./filename.md
  processedContent = processedContent.replace(
    /\[([^\]]+)\]\(\.\/([^)]+\.md)\)/g,
    (_, text, filename) => {
      const targetPath = '/' + filename.replace('.md', '').toLowerCase();
      return `[${text}](${targetPath})`;
    }
  );

  // Pattern 4: Direct relative links without ./ prefix: filename.md
  processedContent = processedContent.replace(
    /\[([^\]]+)\]\(([^/)][^)]*\.md)\)/g,
    (_, text, filename) => {
      // Skip if it's already an absolute path or external URL
      if (filename.startsWith('http') || filename.startsWith('/')) {
        return `[${text}](${filename})`;
      }
      
      // Handle blog post files with numeric prefix
      if (/^\d{8}-/.test(filename)) {
        const cleanFilename = filename.replace(/^\d{8}-/, '').replace('.md', '');
        const targetPath = '/blog/' + cleanFilename.toLowerCase();
        return `[${text}](${targetPath})`;
      }
      
      // Handle regular doc files
      const targetPath = '/' + filename.replace('.md', '').toLowerCase();
      return `[${text}](${targetPath})`;
    }
  );

  return processedContent;
}

// Search through all pages
export function searchPages(pages: DocPage[], query: string): DocPage[] {
  if (!query.trim()) return [];
  
  const lowercaseQuery = query.toLowerCase();
  
  return pages.filter(page => {
    const titleMatch = page.title.toLowerCase().includes(lowercaseQuery);
    const contentMatch = page.content.toLowerCase().includes(lowercaseQuery);
    return titleMatch || contentMatch;
  }).sort((a, b) => {
    // Prioritize title matches
    const aTitleMatch = a.title.toLowerCase().includes(lowercaseQuery);
    const bTitleMatch = b.title.toLowerCase().includes(lowercaseQuery);
    
    if (aTitleMatch && !bTitleMatch) return -1;
    if (!aTitleMatch && bTitleMatch) return 1;
    
    return a.title.localeCompare(b.title);
  });
}

// Get the configured landing page
export async function getLandingPage(): Promise<string> {
  try {
    const config = await loadMenuConfig();
    return config.settings.landingPage || '/getting-started';
  } catch (error) {
    console.error('Failed to load landing page config:', error);
    return '/getting-started'; // Fallback default
  }
}
