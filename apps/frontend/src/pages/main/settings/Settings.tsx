import { DeleteOutlineOutlined, LocalOfferOutlined, LogoutOutlined, Person, RestartAltOutlined } from '@mui/icons-material';
import {
   Alert,
   Avatar,
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
import { deleteUser } from 'firebase/auth';
import { useState } from 'react';
import { ROUTE_PATHS } from '../../../routes/router';
import { useFirestoreContext } from '../../../database/useFirestoreContext';
import { useAuthContext } from '../../../auth/useAuthContext';

export default function Settings(): React.JSX.Element {
   const { user } = useAuthContext();
   const navigate = useNavigate();
   const { setSettings, setMorningTasks, setEveningTasks, setTags, settings } = useFirestoreContext();
   const [snackbar, setSnackbar] = useState<{ msg: string; severity: AlertProps['severity'] }>();

   function resetAllData(): void {
      setSettings({});
      setMorningTasks([]);
      setEveningTasks([]);
      setTags([]);
      setSnackbar({ msg: `All data has been reset`, severity: 'success' });
   }

   function deleteAccount(): void {
      if (!user) return void navigate(ROUTE_PATHS.auth_login, { replace: true });
      deleteUser(user).catch((e) => {
         setSnackbar({ msg: e instanceof FirebaseError ? e.message : `Could not delete account`, severity: 'error' });
      });
   }

   function logout(): void {
      void navigate(ROUTE_PATHS.auth_logout, { replace: true });
   }

   function toggleInheritTagsFromSource(): void {
      setSettings({ ...settings, inheritTagsFromSource: !settings.inheritTagsFromSource });
   }

   return (
      <>
         <Snackbar open={Boolean(snackbar)} onClose={() => setSnackbar(undefined)} autoHideDuration={3000}>
            <Alert onClose={() => setSnackbar(undefined)} severity={snackbar?.severity} sx={{ width: '100%' }}>
               {snackbar?.msg}
            </Alert>
         </Snackbar>

         <Stack height="100%" overflow={'auto'} alignItems={'center'} padding={2} gap={3}>
            {user?.email && (
               <Stack direction={'column'} gap={1} justifyContent={'center'} alignItems={'center'}>
                  <Avatar>
                     <Person fontSize="large" />
                  </Avatar>
                  <Typography variant="overline" fontWeight={600}>
                     {user.email}
                  </Typography>
               </Stack>
            )}
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
      </>
   );
}
