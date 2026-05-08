import { DeleteOutlineOutlined, LocalOfferOutlined, LogoutOutlined, Person, RestartAltOutlined } from '@mui/icons-material';
import {
   Alert,
   Avatar,
   Divider,
   LinearProgress,
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
import type { AppTypes } from '@repo/types/index';
import { FirebaseError } from 'firebase/app';
import { deleteUser } from 'firebase/auth';
import { doc, writeBatch } from 'firebase/firestore';
import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AppUtils } from '@repo/utils/index';
import { useAuthContext } from '../../../authentication/useAuthContext';
import { useFirestoreContext } from '../../../database/useFirestoreContext';
import { db } from '../../../firebase/config';
import { ROUTE_PATHS } from '../../../routes/router';

export default function SettingsPage(): React.JSX.Element {
   const { user } = useAuthContext();
   const navigate = useNavigate();
   const { setSettingsDb, settings } = useFirestoreContext();
   const [snackbar, setSnackbar] = useState<{ msg: string; severity: AlertProps['severity'] }>();
   const [isLoading, setIsLoading] = useState(false);

   function resetAllData(): void {
      if (!user) return void navigate(ROUTE_PATHS.auth_login, { replace: true });
      const paths = Object.entries(AppUtils.FIRESTORE_PATHS_FIELDS).map(([key]) =>
         AppUtils.getFirestorePathAndField(key as AppTypes.FirestorePathField, user.uid),
      );
      setIsLoading(true);
      const batch = writeBatch(db);
      paths.forEach(({ path }) => batch.delete(doc(db, path)));
      batch
         .commit()
         .then(() => setSnackbar({ msg: 'Data successfully reset', severity: 'success' }))
         .catch((e) => setSnackbar({ msg: e instanceof FirebaseError ? e.message : `Could not reset data`, severity: 'error' }))
         .finally(() => setIsLoading(false));
   }

   function deleteAccount(): void {
      if (!user) return void navigate(ROUTE_PATHS.auth_login, { replace: true });
      setIsLoading(true);
      deleteUser(user)
         .catch((e) => setSnackbar({ msg: e instanceof FirebaseError ? e.message : `Could not delete account`, severity: 'error' }))
         .finally(() => setIsLoading(false));
   }

   function logout(): void {
      void navigate(ROUTE_PATHS.auth_logout, { replace: true });
   }

   function toggleInheritTagsFromSource(): void {
      setSettingsDb({ ...settings, inheritTagsFromSource: !settings.inheritTagsFromSource });
   }

   return (
      <>
         {isLoading && <LinearProgress sx={{ position: 'absolute', top: 0, width: '100%' }} />}
         <Snackbar open={Boolean(snackbar)} onClose={() => setSnackbar(undefined)} autoHideDuration={3000}>
            <Alert onClose={() => setSnackbar(undefined)} severity={snackbar?.severity}>
               {snackbar?.msg}
            </Alert>
         </Snackbar>

         <Stack height="100%" overflow={'auto'} alignItems={'center'} padding={2} gap={3}>
            {user?.email && (
               <Stack direction={'column'} gap={1} justifyContent={'center'} alignItems={'center'}>
                  <Avatar sx={{ backgroundColor: 'text.secondary' }}>
                     <Person fontSize="large" />
                  </Avatar>
                  <Typography variant="overline" fontWeight={600} color={'text.secondary'}>
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
