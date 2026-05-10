import type { ThemeOptions, Palette, PaletteColor } from '@mui/material/styles';

export type PaletteOption = { [K in keyof Palette]: Palette[K] extends PaletteColor ? K : never }[keyof Palette];
export type PaletteShade = keyof PaletteColor;

export const palette: ThemeOptions['palette'] = {
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
