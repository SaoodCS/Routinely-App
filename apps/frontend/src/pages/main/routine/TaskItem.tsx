import { DoneAllOutlined, DragIndicatorOutlined, KeyboardDoubleArrowDown, KeyboardDoubleArrowRight } from '@mui/icons-material';
import { Grow, IconButton, ListItem, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import type { T_Routine_Section, T_Task } from '@repo/types/app.types';
import { createNewTask } from '@repo/utils/app.helpers';
import { type FocusEvent, type FormEvent, type JSX, type KeyboardEvent } from 'react';
import { useSearchParams } from 'react-router';
import type DragAndDropList from '../../../components/DragAndDropList';
import SearchTextHighlighter from '../../../components/SearchTextHighlighter';
import SwipeActionWrapper from '../../../components/SwipeActionWrapper';
import type { PaletteFirstKey, PaletteSecondKey } from '../../../theme/theme';
import { useFirestoreContext } from '../../../database/useFirestoreContext';
import { formatInputOnSpace } from '../../../helpers/string.helpers';
import ToggleTaskShowWhenMenuButton from './ToggleTaskShowWhenMenuButton';

const DEPTH_STYLES: Record<T_TaskItemProps['indexes']['length'], { indent: number; color: [PaletteFirstKey, PaletteSecondKey]; fontSize: string }> = {
   1: { indent: 1, color: ['primary', 'light'], fontSize: '1rem' },
   2: { indent: 2, color: ['secondary', 'light'], fontSize: '0.9rem' },
   3: { indent: 3, color: ['success', 'light'], fontSize: '0.825rem' },
};

interface T_TaskItemProps {
   task: T_Task;
   dragElProps: Parameters<Parameters<typeof DragAndDropList<T_Task>>[0]['renderItem']>[1];
   indexes: [number] | [number, number] | [number, number, number];
   section: T_Routine_Section;
}

export default function TaskItem(props: T_TaskItemProps): JSX.Element | null {
   const { task, dragElProps, indexes, section } = props;
   const { morningTasks, eveningTasks, setEveningTasks, setMorningTasks, settings } = useFirestoreContext();
   const tasks = section === 'morning' ? morningTasks : eveningTasks;
   const setTasks = section === 'morning' ? setMorningTasks : setEveningTasks;
   const { palette } = useTheme();
   const taskDepthStyle = DEPTH_STYLES[indexes.length];
   const [searchParams] = useSearchParams();
   const searchQuery = searchParams.get('search') ?? '';

   function addTaskBelow(): void {
      const newTask = createNewTask(settings.inheritTagsFromSource ? { hideWhenTags: task.hideWhenTags, showWhenTags: task.showWhenTags } : {});
      const updatedTasks = [...tasks];
      if (indexes.length === 1) {
         const indexToInsertAt = indexes[0] + 1;
         updatedTasks.splice(indexToInsertAt, 0, newTask);
         setTasks(updatedTasks);
      }
      if (indexes.length === 2) {
         const updatedSubtasks = [...updatedTasks[indexes[0]].children!];
         const indexToInsertAt = indexes[1] + 1;
         updatedSubtasks.splice(indexToInsertAt, 0, newTask);
         updatedTasks[indexes[0]] = { ...updatedTasks[indexes[0]], children: updatedSubtasks };
         setTasks(updatedTasks);
      }
      if (indexes.length === 3) {
         const updatedSubtasks = [...updatedTasks[indexes[0]].children!];
         const updatedSubsubtasks = [...updatedSubtasks[indexes[1]].children!];
         const indexToInsertAt = indexes[2] + 1;
         updatedSubsubtasks.splice(indexToInsertAt, 0, newTask);
         updatedSubtasks[indexes[1]] = { ...updatedSubtasks[indexes[1]], children: updatedSubsubtasks };
         updatedTasks[indexes[0]] = { ...updatedTasks[indexes[0]], children: updatedSubtasks };
         setTasks(updatedTasks);
      }
   }

   function addSubTask(): void {
      const newTask = createNewTask(settings.inheritTagsFromSource ? { hideWhenTags: task.hideWhenTags, showWhenTags: task.showWhenTags } : {});
      const updatedTasks = [...tasks];
      if (indexes.length === 1) {
         updatedTasks[indexes[0]] = { ...updatedTasks[indexes[0]], children: [newTask, ...(updatedTasks[indexes[0]].children ?? [])] };
         setTasks(updatedTasks);
      }
      if (indexes.length === 2) {
         const updatedSubtasks = [...updatedTasks[indexes[0]].children!];
         updatedSubtasks[indexes[1]] = { ...updatedSubtasks[indexes[1]], children: [newTask, ...(updatedSubtasks[indexes[1]].children ?? [])] };
         updatedTasks[indexes[0]] = { ...updatedTasks[indexes[0]], children: updatedSubtasks };
         setTasks(updatedTasks);
      }
   }

   function handleDelete(): void {
      if (indexes.length === 1) {
         setTasks(tasks.filter((_, taskIndex) => taskIndex !== indexes[0]));
      }
      if (indexes.length === 2) {
         const updatedTasks = [...tasks];
         const updatedSubtasks = updatedTasks[indexes[0]].children!.filter((_, subtaskIndex) => subtaskIndex !== indexes[1]);
         updatedTasks[indexes[0]] = { ...updatedTasks[indexes[0]], children: updatedSubtasks };
         setTasks(updatedTasks);
      }
      if (indexes.length === 3) {
         const updatedTasks = [...tasks];
         const updatedSubtasks = [...updatedTasks[indexes[0]].children!];
         const updatedSubsubtasks = updatedSubtasks[indexes[1]].children!.filter((_, subsubtaskIndex) => subsubtaskIndex !== indexes[2]);
         updatedSubtasks[indexes[1]] = { ...updatedSubtasks[indexes[1]], children: updatedSubsubtasks };
         updatedTasks[indexes[0]] = { ...updatedTasks[indexes[0]], children: updatedSubtasks };
         setTasks(updatedTasks);
      }
   }

   function handleToggleIsChecked(): void {
      const updatedTasks = [...tasks];
      if (indexes.length === 1) {
         updatedTasks[indexes[0]] = { ...updatedTasks[indexes[0]], isChecked: !updatedTasks[indexes[0]].isChecked };
         setTasks(updatedTasks);
      }
      if (indexes.length === 2) {
         const updatedSubtasks = [...updatedTasks[indexes[0]].children!];
         updatedSubtasks[indexes[1]] = { ...updatedSubtasks[indexes[1]], isChecked: !updatedSubtasks[indexes[1]].isChecked };
         updatedTasks[indexes[0]] = { ...updatedTasks[indexes[0]], children: updatedSubtasks };
         setTasks(updatedTasks);
      }
      if (indexes.length === 3) {
         const updatedSubtasks = [...updatedTasks[indexes[0]].children!];
         const updatedSubsubtasks = [...updatedSubtasks[indexes[1]].children!];
         updatedSubsubtasks[indexes[2]] = { ...updatedSubsubtasks[indexes[2]], isChecked: !updatedSubsubtasks[indexes[2]].isChecked };
         updatedSubtasks[indexes[1]] = { ...updatedSubtasks[indexes[1]], children: updatedSubsubtasks };
         updatedTasks[indexes[0]] = { ...updatedTasks[indexes[0]], children: updatedSubtasks };
         setTasks(updatedTasks);
      }
   }

   function handleBlurOnEnterClick(event: KeyboardEvent<HTMLSpanElement>): void {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      event.currentTarget.blur();
   }

   function handleFormatLabelOnInput(event: FormEvent<HTMLSpanElement>): void {
      // When user edits label, format the part of the label that comes before the cursor i.e. before where they're typing
      const element = event.currentTarget;
      const selection = window.getSelection();
      if (!selection?.rangeCount) return;
      const { endContainer, endOffset } = selection.getRangeAt(0);
      if (!element.contains(endContainer)) return;
      const range = document.createRange();
      range.selectNodeContents(element);
      range.setEnd(endContainer, endOffset);
      const label = element.textContent ?? '';
      const beforeCursor = label.slice(0, range.toString().length);
      const formattedBeforeCursor = formatInputOnSpace(beforeCursor);
      // If the formatted text is the same as the unformatted text, don't do anything
      if (formattedBeforeCursor === beforeCursor) return;
      // concatenate the formatted text with the part of the label that comes after the cursor
      element.textContent = formattedBeforeCursor + label.slice(beforeCursor.length);
      // move the cursor to the end of the formatted text (back to where the user was typing)
      selection.collapse(element.firstChild, formattedBeforeCursor.length);
   }

   function handleSaveLabelOnBlur(event: FocusEvent<HTMLSpanElement, Element>): void {
      const updatedLabel = event.currentTarget.textContent ?? '';
      if (updatedLabel === task.label) return;
      const updatedTasks = [...tasks];
      if (indexes.length === 1) {
         updatedTasks[indexes[0]] = { ...updatedTasks[indexes[0]], label: updatedLabel };
         setTasks(updatedTasks);
      }
      if (indexes.length === 2) {
         const updatedSubtasks = [...updatedTasks[indexes[0]].children!];
         updatedSubtasks[indexes[1]] = { ...updatedSubtasks[indexes[1]], label: updatedLabel };
         updatedTasks[indexes[0]] = { ...updatedTasks[indexes[0]], children: updatedSubtasks };
         setTasks(updatedTasks);
      }
      if (indexes.length === 3) {
         const updatedSubtasks = [...updatedTasks[indexes[0]].children!];
         const updatedSubsubtasks = [...updatedSubtasks[indexes[1]].children!];
         updatedSubsubtasks[indexes[2]] = { ...updatedSubsubtasks[indexes[2]], label: updatedLabel };
         updatedSubtasks[indexes[1]] = { ...updatedSubtasks[indexes[1]], children: updatedSubsubtasks };
         updatedTasks[indexes[0]] = { ...updatedTasks[indexes[0]], children: updatedSubtasks };
         setTasks(updatedTasks);
      }
   }

   function toggleCheckAllSubItems(): void {
      const checkTaskAndChildren = (task: T_Task, newCheckState: boolean): T_Task => ({
         ...task,
         isChecked: newCheckState,
         children: task.children?.map((task) => checkTaskAndChildren(task, newCheckState)),
      });
      const isTaskAndSubtasksAllChecked = (task: T_Task): boolean => {
         if (!task.isChecked) return false;
         return task.children?.every((task) => isTaskAndSubtasksAllChecked(task)) ?? true;
      };
      const taskAndAllSubTasksAreChecked = isTaskAndSubtasksAllChecked(task);
      const updatedTask = checkTaskAndChildren(task, !taskAndAllSubTasksAreChecked);
      const updatedTasks = [...tasks];
      if (indexes.length === 1) {
         updatedTasks[indexes[0]] = updatedTask;
         setTasks(updatedTasks);
      }
      if (indexes.length === 2) {
         const updatedSubtasks = [...updatedTasks[indexes[0]].children!];
         updatedSubtasks[indexes[1]] = updatedTask;
         updatedTasks[indexes[0]] = { ...updatedTasks[indexes[0]], children: updatedSubtasks };
         setTasks(updatedTasks);
      }
      if (indexes.length === 3) {
         const updatedSubtasks = [...updatedTasks[indexes[0]].children!];
         const updatedSubsubtasks = [...updatedSubtasks[indexes[1]].children!];
         updatedSubsubtasks[indexes[2]] = updatedTask;
         updatedSubtasks[indexes[1]] = { ...updatedSubtasks[indexes[1]], children: updatedSubsubtasks };
         updatedTasks[indexes[0]] = { ...updatedTasks[indexes[0]], children: updatedSubtasks };
         setTasks(updatedTasks);
      }
   }

   return (
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
                  alignItems={'center'}
                  gap={0.5}
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
                     <>
                        <IconButton onClick={addSubTask} size="small">
                           <KeyboardDoubleArrowRight fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={toggleCheckAllSubItems}>
                           <DoneAllOutlined fontSize="small" />
                        </IconButton>
                     </>
                  )}
                  <ToggleTaskShowWhenMenuButton section={section} indexes={indexes} task={task} />
               </Stack>
               <Stack direction={'row'} alignItems={'center'} gap={0.5} sx={{ pl: 0.75, pb: 0.5 }}>
                  {/* <Checkbox checked={task.isChecked} onChange={() => handleToggleIsChecked(indexes)} size="small" sx={{ p: 0 }} /> */}
                  <Typography
                     component="span"
                     contentEditable
                     suppressContentEditableWarning
                     onInput={handleFormatLabelOnInput}
                     onBlur={handleSaveLabelOnBlur}
                     onKeyDown={handleBlurOnEnterClick}
                     fontSize={taskDepthStyle.fontSize}
                     color={task.isChecked ? 'textDisabled' : 'textPrimary'}
                     sx={{ outline: 'none', textDecoration: task.isChecked ? 'line-through' : 'none', width: '100%', pr: 0.75 }}
                  >
                     <SearchTextHighlighter query={searchQuery} fullText={task.label} highlightColor={palette.warning.main} />
                  </Typography>
               </Stack>
            </SwipeActionWrapper>
         </ListItem>
      </Grow>
   );
}
