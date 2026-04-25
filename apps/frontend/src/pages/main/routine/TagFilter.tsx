import { FilterListOutlined } from '@mui/icons-material';
import { Divider, IconButton, ListItemText, Menu, MenuItem, Switch } from '@mui/material';
import { useState } from 'react';
import type { T_Tag } from '@repo/types/app';
import useLocalStorage from '../../../hooks/useLocalStorage';

export default function TagFilter(): React.JSX.Element {
   const [tags, setTags] = useLocalStorage<T_Tag[]>('tags', []);
   const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

   function handleToggleTag(tagIndex: number): void {
      const newTags = [...tags];
      newTags[tagIndex].isEnabled = !newTags[tagIndex].isEnabled;
      setTags(newTags);
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
                        onClick={() => handleToggleTag(i)}
                        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                     >
                        <ListItemText>{tag.label}</ListItemText>
                        <Switch checked={tag.isEnabled} size="small" />
                     </MenuItem>
                  </>
               ))
            )}
         </Menu>
      </>
   );
}
