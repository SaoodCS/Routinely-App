import { useState, type JSX } from 'react';
import type { AppTypes } from '@repo/types/index';
import { AppBar, Box, Chip, Stack } from '@mui/material';
import { useParams } from 'react-router';
import { useFirestoreContext } from '../../../database/useFirestoreContext';
import DragAndDropList from '../../../components/DragAndDropList';
import TaskItem from '../routine/TaskItem';

export default function TagTasks(): JSX.Element {
   const { tagId = '' } = useParams();
   const { tags, morningTasks, eveningTasks } = useFirestoreContext();
   const [section, setSection] = useState<AppTypes.RoutineSection>('morning');

   function doesTaskHaveTag(task: AppTypes.Task): boolean {
      return task.showWhenTags.includes(tagId) || task.hideWhenTags.includes(tagId);
   }

   function doesTaskChildrenHaveTag(task: AppTypes.Task): boolean {
      if (!task.children) return false;
      const tasksToCheck = [...task.children];
      for (let i = 0; i < tasksToCheck.length; i += 1) {
         const child = tasksToCheck[i];
         if (doesTaskHaveTag(child)) return true;
         if (!child.children) continue;
         for (const childTask of child.children) tasksToCheck.push(childTask);
      }
      return false;
   }

   function isTaskVisible(task: AppTypes.Task): boolean {
      return doesTaskHaveTag(task) || doesTaskChildrenHaveTag(task);
   }

   return (
      <>
         <AppBar component="div" sx={{ position: 'absolute', height: 'fit-content', border: 'none' }}>
            <Stack spacing={1} direction={'row'} overflow={'auto'} p={1} alignItems={'center'}>
               {(['morning', 'evening'] satisfies AppTypes.RoutineSection[]).map((item) => (
                  <Chip
                     key={item}
                     label={item.charAt(0).toUpperCase() + item.slice(1)}
                     onClick={() => setSection(item)}
                     variant={item === section ? 'filled' : 'outlined'}
                     sx={{ cursor: 'pointer', bgcolor: item === section ? 'primary.dark' : 'transparent', width: '100%' }}
                  />
               ))}
            </Stack>
            <DragAndDropList
               items={section === 'morning' ? morningTasks : eveningTasks}
               style={{ overflow: 'auto', maxHeight: '100%' }}
               onDrop={() => {}}
               renderItem={(task, dragElProps, i) =>
                  isTaskVisible(task) && (
                     <Box>
                        <TaskItem task={task} dragElProps={dragElProps} indexes={[i]} section={section} disabled={!doesTaskHaveTag(task)} />
                        {task.children && (
                           <DragAndDropList
                              items={task.children}
                              onDrop={() => {}}
                              renderItem={(subtask, dragElProps, j) =>
                                 isTaskVisible(subtask) && (
                                    <Box>
                                       <TaskItem
                                          task={subtask}
                                          dragElProps={dragElProps}
                                          indexes={[i, j]}
                                          section={section}
                                          disabled={!doesTaskHaveTag(subtask)}
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
                                                         disabled={!doesTaskHaveTag(subtask)}
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
