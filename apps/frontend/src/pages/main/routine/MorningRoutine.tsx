import { Box, Fab } from '@mui/material';
import { createNewTask } from '@repo/utils/app.helpers';
import { Add } from '@mui/icons-material';
import DragAndDropList from '../../../components/DragAndDropList';
import { useLocalStorageContext } from '../../../database/useLocalStorageContext';
import useScrollSaver from '../../../hooks/useScrollSaver';
import TaskItem from './TaskItem';

export default function MorningRoutine(): React.JSX.Element {
   const { ref } = useScrollSaver('morning-routine-scroll');
   const { morningTasks: morningTasks, setMorningTasks } = useLocalStorageContext();

   function handleCreateTask(): void {
      const newTask = createNewTask();
      setMorningTasks([...morningTasks, newTask]);
   }

   return (
      <>
         <Fab color="primary" sx={{ position: 'absolute', bottom: 16, right: 16 }}>
            <Add onClick={handleCreateTask} />
         </Fab>
         <DragAndDropList
            ref={ref}
            items={morningTasks}
            onDrop={(newOrderedItems) => setMorningTasks(newOrderedItems)}
            style={{ overflow: 'auto', maxHeight: '100%' }}
            renderItem={(task, dragElProps, i) => (
               <Box>
                  <TaskItem task={task} dragElProps={dragElProps} indexes={[i]} section="morning" />
                  {task.children && (
                     <DragAndDropList
                        items={task.children}
                        onDrop={(newOrderedItems) => {
                           const updatedTasks = [...morningTasks];
                           updatedTasks[i].children = newOrderedItems;
                           setMorningTasks(updatedTasks);
                        }}
                        renderItem={(subtask, dragElProps, j) => (
                           <Box key={subtask.id}>
                              <TaskItem task={subtask} dragElProps={dragElProps} indexes={[i, j]} section="morning" />
                              {subtask.children && (
                                 <DragAndDropList
                                    items={subtask.children}
                                    onDrop={(newOrderedItems) => {
                                       const updatedTasks = [...morningTasks];
                                       updatedTasks[i].children![j].children = newOrderedItems;
                                       setMorningTasks(updatedTasks);
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
      </>
   );
}
