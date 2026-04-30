import { Add } from '@mui/icons-material';
import { Box, Fab, TextField } from '@mui/material';
import type { T_Routine_Section } from '@repo/types/app.types';
import { createNewTask } from '@repo/utils/app.helpers';
import type { ChangeEvent, JSX } from 'react';
import { useLocation, useSearchParams } from 'react-router';
import DragAndDropList from '../../../components/DragAndDropList';
import useToggleVisibilityOnScroll from '../../../hooks/useToggleVisibilityOnScroll';
import useScrollSaver from '../../../hooks/useScrollSaver';
import { useFirestoreContext } from '../../../database/useFirestoreContext';
import TaskItem from './TaskItem';

interface T_RoutineProps {
   section: T_Routine_Section;
}

export default function Routine({ section }: T_RoutineProps): JSX.Element {
   const { morningTasks, setMorningTasks, eveningTasks, setEveningTasks } = useFirestoreContext();
   const tasks = section === 'morning' ? morningTasks : eveningTasks;
   const setTasks = section === 'morning' ? setMorningTasks : setEveningTasks;
   const [searchParams, setSearchParams] = useSearchParams();
   const searchQuery = searchParams.get('search') ?? '';
   const { pathname } = useLocation();
   const { ref: scrollRef } = useScrollSaver(`${pathname}-scroll`);
   const { ref: toggleVisibilityOnScrollRef } = useToggleVisibilityOnScroll(scrollRef);

   function handleCreateTask(): void {
      const newTask = createNewTask();
      setTasks([...tasks, newTask]);
   }

   function handleChangeSearchParam(event: ChangeEvent<HTMLInputElement>): void {
      const newSearchParams = new URLSearchParams(searchParams);
      const newQuery = event.currentTarget.value;
      if (newQuery) newSearchParams.set('search', newQuery);
      else newSearchParams.delete('search');
      setSearchParams(newSearchParams, { replace: true });
   }

   return (
      <>
         <Fab color="primary" sx={{ position: 'absolute', bottom: 16, right: 16 }}>
            <Add onClick={handleCreateTask} />
         </Fab>

         <Box ref={toggleVisibilityOnScrollRef} sx={{ zIndex: 999, position: 'absolute', top: 0, width: '100%', backgroundColor: 'black' }}>
            <TextField
               autoFocus
               value={searchQuery}
               onChange={handleChangeSearchParam}
               variant="standard"
               placeholder="Search"
               size="small"
               sx={{ m: 1 }}
            />
         </Box>
         <DragAndDropList
            ref={scrollRef}
            style={{ overflow: 'auto', maxHeight: '100%' }}
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
      </>
   );
}
