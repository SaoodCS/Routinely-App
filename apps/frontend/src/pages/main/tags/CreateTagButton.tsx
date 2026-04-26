import type { T_Tag } from '@repo/types/app.types';
import { createNewTag } from '@repo/utils/app.helpers';
import { Fab } from '@mui/material';
import { Add } from '@mui/icons-material';
import useLocalStorage from '../../../hooks/useLocalStorage';

export default function CreateTagButton(): React.JSX.Element {
   const [tags, setTags] = useLocalStorage<T_Tag[]>(`tags`, []);
   function handleCreateTagButton(): void {
      const newTag = createNewTag();
      setTags([newTag, ...tags]);
   }
   return (
      <Fab color="primary" sx={{ position: 'absolute', bottom: 16, right: 16 }}>
         <Add onClick={handleCreateTagButton} />
      </Fab>
   );
}
