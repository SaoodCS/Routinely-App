import { AddBoxOutlined } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import type { T_Tag } from '@repo/types/app.types';
import { createNewTag } from '@repo/utils/app.helpers';
import useLocalStorage from '../../../hooks/useLocalStorage';

export default function CreateTagButton(): React.JSX.Element {
   const [tags, setTags] = useLocalStorage<T_Tag[]>(`tags`, []);
   function handleCreateTagButton(): void {
      const newTag = createNewTag();
      setTags([newTag, ...tags]);
   }
   return (
      <IconButton color="primary" onClick={handleCreateTagButton}>
         <AddBoxOutlined />
      </IconButton>
   );
}
