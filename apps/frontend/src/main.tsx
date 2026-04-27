import { Box, ThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// eslint-disable-next-line import/no-unresolved
import { registerSW } from 'virtual:pwa-register';
import { RouterProvider } from 'react-router';
import { router } from './routes/router.tsx';
import theme from './theme/theme.ts';
import { AuthProvider } from './auth/useAuth.tsx';
import { DatabaseProvider } from './database/useDatabase.tsx';

registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
   <StrictMode>
      <ThemeProvider theme={theme}>
         <CssBaseline />
         <Box sx={{ height: '100dvh', width: '100dvw', boxSizing: 'border-box', position: 'relative' }}>
            <AuthProvider>
               <DatabaseProvider>
                  <RouterProvider router={router} />
               </DatabaseProvider>
            </AuthProvider>
         </Box>
      </ThemeProvider>
   </StrictMode>,
);
