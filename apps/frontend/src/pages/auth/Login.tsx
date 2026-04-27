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
         minHeight="100%"
         justifyContent="center"
         alignItems="center"
         padding={2}
         sx={{ background: 'linear-gradient(135deg, #121212 0%, #0c0e1c 50%, #121212 100%)' }}
      >
         <Paper
            elevation={0}
            sx={{ maxWidth: 390, boxShadow: '0 24px 80px rgba(0, 0, 0, 0.35)', background: '#3b3b3b26', backdropFilter: 'blur(10px)' }}
         >
            <Stack gap={3} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: { xs: 3, sm: 4 } }}>
               <Stack direction="row" alignItems="center" gap={1.5}>
                  <Box component="img" src="/logo.svg" alt="Routinely" sx={{ width: 50, height: 50, mixBlendMode: 'lighten' }} />
                  <Box>
                     <Typography color="primary" fontWeight={700}>
                        Routinely
                     </Typography>
                     <Typography variant="caption" color="text.secondary">
                        Daily routines, kept simple
                     </Typography>
                  </Box>
               </Stack>
               <Typography variant="h4" component="h1" sx={{ fontWeight: 700, lineHeight: 1.12 }}>
                  Welcome back
               </Typography>
               {error && <Alert severity="error">{error}</Alert>}
               <Button fullWidth variant="contained" startIcon={<GoogleIcon />} onClick={login} loading={isLoading} sx={{ textTransform: 'none' }}>
                  Continue with Google
               </Button>
               <Typography variant="caption" color="text.secondary" textAlign="center">
                  Use the same Google account each time to keep your data available.
               </Typography>
            </Stack>
         </Paper>
      </Stack>
   );
}
