import { Add } from '@mui/icons-material';
import { AppBar, Box, Chip, Fab, Grid, Stack } from '@mui/material';
import type { T_Routine_Section, T_Tag, T_Task } from '@repo/types/app.types';
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
   const { morningTasks, setMorningTasks, eveningTasks, setEveningTasks, tags, setTags } = useFirestoreContext();
   const tasks = section === 'morning' ? morningTasks : eveningTasks;
   const setTasks = section === 'morning' ? setMorningTasks : setEveningTasks;
   const { pathname } = useLocation();
   const { ref: saveOnScrollRef } = useScrollSaver(`${pathname}-scroll`);
   const { ref: hideOnScrollHeaderRef, hideOnScrollElHeight: hideOnScrollHeaderHeight } = useHideOnScroll(saveOnScrollRef, 'up');
   const { ref: hideOnScrollCheckedRef } = useHideOnScroll(saveOnScrollRef, 'down');
   const [searchParams] = useSearchParams();
   const searchQuery = searchParams.get('search')?.toLowerCase() ?? '';
   const enabledTagIds = useMemo(() => new Set(tags.filter(({ isEnabled }) => isEnabled).map(({ id }) => id)), [tags]);

   const visibleTasks = useMemo(() => {
      const visibleTasks = new Set<T_Task>();
      const addVisibleTasks = (tasks: T_Task[], depth = 1): boolean => {
         let hasVisibleTasks = false;
         for (const task of tasks) {
            const hideWhenTagsEnabled = task.hideWhenTags.some((tagId) => enabledTagIds.has(tagId));
            const showWhenTagsEnabled = task.showWhenTags.some((tagId) => enabledTagIds.has(tagId));
            if (hideWhenTagsEnabled || (task.showWhenTags.length > 0 && !showWhenTagsEnabled)) continue;
            const hasVisibleChildren = Boolean(depth < 3 && task.children && addVisibleTasks(task.children, depth + 1));
            if (task.label.toLowerCase().includes(searchQuery) || hasVisibleChildren) {
               visibleTasks.add(task);
               hasVisibleTasks = true;
            }
         }
         return hasVisibleTasks;
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

   function handleToggleTag(tag: T_Tag): void {
      const newTags = [...tags];
      const tagIndex = newTags.findIndex(({ id }) => id === tag.id);
      newTags[tagIndex] = { ...tag, isEnabled: !tag.isEnabled };
      setTags(newTags);
   }

   return (
      <>
         <AppBar ref={hideOnScrollHeaderRef} component="div" sx={{ position: 'absolute', height: 'fit-content', border: 'none' }}>
            <Stack spacing={1} direction={'row'} overflow={'auto'} p={1}>
               {tags.map((tag) => (
                  <Chip
                     key={tag.id}
                     label={tag.label}
                     onClick={() => handleToggleTag(tag)}
                     sx={{ bgcolor: tag.isEnabled ? tag.color : 'grey.800', opacity: tag.isEnabled ? 1 : 0.4 }}
                  />
               ))}
            </Stack>
         </AppBar>
         <DragAndDropList
            ref={saveOnScrollRef}
            style={{ overflow: 'auto', maxHeight: '100%', paddingTop: hideOnScrollHeaderHeight }}
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
         <Grid ref={hideOnScrollCheckedRef} container sx={{ position: 'absolute', bottom: 0, width: '100%', p: 2 }}>
            <Grid size={3} />
            <Grid size={6} sx={{ textAlign: 'center', alignSelf: 'end' }}>
               <Chip
                  label={`Done: ${checkedTasksCount}/${visibleTasks.size}`}
                  sx={{ color: `${checkedTasksCount === visibleTasks.size ? 'success.main' : 'error.main'}` }}
               />
            </Grid>
            <Grid size={3} sx={{ textAlign: 'right' }}>
               {tasks.length !== 0 && (
                  <Fab color="primary">
                     <Add onClick={handleCreateTask} />
                  </Fab>
               )}
            </Grid>
         </Grid>
      </>
   );
}
