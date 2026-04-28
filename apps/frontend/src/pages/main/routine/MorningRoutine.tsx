import { Box } from '@mui/material';
import DragAndDropList from '../../../components/DragAndDropList';
import { useLocalStorageContext } from '../../../database/useLocalStorageContext';
import useScrollSaver from '../../../hooks/useScrollSaver';
import CreateTaskButton from './CreateTaskButton';
import TaskItem from './TaskItem';

export default function MorningRoutine(): React.JSX.Element {
   const { ref } = useScrollSaver('morning-routine-scroll');
   const { morningTasks: tasks, setMorningTasks: setTasks } = useLocalStorageContext();

   return (
      <>
         <CreateTaskButton section="morning" />
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
      </>
   );
}
