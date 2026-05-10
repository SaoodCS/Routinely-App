import { createTheme } from '@mui/material/styles';
import { palette } from './palette.theme';
import { typography } from './typography.theme';
import { transitions } from './transitions.theme';
import { components } from './components.theme';

const theme = createTheme({ palette, typography, transitions, components });
export default theme;
