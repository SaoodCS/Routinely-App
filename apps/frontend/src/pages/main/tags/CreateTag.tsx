import { AddBoxOutlined } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import type { T_Tag } from '@repo/types/app';
import useLocalStorage from '../../../hooks/useLocalStorage';

export default function CreateTag(): React.JSX.Element {
   const [tags, setTags] = useLocalStorage<T_Tag[]>(`tags`, []);
   function handleCreateTag(): void {
      setTags([...tags, { id: `${Date.now()}-tag`, label: 'New Tag', isEnabled: true, color: '#5c0000' }]);
   }
   return (
      <IconButton color="primary" onClick={handleCreateTag}>
         <AddBoxOutlined />
      </IconButton>
   );
}
