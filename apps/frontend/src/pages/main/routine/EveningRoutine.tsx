import { Box } from '@mui/material';
import DragAndDropList from '../../../components/DragAndDropList';
import useScrollSaver from '../../../hooks/useScrollSaver';
import { useDatabase } from '../../../database/useDatabase';
import TaskItem from './TaskItem';
import CreateTaskButton from './CreateTaskButton';

export default function EveningRoutine(): React.JSX.Element {
   const { ref } = useScrollSaver('evening-routine-scroll');
   const { eveningTasks: tasks, setEveningTasks: setTasks } = useDatabase();

   return (
      <>
         <CreateTaskButton section="evening" />
         <DragAndDropList
            ref={ref}
            items={tasks}
            onDrop={(newOrderedItems) => setTasks(newOrderedItems)}
            style={{ overflow: 'auto', maxHeight: '100%' }}
            renderItem={(task, dragElProps, i) => (
               <Box>
                  <TaskItem task={task} dragElProps={dragElProps} indexes={[i]} section="evening" />
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
                              <TaskItem task={subtask} dragElProps={dragElProps} indexes={[i, j]} section="evening" />
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
                                          <TaskItem task={subsubtask} dragElProps={dragElProps} indexes={[i, j, k]} section="evening" />
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
      </>
   );
}
