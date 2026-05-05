import { useParams } from 'react-router';
import { Typography } from '@mui/material';
import { useFirestoreContext } from '../../../database/useFirestoreContext';

export default function TagTasksHeaderTitle(): React.ReactNode {
   const { tags } = useFirestoreContext();
   const { tagId = '' } = useParams();
   return (
      <Typography variant={'h6'} fontSize={'1.1rem'}>
         {tags.find((t) => t.id === tagId)?.label ?? ''}
      </Typography>
   );
}
