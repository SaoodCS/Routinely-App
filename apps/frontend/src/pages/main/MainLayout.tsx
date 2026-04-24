import { ArrowBack, HomeOutlined, SettingsOutlined } from '@mui/icons-material';
import { AppBar, BottomNavigation, BottomNavigationAction, Box, Container, IconButton, Toolbar, Typography } from '@mui/material';
import { Outlet, useMatches, useNavigate } from 'react-router';
import { ROUTE_PATHS, type T_Route_Path, type T_Route_UseMatches } from '../../routes/router';

export default function MainLayout(): React.JSX.Element {
   const navigate = useNavigate();
   const matches = useMatches() as T_Route_UseMatches;
   const currentMatch = matches.at(-1);
   const HeaderRightEl = currentMatch?.handle?.header?.RightElement;

   return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
         {!currentMatch?.handle?.header?.hide && (
            <AppBar>
               <Toolbar>
                  {currentMatch?.handle?.header?.showBack && (
                     <IconButton sx={{ mr: 1 }} onClick={() => void navigate(matches.at(-2)?.pathname ?? '/')}>
                        <ArrowBack />
                     </IconButton>
                  )}
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                     {currentMatch?.handle?.header?.title}
                  </Typography>
                  {HeaderRightEl && <HeaderRightEl />}
               </Toolbar>
            </AppBar>
         )}

         <Container>
            <Outlet />
         </Container>

         {!currentMatch?.handle?.nav?.hide && (
            <BottomNavigation
               value={matches.findLast((match) => match.handle?.nav?.inBottomNav)?.pathname ?? false}
               onChange={(_, newValue: T_Route_Path) => void navigate(newValue)}
            >
               <BottomNavigationAction label={'Home'} value={ROUTE_PATHS.main_home} icon={<HomeOutlined />} />
               <BottomNavigationAction label={'Settings'} value={ROUTE_PATHS.main_settings} icon={<SettingsOutlined />} />
            </BottomNavigation>
         )}
      </Box>
   );
}
