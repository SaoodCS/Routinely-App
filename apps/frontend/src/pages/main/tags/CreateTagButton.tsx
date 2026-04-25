import { AddBoxOutlined } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import type { T_Tag } from '@repo/types/app';
import useLocalStorage from '../../../hooks/useLocalStorage';

export default function CreateTagButton(): React.JSX.Element {
   const [tags, setTags] = useLocalStorage<T_Tag[]>(`tags`, []);
   function handleCreateTagButton(): void {
      setTags([{ id: `${Date.now()}-tag`, label: 'New Tag', isEnabled: true, color: '#5c0000' }, ...tags]);
   }
   return (
      <IconButton color="primary" onClick={handleCreateTagButton}>
         <AddBoxOutlined />
      </IconButton>
   );
}
