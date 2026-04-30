import { Add } from '@mui/icons-material';
import { Box, Fab, Stack } from '@mui/material';
import type { T_Routine_Section } from '@repo/types/app.types';
import { createNewTask } from '@repo/utils/app.helpers';
import type { JSX } from 'react';
import { useLocation } from 'react-router';
import DragAndDropList from '../../../components/DragAndDropList';
import useDisappearOnScroll from '../../../hooks/useToggelVisibilityOnScroll';
import useScrollSaver from '../../../hooks/useScrollSaver';
import { useFirestoreContext } from '../../../database/useFirestoreContext';
import TaskItem from './TaskItem';

interface T_RoutineProps {
   section: T_Routine_Section;
}

export default function Routine({ section }: T_RoutineProps): JSX.Element {
   const { morningTasks, setMorningTasks, eveningTasks, setEveningTasks } = useFirestoreContext();
   const { pathname } = useLocation();
   const tasks = section === 'morning' ? morningTasks : eveningTasks;
   const setTasks = section === 'morning' ? setMorningTasks : setEveningTasks;
   const { ref: scrollRef } = useScrollSaver(`${pathname}-scroll`);
   const { ref: toggleVisibilityOnScrollRef } = useDisappearOnScroll(scrollRef);

   function handleCreateTask(): void {
      const newTask = createNewTask();
      setTasks([...tasks, newTask]);
   }

   return (
      <>
         <Fab color="primary" sx={{ position: 'absolute', bottom: 16, right: 16 }}>
            <Add onClick={handleCreateTask} />
         </Fab>
         <Stack ref={scrollRef} sx={{ overflow: 'auto', maxHeight: '100%' }}>
            <Box ref={toggleVisibilityOnScrollRef} sx={{ position: 'sticky', top: 0, height: '1rem', backgroundColor: 'white', zIndex: 1 }}>
               Hello
            </Box>
            <DragAndDropList
               items={tasks}
               onDrop={(newOrderedItems) => setTasks(newOrderedItems)}
               renderItem={(task, dragElProps, i) => (
                  <Box>
                     <TaskItem task={task} dragElProps={dragElProps} indexes={[i]} section={section} />
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
                                 <TaskItem task={subtask} dragElProps={dragElProps} indexes={[i, j]} section={section} />
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
                                             <TaskItem task={subsubtask} dragElProps={dragElProps} indexes={[i, j, k]} section={section} />
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
         </Stack>
      </>
   );
}
