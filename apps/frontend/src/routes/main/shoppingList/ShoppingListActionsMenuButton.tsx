import { MoreHorizRounded, SortByAlpha } from '@mui/icons-material';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import { useFirestoreContext } from '../../../database/useFirestoreContext';

export default function ShoppingListActionsMenuButton(): React.JSX.Element {
   const { setShoppingListDb } = useFirestoreContext();
   const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

   function handleClearShoppingList(): void {
      setShoppingListDb([]);
   }

   return (
      <>
         <IconButton onClick={(event) => setAnchorEl(event.currentTarget)}>
            <MoreHorizRounded />
         </IconButton>
         <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={handleClearShoppingList}>
               <ListItemIcon>{<SortByAlpha />}</ListItemIcon>
               <ListItemText>{`Clear Shopping List`}</ListItemText>
            </MenuItem>
         </Menu>
      </>
   );
}
