import type { T_Task } from '@repo/types/app';
import useLocalStorage from '../../../hooks/useLocalStorage';
import useScrollSaver from '../../../hooks/useScrollSaver';
import DragAndDropList from '../../../components/DragAndDropList';
export default function MorningRoutine(): React.JSX.Element {
   const { ref } = useScrollSaver('morning-routine-scroll');
   const [tasks, setTasks] = useLocalStorage<T_Task[]>(`morning-routine-tasks`, []);
   return (
      <DragAndDropList
         ref={ref}
         items={tasks}
         onDrop={(newOrderedItems) => setTasks(newOrderedItems)}
         renderItem={(item, dragElProps) => (
            <div {...dragElProps} style={{ padding: '1rem' }}>
               {item.label}
            </div>
         )}
         style={{ overflow: 'auto', maxHeight: '100%' }}
      />
   );
}
