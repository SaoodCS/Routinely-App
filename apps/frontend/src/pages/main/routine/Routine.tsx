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
   const [searchParams] = useSearchParams();
   const searchQuery = searchParams.get('search')?.toLowerCase() ?? '';
   const enabledTagIds = useMemo(() => new Set(tags.filter(({ isEnabled }) => isEnabled).map(({ id }) => id)), [tags]);

   const visibleTasks = useMemo(() => {
      const visibleTasks = new Set<T_Task>();
      const addVisibleTasks = (tasks: T_Task[], depth = 1): void => {
         for (const task of tasks) {
            const hideWhenTagsEnabled = task.hideWhenTags.some((tagId) => enabledTagIds.has(tagId));
            const showWhenTagsEnabled = task.showWhenTags.some((tagId) => enabledTagIds.has(tagId));
            if (hideWhenTagsEnabled || (task.showWhenTags.length > 0 && !showWhenTagsEnabled)) continue;
            if (task.label.toLowerCase().includes(searchQuery)) visibleTasks.add(task);
            if (depth < 3 && task.children) addVisibleTasks(task.children, depth + 1);
         }
      };
      addVisibleTasks(tasks);
      return visibleTasks;
   }, [tasks, searchQuery, enabledTagIds]);

   const checkedTasksCount = useMemo(() => {
      let checkedTasksCount = 0;
      for (const task of visibleTasks) if (task.isChecked) checkedTasksCount += 1;
      return checkedTasksCount;
   }, [visibleTasks]);

   const isTaskVisible = (task: T_Task): boolean => visibleTasks.has(task);

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
               {checkedTasksCount}/{visibleTasks.size}
            </Typography>
         </AppBar>

         <DragAndDropList
            ref={saveOnScrollRef}
            style={{ overflow: 'auto', maxHeight: '100%', paddingTop: hideOnScrollElHeight }}
            items={tasks}
            onDrop={(newOrderedItems) => setTasks(newOrderedItems)}
            renderItem={(task, dragElProps, i) =>
               isTaskVisible(task) && (
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
                           renderItem={(subtask, dragElProps, j) =>
                              isTaskVisible(subtask) && (
                                 <Box>
                                    <TaskItem task={subtask} dragElProps={dragElProps} indexes={[i, j]} section={section} />
                                    {subtask.children && (
                                       <DragAndDropList
                                          items={subtask.children}
                                          onDrop={(newOrderedItems) => {
                                             const updatedTasks = [...tasks];
                                             updatedTasks[i].children![j].children = newOrderedItems;
                                             setTasks(updatedTasks);
                                          }}
                                          renderItem={(subsubtask, dragElProps, k) =>
                                             isTaskVisible(subsubtask) && (
                                                <Box>
                                                   <TaskItem task={subsubtask} dragElProps={dragElProps} indexes={[i, j, k]} section={section} />
                                                </Box>
                                             )
                                          }
                                       />
                                    )}
                                 </Box>
                              )
                           }
                        />
                     )}
                  </Box>
               )
            }
         />
      </>
   );
}
