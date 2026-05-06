import { MoreHorizRounded, SortByAlpha } from '@mui/icons-material';
import { alpha, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, useTheme } from '@mui/material';
import { isEqual, orderBy } from 'lodash';
import { useState } from 'react';
import { useFirestoreContext } from '../../../database/useFirestoreContext';

export default function MoreTagActionsMenuButton(): React.JSX.Element {
   const { tags, setTagsDb } = useFirestoreContext();
   const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

   const { palette } = useTheme();

   function handleSortTags(): void {
      const sortedTags = orderBy(tags, ['label'], ['asc']);
      const direction = isEqual(tags, sortedTags) ? 'desc' : 'asc';
      setTagsDb(direction === 'asc' ? sortedTags : orderBy(tags, ['label'], [direction]));
   }

   return (
      <>
         <IconButton
            onClick={(event) => setAnchorEl(event.currentTarget)}
            size="small"
            sx={{ borderRadius: '50%', bgcolor: alpha(palette.primary.main, 0.05), border: '1px solid', borderColor: 'divider' }}
         >
            <MoreHorizRounded fontSize="small" />
         </IconButton>
         <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            slotProps={{ paper: { sx: { overflowY: 'auto', maxHeight: '30rem', minWidth: '15rem' } } }}
         >
            <MenuItem onClick={handleSortTags}>
               <ListItemIcon>{<SortByAlpha />}</ListItemIcon>
               <ListItemText>{`Sort Tag Order`}</ListItemText>
            </MenuItem>
         </Menu>
      </>
   );
}
