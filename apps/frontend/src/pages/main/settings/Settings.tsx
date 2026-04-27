import { DeleteOutlineOutlined, LogoutOutlined, RestartAltOutlined } from '@mui/icons-material';
import { Divider, ListItemIcon, ListItemText, MenuItem, MenuList, Paper, Stack } from '@mui/material';
import type React from 'react';
import { useNavigate } from 'react-router';
import { FirebaseError } from 'firebase/app';
import { deleteUser, GoogleAuthProvider, reauthenticateWithPopup, signOut } from 'firebase/auth';
import { auth } from '../../../firebase/config';
import { ROUTE_PATHS } from '../../../routes/router';

export default function Settings(): React.JSX.Element {
   const navigate = useNavigate();

   function resetAllData(): void {
      localStorage.clear();
   }

   function deleteAccount(): void {
      const user = auth.currentUser;
      if (!user) return void navigate(ROUTE_PATHS.auth_login, { replace: true });
      resetAllData();
      deleteUser(user).catch((err) => {
         if (!(err instanceof FirebaseError) || err.code !== 'auth/requires-recent-login') {
            void reauthenticateWithPopup(user, new GoogleAuthProvider()).then(() => void deleteUser(user));
         }
      });
   }

   function logout(): void {
      signOut(auth).catch((err) => window.alert(err instanceof Error ? err.message : 'Could not log out.'));
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
               <MenuItem onClick={deleteAccount}>
                  <ListItemIcon>
                     <DeleteOutlineOutlined />
                  </ListItemIcon>
                  <ListItemText>Delete Account</ListItemText>
               </MenuItem>
               <MenuItem onClick={logout}>
                  <ListItemIcon>
                     <LogoutOutlined />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
               </MenuItem>
            </MenuList>
         </Paper>
      </Stack>
   );
}
