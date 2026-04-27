import { DragIndicatorOutlined, KeyboardDoubleArrowDown, KeyboardDoubleArrowRight } from '@mui/icons-material';
import { Grow, IconButton, ListItem, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import type { T_Routine_Section, T_Tag, T_Task } from '@repo/types/app.types';
import { createNewTask } from '@repo/utils/app.helpers';
import { useMemo, type FocusEvent, type JSX, type KeyboardEvent } from 'react';
import { useSearchParams } from 'react-router';
import type DragAndDropList from '../../../components/DragAndDropList';
import SwipeActionWrapper from '../../../components/SwipeActionWrapper';
import useLocalStorage from '../../../hooks/useLocalStorage';
import type { PaletteFirstKey, PaletteSecondKey } from '../../../theme/theme';
import ShowHideWhenMenuButton from './ShowHideWhenMenuButton';

const DEPTH_STYLES: Record<T_TaskItemProps['indexes']['length'], { indent: number; color: [PaletteFirstKey, PaletteSecondKey]; fontSize: string }> = {
   1: { indent: 1, color: ['primary', 'main'], fontSize: '1rem' },
   2: { indent: 2, color: ['secondary', 'dark'], fontSize: '0.9rem' },
   3: { indent: 3, color: ['secondary', 'main'], fontSize: '0.825rem' },
};

interface T_TaskItemProps {
   task: T_Task;
   dragElProps: Parameters<Parameters<typeof DragAndDropList<T_Task>>[0]['renderItem']>[1];
   indexes: [number] | [number, number] | [number, number, number];
   section: T_Routine_Section;
}

export default function TaskItem(props: T_TaskItemProps): JSX.Element | null {
   const { task, dragElProps, indexes, section } = props;
   const [searchParams] = useSearchParams();
   const searchQuery = searchParams.get('search')?.toLowerCase();
   const [tasks, setTasks] = useLocalStorage<T_Task[]>(`${section}-routine-tasks`, []);
   const [tags] = useLocalStorage<T_Tag[]>(`tags`, []);
   const { palette } = useTheme();
   const taskDepthStyle = DEPTH_STYLES[indexes.length];
   const enabledTagIds = useMemo(() => new Set(tags.filter(({ isEnabled }) => isEnabled).map(({ id }) => id)), [tags]);

   function updateTask(updatedTasks: T_Task[], update: (task: T_Task) => T_Task): void {
      if (indexes.length === 1) updatedTasks[indexes[0]] = update(updatedTasks[indexes[0]]);
      else if (indexes.length === 2) updatedTasks[indexes[0]].children![indexes[1]] = update(updatedTasks[indexes[0]].children![indexes[1]]);
      else
         updatedTasks[indexes[0]].children![indexes[1]].children![indexes[2]] = update(
            updatedTasks[indexes[0]].children![indexes[1]].children![indexes[2]],
         );
   }

   function addTaskBelow(): void {
      const updatedTasks = [...tasks];
      const newTask = createNewTask();
      if (indexes.length === 1) updatedTasks.splice(indexes[0] + 1, 0, newTask);
      else if (indexes.length === 2) updatedTasks[indexes[0]].children!.splice(indexes[1] + 1, 0, newTask);
      else updatedTasks[indexes[0]].children![indexes[1]].children!.splice(indexes[2] + 1, 0, newTask);
      setTasks(updatedTasks);
   }

   function addSubTask(): void {
      const updatedTasks = [...tasks];
      const newTask = createNewTask();
      let parentTask = updatedTasks[indexes[0]];
      if (indexes.length === 2) parentTask = parentTask.children![indexes[1]];
      parentTask.children = [newTask, ...(parentTask.children ?? [])];
      setTasks(updatedTasks);
   }

   function handleDelete(): void {
      const updatedTasks = [...tasks];
      if (indexes.length === 1) updatedTasks.splice(indexes[0], 1);
      else if (indexes.length === 2) updatedTasks[indexes[0]].children!.splice(indexes[1], 1);
      else updatedTasks[indexes[0]].children![indexes[1]].children!.splice(indexes[2], 1);
      setTasks(updatedTasks);
   }

   function handleToggleIsChecked(): void {
      const updatedTasks = [...tasks];
      let updatedTask = updatedTasks[indexes[0]];
      if (indexes.length === 2) updatedTask = updatedTask.children![indexes[1]];
      else if (indexes.length === 3) updatedTask = updatedTask.children![indexes[1]].children![indexes[2]];
      updatedTask.isChecked = !updatedTask.isChecked;
      setTasks(updatedTasks);
   }

   function handleBlurOnEnterClick(event: KeyboardEvent<HTMLSpanElement>): void {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      event.currentTarget.blur();
   }

   function handleSaveLabelOnBlur(event: FocusEvent<HTMLSpanElement, Element>): void {
      const updatedLabel = event.currentTarget.textContent ?? '';
      if (updatedLabel === task.label) return;
      const updatedTasks = [...tasks];
      let updatedTask = updatedTasks[indexes[0]];
      if (indexes.length === 2) updatedTask = updatedTask.children![indexes[1]];
      else if (indexes.length === 3) updatedTask = updatedTask.children![indexes[1]].children![indexes[2]];
      updatedTask.label = updatedLabel;
      setTasks(updatedTasks);
   }

   function isTaskVisibleViaTag(task: T_Task): boolean {
      const taskHideWhenTags: T_Task['hideWhenTags'] = task.hideWhenTags ?? [];
      if (taskHideWhenTags.some((tagId) => enabledTagIds.has(tagId))) return false;
      if (!task.showWhenTags || task.showWhenTags.length === 0) return true;
      return task.showWhenTags.some((tagId) => enabledTagIds.has(tagId));
   }

   function isTaskVisible(): boolean {
      if (searchQuery && !task.label.toLowerCase().includes(searchQuery)) return false;
      if (!isTaskVisibleViaTag(task)) return false;
      if (indexes.length === 2 || indexes.length === 3) {
         const parentTask = tasks[indexes[0]];
         if (!isTaskVisibleViaTag(parentTask)) return false;
      }
      if (indexes.length === 3) {
         const parentTask = tasks[indexes[0]].children![indexes[1]];
         if (!isTaskVisibleViaTag(parentTask)) return false;
      }
      return true;
   }

   return isTaskVisible() ? (
      <Grow in timeout={500}>
         <ListItem sx={{ py: 0.5, px: 1, pl: taskDepthStyle.indent }}>
            <SwipeActionWrapper
               rightAction={{ label: 'Delete', bgColor: 'red', onAction: handleDelete }}
               leftAction={{ label: 'Toggle', bgColor: 'green', onAction: handleToggleIsChecked }}
               style={{
                  borderRadius: '5px',
                  borderLeft: `4px solid ${palette[taskDepthStyle.color[0]][taskDepthStyle.color[1]]}`,
                  backgroundColor: alpha(palette[taskDepthStyle.color[0]][taskDepthStyle.color[1]], 0.15),
                  opacity: task.isChecked ? 0.5 : 1,
               }}
            >
               <Stack
                  direction={'row'}
                  justifyContent={'start'}
                  alignItems={'center'}
                  sx={{
                     pt: 0.5,
                     '& > :last-child': { ml: 'auto' },
                     '& button': { p: 0, color: palette[taskDepthStyle.color[0]][taskDepthStyle.color[1]] },
                  }}
               >
                  <IconButton {...dragElProps} size="small">
                     <DragIndicatorOutlined fontSize="small" />
                  </IconButton>
                  <IconButton onClick={addTaskBelow} size="small">
                     <KeyboardDoubleArrowDown fontSize="small" />
                  </IconButton>
                  {indexes.length !== 3 && (
                     <IconButton onClick={addSubTask} size="small">
                        <KeyboardDoubleArrowRight fontSize="small" />
                     </IconButton>
                  )}
                  <ShowHideWhenMenuButton section={section} indexes={indexes} task={task} />
               </Stack>
               <Stack direction={'row'} alignItems={'center'} gap={0.5} sx={{ pl: 0.75, pb: 0.5 }}>
                  {/* <Checkbox checked={task.isChecked} onChange={() => handleToggleIsChecked(indexes)} size="small" sx={{ p: 0 }} /> */}
                  <Typography
                     component="span"
                     contentEditable
                     suppressContentEditableWarning
                     onBlur={handleSaveLabelOnBlur}
                     onKeyDown={handleBlurOnEnterClick}
                     fontSize={taskDepthStyle.fontSize}
                     color={task.isChecked ? 'textDisabled' : 'textPrimary'}
                     sx={{ outline: 'none', textDecoration: task.isChecked ? 'line-through' : 'none' }}
                  >
                     {task.label}
                  </Typography>
               </Stack>
            </SwipeActionWrapper>
         </ListItem>
      </Grow>
   ) : null;
}
