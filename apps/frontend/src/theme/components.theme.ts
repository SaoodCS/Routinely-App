import { alpha } from '@mui/material';
import type { ThemeOptions } from '@mui/material/styles';

const HEADER_HEIGHT = '55px';
const FOOTER_HEIGHT = '70px';

export const components: ThemeOptions['components'] = {
   // LAYOUT-RELATED
   MuiAppBar: {
      defaultProps: { component: 'header', elevation: 0, position: 'sticky', square: false },
      styleOverrides: {
         root: { flexShrink: 0, height: HEADER_HEIGHT, justifyContent: 'center' },
      },
   },
   MuiContainer: {
      defaultProps: { component: 'main', disableGutters: true, maxWidth: false },
      styleOverrides: {
         root: { position: 'relative', flex: '1 1 0', minHeight: 0, overflow: 'clip' },
      },
   },
   MuiBottomNavigation: {
      defaultProps: { component: 'nav', showLabels: true },
      styleOverrides: {
         root: ({ theme: t }) => ({
            borderTop: `1px solid ${t.palette.divider}`,
            flexShrink: 0,
            minHeight: FOOTER_HEIGHT,
            width: '100%',
            padding: '0 10px 0 10px',
         }),
      },
   },
   MuiBottomNavigationAction: {
      styleOverrides: {
         label: { fontSize: '0.7rem', '&.Mui-selected': { fontSize: '0.8rem' } },
         root: { padding: 'unset', fontSize: '0.5rem', minWidth: 'auto', flexGrow: 1 },
      },
   },

   // POPUP-RELATED
   MuiAlert: { styleOverrides: { root: { width: '100%' } } },
   MuiSnackbar: { defaultProps: { anchorOrigin: { horizontal: 'right', vertical: 'top' } } },

   // BUTTON-RELATED
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
   MuiSwitch: { defaultProps: { size: 'small' } },
   MuiFab: { defaultProps: { color: 'primary' } },
   MuiSpeedDial: {
      styleOverrides: {
         root: { '& .MuiSpeedDial-actionsClosed': { width: 0, height: 0, margin: 0, padding: 0, overflow: 'hidden' }, pointerEvents: 'auto' },
      },
   },
   MuiSpeedDialAction: { styleOverrides: { staticTooltipLabel: { whiteSpace: 'nowrap', width: 'max-content' } } },
   MuiIconButton: {
      defaultProps: { size: 'small' },
      styleOverrides: {
         root: ({ theme: t }) => ({
            borderRadius: '50%',
            backgroundColor: alpha(t.palette.primary.main, 0.05),
            border: `1px solid ${t.palette.divider}`,
            '&.Mui-disabled': { opacity: 0.4 },
         }),
      },
   },

   // ICON-RELATED
   MuiIcon: { defaultProps: { fontSize: 'small' } },
   MuiSvgIcon: { defaultProps: { fontSize: 'small' } },
   MuiAvatar: { styleOverrides: { root: ({ theme: t }) => ({ backgroundColor: alpha(t.palette.primary.main, 0.05) }) } },

   // INPUT-RELATED
   MuiTextField: {
      styleOverrides: {
         root: ({ theme }) => ({
            '&.SearchParamField-appHeader': {
               margin: 8,
               backgroundColor: alpha(theme.palette.primary.main, 0.05),
               width: 120,
               '& .MuiOutlinedInput-root.Mui-focused fieldset': { border: '1px solid', borderColor: theme.palette.divider },
               '& .MuiOutlinedInput-input': { paddingTop: 6.8, paddingBottom: 6.8, fontSize: '0.8rem' },
               '& .MuiOutlinedInput-root.MuiInputBase-adornedEnd': { paddingRight: 5 },
               '& .MuiInputAdornment-positionEnd': {
                  marginLeft: 6.4,
                  '& .MuiIconButton-root': { padding: 4, marginRight: -2.4 },
                  '& .MuiSvgIcon-root': { fontSize: 16 },
               },
            },
         }),
      },
   },

   // LIST-RELATED
   MuiMenu: { styleOverrides: { paper: { overflowY: 'auto', maxHeight: '30rem', minWidth: '15rem' } } },
   MuiMenuItem: { defaultProps: { dense: true } },
};
