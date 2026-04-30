import GoogleIcon from '@mui/icons-material/Google';
import { Alert, Box, Button, Divider, Stack, TextField, Typography, useTheme } from '@mui/material';
import { useState } from 'react';
import {
   browserLocalPersistence,
   createUserWithEmailAndPassword,
   GoogleAuthProvider,
   setPersistence,
   signInAnonymously,
   signInWithEmailAndPassword,
   signInWithRedirect,
} from 'firebase/auth';
import { AppRegistration, LoginSharp, Person } from '@mui/icons-material';
import { FirebaseError } from 'firebase/app';
import { auth } from '../../firebase/config';

export function Login(): React.JSX.Element {
   const [isLoading, setIsLoading] = useState<'reg' | 'email-pwd' | 'google' | 'anonymous'>();
   const [error, setError] = useState<string | null>(null);
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const { palette } = useTheme();
   const validForm = (): boolean => email.includes('@') && password.length >= 6;

   function regViaEmailPwd(e: React.MouseEvent<HTMLButtonElement>): void {
      e.preventDefault();
      setError(null);
      if (!validForm()) return setError('Enter a valid email and a password > 6 characters.');
      setIsLoading('reg');
      createUserWithEmailAndPassword(auth, email, password)
         .then(() => loginViaEmailPwd(e))
         .catch((e) => setError(e instanceof FirebaseError ? e.message : 'Registration failed.'))
         .finally(() => setIsLoading(undefined));
   }

   function loginViaEmailPwd(e: React.SubmitEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>): void {
      e.preventDefault();
      setError(null);
      if (!validForm()) return setError('Enter a valid email and a password > 6 characters.');
      setIsLoading('email-pwd');
      setPersistence(auth, browserLocalPersistence)
         .then(() => signInWithEmailAndPassword(auth, email, password))
         .catch((e) => setError(e instanceof FirebaseError ? e.message : 'Login failed.'))
         .finally(() => setIsLoading(undefined));
   }

   function loginViaGoogle(e: React.MouseEvent<HTMLButtonElement>): void {
      e.preventDefault();
      setIsLoading('google');
      setError(null);
      setPersistence(auth, browserLocalPersistence)
         .then(() => signInWithRedirect(auth, new GoogleAuthProvider()))
         .catch((e) => setError(e instanceof FirebaseError ? e.message : 'Login failed.'))
         .finally(() => setIsLoading(undefined));
   }

   function loginAnonymously(e: React.MouseEvent<HTMLButtonElement>): void {
      e.preventDefault();
      setIsLoading('anonymous');
      setError(null);
      setPersistence(auth, browserLocalPersistence)
         .then(() => signInAnonymously(auth))
         .catch((e) => setError(e instanceof FirebaseError ? e.message : 'Login failed.'))
         .finally(() => setIsLoading(undefined));
   }

   return (
      <Stack
         minHeight="100%"
         justifyContent="center"
         alignItems="center"
         padding={2}
         sx={{
            background: palette.background.default,
            backgroundImage: `linear-gradient(to right, #42a4f51d 1px, transparent 1px),linear-gradient(to bottom, #42a4f51d 1px, transparent 1px),radial-gradient(circle at 50% 50%, #42a4f519 0%, transparent 70%)`,
            backgroundSize: '85px 85px, 85px 85px, 100% 100%',
         }}
      >
         <Stack
            gap={3}
            boxShadow={'0 24px 80px #00000080'}
            bgcolor={'#ffffff05'}
            sx={{ p: { xs: 3, sm: 4 }, backdropFilter: 'blur(3px)', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}
         >
            <Stack direction="row" alignItems="center" gap={1.5}>
               <Box component="img" src="/logo-transparent.svg" alt="Routinely" sx={{ width: 56, height: 56, display: 'block' }} />
               <Box>
                  <Typography color="primary" fontWeight={700}>
                     Routinely
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                     Daily routines, kept simple
                  </Typography>
               </Box>
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.12 }}>
               Get started
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <Stack component={'form'} gap={2} onSubmit={loginViaEmailPwd}>
               <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
               <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
               <Stack direction="row" alignItems={'center'} justifyContent={'center'} gap={2}>
                  <Button startIcon={<LoginSharp />} variant="contained" type="submit" loading={isLoading === 'email-pwd'} fullWidth>
                     Login
                  </Button>
                  <Button startIcon={<AppRegistration />} variant="contained" loading={isLoading === 'reg'} onClick={regViaEmailPwd} fullWidth>
                     Register
                  </Button>
               </Stack>
            </Stack>
            <Divider>or</Divider>
            <Stack gap={2}>
               <Button fullWidth variant="outlined" startIcon={<GoogleIcon />} loading={isLoading === 'google'} onClick={loginViaGoogle}>
                  Continue with Google
               </Button>
               <Button fullWidth variant="outlined" startIcon={<Person />} loading={isLoading === 'anonymous'} onClick={loginAnonymously}>
                  Continue Anonymously
               </Button>
            </Stack>
            <Typography variant="caption" color="text.secondary" textAlign="center">
               Anonymous accounts are automatically deleted after 30 days.
            </Typography>
         </Stack>
      </Stack>
   );
}
