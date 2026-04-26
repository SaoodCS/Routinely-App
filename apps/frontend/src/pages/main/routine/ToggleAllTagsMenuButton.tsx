import { IconButton, Menu } from '@mui/material';
import { useState } from 'react';
import { VisibilityOutlined } from '@mui/icons-material';

export default function ToggleAllTagsMenuButton(): React.JSX.Element {
   const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

   return (
      <>
         <IconButton color="primary" onClick={(event) => setAnchorEl(event.currentTarget)}>
            <VisibilityOutlined />
         </IconButton>
         <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            slotProps={{ paper: { sx: { overflowY: 'auto', maxHeight: '30rem', minWidth: '15rem' } } }}
         ></Menu>
      </>
   );
}
