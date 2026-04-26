import { DeleteOutlineOutlined, RestartAltOutlined } from '@mui/icons-material';
import { Divider, ListItemIcon, ListItemText, MenuItem, MenuList, Stack } from '@mui/material';
import type React from 'react';
import { lighten } from '@mui/material/styles';

export default function Settings(): React.JSX.Element {
   function resetAllData(): void {
      localStorage.clear();
   }

   return (
      <Stack height="100%" overflow={'auto'} alignItems={'center'} padding="1rem">
         <MenuList
            dense
            sx={{
               width: '100%',
               bgcolor: ({ palette }) => lighten(palette.background.default, 0.05),
               borderRadius: '1rem',
               boxShadow: '0 0 1rem rgba(0, 0, 0, 0.2)',
            }}
         >
            <MenuItem onClick={resetAllData}>
               <ListItemIcon>
                  <RestartAltOutlined />
               </ListItemIcon>
               <ListItemText>Reset All Data</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem>
               <ListItemIcon>
                  <DeleteOutlineOutlined />
               </ListItemIcon>
               <ListItemText>Delete Account</ListItemText>
            </MenuItem>
         </MenuList>
      </Stack>
   );
}
