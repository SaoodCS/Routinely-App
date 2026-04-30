import { Add } from '@mui/icons-material';
import { AppBar, Box, Fab, Typography } from '@mui/material';
import type { T_Routine_Section, T_Task } from '@repo/types/app.types';
import { createNewTask } from '@repo/utils/app.helpers';
import { useMemo, type JSX } from 'react';
import { useLocation, useSearchParams } from 'react-router';
import DragAndDropList from '../../../components/DragAndDropList';
import useScrollSaver from '../../../hooks/useScrollSaver';
import { useFirestoreContext } from '../../../database/useFirestoreContext';
import useHideOnScroll from '../../../hooks/useHideOnScroll';
import TaskItem from './TaskItem';

interface T_RoutineProps {
   section: T_Routine_Section;
}

export default function Routine({ section }: T_RoutineProps): JSX.Element {
   const { morningTasks, setMorningTasks, eveningTasks, setEveningTasks, tags } = useFirestoreContext();
   const tasks = section === 'morning' ? morningTasks : eveningTasks;
   const setTasks = section === 'morning' ? setMorningTasks : setEveningTasks;
   const { pathname } = useLocation();
   const { ref: saveOnScrollRef } = useScrollSaver(`${pathname}-scroll`);
   const { ref: hideOnScrollRef, hideOnScrollElHeight } = useHideOnScroll(saveOnScrollRef, 'up');
   const enabledTagIds = useMemo(() => new Set(tags.filter(({ isEnabled }) => isEnabled).map(({ id }) => id)), [tags]);
   const [searchParams] = useSearchParams();
   const searchQuery = searchParams.get('search')?.toLowerCase();

   const visibleTasks = useMemo(() => {
      const isVisibleViaTag = (task: T_Task): boolean => {
         if (task.hideWhenTags.some((tagId) => enabledTagIds.has(tagId))) return false;
         return !task.showWhenTags.length || task.showWhenTags.some((tagId) => enabledTagIds.has(tagId));
      };
      const isVisible = (task: T_Task, indexes: number[]): boolean => {
         if (searchQuery && !task.label.toLowerCase().includes(searchQuery)) return false;
         if (!isVisibleViaTag(task)) return false;
         const parentTask = tasks[indexes[0]];
         if ((indexes.length === 2 || indexes.length === 3) && !isVisibleViaTag(parentTask)) return false;
         if (indexes.length === 3 && !isVisibleViaTag(parentTask.children![indexes[1]])) return false;
         return true;
      };
      const getVisibleTasks = (taskList: T_Task[], parentIndexes: number[] = []): T_Task[] => {
         const visibleTasks: T_Task[] = [];
         taskList.forEach((task, index) => {
            const indexes = [...parentIndexes, index];
            if (isVisible(task, indexes)) visibleTasks.push(task);
            if (task.children && indexes.length < 3) visibleTasks.push(...getVisibleTasks(task.children, indexes));
         });
         return visibleTasks;
      };
      return getVisibleTasks(tasks);
   }, [tasks, searchQuery, enabledTagIds]);

   const checkedTasksCount = useMemo(() => visibleTasks.reduce((count, task) => count + (task.isChecked ? 1 : 0), 0), [visibleTasks]);

   function handleCreateTask(): void {
      const newTask = createNewTask();
      setTasks([...tasks, newTask]);
   }

   return (
      <>
         <Fab color="primary" sx={{ position: 'absolute', bottom: 16, right: 16 }}>
            <Add onClick={handleCreateTask} />
         </Fab>
         <AppBar ref={hideOnScrollRef} component="div" position="absolute" sx={{ bottom: 0, height: 'fit-content', p: 1, border: 'none' }}>
            <Typography variant="body2" align="center">
               {checkedTasksCount}/{visibleTasks.length}
            </Typography>
         </AppBar>

         <DragAndDropList
            ref={saveOnScrollRef}
            style={{ overflow: 'auto', maxHeight: '100%', paddingTop: hideOnScrollElHeight }}
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
