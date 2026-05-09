import { Add } from '@mui/icons-material';
import { AppBar, Box, Chip, Fab, Grid, Stack } from '@mui/material';
import type { AppTypes } from '@repo/types/index';
import { AppUtils } from '@repo/utils/index';
import { useMemo, useState, type JSX } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router';
import DragAndDropList from '../../../../components/DragAndDropList';
import { useFirestoreContext } from '../../../../database/useFirestoreContext';
import useHideOnScroll from '../../../../hooks/useHideOnScroll';
import useScrollSaver from '../../../../hooks/useScrollSaver';
import TaskItem from '../../routine/TaskItem';

export default function TagIdPage(): JSX.Element {
   const { tagId = '' } = useParams();
   const { pathname } = useLocation();
   const { morningTasks, eveningTasks, setMorningTasksDb, setEveningTasksDb } = useFirestoreContext();
   const [section, setSection] = useState<AppTypes.RoutineSection>('morning');
   const { ref: dragDropListRef } = useScrollSaver(`${pathname}-scroll`);
   const { ref: sectionHeaderRef, hideOnScrollElHeight: sectionHeaderHeight } = useHideOnScroll(dragDropListRef, 'up');
   const { ref: tasksDoneFooterRef } = useHideOnScroll(dragDropListRef, 'down');
   const [searchParams] = useSearchParams();
   const normalizedSearchQuery = searchParams.get('search')?.toLowerCase() ?? '';
   const tasks = section === 'morning' ? morningTasks : eveningTasks;
   const setTasks = section === 'morning' ? setMorningTasksDb : setEveningTasksDb;

   const relatedTasks = useMemo(() => {
      const relatedTasks: Set<AppTypes.Task> = new Set();
      const tasksToCheck = [...tasks];
      for (let i = 0; i < tasksToCheck.length; i += 1) {
         const task = tasksToCheck[i];
         if (task.children) for (const child of task.children) tasksToCheck.push(child);
      }
      for (let i = tasksToCheck.length - 1; i >= 0; i -= 1) {
         const task = tasksToCheck[i];
         const isTaskRelatedToTag = task.showWhenTags.includes(tagId) || task.hideWhenTags.includes(tagId);
         const areChildrenOfTaskRelatedToTag = task.children?.some((child) => relatedTasks.has(child)) ?? false;
         if (isTaskRelatedToTag || areChildrenOfTaskRelatedToTag) relatedTasks.add(task);
      }
      return relatedTasks;
   }, [tasks, tagId]);

   const tasksRelatedViaShowWhenField = useMemo(() => {
      const tasksRelatedViaShowWhenField: Set<AppTypes.Task> = new Set();
      for (const task of relatedTasks) {
         if (!task.showWhenTags.includes(tagId)) continue;
         tasksRelatedViaShowWhenField.add(task);
      }
      return tasksRelatedViaShowWhenField;
   }, [relatedTasks, tagId]);

   const checkedTasksRelatedViaShowWhenFieldCount = useMemo(() => {
      let checkedTasksRelatedViaShowWhenFieldCount = 0;
      for (const task of tasksRelatedViaShowWhenField) if (task.isChecked) checkedTasksRelatedViaShowWhenFieldCount += 1;
      return checkedTasksRelatedViaShowWhenFieldCount;
   }, [tasksRelatedViaShowWhenField]);

   const isTaskVisible = (task: AppTypes.Task): boolean => {
      if (!relatedTasks.has(task)) return false;
      if (task.label.toLowerCase().includes(normalizedSearchQuery)) return true;
      if (!task.children) return false;
      const tasksToCheck = [...task.children];
      for (let i = 0; i < tasksToCheck.length; i += 1) {
         const taskToCheck = tasksToCheck[i];
         if (!relatedTasks.has(taskToCheck)) continue;
         if (taskToCheck.label.toLowerCase().includes(normalizedSearchQuery)) return true;
         if (taskToCheck.children) for (const child of taskToCheck.children) tasksToCheck.push(child);
      }
      return false;
   };

   function handleTextOverlay(task: AppTypes.Task): string | undefined {
      if (task.hideWhenTags.includes(tagId)) return 'TASK IS HIDDEN WHEN TAG IS ENABLED';
      if (!task.showWhenTags.includes(tagId)) return 'PARENT OF SUBTASK RELATED TO TAG';
      if (!task.label.toLowerCase().includes(normalizedSearchQuery)) return 'PARENT OF SEARCH QUERY MATCH';
   }

   function handleChangeSection(section: AppTypes.RoutineSection): void {
      setSection(section);
   }

   function handleCreateTask(): void {
      const newTask: AppTypes.Task = AppUtils.createNewTask({ showWhenTags: [tagId] });
      setTasks([...tasks, newTask]);
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
         <AppBar ref={sectionHeaderRef} component="div" position={'absolute'} sx={{ height: 'fit-content' }}>
            <Stack spacing={1} direction={'row'} overflow={'auto'} p={1} alignItems={'center'}>
               {(['morning', 'evening'] satisfies AppTypes.RoutineSection[]).map((item) => (
                  <Chip
                     key={item}
                     label={item.charAt(0).toUpperCase() + item.slice(1)}
                     onClick={() => handleChangeSection(item)}
                     variant={item === section ? 'filled' : 'outlined'}
                     sx={{ bgcolor: item === section ? 'primary.dark' : 'transparent', width: '100%' }}
                  />
               ))}
            </Stack>
         </AppBar>
         <DragAndDropList
            ref={dragDropListRef}
            items={section === 'morning' ? morningTasks : eveningTasks}
            style={{ overflow: 'auto', maxHeight: '100%', paddingTop: sectionHeaderHeight }}
            onDrop={(newOrderedItems) => handleReorderOnDrop(newOrderedItems)}
            renderItem={(task, dragElProps, i) =>
               isTaskVisible(task) && (
                  <Box>
                     <TaskItem task={task} dragElProps={dragElProps} indexes={[i]} section={section} textOverlay={handleTextOverlay(task)} />
                     {task.children && (
                        <DragAndDropList
                           items={task.children}
                           onDrop={(newOrderedItems) => handleReorderOnDrop(newOrderedItems, [i])}
                           renderItem={(subtask, dragElProps, j) =>
                              isTaskVisible(subtask) && (
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
                                             isTaskVisible(subsubtask) && (
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
                  label={`Done: ${checkedTasksRelatedViaShowWhenFieldCount}/${tasksRelatedViaShowWhenField.size}`}
                  sx={{
                     color: `${checkedTasksRelatedViaShowWhenFieldCount === tasksRelatedViaShowWhenField.size ? 'success.main' : 'error.main'}`,
                     cursor: 'default',
                  }}
               />
            </Grid>
            <Grid size={3} sx={{ textAlign: 'right' }} onClick={handleCreateTask}>
               <Fab color="primary">
                  <Add />
               </Fab>
            </Grid>
         </Grid>
      </>
   );
}
