import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { type JSX } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

export default function PWADialog(): JSX.Element {
   const [dialogSeen, setDialogSeen] = useLocalStorage('pwa-dialog-seen', false);

   function isPWAInstalled(): boolean {
      return window.matchMedia('(display-mode: standalone)').matches;
   }

   function handleClose(): void {
      setDialogSeen(true);
   }

   return (
      <Dialog open={!dialogSeen && !isPWAInstalled()} onClose={handleClose}>
         <DialogTitle>Install this app as a PWA</DialogTitle>
         <DialogContent>
            <DialogContentText>To access all features of this app, install it as a PWA.</DialogContentText>
         </DialogContent>
         <DialogActions>
            <Button onClick={handleClose}>Close</Button>
         </DialogActions>
      </Dialog>
   );
}
