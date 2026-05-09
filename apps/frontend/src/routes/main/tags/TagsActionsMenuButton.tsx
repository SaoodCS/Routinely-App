import { MoreHorizRounded, SortByAlpha } from '@mui/icons-material';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import orderBy from 'lodash/orderBy';
import isEqual from 'lodash/isEqual';
import { useState } from 'react';
import { useFirestoreContext } from '../../../database/useFirestoreContext';

export default function TagsActionsMenuButton(): React.JSX.Element {
   const { tags, setTagsDb } = useFirestoreContext();
   const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

   function handleSortTags(): void {
      const sortedTags = orderBy(tags, ['label'], ['asc']);
      const direction = isEqual(tags, sortedTags) ? 'desc' : 'asc';
      setTagsDb(direction === 'asc' ? sortedTags : orderBy(tags, ['label'], [direction]));
   }

   return (
      <>
         <IconButton onClick={(event) => setAnchorEl(event.currentTarget)}>
            <MoreHorizRounded />
         </IconButton>
         <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={handleSortTags}>
               <ListItemIcon>{<SortByAlpha />}</ListItemIcon>
               <ListItemText>{`Sort Tag Order`}</ListItemText>
            </MenuItem>
         </Menu>
      </>
   );
}
