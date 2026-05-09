import { ArrowBack, BedtimeOutlined, LightModeOutlined, LocalOfferOutlined, SettingsOutlined } from '@mui/icons-material';
import { AppBar, Avatar, BottomNavigation, BottomNavigationAction, Box, Container, IconButton, Stack, Toolbar, Typography } from '@mui/material';
import { Outlet, useMatches, useNavigate } from 'react-router';
import { ROUTE_PATHS, type T_Route_Path, type T_Route_UseMatches } from '../index.route';

export default function MainLayout(): React.JSX.Element {
   const navigate = useNavigate();
   const matches = useMatches() as T_Route_UseMatches;
   const currentMatch = matches.at(-1);
   const HeaderRightEl = currentMatch?.handle?.header?.RightElement;
   const HeaderTitle = currentMatch?.handle?.header?.title ?? 'Routinely';
   const HeaderIcon = currentMatch?.handle?.header?.Icon;

   return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
         {!currentMatch?.handle?.header?.hide && (
            <AppBar>
               <Toolbar sx={{ gap: 1 }}>
                  {currentMatch?.handle?.header?.showBack && (
                     <IconButton sx={{ mr: 1 }} onClick={() => void navigate(matches.at(-2)?.pathname ?? '/')}>
                        <ArrowBack />
                     </IconButton>
                  )}
                  <Stack direction={'row'} alignItems={'center'} gap={1.5}>
                     {HeaderIcon && (
                        <Avatar>
                           <HeaderIcon />
                        </Avatar>
                     )}
                     {HeaderTitle && (typeof HeaderTitle === 'string' ? <Typography variant="h6">{HeaderTitle}</Typography> : <HeaderTitle />)}
                  </Stack>

                  <Stack direction={'row'} alignItems={'center'} ml={'auto'}>
                     {HeaderRightEl && <HeaderRightEl />}
                  </Stack>
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
               <BottomNavigationAction label={'Morning'} value={ROUTE_PATHS.main_routine_morning} icon={<LightModeOutlined />} />
               <BottomNavigationAction label={'Evening'} value={ROUTE_PATHS.main_routine_evening} icon={<BedtimeOutlined />} />
               <BottomNavigationAction label={'Tags'} value={ROUTE_PATHS.main_tags} icon={<LocalOfferOutlined />} />
               <BottomNavigationAction label={'Settings'} value={ROUTE_PATHS.main_settings} icon={<SettingsOutlined />} />
            </BottomNavigation>
         )}
      </Box>
   );
}
