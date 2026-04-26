import { DragIndicatorOutlined, KeyboardDoubleArrowDown, KeyboardDoubleArrowRight } from '@mui/icons-material';
import { Box, Checkbox, Divider, IconButton, ListItem, ListItemIcon, Stack, Typography } from '@mui/material';
import type { T_Task } from '@repo/types/app.types';
import { useSearchParams } from 'react-router';
import { createNewTask } from '@repo/utils/app.helpers';
import DragAndDropList from '../../../components/DragAndDropList';
import SwipeActionWrapper from '../../../components/SwipeActionWrapper';
import useLocalStorage from '../../../hooks/useLocalStorage';
import useScrollSaver from '../../../hooks/useScrollSaver';
import HideWhenMenuButton from './HideWhenMenuButton';
import ShowWhenMenuButton from './ShowWhenMenuButton';

export default function MorningRoutine(): React.JSX.Element {
   const [searchParams] = useSearchParams();
   const searchQuery = searchParams.get('search');
   const { ref } = useScrollSaver('morning-routine-scroll');
   const [tasks, setTasks] = useLocalStorage<T_Task[]>(`morning-routine-tasks`, []);

   function handleDelete(taskIndex: number): void {
      const updatedTasks = [...tasks];
      updatedTasks.splice(taskIndex, 1);
      setTasks(updatedTasks);
   }

   function handleToggleIsChecked(taskIndex: number): void {
      const updatedTasks = [...tasks];
      updatedTasks[taskIndex].isChecked = !updatedTasks[taskIndex].isChecked;
      setTasks(updatedTasks);
   }

   function handleSaveLabelOnBlur(event: React.FocusEvent<HTMLSpanElement>, taskIndex: number): void {
      const updatedLabel = event.currentTarget.textContent ?? '';
      if (updatedLabel === tasks[taskIndex].label) return;
      const updatedTasks = [...tasks];
      updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], label: updatedLabel };
      setTasks(updatedTasks);
   }

   function handleBlurOnEnterClick(event: React.KeyboardEvent<HTMLSpanElement>): void {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      event.currentTarget.blur();
   }

   function isTaskHidden(task: T_Task): boolean {
      return !(!searchQuery || task.label.toLowerCase().includes(searchQuery.toLowerCase()));
   }

   function addTaskBelow(indexes: [number] | [number, number] | [number, number, number]): void {
      const updatedTasks = [...tasks];
      const newTask: T_Task = createNewTask();
      if (indexes.length === 1) updatedTasks.splice(indexes[0] + 1, 0, newTask);
      else if (indexes.length === 2) updatedTasks[indexes[0]].children!.splice(indexes[1] + 1, 0, newTask);
      else updatedTasks[indexes[0]].children![indexes[1]].children!.splice(indexes[2] + 1, 0, newTask);
      setTasks(updatedTasks);
   }

   function addSubTask(indexes: [number] | [number, number]): void {
      const updatedTasks = [...tasks];
      const newTask: T_Task = createNewTask();
      let parentTask = updatedTasks[indexes[0]];
      if (indexes.length === 2) parentTask = parentTask.children![indexes[1]];
      parentTask.children = [...(parentTask.children ?? []), newTask];
      setTasks(updatedTasks);
   }

   return (
      <DragAndDropList
         ref={ref}
         items={tasks}
         onDrop={(newOrderedItems) => setTasks(newOrderedItems)}
         style={{ overflow: 'auto', maxHeight: '100%' }}
         renderItem={(task, dragElProps, i) =>
            !isTaskHidden(task) && (
               <Box>
                  {i > 0 && <Divider />}
                  <ListItem>
                     <SwipeActionWrapper
                        rightAction={{ label: 'Delete', bgColor: 'red', onAction: () => handleDelete(i) }}
                        leftAction={{ label: 'Toggle', bgColor: 'green', onAction: () => handleToggleIsChecked(i) }}
                     >
                        <Stack direction={'row'} justifyContent={'start'} alignItems={'center'}>
                           <ListItemIcon sx={{ minWidth: 20 }} {...dragElProps}>
                              <DragIndicatorOutlined />
                           </ListItemIcon>
                           <IconButton onClick={() => addTaskBelow([i])} size="small">
                              <KeyboardDoubleArrowDown fontSize="small" />
                           </IconButton>
                           <IconButton onClick={() => addSubTask([i])} size="small">
                              <KeyboardDoubleArrowRight fontSize="small" />
                           </IconButton>
                           <ShowWhenMenuButton section="morning" indexes={[i]} task={task} />
                           <HideWhenMenuButton section="morning" indexes={[i]} task={task} />
                        </Stack>
                        <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                           <Stack direction={'row'} alignItems={'center'}>
                              <Checkbox checked={task.isChecked} onChange={() => handleToggleIsChecked(i)} />
                              <Typography
                                 component="span"
                                 contentEditable
                                 suppressContentEditableWarning
                                 onBlur={(event) => handleSaveLabelOnBlur(event, i)}
                                 onKeyDown={handleBlurOnEnterClick}
                                 sx={{ outline: 'none' }}
                              >
                                 {task.label}
                              </Typography>
                           </Stack>
                        </Stack>
                     </SwipeActionWrapper>
                  </ListItem>
               </Box>
            )
         }
      />
   );
}

// add new task below icon
// add new subtask icon (only for tasks and subtasks, not subtasks of subtasks)
// select tags dropdown icon
// some sort of indication to what tags are associated with the task

// header: hide/show all tags
// header: reset all tasks
