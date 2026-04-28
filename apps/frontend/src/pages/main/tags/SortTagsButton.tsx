import { SortByAlphaOutlined } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { isEqual, orderBy } from 'lodash';
import { useLocalStorageContext } from '../../../database/useLocalStorageContext';

export default function SortTagsButton(): React.JSX.Element {
   const { tags, setTags } = useLocalStorageContext();

   function handleSortTagsButton(): void {
      const sortedTags = orderBy(tags, ['label'], ['asc']);
      if (isEqual(tags, sortedTags)) sortedTags.reverse();
      setTags(sortedTags);
   }

   return (
      <IconButton color="primary" onClick={handleSortTagsButton}>
         <SortByAlphaOutlined />
      </IconButton>
   );
}
