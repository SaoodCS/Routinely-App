import { ClearOutlined, SearchOutlined } from '@mui/icons-material';
import { alpha, IconButton, InputAdornment, TextField, useTheme, type TextFieldProps } from '@mui/material';
import type { ChangeEvent } from 'react';
import { useSearchParams } from 'react-router';

export default function SearchParamField(props?: TextFieldProps): React.JSX.Element {
   const { ...textFieldProps } = props ?? {};
   const [searchParams, setSearchParams] = useSearchParams();
   const searchQuery = searchParams.get('search') ?? '';
   const { palette } = useTheme();

   function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
      const newSearchParams = new URLSearchParams(searchParams);
      const newQuery = event.currentTarget.value;
      if (newQuery) newSearchParams.set('search', newQuery);
      else newSearchParams.delete('search');
      setSearchParams(newSearchParams, { replace: true });
   }

   function handleClear(): void {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('search');
      setSearchParams(newSearchParams, { replace: true });
   }

   return (
      <TextField
         autoFocus
         value={searchQuery}
         onChange={handleChange}
         placeholder="Search"
         size="small"
         slotProps={{
            input: {
               startAdornment: (
                  <InputAdornment position="start">
                     <SearchOutlined />
                  </InputAdornment>
               ),
               endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                     <IconButton edge="end" onClick={handleClear}>
                        <ClearOutlined />
                     </IconButton>
                  </InputAdornment>
               ) : undefined,
            },
         }}
         // TODO: NEED TO ADD THIS SX AS A PROP INSTEAD AND FEED IT IN FROM WHERE THIS COMPONENT IS REFERENCED IN ORDER TO MAKE THIS COMPONENT REUSABLE (OR SET A DEFAULT STYLE FOR IT IN THEME.TS)
         sx={{
            scale: '0.8',
            '& .MuiOutlinedInput-root.Mui-focused fieldset': { border: '1px solid', borderColor: 'divider' },
            bgcolor: alpha(palette.primary.main, 0.05),
            width: '120px',
            ...textFieldProps.sx,
         }}
         {...textFieldProps}
      />
   );
}
