import type { ThemeOptions } from '@mui/material/styles';

export const typography: ThemeOptions['typography'] = {
   fontFamily: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'].join(','),
   h6: { lineHeight: 1 },
};
