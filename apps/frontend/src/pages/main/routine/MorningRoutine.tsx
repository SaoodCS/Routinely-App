import type { T_Task } from '@repo/types/app';
import { Box } from '@mui/material';
import { useSearchParams } from 'react-router';
import useLocalStorage from '../../../hooks/useLocalStorage';
import useScrollSaver from '../../../hooks/useScrollSaver';
import DragAndDropList from '../../../components/DragAndDropList';

export default function MorningRoutine(): React.JSX.Element {
   const [searchParams] = useSearchParams();
   const searchQuery = searchParams.get('search');
   const { ref } = useScrollSaver('morning-routine-scroll');
   const [tasks, setTasks] = useLocalStorage<T_Task[]>(`morning-routine-tasks`, []);

   function isTaskFiltered(task: T_Task): boolean {
      return !searchQuery || task.label.toLowerCase().includes(searchQuery.toLowerCase());
   }

   return (
      <DragAndDropList
         ref={ref}
         items={tasks}
         onDrop={(newOrderedItems) => setTasks(newOrderedItems)}
         renderItem={(item, dragElProps) => (
            <Box {...dragElProps} style={{ padding: '1rem' }}>
               {item.label}
            </Box>
         )}
         style={{ overflow: 'auto', maxHeight: '100%' }}
      />
   );
}
