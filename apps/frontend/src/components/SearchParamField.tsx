import { ClearOutlined, SearchOutlined } from '@mui/icons-material';
import { IconButton, InputAdornment, TextField, type TextFieldProps } from '@mui/material';
import type { ChangeEvent } from 'react';
import { useSearchParams } from 'react-router';

export default function SearchParamField(props?: TextFieldProps): React.JSX.Element {
   const { ...textFieldProps } = props ?? {};
   const [searchParams, setSearchParams] = useSearchParams();
   const searchQuery = searchParams.get('search') ?? '';

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
         slotProps={{
            input: {
               startAdornment: (
                  <InputAdornment position="start">
                     <SearchOutlined />
                  </InputAdornment>
               ),
               endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                     <IconButton edge="end" onClick={handleClear} sx={{ border: 'unset', bgcolor: 'unset' }}>
                        <ClearOutlined />
                     </IconButton>
                  </InputAdornment>
               ) : undefined,
            },
         }}
         {...textFieldProps}
      />
   );
}
