import { SortByAlphaOutlined } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { isEqual, orderBy } from 'lodash';
import { useFirestoreContext } from '../../../database/useFirestoreContext';

export default function SortTagsButton(): React.JSX.Element {
   const { tags, setTagsDb } = useFirestoreContext();

   function handleSortTagsButton(): void {
      const sortedTags = orderBy(tags, ['label'], ['asc']);
      const direction = isEqual(tags, sortedTags) ? 'desc' : 'asc';
      setTagsDb(direction === 'asc' ? sortedTags : orderBy(tags, ['label'], [direction]));
   }

   return (
      <IconButton color="primary" onClick={handleSortTagsButton}>
         <SortByAlphaOutlined />
      </IconButton>
   );
}
