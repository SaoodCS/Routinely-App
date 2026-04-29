import { DeleteOutlineOutlined, LocalOfferOutlined, LogoutOutlined, RestartAltOutlined } from '@mui/icons-material';
import {
   Alert,
   Divider,
   ListItemIcon,
   ListItemText,
   MenuItem,
   MenuList,
   Paper,
   Snackbar,
   Stack,
   Switch,
   Typography,
   type AlertProps,
} from '@mui/material';
import type React from 'react';
import { useNavigate } from 'react-router';
import { FirebaseError } from 'firebase/app';
import { deleteUser, GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth';
import { useState } from 'react';
import { auth } from '../../../firebase/config';
import { ROUTE_PATHS } from '../../../routes/router';
import { useFirestoreContext } from '../../../database/useFirestoreContext';

export default function Settings(): React.JSX.Element {
   const navigate = useNavigate();
   const { setSettings, settings } = useFirestoreContext();
   const [snackbar, setSnackbar] = useState<{ msg: string; severity: AlertProps['severity'] }>();

   function resetAllData(): void {
      localStorage.clear();
      setSnackbar({ msg: `All data has been reset`, severity: 'success' });
   }

   function deleteAccount(): void {
      const user = auth.currentUser;
      if (!user) return void navigate(ROUTE_PATHS.auth_login, { replace: true });
      resetAllData();
      deleteUser(user).catch((err) => {
         if (!(err instanceof FirebaseError) || err.code !== 'auth/requires-recent-login') {
            void reauthenticateWithPopup(user, new GoogleAuthProvider())
               .then(() => void deleteUser(user))
               .catch(() => setSnackbar({ msg: `Could not delete account`, severity: 'error' }));
         }
      });
   }

   function logout(): void {
      void navigate(ROUTE_PATHS.auth_logout, { replace: true });
   }

   function toggleInheritTagsFromSource(): void {
      setSettings({ ...settings, inheritTagsFromSource: !settings.inheritTagsFromSource });
      // TODO: implement inheritTagsFromSource in the createTask / createSubTask function of the app
   }

   return (
      <>
         <Stack height="100%" overflow={'auto'} alignItems={'center'} padding="1rem" gap={3}>
            <Typography variant="h6">App Settings</Typography>
            <Paper sx={{ width: '100%', borderRadius: '1rem' }}>
               <MenuList>
                  <MenuItem onClick={toggleInheritTagsFromSource}>
                     <ListItemIcon>
                        <LocalOfferOutlined color="secondary" />
                     </ListItemIcon>
                     <ListItemText>Inherit Tags From Source Task</ListItemText>
                     <Switch color="secondary" checked={settings.inheritTagsFromSource ?? false} />
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
         <Snackbar open={Boolean(snackbar)} onClose={() => setSnackbar(undefined)} autoHideDuration={3000}>
            <Alert onClose={() => setSnackbar(undefined)} severity={snackbar?.severity} sx={{ width: '100%' }}>
               {snackbar?.msg}
            </Alert>
         </Snackbar>
      </>
   );
}
