import { DoneAllOutlined, DragIndicatorOutlined, KeyboardDoubleArrowDown, KeyboardDoubleArrowRight } from '@mui/icons-material';
import { Alert, Grow, IconButton, ListItem, Snackbar, Stack, Typography, type AlertProps } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import type { AppTypes } from '@repo/types/index';
import { AppUtils } from '@repo/utils/index';
import { useEffect, useRef, useState, type ComponentProps, type FocusEvent, type JSX, type KeyboardEvent } from 'react';
import { useSearchParams } from 'react-router';
import ContentEditableField from '../../../components/ContentEditableField';
import type DragAndDropList from '../../../components/DragAndDropList';
import SwipeActionWrapper from '../../../components/SwipeActionWrapper';
import TextFormatter from '../../../components/TextFormatter';
import { useFirestoreContext } from '../../../database/useFirestoreContext';
import { ElementUtils } from '../../../utils';
import type { PaletteOption, PaletteShade } from '../../../theme/palette.theme';
import TaskItemRelatedTagsMenuButton from './TaskItemRelatedTagsMenuButton';

const DEPTH_STYLES: Record<
   T_TaskItemProps['indexes']['length'],
   { indent: number; colorAndShade: [PaletteOption, PaletteShade]; fontSize: string; paddingTop: number }
> = {
   1: { indent: 1, colorAndShade: ['primary', 'light'], fontSize: '1rem', paddingTop: 1 },
   2: { indent: 2.5, colorAndShade: ['secondary', 'light'], fontSize: '0.9rem', paddingTop: 0 },
   3: { indent: 4, colorAndShade: ['success', 'light'], fontSize: '0.825rem', paddingTop: 0 },
};

interface T_TaskItemProps {
   task: AppTypes.Task;
   dragElProps: Parameters<Parameters<typeof DragAndDropList<AppTypes.Task>>[0]['renderItem']>[1];
   indexes: AppTypes.DepthIndexes;
   section: AppTypes.RoutineSection;
   textOverlay?: string;
}

export default function TaskItem(props: T_TaskItemProps): JSX.Element | null {
   const { task, dragElProps, indexes, section, textOverlay } = props;
   const { morningTasks, eveningTasks, setEveningTasksDb, setMorningTasksDb, settings, shoppingList, setShoppingListDb } = useFirestoreContext();
   const tasks = section === 'morning' ? morningTasks : eveningTasks;
   const setTasks = section === 'morning' ? setMorningTasksDb : setEveningTasksDb;
   const [searchParams] = useSearchParams();
   const searchQuery = searchParams.get('search') ?? '';
   const focusTaskIdRef = useRef<string | null>(null);
   const { palette } = useTheme();
   const [isContentEditableFocused, setIsContentEditableFocused] = useState(false);
   const [snackbar, setSnackbar] = useState<{ message: string; severity: AlertProps['severity'] }>();
   const { indent, colorAndShade, fontSize, paddingTop } = DEPTH_STYLES[indexes.length];
   const color = palette[colorAndShade[0]][colorAndShade[1]];

   useEffect(() => {
      if (!focusTaskIdRef.current) return;
      document.getElementById(focusTaskIdRef.current)?.focus();
      focusTaskIdRef.current = null;
   }, [tasks]);

   function handleAddTaskAbove(focusOnNewTask?: boolean): void {
      const { inheritTagsFromSource } = settings;
      const newTask = AppUtils.createNewTask(inheritTagsFromSource ? { hideWhenTags: task.hideWhenTags, showWhenTags: task.showWhenTags } : {});
      const updatedTasks = [...tasks];
      const taskListToInsertInto = AppUtils.getTasksListToUpdate(updatedTasks, indexes);
      const newTaskIndex = indexes.at(-1)!;
      taskListToInsertInto.splice(newTaskIndex, 0, newTask);
      setTasks(updatedTasks);
      if (focusOnNewTask) focusTaskIdRef.current = newTask.id;
   }

   function handleAddTaskBelow(focusOnNewTask?: boolean): void {
      const { inheritTagsFromSource } = settings;
      const newTask = AppUtils.createNewTask(inheritTagsFromSource ? { hideWhenTags: task.hideWhenTags, showWhenTags: task.showWhenTags } : {});
      const updatedTasks = [...tasks];
      const taskListToInsertInto = AppUtils.getTasksListToUpdate(updatedTasks, indexes);
      const newTaskIndex = indexes.at(-1)! + 1;
      taskListToInsertInto.splice(newTaskIndex, 0, newTask);
      setTasks(updatedTasks);
      if (focusOnNewTask) focusTaskIdRef.current = newTask.id;
   }

   function handleAddSubTaskBelow(focusOnNewTask?: boolean): void {
      const { inheritTagsFromSource } = settings;
      const newTask = AppUtils.createNewTask(inheritTagsFromSource ? { hideWhenTags: task.hideWhenTags, showWhenTags: task.showWhenTags } : {});
      const updatedTasks = [...tasks];
      const taskListToUpdate = AppUtils.getTasksListToUpdate(updatedTasks, indexes);
      const taskIndex = indexes.at(-1)!;
      const taskToUpdate = taskListToUpdate[taskIndex];
      taskListToUpdate[taskIndex] = { ...taskToUpdate, children: [newTask, ...(taskToUpdate.children ?? [])] };
      setTasks(updatedTasks);
      if (focusOnNewTask) focusTaskIdRef.current = newTask.id;
   }

   function handleAddParentTaskBelow(focusOnNewTask?: boolean): void {
      if (indexes.length === 1) return;
      const { inheritTagsFromSource } = settings;
      const newTask = AppUtils.createNewTask(inheritTagsFromSource ? { hideWhenTags: task.hideWhenTags, showWhenTags: task.showWhenTags } : {});
      const updatedTasks = [...tasks];
      const taskListToInsertInto = AppUtils.getTasksListToUpdate(updatedTasks, indexes.slice(0, -1));
      const newTaskIndex = indexes.at(-2)! + 1;
      taskListToInsertInto.splice(newTaskIndex, 0, newTask);
      setTasks(updatedTasks);
      if (focusOnNewTask) focusTaskIdRef.current = newTask.id;
   }

   function handleDelete(): void {
      const updatedTasks = [...tasks];
      const taskListToDeleteFrom = AppUtils.getTasksListToUpdate(updatedTasks, indexes);
      const taskIndex = indexes[indexes.length - 1];
      taskListToDeleteFrom.splice(taskIndex, 1);
      setTasks(updatedTasks);
   }

   function handleToggleChecked(): void {
      const updatedTasks = [...tasks];
      const taskListToUpdate = AppUtils.getTasksListToUpdate(updatedTasks, indexes);
      const taskIndex = indexes[indexes.length - 1];
      const taskToUpdate = taskListToUpdate[taskIndex];
      taskListToUpdate[taskIndex] = { ...taskToUpdate, isChecked: !taskToUpdate.isChecked };
      setTasks(updatedTasks);
   }

   function handleToggleCheckTaskAndSubtasks(): void {
      const updatedTasks = [...tasks];
      const tasksToUpdate: { task: AppTypes.Task; indexesToUpdate: number[] }[] = [{ task, indexesToUpdate: indexes }];
      for (let i = 0; i < tasksToUpdate.length; i++) {
         const { task: taskToUpdate, indexesToUpdate } = tasksToUpdate[i];
         taskToUpdate.children?.forEach((childTask, j) => tasksToUpdate.push({ task: childTask, indexesToUpdate: [...indexesToUpdate, j] }));
      }
      const shouldCheckTasks = tasksToUpdate.some(({ task }) => !task.isChecked);
      for (let i = 0; i < tasksToUpdate.length; i++) {
         const { task: taskToUpdate, indexesToUpdate } = tasksToUpdate[i];
         const taskListToUpdate = AppUtils.getTasksListToUpdate(updatedTasks, indexesToUpdate);
         const taskToUpdateIndex = indexesToUpdate.at(-1)!;
         const updatedTask: AppTypes.Task = { ...taskToUpdate, isChecked: shouldCheckTasks };
         if (taskToUpdate.children) updatedTask.children = [...taskToUpdate.children];
         taskListToUpdate[taskToUpdateIndex] = updatedTask;
      }
      setTasks(updatedTasks);
   }

   function handleSaveLabelOnBlur(event: FocusEvent<HTMLTextAreaElement, Element>): void {
      const updatedLabel = event.currentTarget.value;
      if (updatedLabel === task.label) return;
      const updatedTasks = [...tasks];
      const taskListToUpdate = AppUtils.getTasksListToUpdate(updatedTasks, indexes);
      const taskIndex = indexes.at(-1)!;
      const taskToUpdate = taskListToUpdate[taskIndex];
      taskListToUpdate[taskIndex] = { ...taskToUpdate, label: updatedLabel };
      setTasks(updatedTasks);
   }

   function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
      if (!event.ctrlKey) {
         if (event.key === 'Enter' || event.key === 'Escape') event.currentTarget.blur();
         return;
      }
      if (event.key === 'ArrowUp') return handleAddTaskAbove(true);
      if (event.key === 'ArrowDown' || event.key === 'Enter') return handleAddTaskBelow(true);
      if (event.key === 'ArrowRight' && indexes.length < 3) return handleAddSubTaskBelow(true);
      if (event.key === 'ArrowLeft') return handleAddParentTaskBelow(true);
      if (event.key === 'Backspace' || event.key === 'Delete') return handleDelete();
   }

   function formatAddToShoppingListWords(): NonNullable<ComponentProps<typeof TextFormatter>['rules']> {
      const phrases = new Set(Array.from(task.label.matchAll(/\*([^*]+)\*/g), (match) => match[1]));
      return Array.from(phrases).flatMap((text) => [
         { textMatch: `*${text}*`, replaceWith: text },
         {
            textMatch: text,
            style: { textDecoration: 'underline', color: 'lightblue', cursor: 'pointer' },
            action: (text) => {
               if (shoppingList.some((item) => item.label === text)) {
                  return setSnackbar({ message: `"${text}" is already in the shopping list`, severity: 'warning' });
               }
               setShoppingListDb([...shoppingList, AppUtils.createNewShoppingItem({ label: text })]);
               setSnackbar({ message: `'${text}' added to the shopping list`, severity: 'success' });
            },
         },
      ]);
   }

   return (
      <>
         <Snackbar key={snackbar?.message} open={Boolean(snackbar)} autoHideDuration={3000} onClose={() => setSnackbar(undefined)}>
            <Alert severity={snackbar?.severity} onClose={() => setSnackbar(undefined)}>
               {snackbar?.message}
            </Alert>
         </Snackbar>
         <Grow in timeout={500}>
            <ListItem sx={{ py: 0.3, pt: paddingTop, px: 1, pl: indent, position: 'relative' }}>
               <Typography position={'absolute'} textAlign={'center'} right={0} left={0} variant={'body2'} fontWeight={700} color="grey.500">
                  {textOverlay}
               </Typography>
               <SwipeActionWrapper
                  disabled={isContentEditableFocused}
                  rightAction={{ label: 'Delete', bgColor: 'red', onAction: handleDelete }}
                  leftAction={{ label: 'Toggle', bgColor: 'green', onAction: handleToggleChecked }}
                  style={{
                     borderRadius: '5px',
                     borderLeft: `4px solid ${color}`,
                     background: `linear-gradient(150deg, ${alpha(color, 0.2)}, ${alpha(color, 0.1)} 50%)`,
                     opacity: textOverlay || task.isChecked ? 0.5 : 1,
                  }}
               >
                  <Stack
                     direction="row"
                     alignItems="center"
                     gap={1}
                     sx={{ px: 1, pt: 0.75, pb: 0.5, '& > :last-child': { ml: 'auto' }, '& button': { p: 0, color: color } }}
                  >
                     <IconButton {...dragElProps} {...ElementUtils.skipTabFocusProps}>
                        <DragIndicatorOutlined />
                     </IconButton>
                     <IconButton onClick={() => handleAddTaskBelow()} {...ElementUtils.skipTabFocusProps}>
                        <KeyboardDoubleArrowDown />
                     </IconButton>
                     {indexes.length !== 3 && (
                        <>
                           <IconButton onClick={() => handleAddSubTaskBelow()} {...ElementUtils.skipTabFocusProps}>
                              <KeyboardDoubleArrowRight />
                           </IconButton>
                           <IconButton onClick={handleToggleCheckTaskAndSubtasks} {...ElementUtils.skipTabFocusProps}>
                              <DoneAllOutlined />
                           </IconButton>
                        </>
                     )}
                     <TaskItemRelatedTagsMenuButton section={section} indexes={indexes} task={task} />
                  </Stack>
                  <Stack direction={'row'} alignItems={'center'} gap={0.5} sx={{ pl: 1.25, pb: 0.75 }}>
                     {/* <Checkbox checked={task.isChecked} onChange={() => handleToggleChecked(indexes)} size="small" sx={{ p: 0 }} /> */}
                     <ContentEditableField
                        id={task.id}
                        text={task.label}
                        onBlur={(event) => {
                           setIsContentEditableFocused(false);
                           handleSaveLabelOnBlur(event);
                        }}
                        onFocus={() => setIsContentEditableFocused(true)}
                        onInput={ElementUtils.handleFormatInputOnSpace}
                        onKeyDown={handleKeyDown}
                        style={{
                           fontSize: fontSize,
                           color: task.isChecked || textOverlay ? palette.text.disabled : palette.text.primary,
                           textDecoration: task.isChecked ? 'line-through' : 'none',
                           width: '100%',
                           padding: '0 6px 1.2px 0',
                        }}
                     >
                        <TextFormatter
                           fullText={task.label}
                           rules={[{ textMatch: searchQuery, style: { backgroundColor: palette.warning.main } }, ...formatAddToShoppingListWords()]}
                        />
                     </ContentEditableField>
                  </Stack>
               </SwipeActionWrapper>
            </ListItem>
         </Grow>
      </>
   );
}
