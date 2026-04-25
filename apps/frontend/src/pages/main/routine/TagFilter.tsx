import { FilterListOutlined } from '@mui/icons-material';
import { Divider, IconButton, ListItemText, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import Check from '@mui/icons-material/Check';
import type { T_Tag } from '@repo/types/app';
import useLocalStorage from '../../../hooks/useLocalStorage';

export default function TagFilter(): React.JSX.Element {
   const [tags, setTags] = useLocalStorage<T_Tag[]>('tags', []);
   const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

   function handleToggleTag(tagId: T_Tag['id']): void {
      setTags(tags.map((tag) => (tag.id === tagId ? { ...tag, isEnabled: !tag.isEnabled } : tag)));
   }

   return (
      <>
         <IconButton color="primary" onClick={(event) => setAnchorEl(event.currentTarget)}>
            <FilterListOutlined />
         </IconButton>
         <Menu
            id="tag-filter-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            slotProps={{ paper: { sx: { overflowY: 'auto', maxHeight: '30rem', minWidth: '10rem' } } }}
         >
            {tags.length === 0 ? (
               <MenuItem disabled>No tags</MenuItem>
            ) : (
               tags.map((tag, i) => (
                  <>
                     {i > 0 && <Divider />}
                     <MenuItem
                        key={tag.id}
                        onClick={() => handleToggleTag(tag.id)}
                        sx={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}
                     >
                        <ListItemText>{tag.label}</ListItemText>
                        {tag.isEnabled && <Check fontSize="small" color={'success'} />}
                     </MenuItem>
                  </>
               ))
            )}
         </Menu>
      </>
   );
}
