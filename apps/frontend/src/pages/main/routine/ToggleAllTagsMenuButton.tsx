import { IconButton } from '@mui/material';
import { VisibilityOutlined } from '@mui/icons-material';
import type { T_Tag } from '@repo/types/app.types';
import useLocalStorage from '../../../hooks/useLocalStorage';

export default function ToggleAllTagsMenuButton(): React.JSX.Element {
   const [tags, setTags] = useLocalStorage<T_Tag[]>('tags', []);

   function handleToggleAllTags(): void {
      const areAllTagsEnabled = tags.every((tag) => tag.isEnabled);
      const updatedTags = tags.map((tag) => ({ ...tag, isEnabled: !areAllTagsEnabled }));
      setTags(updatedTags);
   }

   return (
      <>
         <IconButton color="primary" onClick={handleToggleAllTags}>
            <VisibilityOutlined />
         </IconButton>
      </>
   );
}
