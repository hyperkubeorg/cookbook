import React from 'react';
import { Box, Button, Tooltip } from '@mui/material';
import { ExternalLink } from 'lucide-react';

interface ViewSourceProps {
  sourceUrl: string | null;
  label?: string;
}

const ViewSource: React.FC<ViewSourceProps> = ({ 
  sourceUrl, 
  label = "View Source" 
}) => {
  if (!sourceUrl) {
    return null; // Don't render if no source URL available
  }

  return (
    <Box sx={{ 
      mt: 4, 
      pt: 2, 
      borderTop: '1px solid', 
      borderColor: 'divider',
      display: 'flex',
      justifyContent: 'flex-end' // Align button to the right
    }}>
      <Tooltip title="View the markdown source file on GitHub">
        <Button
          variant="outlined"
          size="small"
          startIcon={<ExternalLink size={16} />}
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            textTransform: 'none',
            borderColor: 'text.secondary',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'primary.main',
              color: 'primary.main',
            },
          }}
        >
          {label}
        </Button>
      </Tooltip>
    </Box>
  );
};

export default ViewSource;
