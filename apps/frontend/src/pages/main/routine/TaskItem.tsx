import type { T_Routine_Section, T_Task } from '@repo/types/app.types';
import type { FocusEvent, JSX } from 'react';
import { useSearchParams } from 'react-router';
import type { TypographyOwnProps } from '@mui/material';
import { Checkbox, IconButton, ListItem, ListItemIcon, Stack, Typography } from '@mui/material';
import { DragIndicatorOutlined, KeyboardDoubleArrowDown, KeyboardDoubleArrowRight } from '@mui/icons-material';
import { createNewTask } from '@repo/utils/app.helpers';
import { useTheme, alpha } from '@mui/material/styles';
import type DragAndDropList from '../../../components/DragAndDropList';
import useLocalStorage from '../../../hooks/useLocalStorage';
import SwipeActionWrapper from '../../../components/SwipeActionWrapper';
import ShowWhenMenuButton from './ShowWhenMenuButton';
import HideWhenMenuButton from './HideWhenMenuButton';

interface T_TaskItemProps {
   task: T_Task;
   dragElProps: Parameters<Parameters<typeof DragAndDropList<T_Task>>[0]['renderItem']>[1];
   indexes: [number] | [number, number] | [number, number, number];
   section: T_Routine_Section;
}

export default function TaskItem(props: T_TaskItemProps): JSX.Element {
   const { task, dragElProps, indexes, section } = props;
   const [searchParams] = useSearchParams();
   const searchQuery = searchParams.get('search');
   const [tasks, setTasks] = useLocalStorage<T_Task[]>(`${section}-routine-tasks`, []);
   const { palette } = useTheme();
   const depthBaseColors: string[] = [palette.primary.main, palette.secondary.dark, palette.secondary.main];
   const depthLeftIndent: number[] = [0.5, 1.25, 2.5];
   const depthTypographyVariant: TypographyOwnProps['variant'][] = ['body1', 'subtitle2', 'body2'];

   function addTaskBelow(indexes: T_TaskItemProps['indexes']): void {
      const updatedTasks = [...tasks];
      const newTask = createNewTask();
      if (indexes.length === 1) updatedTasks.splice(indexes[0] + 1, 0, newTask);
      else if (indexes.length === 2) updatedTasks[indexes[0]].children!.splice(indexes[1] + 1, 0, newTask);
      else updatedTasks[indexes[0]].children![indexes[1]].children!.splice(indexes[2] + 1, 0, newTask);
      setTasks(updatedTasks);
   }

   function addSubTask(indexes: T_TaskItemProps['indexes']): void {
      const updatedTasks = [...tasks];
      const newTask = createNewTask();
      let parentTask = updatedTasks[indexes[0]];
      if (indexes.length === 2) parentTask = parentTask.children![indexes[1]];
      parentTask.children = [...(parentTask.children ?? []), newTask];
      setTasks(updatedTasks);
   }

   function handleDelete(indexes: T_TaskItemProps['indexes']): void {
      const updatedTasks = [...tasks];
      if (indexes.length === 1) updatedTasks.splice(indexes[0], 1);
      else if (indexes.length === 2) updatedTasks[indexes[0]].children!.splice(indexes[1], 1);
      else updatedTasks[indexes[0]].children![indexes[1]].children!.splice(indexes[2], 1);
      setTasks(updatedTasks);
   }

   function handleToggleIsChecked(indexes: T_TaskItemProps['indexes']): void {
      const updatedTasks = [...tasks];
      let updatedTask = updatedTasks[indexes[0]];
      if (indexes.length === 2) updatedTask = updatedTask.children![indexes[1]];
      else if (indexes.length === 3) updatedTask = updatedTask.children![indexes[1]].children![indexes[2]];
      updatedTask.isChecked = !updatedTask.isChecked;
      setTasks(updatedTasks);
   }

   function handleBlurOnEnterClick(event: React.KeyboardEvent<HTMLSpanElement>): void {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      event.currentTarget.blur();
   }

   function handleSaveLabelOnBlur(event: FocusEvent<HTMLSpanElement, Element>, indexes: T_TaskItemProps['indexes']): void {
      const updatedLabel = event.currentTarget.textContent ?? '';
      if (updatedLabel === task.label) return;
      const updatedTasks = [...tasks];
      let updatedTask = updatedTasks[indexes[0]];
      if (indexes.length === 2) updatedTask = updatedTask.children![indexes[1]];
      else if (indexes.length === 3) updatedTask = updatedTask.children![indexes[1]].children![indexes[2]];
      updatedTask.label = updatedLabel;
      setTasks(updatedTasks);
   }

   function isTaskHidden(task: T_Task): boolean {
      return !(!searchQuery || task.label.toLowerCase().includes(searchQuery.toLowerCase()));
   }

   return !isTaskHidden(task) ? (
      <>
         <ListItem sx={{ px: 0.5, py: 0.5, pl: depthLeftIndent[indexes.length - 1] }}>
            <SwipeActionWrapper
               rightAction={{ label: 'Delete', bgColor: 'red', onAction: () => handleDelete(indexes) }}
               leftAction={{ label: 'Toggle', bgColor: 'green', onAction: () => handleToggleIsChecked(indexes) }}
               style={{
                  borderRadius: '5px',
                  borderLeft: `4px solid`,
                  backgroundColor: alpha(depthBaseColors[indexes.length - 1], 0.15),
                  borderLeftColor: depthBaseColors[indexes.length - 1],
               }}
            >
               <Stack direction={'row'} justifyContent={'start'} alignItems={'center'}>
                  <ListItemIcon sx={{ minWidth: 20 }} {...dragElProps}>
                     <DragIndicatorOutlined sx={{ color: alpha(depthBaseColors[indexes.length - 1], 0.75) }} />
                  </ListItemIcon>
                  <IconButton onClick={() => addTaskBelow(indexes)} size="small">
                     <KeyboardDoubleArrowDown fontSize="small" />
                  </IconButton>
                  {indexes.length !== 3 && (
                     <IconButton onClick={() => addSubTask(indexes)} size="small">
                        <KeyboardDoubleArrowRight fontSize="small" />
                     </IconButton>
                  )}
                  <ShowWhenMenuButton section="morning" indexes={indexes} task={task} />
                  <HideWhenMenuButton section="morning" indexes={indexes} task={task} />
               </Stack>
               <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                  <Stack direction={'row'} alignItems={'center'}>
                     <Checkbox checked={task.isChecked} onChange={() => handleToggleIsChecked(indexes)} sx={{ py: 0.5, px: 0.5 }} />
                     <Typography
                        component="span"
                        variant={depthTypographyVariant[indexes.length - 1]}
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(event) => handleSaveLabelOnBlur(event, indexes)}
                        onKeyDown={handleBlurOnEnterClick}
                        sx={{ outline: 'none', ...(task.isChecked ? { textDecoration: 'line-through' } : {}) }}
                     >
                        {task.label}
                     </Typography>
                  </Stack>
               </Stack>
            </SwipeActionWrapper>
         </ListItem>
      </>
   ) : (
      <></>
   );
}
