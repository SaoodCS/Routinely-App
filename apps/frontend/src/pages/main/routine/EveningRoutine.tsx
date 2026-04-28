import { Box, Fab } from '@mui/material';
import { createNewTask } from '@repo/utils/app.helpers';
import { Add } from '@mui/icons-material';
import DragAndDropList from '../../../components/DragAndDropList';
import { useLocalStorageContext } from '../../../database/useLocalStorageContext';
import useScrollSaver from '../../../hooks/useScrollSaver';
import TaskItem from './TaskItem';

export default function EveningRoutine(): React.JSX.Element {
   const { ref } = useScrollSaver('evening-routine-scroll');
   const { eveningTasks, setEveningTasks: setEveningTasks } = useLocalStorageContext();

   function handleCreateTask(): void {
      const newTask = createNewTask();
      setEveningTasks([...eveningTasks, newTask]);
   }

   return (
      <>
         <Fab color="primary" sx={{ position: 'absolute', bottom: 16, right: 16 }}>
            <Add onClick={handleCreateTask} />
         </Fab>
         <DragAndDropList
            ref={ref}
            items={eveningTasks}
            onDrop={(newOrderedItems) => setEveningTasks(newOrderedItems)}
            style={{ overflow: 'auto', maxHeight: '100%' }}
            renderItem={(task, dragElProps, i) => (
               <Box>
                  <TaskItem task={task} dragElProps={dragElProps} indexes={[i]} section="evening" />
                  {task.children && (
                     <DragAndDropList
                        items={task.children}
                        onDrop={(newOrderedItems) => {
                           const updatedTasks = [...eveningTasks];
                           updatedTasks[i].children = newOrderedItems;
                           setEveningTasks(updatedTasks);
                        }}
                        renderItem={(subtask, dragElProps, j) => (
                           <Box key={subtask.id}>
                              <TaskItem task={subtask} dragElProps={dragElProps} indexes={[i, j]} section="evening" />
                              {subtask.children && (
                                 <DragAndDropList
                                    items={subtask.children}
                                    onDrop={(newOrderedItems) => {
                                       const updatedTasks = [...eveningTasks];
                                       updatedTasks[i].children![j].children = newOrderedItems;
                                       setEveningTasks(updatedTasks);
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
