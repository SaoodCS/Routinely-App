import { SortByAlphaOutlined } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { isEqual, orderBy } from 'lodash';
import { useFirestoreContext } from '../../../database/useFirestoreContext';

export default function SortTagsButton(): React.JSX.Element {
   const { tags, setTags } = useFirestoreContext();

   function handleSortTagsButton(): void {
      const sortedTags = orderBy(tags, ['label'], ['asc']);
      if (isEqual(tags, sortedTags)) sortedTags.reverse();
      setTags(sortedTags).catch(console.error);
   }

   return (
      <IconButton color="primary" onClick={handleSortTagsButton}>
         <SortByAlphaOutlined />
      </IconButton>
   );
}
