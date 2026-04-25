import { SortByAlphaOutlined } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import type { T_Tag } from '@repo/types/app';
import { isEqual, orderBy } from 'lodash';
import useLocalStorage from '../../../hooks/useLocalStorage';

export default function SortTags(): React.JSX.Element {
   const [tags, setTags] = useLocalStorage<T_Tag[]>(`tags`, []);

   function handleSortTags(): void {
      const sortedTags = orderBy(tags, ['label'], ['asc']);
      if (isEqual(tags, sortedTags)) sortedTags.reverse();
      setTags(sortedTags);
   }

   return (
      <IconButton color="primary" onClick={handleSortTags}>
         <SortByAlphaOutlined />
      </IconButton>
   );
}
