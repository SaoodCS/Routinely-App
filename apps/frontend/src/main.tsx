import { Box, ThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
// eslint-disable-next-line import/no-unresolved
import { registerSW } from 'virtual:pwa-register';
import { AuthProvider } from './authentication/useAuthContext.tsx';
import PWADialog from './components/PWADialog.tsx';
import { FirestoreProvider } from './database/useFirestoreContext.tsx';
import { LocalStorageProvider } from './database/useLocalStorageContext.tsx';
import theme from './theme/theme.ts';
import { router } from './routes/index.tsx';

registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
   <StrictMode>
      <ThemeProvider theme={theme}>
         <CssBaseline />
         <Box sx={{ height: '100dvh', width: '100dvw', boxSizing: 'border-box', position: 'relative' }}>
            <PWADialog />
            <AuthProvider>
               <LocalStorageProvider>
                  <FirestoreProvider>
                     <RouterProvider router={router} />
                  </FirestoreProvider>
               </LocalStorageProvider>
            </AuthProvider>
         </Box>
      </ThemeProvider>
   </StrictMode>,
);
