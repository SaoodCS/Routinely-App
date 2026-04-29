import { FilterListOutlined } from '@mui/icons-material';
import { Divider, IconButton, ListItemText, Menu, MenuItem, Switch } from '@mui/material';
import { useState } from 'react';
import { useFirestoreContext } from '../../../database/useFirestoreContext';

export default function ToggleTagMenuButton(): React.JSX.Element {
   const { tags, setTags } = useFirestoreContext();
   const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

   function handleToggleTag(tagIndex: number): void {
      const updatedTags = [...tags];
      updatedTags[tagIndex].isEnabled = !updatedTags[tagIndex].isEnabled;
      setTags(updatedTags);
   }

   function handleToggleAllTags(): void {
      const areAllTagsEnabled = tags.every((tag) => tag.isEnabled);
      const updatedTags = tags.map((tag) => ({ ...tag, isEnabled: !areAllTagsEnabled }));
      setTags(updatedTags);
   }

   return (
      <>
         <IconButton color="primary" onClick={(event) => setAnchorEl(event.currentTarget)}>
            <FilterListOutlined />
         </IconButton>
         <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            slotProps={{ paper: { sx: { overflowY: 'auto', maxHeight: '30rem', minWidth: '15rem' } } }}
         >
            <MenuItem onClick={handleToggleAllTags} disabled={tags.length === 0}>
               <ListItemText>{tags.length === 0 ? 'No tags' : 'Show/hide all'}</ListItemText>
            </MenuItem>
            <Divider hidden={tags.length === 0} />
            {tags.map((tag, i) => (
               <span key={tag.id}>
                  {i > 0 && <Divider />}
                  <MenuItem onClick={() => handleToggleTag(i)} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <ListItemText>{tag.label}</ListItemText>
                     <Switch checked={tag.isEnabled} size="small" />
                  </MenuItem>
               </span>
            ))}
         </Menu>
      </>
   );
}
