import { DeleteOutlineOutlined, LocalOfferOutlined, LogoutOutlined, RestartAltOutlined } from '@mui/icons-material';
import { Divider, ListItemIcon, ListItemText, MenuItem, MenuList, Paper, Stack, Switch, Typography } from '@mui/material';
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

   function inheritTagsFromSource(): void {
      //TODO: implement this - when enabled: when a user creates a task, it will inherit the tags from the source task they created it from
   }

   return (
      <Stack height="100%" overflow={'auto'} alignItems={'center'} padding="1rem" gap="1rem">
         <Typography variant="h6">App Settings</Typography>
         <Paper sx={{ width: '100%', borderRadius: '1rem' }}>
            <MenuList>
               <MenuItem onClick={inheritTagsFromSource}>
                  <ListItemIcon>
                     <LocalOfferOutlined color="secondary" />
                  </ListItemIcon>
                  <ListItemText>Inherit Tags From Source Task</ListItemText>
                  <Switch color="secondary" />
               </MenuItem>
            </MenuList>
         </Paper>
         <Typography variant="h6">Account Settings</Typography>
         <Paper sx={{ width: '100%', borderRadius: '1rem' }}>
            <MenuList>
               <MenuItem onClick={resetAllData}>
                  <ListItemIcon>
                     <RestartAltOutlined color="warning" />
                  </ListItemIcon>
                  <ListItemText>Reset All Data</ListItemText>
               </MenuItem>
               <Divider />
               <MenuItem onClick={logout}>
                  <ListItemIcon>
                     <LogoutOutlined color="warning" />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
               </MenuItem>
               <Divider />
               <MenuItem onClick={deleteAccount}>
                  <ListItemIcon>
                     <DeleteOutlineOutlined color="error" />
                  </ListItemIcon>
                  <ListItemText>Delete Account</ListItemText>
               </MenuItem>
            </MenuList>
         </Paper>
      </Stack>
   );
}
