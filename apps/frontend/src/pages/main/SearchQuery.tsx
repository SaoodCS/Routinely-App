import { CancelOutlined, SearchOutlined } from '@mui/icons-material';
import { Fade, Grow, IconButton, Menu, TextField } from '@mui/material';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { useSearchParams } from 'react-router';

export default function SearchQuery(): React.JSX.Element {
   const [searchParams, setSearchParams] = useSearchParams();
   const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
   const searchQuery = searchParams.get('search') ?? '';

   function handleChange(event: ChangeEvent<HTMLInputElement>): void {
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
      <>
         <IconButton color="primary" onClick={(event) => setAnchorEl(event.currentTarget)}>
            <SearchOutlined />
         </IconButton>
         {searchQuery && (
            <Fade in={Boolean(searchQuery)}>
               <IconButton color="error" onClick={handleClear}>
                  <CancelOutlined />
               </IconButton>
            </Fade>
         )}
         <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            slotProps={{ paper: { sx: { overflowY: 'auto', maxHeight: '30rem', minWidth: '10rem' } } }}
         >
            <TextField autoFocus value={searchQuery} onChange={handleChange} variant="standard" placeholder="Search" size="small" sx={{ m: 1 }} />
         </Menu>
      </>
   );
}
