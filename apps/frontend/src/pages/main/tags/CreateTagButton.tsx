import { Add } from '@mui/icons-material';
import { Fab } from '@mui/material';
import { createNewTag } from '@repo/utils/app.helpers';
import { useLocalStorageContext } from '../../../database/useLocalStorageContext';

export default function CreateTagButton(): React.JSX.Element {
   const { tags, setTags } = useLocalStorageContext();

   function handleCreateTagButton(): void {
      const newTag = createNewTag();
      setTags([...tags, newTag]);
   }
   return (
      <Fab color="primary" sx={{ position: 'absolute', bottom: 16, right: 16 }}>
         <Add onClick={handleCreateTagButton} />
      </Fab>
   );
}
