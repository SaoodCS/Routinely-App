import { useParams } from 'react-router';
import { useFirestoreContext } from '../../../database/useFirestoreContext';

export default function TagTasksHeaderTitle(): React.ReactNode {
   const { tags } = useFirestoreContext();
   const { tagId = '' } = useParams();
   return tags.find((t) => t.id === tagId)?.label ?? '';
}
