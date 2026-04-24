import type { ThemeOptions } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

// TODO: customize palette styles here
const palette: ThemeOptions['palette'] = { mode: 'dark', background: { default: '#121212' } };

//TODO: customize text styles here
const typography: ThemeOptions['typography'] = {
   fontFamily: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'].join(','),
};

//TODO: customize transition styles here (applies to transition components e.g. Fade, Grow, Zoom etc)
const transitions: ThemeOptions['transitions'] = {
   duration: { enteringScreen: 600, leavingScreen: 600 },
};

// TODO: customize layout components here
const hHeight = '55px';
const fHeight = '70px';
const components_layout: ThemeOptions['components'] = {
   MuiAppBar: {
      defaultProps: { component: 'header', elevation: 0, position: 'sticky', square: false },
      styleOverrides: {
         root: ({ theme: t }) => ({ borderBottom: `1px solid ${t.palette.divider}`, flexShrink: 0, height: hHeight, justifyContent: 'center' }),
      },
   },
   MuiContainer: {
      defaultProps: { component: 'main', disableGutters: true, maxWidth: false },
      styleOverrides: {
         root: { position: 'relative', flex: '1 1 0', minHeight: 0, overflow: 'clip' },
      },
   },
   MuiBottomNavigation: {
      defaultProps: { component: 'nav', showLabels: false },
      styleOverrides: {
         root: ({ theme: t }) => ({ borderTop: `1px solid ${t.palette.divider}`, flexShrink: 0, minHeight: fHeight, width: '100%' }),
      },
   },
   MuiBottomNavigationAction: { styleOverrides: { label: { display: 'none' }, root: { padding: 'unset' } } },
};

//TODO: customize components here which are re-used multiple times w/ the same style. Otherwise, just inline-style
const components: ThemeOptions['components'] = {};

const theme = createTheme({ palette, typography, transitions, components: { ...components_layout, ...components } });
export default theme;
