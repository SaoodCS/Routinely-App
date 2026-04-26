import { Box } from '@mui/material';
import type { T_Task } from '@repo/types/app.types';
import DragAndDropList from '../../../components/DragAndDropList';
import useLocalStorage from '../../../hooks/useLocalStorage';
import useScrollSaver from '../../../hooks/useScrollSaver';
import TaskItem from './TaskItem';

export default function MorningRoutine(): React.JSX.Element {
   const { ref } = useScrollSaver('morning-routine-scroll');
   const [tasks, setTasks] = useLocalStorage<T_Task[]>(`morning-routine-tasks`, []);

   return (
      <DragAndDropList
         ref={ref}
         items={tasks}
         onDrop={(newOrderedItems) => setTasks(newOrderedItems)}
         style={{ overflow: 'auto', maxHeight: '100%' }}
         renderItem={(task, dragElProps, i) => (
            <Box>
               <TaskItem task={task} dragElProps={dragElProps} indexes={[i]} section="morning" />
               {task.children && (
                  <DragAndDropList
                     items={task.children}
                     onDrop={(newOrderedItems) => {
                        const updatedTasks = [...tasks];
                        updatedTasks[i].children = newOrderedItems;
                        setTasks(updatedTasks);
                     }}
                     renderItem={(subtask, dragElProps, j) => (
                        <Box key={subtask.id}>
                           <TaskItem task={subtask} dragElProps={dragElProps} indexes={[i, j]} section="morning" />
                           {subtask.children && (
                              <DragAndDropList
                                 items={subtask.children}
                                 onDrop={(newOrderedItems) => {
                                    const updatedTasks = [...tasks];
                                    updatedTasks[i].children![j].children = newOrderedItems;
                                    setTasks(updatedTasks);
                                 }}
                                 renderItem={(subsubtask, dragElProps, k) => (
                                    <Box key={subsubtask.id}>
                                       <TaskItem task={subsubtask} dragElProps={dragElProps} indexes={[i, j, k]} section="morning" />
                                    </Box>
                                 )}
                              />
                           )}
                        </Box>
                     )}
                  />
               )}
            </Box>
         )}
      />
   );
}

// add new task below icon
// add new subtask icon (only for tasks and subtasks, not subtasks of subtasks)
// select tags dropdown icon
// some sort of indication to what tags are associated with the task

// header: hide/show all tags
// header: reset all tasks
