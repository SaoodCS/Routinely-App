import { DeleteOutlineOutlined, RestartAltOutlined } from '@mui/icons-material';
import { Divider, ListItemIcon, ListItemText, MenuItem, MenuList, Paper, Stack } from '@mui/material';
import type React from 'react';

export default function Settings(): React.JSX.Element {
   function resetAllData(): void {
      localStorage.clear();
   }

   return (
      <Stack height="100%" overflow={'auto'} alignItems={'center'} padding="1rem" gap="1rem">
         <Paper sx={{ width: '100%', borderRadius: '1rem' }}>
            <MenuList>
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
         </Paper>
      </Stack>
   );
}
