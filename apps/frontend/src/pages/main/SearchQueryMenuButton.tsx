import { ClearOutlined, SearchOutlined } from '@mui/icons-material';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import type { ChangeEvent } from 'react';
import { useSearchParams } from 'react-router';

export default function SearchQueryMenuButton(): React.JSX.Element {
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
         size="small"
         slotProps={{
            input: {
               startAdornment: (
                  <InputAdornment position="start">
                     <SearchOutlined fontSize="small" />
                  </InputAdornment>
               ),
               endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                     <IconButton aria-label="Clear search" edge="end" onClick={handleClear} size="small">
                        <ClearOutlined fontSize="small" />
                     </IconButton>
                  </InputAdornment>
               ) : undefined,
            },
         }}
         sx={{ scale: '0.8', flex: 1, '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: 'divider' } }}
      />
   );
}
