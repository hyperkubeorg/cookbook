Codebase for [hyperkube.org](https://hyperkube.org/).

# Documentation Site

A modern documentation site with blog functionality, built with React, TypeScript, and Vite.

## Features

- 📚 **Markdown-based documentation** - Write docs in markdown files
- 📝 **Blog posts** - Share experiences and insights (separate from docs)
- 🔍 **Configurable search** - Search across documentation with flexible exclusion rules
- 🎨 **Syntax highlighting** - Code blocks with line numbers and copy buttons
- 📱 **Responsive design** - Works great on desktop and mobile
- 🔗 **Cross-linking** - Link between markdown files
- 🌙 **Dark theme** - Easy on the eyes
- 📖 **View Source** - Direct links to markdown files on GitHub
- 🚀 **GitHub Pages ready** - Automatic deployment

## Quick Start

```bash
# Clone and install
git clone <your-repo>
cd <project-name>
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the site.

## Contributing

### Adding Documentation

Documentation files go in `src/docs/` and are automatically discovered and made searchable.

1. **Create a new markdown file** in `src/docs/`:
   ```bash
   touch src/docs/my-new-doc.md
   ```

2. **Add content** with proper heading structure:
   ```markdown
   # My New Documentation
   
   This will be the title shown in search and navigation.
   
   ## Section 1
   Your content here...
   ```

3. **That's it!** The file is automatically:
   - Discovered by Vite's glob imports
   - Added to the navigation menu (unless excluded)
   - Made searchable via the search bar
   - Accessible at `/my-new-doc`

4. **Cross-link to other docs** using relative paths:
   ```markdown
   See also [Other Doc](./other-doc.md) for more information.
   ```

### Adding Blog Posts

Blog posts go in `src/blog/` and are automatically discovered (but NOT included in search results).

1. **Create a new blog post** with numeric prefix in `src/blog/`:
   ```bash
   touch src/blog/00000004-my-blog-post.md
   ```

2. **Add content** with publication date:
   ```markdown
   # My Blog Post Title
   
   *Published: March 15, 2024*
   
   First paragraph becomes the excerpt shown in blog listing...
   
   ## Rest of your content
   ```

3. **That's it!** The blog post is automatically:
   - Discovered by Vite's glob imports
   - Added to the blog listing (sorted by numeric prefix, higher = newer)
   - Accessible at `/blog/my-blog-post` (prefix is removed from URL)
   - NOT included in documentation search

#### **Blog Post Naming Convention**
- **Format**: `XXXXXXXX-filename.md` (8 digits + hyphen + descriptive name)
- **Ordering**: Higher numbers appear first (newest at top)
- **URL**: Numeric prefix is stripped from the URL path
- **Editor-friendly**: Files sort correctly in file explorers

### Landing Page Configuration

Control which page users see when visiting the root URL (`/`) by setting the landing page in `src/config/menu.yaml`:

```yaml
settings:
  landingPage: "/getting-started"  # Default page when visiting "/"
                                   # Options: "/getting-started", "/blog", "/any-doc-slug"
```

**Examples:**
- `landingPage: "/getting-started"` - Default documentation page
- `landingPage: "/blog"` - Blog listing page
- `landingPage: "/kubernetes-basics"` - Specific documentation page

### GitHub Integration

Enable "View Source" links on documentation and blog pages by configuring GitHub settings in `src/config/menu.yaml`:

```yaml
settings:
  github:
    enabled: true                    # Set to false to disable source links
    repo: "username/repository-name" # Your GitHub repository
    branch: "main"                   # Branch name (automatically updated to commit hash during deployment)
```

When enabled, each documentation page and blog post will show a "View Source" button that links directly to the markdown file on GitHub.

#### Automatic Commit Hash Updates

During GitHub Pages deployment, the build process automatically updates the `branch` value to the current 8-character commit hash. This ensures that "View Source" links always point to the exact commit used to build the deployed site, rather than potentially outdated content on the main branch.

### Menu Configuration

The sidebar menu is controlled by `src/config/menu.yaml`, which defines sections, items, and their visibility.

1. **Configure menu sections** in `src/config/menu.yaml`:
   ```yaml
   sections:
   - title: "Application Development" 
     type: "section"
     exclude: true  # Hide entire section from menu
     items:
     - id: "backend-setup"
       label: "Backend Setup"
     - id: "frontend-setup"
       label: "Frontend Setup"
   ```

2. **Control individual item visibility**:
   ```yaml
   - id: "backups"
     label: "Backups"
     exclude: true  # Hide specific item from menu
   ```

3. **Menu settings**:
   ```yaml
   settings:
     autoGenerateLabels: true  # Use markdown titles if no label specified
     sortItems: false          # Maintain order as defined above
     showEmptySections: false  # Hide sections with no visible items
   ```

### Search Configuration

Control which content appears in search results using `src/config/search.yaml`:

1. **Exclude entire sections from search**:
   ```yaml
   exclusions:
     sections:
       - "Application Development"  # Hide all items from this section
   ```

2. **Exclude specific pages**:
   ```yaml
   exclusions:
     ids:
       - "overview-wip"
       - "draft-feature"
   ```

3. **Search settings**:
   ```yaml
   settings:
     enableSearch: true      # Set to false to disable search entirely
     maxResults: 10         # Maximum number of search results
     searchContent: true    # Search within page content (not just titles)
     caseSensitive: false   # Whether search should be case sensitive
   ```

### File Naming Conventions

- **Documentation**: `kebab-case.md` (e.g., `kubernetes-basics.md`)
- **Blog posts**: `kebab-case.md` (e.g., `my-kubernetes-journey.md`)
- **Titles**: Use proper heading (`# Title`) as first line
- **URLs**: Generated automatically from filename

### Content Guidelines

#### Documentation
- Focus on technical content, tutorials, and reference material
- Use clear headings and sections
- Include code examples with proper language tags
- Cross-link to related documentation

#### Blog Posts
- Include publication date in `*Published: Date*` format
- Write engaging content
- Share experiences, lessons learned, and insights
- First paragraph becomes the excerpt

## Building and Deployment

### Local Development
```bash
npm run dev     # Start dev server
npm run build   # Build for production
npm run preview # Preview production build
npm run lint    # Check code quality
```

### GitHub Pages Deployment

This project automatically deploys to GitHub Pages when you push to the main branch.

#### Setup Instructions

1. **Enable GitHub Pages** in repository settings:
   - Go to Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: "gh-pages"
   - Folder: "/ (root)"

2. **Configure deployment path** in `src/config/menu.yaml`:
   ```yaml
   settings:
     basePath: "/"               # For root domain (e.g., username.github.io)
     # OR
     basePath: "/repository-name/"  # For project pages (e.g., username.github.io/repo)
   ```

3. **Push to main branch** - GitHub Actions will handle the rest!

#### Deployment Path Configuration

The project automatically reads the `basePath` from your menu configuration:

- **Root domain deployment** (e.g., `username.github.io`): Use `basePath: "/"`
- **Project pages deployment** (e.g., `username.github.io/repo-name`): Use `basePath: "/repo-name/"`

This approach centralizes all deployment configuration in the menu.yaml file, eliminating the need to modify build scripts or Vite configuration files.

#### Important Notes
- The `dist` folder is ignored in git (build artifacts don't pollute main branch)
- GitHub Actions builds and deploys to the `gh-pages` branch automatically
- No manual artifact management required

## Project Structure

```
src/
├── docs/                    # Documentation files (searchable, configured via menu.yaml)
│   ├── overview.md
│   ├── backend-setup.md
│   ├── kubernetes.md
│   └── [other docs...]
├── blog/                    # Blog posts (numeric prefix for ordering)
│   └── 00000001-a-work-in-progress.md
├── config/
│   ├── menu.yaml           # Menu structure and GitHub integration
│   └── search.yaml         # Search configuration and exclusions
├── components/
│   ├── layout/
│   │   ├── MainLayout.tsx   # Main app layout with sidebar
│   │   └── ScrollToTop.tsx  # Route change scroll behavior
│   ├── pages/
│   │   ├── DocPage.tsx      # Documentation page component
│   │   ├── BlogPage.tsx     # Blog listing and post component
│   │   └── 404.tsx          # Not found page
│   ├── MarkdownRenderer.tsx # Markdown processing with syntax highlighting
│   └── ViewSource.tsx       # GitHub "View Source" component
├── utils/
│   ├── markdownUtils.ts     # File loading, processing, and configuration utilities
│   └── basePath.ts          # Base path utility for routing
└── App.tsx                  # Main app with routing
```

## Technology Stack

- **React 19** - UI framework with modern features
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool and development server
- **Material-UI (MUI)** - Component library with dark theme
- **React Router** - Client-side routing
- **React Markdown** - Markdown processing with GitHub Flavored Markdown
- **React Syntax Highlighter** - Code syntax highlighting with line numbers
- **js-yaml** - YAML configuration file parsing
- **Lucide React** - Modern icon library

## Development Tips

### Adding New Markdown Files
1. Create the `.md` file in appropriate directory:
   - **Documentation**: `docs/filename.md`
   - **Blog posts**: `blog/XXXXXXXX-filename.md` (8-digit prefix)
2. Content appears automatically in navigation/listing (no manual registration needed!)

### Debugging
- Check browser console for import errors
- Verify file paths match exactly in import statements
- Use `npm run build` to catch TypeScript errors early

### Customization
- **Theme colors**: Edit `src/App.tsx` theme configuration
- **Layout spacing**: Modify `src/components/layout/MainLayout.tsx`
- **Markdown styling**: Update `src/components/MarkdownRenderer.tsx`
- **Menu structure**: Modify `src/config/menu.yaml`
- **Search behavior**: Configure `src/config/search.yaml` or modify search logic in `MainLayout.tsx`
- **Base path**: Configure `basePath` in `src/config/menu.yaml`

## License

This project is open source and available under the [MIT License](LICENSE).
