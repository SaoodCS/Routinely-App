import { useMemo, useState, type JSX } from 'react';
import type { AppTypes } from '@repo/types/index';
import { AppBar, Box, Chip, Stack } from '@mui/material';
import { useParams } from 'react-router';
import { AppUtils } from '@repo/utils/index';
import { useFirestoreContext } from '../../../database/useFirestoreContext';
import DragAndDropList from '../../../components/DragAndDropList';
import TaskItem from '../routine/TaskItem';

export default function TagTasks(): JSX.Element {
   const { tagId = '' } = useParams();
   const { morningTasks, eveningTasks, setMorningTasks, setEveningTasks } = useFirestoreContext();
   const [section, setSection] = useState<AppTypes.RoutineSection>('morning');
   const tasks = useMemo(() => (section === 'morning' ? morningTasks : eveningTasks), [section, morningTasks, eveningTasks]);
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
         if (hasTag || hasRelatedChildren) relatedTasks.add(task);
      }
      return relatedTasks;
   }, [tasks, tagId]);

   const isTaskVisible = (task: AppTypes.Task): boolean => relatedTasks.has(task);

   function handleChangeSection(section: AppTypes.RoutineSection): void {
      setSection(section);
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
      if (task.hideWhenTags.includes(tagId)) return 'HIDDEN WHEN TAG IS ENABLED';
      if (!task.showWhenTags.includes(tagId)) return 'PARENT OF RELATED TASK';
   }

   return (
      <>
         <AppBar component="div" sx={{ position: 'absolute', height: 'fit-content', border: 'none' }}>
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
            <DragAndDropList
               items={section === 'morning' ? morningTasks : eveningTasks}
               style={{ overflow: 'auto', maxHeight: '100%' }}
               onDrop={(newOrderedItems) => handleReorderOnDrop(newOrderedItems)}
               renderItem={(task, dragElProps, i) =>
                  isTaskVisible(task) && (
                     <Box>
                        <TaskItem task={task} dragElProps={dragElProps} indexes={[i]} section={section} textOverlay={handleTextOverlay(task)} />
                        {task.children && (
                           <DragAndDropList
                              items={task.children}
                              onDrop={(newOrderedItems) => handleReorderOnDrop(newOrderedItems)}
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
                                             onDrop={() => {}}
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
         </AppBar>
      </>
   );
}
