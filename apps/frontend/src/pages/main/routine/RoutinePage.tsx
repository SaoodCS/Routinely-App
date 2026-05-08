import { Add } from '@mui/icons-material';
import { alpha, AppBar, Box, Chip, Grid, SpeedDial, SpeedDialAction, SpeedDialIcon, Stack, useTheme } from '@mui/material';
import type { AppTypes } from '@repo/types/index';
import { AppUtils } from '@repo/utils/index';
import { useMemo, type JSX } from 'react';
import { useLocation, useSearchParams } from 'react-router';
import DragAndDropList from '../../../components/DragAndDropList';
import { useFirestoreContext } from '../../../database/useFirestoreContext';
import useHideOnScroll from '../../../hooks/useHideOnScroll';
import useLocalStorage from '../../../hooks/useLocalStorage';
import useScrollSaver from '../../../hooks/useScrollSaver';
import TaskItem from './TaskItem';
import RoutineEmptyPlaceholder from './RoutineEmptyPlaceholder';

interface T_RoutineProps {
   section: AppTypes.RoutineSection;
}

export default function RoutinePage({ section }: T_RoutineProps): JSX.Element {
   const { morningTasks, setMorningTasksDb, eveningTasks, setEveningTasksDb, tags, setTagsDb } = useFirestoreContext();
   const tasks = section === 'morning' ? morningTasks : eveningTasks;
   const setTasks = section === 'morning' ? setMorningTasksDb : setEveningTasksDb;
   const { pathname } = useLocation();
   const { ref: dragDropListRef } = useScrollSaver(`${pathname}-scroll`);
   const { ref: tagHeaderRef, hideOnScrollElHeight: tagHeaderHeight } = useHideOnScroll(dragDropListRef, 'up', tags.length > 0);
   const { ref: tasksDoneFooterRef } = useHideOnScroll(dragDropListRef, 'down');
   const [searchParams] = useSearchParams();
   const normalizedSearchQuery = searchParams.get('search')?.toLowerCase() ?? '';
   const enabledTagIds = useMemo(() => new Set(tags.filter(({ isEnabled }) => isEnabled).map(({ id }) => id)), [tags]);
   const [showHidden] = useLocalStorage<boolean>('show-hidden', false);
   const { palette } = useTheme();

   const visibleTasks = useMemo(() => {
      const visibleTasks = new Set<AppTypes.Task>();
      const tasksToCheck = [...tasks];
      for (let i = 0; i < tasksToCheck.length; i += 1) {
         const task = tasksToCheck[i];
         const hideWhenTagsEnabled = task.hideWhenTags.some((tagId) => enabledTagIds.has(tagId));
         const showWhenTagsEnabled = task.showWhenTags.some((tagId) => enabledTagIds.has(tagId));
         const showWhenTagsEmpty = task.showWhenTags.length === 0;
         if (hideWhenTagsEnabled || (!showWhenTagsEmpty && !showWhenTagsEnabled)) continue;
         visibleTasks.add(task);
         if (task.children) for (const child of task.children) tasksToCheck.push(child);
      }
      return visibleTasks;
   }, [tasks, enabledTagIds]);

   const checkedTasksCount = useMemo(() => {
      let checkedTasksCount = 0;
      for (const task of visibleTasks) if (task.isChecked) checkedTasksCount += 1;
      return checkedTasksCount;
   }, [visibleTasks]);

   const isTaskRendered = (task: AppTypes.Task): boolean => {
      if (!(visibleTasks.has(task) || showHidden)) return false;
      if (task.label.toLowerCase().includes(normalizedSearchQuery)) return true;
      if (!task.children) return false;
      const tasksToCheck = [...task.children];
      for (let i = 0; i < tasksToCheck.length; i += 1) {
         const taskToCheck = tasksToCheck[i];
         if (!(visibleTasks.has(taskToCheck) || showHidden)) continue;
         if (taskToCheck.label.toLowerCase().includes(normalizedSearchQuery)) return true;
         if (taskToCheck.children) for (const child of taskToCheck.children) tasksToCheck.push(child);
      }
      return false;
   };

   function handleTextOverlay(task: AppTypes.Task): string | undefined {
      if (!isTaskRendered(task)) return;
      if (!visibleTasks.has(task) && showHidden) return 'HIDDEN';
      if (!task.label.toLowerCase().includes(normalizedSearchQuery)) return 'PARENT OF SEARCH QUERY MATCH';
   }

   function handleCreateTask(): void {
      const newTask = AppUtils.createNewTask();
      setTasks([...tasks, newTask]);
   }

   function handleToggleTag(index: number): void {
      const updatedTag = { ...tags[index], isEnabled: !tags[index].isEnabled };
      setTagsDb(tags.with(index, updatedTag));
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
            <AppBar ref={tagHeaderRef} component="div" position={'absolute'} sx={{ height: 'fit-content' }}>
               <Stack spacing={1} direction={'row'} overflow={'auto'} p={1} alignItems={'center'}>
                  {tags.map((tag, i) => (
                     <Chip
                        size={'small'}
                        key={tag.id}
                        label={tag.label}
                        onClick={() => handleToggleTag(i)}
                        sx={{
                           bgcolor: alpha(palette.primary.main, tag.isEnabled ? 0.6 : 0.075),
                           color: tag.isEnabled ? palette.text.primary : palette.grey[700],
                        }}
                     />
                  ))}
               </Stack>
            </AppBar>
         )}
         {tasks.length === 0 && <RoutineEmptyPlaceholder />}
         <DragAndDropList
            ref={dragDropListRef}
            style={{ overflow: 'auto', maxHeight: '100%', paddingTop: tagHeaderHeight }}
            items={tasks}
            onDrop={(newOrderedItems) => handleReorderOnDrop(newOrderedItems)}
            renderItem={(task, dragElProps, i) =>
               isTaskRendered(task) && (
                  <Box>
                     <TaskItem task={task} dragElProps={dragElProps} indexes={[i]} section={section} textOverlay={handleTextOverlay(task)} />
                     {task.children && (
                        <DragAndDropList
                           items={task.children}
                           onDrop={(newOrderedItems) => handleReorderOnDrop(newOrderedItems, [i])}
                           renderItem={(subtask, dragElProps, j) =>
                              isTaskRendered(subtask) && (
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
                                             isTaskRendered(subsubtask) && (
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
         <Grid ref={tasksDoneFooterRef} container sx={{ position: 'absolute', bottom: 0, width: '100%', p: 2, pointerEvents: 'none' }}>
            <Grid size={3} />
            <Grid size={6} sx={{ textAlign: 'center', alignSelf: 'end' }}>
               <Chip
                  label={`Done: ${checkedTasksCount}/${visibleTasks.size}`}
                  sx={{ color: `${checkedTasksCount === visibleTasks.size ? 'success.main' : 'error.main'}`, cursor: 'default' }}
               />
            </Grid>
            <Grid size={3}>
               <SpeedDial ariaLabel="quick actions" icon={<SpeedDialIcon />}>
                  <SpeedDialAction onClick={handleCreateTask} icon={<Add />} slotProps={{ tooltip: { open: true, title: 'Add Task' } }} />
               </SpeedDial>
            </Grid>
         </Grid>
      </>
   );
}
