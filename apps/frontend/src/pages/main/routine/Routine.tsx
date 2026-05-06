import { Add } from '@mui/icons-material';
import { AppBar, Box, Chip, Fab, Grid, Stack } from '@mui/material';
import { useMemo, type JSX } from 'react';
import { useLocation, useSearchParams } from 'react-router';
import { AppUtils } from '@repo/utils/index';
import type { AppTypes } from '@repo/types/index';
import DragAndDropList from '../../../components/DragAndDropList';
import useScrollSaver from '../../../hooks/useScrollSaver';
import { useFirestoreContext } from '../../../database/useFirestoreContext';
import useHideOnScroll from '../../../hooks/useHideOnScroll';
import useLocalStorage from '../../../hooks/useLocalStorage';
import TaskItem from './TaskItem';

interface T_RoutineProps {
   section: AppTypes.RoutineSection;
}

export default function Routine({ section }: T_RoutineProps): JSX.Element {
   const { morningTasks, setMorningTasks, eveningTasks, setEveningTasks, tags, setTags } = useFirestoreContext();
   const tasks = section === 'morning' ? morningTasks : eveningTasks;
   const setTasks = section === 'morning' ? setMorningTasks : setEveningTasks;
   const { pathname } = useLocation();
   const { ref: dragDropListRef } = useScrollSaver(`${pathname}-scroll`);
   const { ref: tagHeaderRef, hideOnScrollElHeight: tagHeaderHeight } = useHideOnScroll(dragDropListRef, 'up', tags.length > 0);
   const { ref: tasksDoneFooterRef } = useHideOnScroll(dragDropListRef, 'down');
   const [searchParams] = useSearchParams();
   const searchQuery = searchParams.get('search');
   const enabledTagIds = useMemo(() => new Set(tags.filter(({ isEnabled }) => isEnabled).map(({ id }) => id)), [tags]);
   const [showHidden, setShowHidden] = useLocalStorage<boolean>('show-hidden', false);

   const visibleTasks = useMemo(() => {
      const visibleTasks = new Set<AppTypes.Task>();
      const tasksToCheck = [...tasks];
      let visibleTaskCandidatesCount = 0;
      for (let i = 0; i < tasksToCheck.length; i += 1) {
         const task = tasksToCheck[i];
         const hideWhenTagsEnabled = task.hideWhenTags.some((tagId) => enabledTagIds.has(tagId));
         const showWhenTagsEnabled = task.showWhenTags.some((tagId) => enabledTagIds.has(tagId));
         if (hideWhenTagsEnabled || (task.showWhenTags.length > 0 && !showWhenTagsEnabled)) continue;
         tasksToCheck[visibleTaskCandidatesCount] = task;
         visibleTaskCandidatesCount += 1;
         if (task.children) for (const child of task.children) tasksToCheck.push(child);
      }
      for (let i = visibleTaskCandidatesCount - 1; i >= 0; i -= 1) {
         const task = tasksToCheck[i];
         const hasVisibleChildren = task.children?.some((child) => visibleTasks.has(child)) ?? false;
         const inSearchQuery = task.label.toLowerCase().includes(searchQuery?.toLowerCase() ?? '');
         if (inSearchQuery || hasVisibleChildren) visibleTasks.add(task);
      }
      return visibleTasks;
   }, [tasks, searchQuery, enabledTagIds]);

   const checkedTasksCount = useMemo(() => {
      let checkedTasksCount = 0;
      for (const task of visibleTasks) if (task.isChecked) checkedTasksCount += 1;
      return checkedTasksCount;
   }, [visibleTasks]);

   const isTaskVisible = (task: AppTypes.Task): boolean => visibleTasks.has(task);

   function handleTextOverlay(task: AppTypes.Task): string | undefined {
      if (!isTaskVisible(task)) return 'HIDDEN';
   }

   function handleCreateTask(): void {
      const newTask = AppUtils.createNewTask();
      setTasks([...tasks, newTask]);
   }

   function handleToggleTag(index: number): void {
      const newTags = [...tags];
      newTags[index] = { ...newTags[index], isEnabled: !newTags[index].isEnabled };
      setTags(newTags);
   }

   function handleToggleAllTags(): void {
      const shouldEnableAllTags = tags.some(({ isEnabled }) => !isEnabled);
      setTags(tags.map((tag) => ({ ...tag, isEnabled: shouldEnableAllTags })));
   }

   function handleReorderOnDrop(newOrderedItems: AppTypes.Task[], indexes?: AppTypes.DepthIndexes): void {
      if (!indexes) {
         setTasks(newOrderedItems);
         return;
      }
      const updatedTasks = [...tasks];
      const parentTaskList = AppUtils.getTasksListToUpdate(updatedTasks, indexes);
      const parentTaskIndex = indexes.at(-1)!;
      parentTaskList[parentTaskIndex] = { ...parentTaskList[parentTaskIndex], children: newOrderedItems };
      setTasks(updatedTasks);
   }

   return (
      <>
         {tags.length > 0 && (
            <AppBar ref={tagHeaderRef} component="div" sx={{ position: 'absolute', height: 'fit-content', border: 'none' }}>
               <Stack spacing={1} direction={'row'} overflow={'auto'} p={1} alignItems={'center'}>
                  <Chip label={'Toggle All Tags'} onClick={handleToggleAllTags} color="primary" variant={'outlined'} />
                  <Chip
                     label={`${showHidden ? 'Hide' : 'Show'} Hidden Tasks`}
                     onClick={() => setShowHidden(!showHidden)}
                     color="primary"
                     variant={'outlined'}
                  />
                  {tags.map((tag, i) => (
                     <Chip
                        key={tag.id}
                        label={tag.label}
                        onClick={() => handleToggleTag(i)}
                        sx={{ bgcolor: tag.isEnabled ? 'primary.dark' : 'grey.800', opacity: tag.isEnabled ? 1 : 0.4 }}
                     />
                  ))}
               </Stack>
            </AppBar>
         )}
         <DragAndDropList
            ref={dragDropListRef}
            style={{ overflow: 'auto', maxHeight: '100%', paddingTop: tagHeaderHeight }}
            items={tasks}
            onDrop={(newOrderedItems) => handleReorderOnDrop(newOrderedItems)}
            renderItem={(task, dragElProps, i) =>
               (isTaskVisible(task) || showHidden) && (
                  <Box>
                     <TaskItem task={task} dragElProps={dragElProps} indexes={[i]} section={section} textOverlay={handleTextOverlay(task)} />
                     {task.children && (
                        <DragAndDropList
                           items={task.children}
                           onDrop={(newOrderedItems) => handleReorderOnDrop(newOrderedItems, [i])}
                           renderItem={(subtask, dragElProps, j) =>
                              (isTaskVisible(subtask) || showHidden) && (
                                 <Box>
                                    <TaskItem
                                       task={subtask}
                                       dragElProps={dragElProps}
                                       indexes={[i, j]}
                                       section={section}
                                       textOverlay={handleTextOverlay(subtask)}
                                    />
                                    {subtask.children && (
                                       <DragAndDropList
                                          items={subtask.children}
                                          onDrop={(newOrderedItems) => handleReorderOnDrop(newOrderedItems, [i, j])}
                                          renderItem={(subsubtask, dragElProps, k) =>
                                             (isTaskVisible(subsubtask) || showHidden) && (
                                                <Box>
                                                   <TaskItem
                                                      task={subsubtask}
                                                      dragElProps={dragElProps}
                                                      indexes={[i, j, k]}
                                                      section={section}
                                                      textOverlay={handleTextOverlay(subsubtask)}
                                                   />
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
         <Grid ref={tasksDoneFooterRef} container sx={{ position: 'absolute', bottom: 0, width: '100%', p: 2 }}>
            <Grid size={3} />
            <Grid size={6} sx={{ textAlign: 'center', alignSelf: 'end' }}>
               <Chip
                  label={`Done: ${checkedTasksCount}/${visibleTasks.size}`}
                  sx={{ color: `${checkedTasksCount === visibleTasks.size ? 'success.main' : 'error.main'}`, cursor: 'default' }}
               />
            </Grid>
            <Grid size={3} sx={{ textAlign: 'right' }}>
               <Fab color="primary">
                  <Add onClick={handleCreateTask} />
               </Fab>
            </Grid>
         </Grid>
      </>
   );
}
