import GoogleIcon from '@mui/icons-material/Google';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { browserLocalPersistence, GoogleAuthProvider, setPersistence, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase/config';

export function Login(): React.JSX.Element {
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   function login(): void {
      setIsLoading(true);
      setError(null);
      setPersistence(auth, browserLocalPersistence)
         .then(() => signInWithPopup(auth, new GoogleAuthProvider()))
         .catch((err) => setError(err instanceof Error ? err.message : 'Login failed.'))
         .finally(() => setIsLoading(false));
   }

   return (
      <Stack
         height="100%"
         justifyContent="center"
         alignItems="center"
         padding="1rem"
         sx={{ background: 'radial-gradient(circle at top, rgba(144, 202, 249, 0.18), transparent 38%)' }}
      >
         <Paper sx={{ width: '100%', maxWidth: 380, borderRadius: '1rem', border: '1px solid', borderColor: 'divider', p: 3.5, boxShadow: 8 }}>
            <Stack gap={2} alignItems="center">
               <Box component="img" src="/logo.svg" alt="Routinely" sx={{ width: 88, height: 88, mixBlendMode: 'lighten' }} />
               <Typography variant="h5" component="h1">
                  Welcome back
               </Typography>
               {error && (
                  <Alert severity="error" sx={{ width: '100%' }}>
                     {error}
                  </Alert>
               )}
               <Button fullWidth variant="contained" startIcon={<GoogleIcon />} onClick={login} loading={isLoading} disabled={isLoading}>
                  Continue with Google
               </Button>
            </Stack>
         </Paper>
      </Stack>
   );
}
