import type { Palette, PaletteColor, ThemeOptions } from '@mui/material/styles';
import { alpha, createTheme } from '@mui/material/styles';

const palette: ThemeOptions['palette'] = {
   mode: 'dark',
   background: { default: '#071018', paper: '#071018' },
   primary: { main: '#50abf6', light: '#8ec9fb', dark: '#2f86d1' },
   secondary: { main: '#c77dd4', light: '#e3b7ec', dark: '#9959a8' },
   error: { main: '#f28b82', light: '#ffc1c1', dark: '#c25c5c' },
   warning: { main: '#ffb74d', light: '#ffe0a3', dark: '#c88719' },
   success: { main: '#81c784', light: '#b9e3bb', dark: '#519657' },
   info: { main: '#4fc3f7', light: '#a5e1fb', dark: '#2a92c7' },
   divider: '#ffffff1f',
   grey: { 50: '#fafafa', 100: '#f5f5f5', 300: '#e0e0e0', 500: '#9e9e9e', 600: '#757575', 800: '#424242' },
   text: { primary: '#fff', secondary: '#ffffffb3', disabled: '#ffffff80' },
   action: {
      active: '#fff',
      hover: '#ffffff14',
      hoverOpacity: 0.08,
      selected: '#ffffff29',
      selectedOpacity: 0.16,
      disabled: '#ffffff4d',
      disabledBackground: '#ffffff1f',
      disabledOpacity: 0.38,
      focus: '#ffffff1f',
      focusOpacity: 0.12,
      activatedOpacity: 0.24,
   },
   contrastThreshold: 3,
   tonalOffset: 0.2,
   getContrastText: (background) => (background === '#071018' ? '#fff' : '#071018'),
};

const typography: ThemeOptions['typography'] = {
   fontFamily: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'].join(','),
   h6: { lineHeight: 1 },
};

const transitions: ThemeOptions['transitions'] = {
   duration: { enteringScreen: 600, leavingScreen: 600 },
};

const hHeight = '55px';
const fHeight = '70px';
const components_layout: ThemeOptions['components'] = {
   MuiAppBar: {
      defaultProps: { component: 'header', elevation: 0, position: 'sticky', square: false },
      styleOverrides: {
         root: { flexShrink: 0, height: hHeight, justifyContent: 'center' },
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

const components: ThemeOptions['components'] = {
   MuiAlert: { styleOverrides: { root: { width: '100%' } } },
   MuiMenuItem: { defaultProps: { dense: true } },
   MuiMenu: { styleOverrides: { paper: { overflowY: 'auto', maxHeight: '30rem', minWidth: '15rem' } } },
   MuiButton: { styleOverrides: { root: { textTransform: 'none' } } },
   MuiChip: {
      defaultProps: { variant: 'filled', clickable: false },
      styleOverrides: {
         root: ({ theme: t }) => ({
            backgroundColor: 'black',
            opacity: 1,
            cursor: 'pointer',
            border: `1px solid ${t.palette.divider}`,
            pointerEvents: 'auto',
         }),
      },
   },
   MuiSnackbar: { defaultProps: { anchorOrigin: { horizontal: 'right', vertical: 'top' } } },
   MuiAvatar: { styleOverrides: { root: ({ theme: t }) => ({ backgroundColor: alpha(t.palette.primary.main, 0.05) }) } },
   MuiIconButton: {
      defaultProps: { size: 'small' },
      styleOverrides: {
         root: ({ theme: t }) => ({
            borderRadius: '50%',
            backgroundColor: alpha(t.palette.primary.main, 0.05),
            border: `1px solid ${t.palette.divider}`,
         }),
      },
   },
   MuiFab: { defaultProps: { color: 'primary' } },
   MuiIcon: { defaultProps: { fontSize: 'small' } },
   MuiSvgIcon: { defaultProps: { fontSize: 'small' } },
   MuiSpeedDial: {
      styleOverrides: {
         root: { '& .MuiSpeedDial-actionsClosed': { width: 0, height: 0, margin: 0, padding: 0, overflow: 'hidden' }, pointerEvents: 'auto' },
      },
   },
   MuiSpeedDialAction: { styleOverrides: { staticTooltipLabel: { whiteSpace: 'nowrap', width: 'max-content' } } },
};

const theme = createTheme({ palette, typography, transitions, components: { ...components_layout, ...components } });
export default theme;
export type PaletteOption = { [K in keyof Palette]: Palette[K] extends PaletteColor ? K : never }[keyof Palette];
export type PaletteShade = keyof PaletteColor;
