import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  InputAdornment,
  Divider,
  useTheme,
  useMediaQuery,
  IconButton,
  Autocomplete,
  Paper,
} from '@mui/material';
import { Search, Menu as MenuIcon, BookMarked } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { DocPage, MenuSection } from '@/utils/markdownUtils';

const DRAWER_WIDTH = 280;

interface MainLayoutProps {
  children: React.ReactNode;
  menuSections: MenuSection[];
  allPages: DocPage[];
  searchPages?: DocPage[];  // Optional filtered pages for search
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, menuSections, allPages, searchPages }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (path: string) => {
    // Ensure trailing slash for consistency
    const normalizedPath = path.endsWith('/') ? path : path + '/';
    navigate(normalizedPath);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleSearchSelect = (_: any, value: DocPage | null) => {
    if (value) {
      // Ensure trailing slash for consistency
      const normalizedPath = value.path.endsWith('/') ? value.path : value.path + '/';
      navigate(normalizedPath);
      // Keep search query so user can continue searching
    }
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Box display="flex" alignItems="center" gap={1}>
          <BookMarked size={24} color={theme.palette.primary.main} />
          <Typography variant="h6" noWrap component="div" color="primary">
            Hyperkube Cookbook
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      {menuSections && menuSections.map((section, sectionIndex) => (
        <React.Fragment key={sectionIndex}>
          {section.showDivider && sectionIndex > 0 && <Divider />}
          
          {section.type === 'link' ? (
            // Simple link section (like Blog)
            <List>
              <ListItem disablePadding>
                <ListItemButton
                  selected={section.path ? location.pathname.startsWith(section.path) : false}
                  onClick={() => section.path && handleMenuClick(section.path)}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.main + '20',
                      borderRight: `3px solid ${theme.palette.primary.main}`,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.main + '30',
                      },
                    },
                  }}
                >
                  <ListItemText 
                    primary={section.title}
                    primaryTypographyProps={{
                      fontWeight: section.path && location.pathname.startsWith(section.path) ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          ) : (
            // Section with items (like Documentation)
            section.items && (
              <List>
                {(section.items as any[]).map((page: any) => (
                  <ListItem key={page.id} disablePadding>
                    <ListItemButton
                      selected={location.pathname === page.path}
                      onClick={() => handleMenuClick(page.path)}
                      sx={{
                        '&.Mui-selected': {
                          backgroundColor: theme.palette.primary.main + '20',
                          borderRight: `3px solid ${theme.palette.primary.main}`,
                          '&:hover': {
                            backgroundColor: theme.palette.primary.main + '30',
                          },
                        },
                      }}
                    >
                      <ListItemText 
                        primary={page.title}
                        primaryTypographyProps={{
                          fontWeight: location.pathname === page.path ? 600 : 400,
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )
          )}
        </React.Fragment>
      ))}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1, maxWidth: 600 }}>
            <Autocomplete
              options={searchPages || allPages}
              getOptionLabel={(option) => option.title}
              renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                return (
                  <Box component="li" key={key} {...otherProps}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {option.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.path}
                      </Typography>
                    </Box>
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search documentation..."
                  variant="outlined"
                  size="small"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search size={20} />
                      </InputAdornment>
                    ),
                    sx: {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'white',
                      },
                      '& input': {
                        color: 'white',
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                      },
                      '& .MuiInputAdornment-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                      },
                    },
                  }}
                />
              )}
              PaperComponent={(props) => (
                <Paper {...props} sx={{ bgcolor: 'background.paper', mt: 1 }} />
              )}
              onChange={handleSearchSelect}
              inputValue={searchQuery}
              onInputChange={(_, newValue) => setSearchQuery(newValue)}
              filterOptions={(options, { inputValue }) => {
                const filtered = options.filter((option) =>
                  option.title.toLowerCase().includes(inputValue.toLowerCase()) ||
                  option.content.toLowerCase().includes(inputValue.toLowerCase())
                );
                return filtered.slice(0, 10); // Limit to 10 results
              }}
              noOptionsText="No documentation found"
            />
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8, // Account for AppBar height
          minHeight: 'calc(100vh - 64px)',
          overflow: 'hidden', // Prevent horizontal overflow
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
