import GoogleIcon from '@mui/icons-material/Google';
import { Alert, Box, Button, Divider, Paper, Stack, TextField, Typography, useTheme } from '@mui/material';
import { useState } from 'react';
import {
   browserLocalPersistence,
   createUserWithEmailAndPassword,
   GoogleAuthProvider,
   setPersistence,
   signInWithEmailAndPassword,
   signInWithRedirect,
} from 'firebase/auth';
import { AppRegistration, LoginSharp, Person } from '@mui/icons-material';
import { auth } from '../../firebase/config';

export function Login(): React.JSX.Element {
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const { palette } = useTheme();
   const validForm = (): boolean => email.includes('@') && password.length >= 6;

   function regViaEmailPwd(e: React.MouseEvent<HTMLButtonElement>): void {
      e.preventDefault();
      setIsLoading(true);
      setError(null);
      if (!validForm()) return setError('Enter a valid email and a password > 6 characters.');
      createUserWithEmailAndPassword(auth, email, password)
         .then(() => loginViaEmailPwd(e))
         .catch((err) => setError(err instanceof Error ? err.message : 'Registration failed.'))
         .finally(() => setIsLoading(false));
   }

   function loginViaEmailPwd(e: React.SubmitEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>): void {
      e.preventDefault();
      setIsLoading(true);
      setError(null);
      if (!validForm()) return setError('Enter a valid email and a password > 6 characters.');
      setPersistence(auth, browserLocalPersistence)
         .then(() => signInWithEmailAndPassword(auth, email, password))
         .catch((err) => setError(err instanceof Error ? err.message : 'Login failed.'))
         .finally(() => setIsLoading(false));
   }

   function loginViaGoogle(e: React.MouseEvent<HTMLButtonElement>): void {
      e.preventDefault();
      setIsLoading(true);
      setError(null);
      setPersistence(auth, browserLocalPersistence)
         .then(() => signInWithRedirect(auth, new GoogleAuthProvider()))
         .catch((err) => setError(err instanceof Error ? err.message : 'Login failed.'))
         .finally(() => setIsLoading(false));
   }

   return (
      <Stack
         minHeight="100%"
         justifyContent="center"
         alignItems="center"
         padding={2}
         sx={{
            background: palette.background.default,
            backgroundImage: `
        linear-gradient(to right, #42a4f51d 1px, transparent 1px),
        linear-gradient(to bottom, #42a4f51d 1px, transparent 1px),
        radial-gradient(circle at 50% 50%, #42a4f519 0%, transparent 70%)
      `,
            backgroundSize: '85px 85px, 85px 85px, 100% 100%',
         }}
      >
         <Paper
            elevation={0}
            sx={{ maxWidth: 400, boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5)', background: '#ffffff05', backdropFilter: 'blur(3px)' }}
         >
            <Stack gap={3} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: { xs: 3, sm: 4 } }}>
               <Stack direction="row" alignItems="center" gap={1.5}>
                  <Box component="img" src="/logo-transparent.svg" alt="Routinely" sx={{ width: 50, height: 50 }} />
                  <Box>
                     <Typography color="primary" fontWeight={700}>
                        Routinely
                     </Typography>
                     <Typography variant="caption" color="text.secondary">
                        Daily routines, kept simple
                     </Typography>
                  </Box>
               </Stack>
               <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.12 }}>
                  Welcome back
               </Typography>
               {error && <Alert severity="error">{error}</Alert>}
               <Stack component={'form'} gap={2} onSubmit={loginViaEmailPwd}>
                  <TextField size="small" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <TextField size="small" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <Button startIcon={<LoginSharp />} name="login" variant="contained" type="submit" loading={isLoading}>
                     Login
                  </Button>
                  <Button startIcon={<AppRegistration />} variant="contained" loading={isLoading} onClick={regViaEmailPwd}>
                     Register
                  </Button>
               </Stack>
               <Divider>or</Divider>
               <Stack gap={2}>
                  <Button fullWidth variant="outlined" startIcon={<GoogleIcon />} loading={isLoading} onClick={loginViaGoogle}>
                     Continue with Google
                  </Button>
                  <Button fullWidth variant="outlined" startIcon={<Person />} loading={isLoading} onClick={loginViaGoogle}>
                     Continue Anonymously
                  </Button>
               </Stack>
               <Typography variant="caption" color="text.secondary" textAlign="center">
                  Anonymous account are automatically deleted after 30 days.
               </Typography>
            </Stack>
         </Paper>
      </Stack>
   );
}
