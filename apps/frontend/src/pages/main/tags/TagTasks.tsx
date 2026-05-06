import { useMemo, useState, type JSX } from 'react';
import type { AppTypes } from '@repo/types/index';
import { AppBar, Box, Chip, Fab, Grid, Stack } from '@mui/material';
import { useLocation, useParams, useSearchParams } from 'react-router';
import { AppUtils } from '@repo/utils/index';
import { Add } from '@mui/icons-material';
import { useFirestoreContext } from '../../../database/useFirestoreContext';
import DragAndDropList from '../../../components/DragAndDropList';
import TaskItem from '../routine/TaskItem';
import useScrollSaver from '../../../hooks/useScrollSaver';
import useHideOnScroll from '../../../hooks/useHideOnScroll';

export default function TagTasks(): JSX.Element {
   const { tagId = '' } = useParams();
   const { pathname } = useLocation();
   const { morningTasks, eveningTasks, setMorningTasks, setEveningTasks } = useFirestoreContext();
   const [section, setSection] = useState<AppTypes.RoutineSection>('morning');
   const { ref: dragDropListRef } = useScrollSaver(`${pathname}-scroll`);
   const { ref: sectionHeaderRef, hideOnScrollElHeight: sectionHeaderHeight } = useHideOnScroll(dragDropListRef, 'up');
   const { ref: tasksDoneFooterRef } = useHideOnScroll(dragDropListRef, 'down');
   const [searchParams] = useSearchParams();
   const searchQuery = searchParams.get('search')?.toLowerCase() ?? '';
   const tasks = section === 'morning' ? morningTasks : eveningTasks;
   const setTasks = section === 'morning' ? setMorningTasks : setEveningTasks;

   const relatedTasks = useMemo(() => {
      const relatedTasks: Set<AppTypes.Task> = new Set();
      const tasksToCheck = [...tasks];
      for (let i = 0; i < tasksToCheck.length; i += 1) {
         const task = tasksToCheck[i];
         if (task.children) for (const child of task.children) tasksToCheck.push(child);
      }
      for (let i = tasksToCheck.length - 1; i >= 0; i -= 1) {
         const task = tasksToCheck[i];
         const hasTag = task.showWhenTags.includes(tagId) || task.hideWhenTags.includes(tagId);
         const hasRelatedChildren = task.children?.some((child) => relatedTasks.has(child)) ?? false;
         const inSearchQuery = task.label.toLowerCase().includes(searchQuery);
         if (hasTag || hasRelatedChildren || inSearchQuery) relatedTasks.add(task);
      }
      return relatedTasks;
   }, [tasks, tagId, searchQuery]);

   const { showWhenTasksCount, checkedShowWhenTasksCount } = useMemo(() => {
      let showWhenTasksCount = 0;
      let checkedShowWhenTasksCount = 0;
      for (const task of relatedTasks) {
         if (!task.showWhenTags.includes(tagId)) continue;
         showWhenTasksCount += 1;
         if (task.isChecked) checkedShowWhenTasksCount += 1;
      }
      return { showWhenTasksCount, checkedShowWhenTasksCount };
   }, [relatedTasks, tagId]);

   const isTaskVisible = (task: AppTypes.Task): boolean => relatedTasks.has(task);

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

   function handleTextOverlay(task: AppTypes.Task): string | undefined {
      if (task.hideWhenTags.includes(tagId)) return 'TASK IS HIDDEN WHEN TAG IS ENABLED';
      if (!task.showWhenTags.includes(tagId)) return 'PARENT OF TAGGED SUBTASK';
   }

   return (
      <>
         <AppBar ref={sectionHeaderRef} component="div" sx={{ position: 'absolute', height: 'fit-content', border: 'none' }}>
            <Stack spacing={1} direction={'row'} overflow={'auto'} p={1} alignItems={'center'}>
               {(['morning', 'evening'] satisfies AppTypes.RoutineSection[]).map((item) => (
                  <Chip
                     key={item}
                     label={item.charAt(0).toUpperCase() + item.slice(1)}
                     onClick={() => handleChangeSection(item)}
                     variant={item === section ? 'filled' : 'outlined'}
                     sx={{ cursor: 'pointer', bgcolor: item === section ? 'primary.dark' : 'transparent', width: '100%' }}
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
                  label={`Done: ${checkedShowWhenTasksCount}/${showWhenTasksCount}`}
                  sx={{ color: `${checkedShowWhenTasksCount === showWhenTasksCount ? 'success.main' : 'error.main'}`, cursor: 'default' }}
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
