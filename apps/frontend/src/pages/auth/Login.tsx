import GoogleIcon from '@mui/icons-material/Google';
import { Alert, Button, Paper, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { browserLocalPersistence, GoogleAuthProvider, setPersistence, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase/config';

export function Login(): React.JSX.Element {
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   function login(): void {
      setIsLoading(true);
      setError(null);
      const provider = new GoogleAuthProvider();
      setPersistence(auth, browserLocalPersistence)
         .then(() => signInWithPopup(auth, provider))
         .catch((err) => setError(err instanceof Error ? err.message : 'Login failed.'))
         .finally(() => setIsLoading(false));
   }

   return (
      <Stack height="100%" justifyContent="center" alignItems="center" padding="1rem">
         <Paper sx={{ width: '100%', maxWidth: 360, borderRadius: '1rem', p: 3 }}>
            <Stack gap={2}>
               <Typography variant="h5" component="h1">
                  Login
               </Typography>
               {error && <Alert severity="error">{error}</Alert>}
               <Button variant="contained" startIcon={<GoogleIcon />} onClick={login} loading={isLoading} disabled={isLoading}>
                  Continue with Google
               </Button>
            </Stack>
         </Paper>
      </Stack>
   );
}
