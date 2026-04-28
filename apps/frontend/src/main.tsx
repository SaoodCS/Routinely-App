import { Box, ThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
// eslint-disable-next-line import/no-unresolved
import { registerSW } from 'virtual:pwa-register';
import { AuthProvider } from './auth/useAuthContext.tsx';
import { LocalStorageProvider } from './database/useLocalStorageContext.tsx';
import { router } from './routes/router.tsx';
import theme from './theme/theme.ts';

registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
   <StrictMode>
      <ThemeProvider theme={theme}>
         <CssBaseline />
         <Box sx={{ height: '100dvh', width: '100dvw', boxSizing: 'border-box', position: 'relative' }}>
            <AuthProvider>
               <LocalStorageProvider>
                  <RouterProvider router={router} />
               </LocalStorageProvider>
            </AuthProvider>
         </Box>
      </ThemeProvider>
   </StrictMode>,
);
