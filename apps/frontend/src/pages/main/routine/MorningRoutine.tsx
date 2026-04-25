import type { T_Task } from '@repo/types/app';
import { Box, Divider, ListItem, ListItemIcon, Typography } from '@mui/material';
import { useSearchParams } from 'react-router';
import { DragIndicatorOutlined } from '@mui/icons-material';
import useLocalStorage from '../../../hooks/useLocalStorage';
import useScrollSaver from '../../../hooks/useScrollSaver';
import DragAndDropList from '../../../components/DragAndDropList';
import SwipeActionWrapper from '../../../components/SwipeActionWrapper';

export default function MorningRoutine(): React.JSX.Element {
   const [searchParams] = useSearchParams();
   const searchQuery = searchParams.get('search');
   const { ref } = useScrollSaver('morning-routine-scroll');
   const [tasks, setTasks] = useLocalStorage<T_Task[]>(`morning-routine-tasks`, []);

   function handleDelete(taskIndex: number): void {
      const newTasks = [...tasks];
      newTasks.splice(taskIndex, 1);
      setTasks(newTasks);
   }

   function handleSaveLabelOnBlur(event: React.FocusEvent<HTMLSpanElement>, taskIndex: number): void {
      const newLabel = event.currentTarget.textContent ?? '';
      if (newLabel === tasks[taskIndex].label) return;
      const newTasks = [...tasks];
      newTasks[taskIndex] = { ...newTasks[taskIndex], label: newLabel };
      setTasks(newTasks);
   }

   function handleBlurOnEnterClick(event: React.KeyboardEvent<HTMLSpanElement>): void {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      event.currentTarget.blur();
   }

   function isTaskHidden(task: T_Task): boolean {
      return !(!searchQuery || task.label.toLowerCase().includes(searchQuery.toLowerCase()));
   }

   return (
      <DragAndDropList
         ref={ref}
         items={tasks}
         onDrop={(newOrderedItems) => setTasks(newOrderedItems)}
         renderItem={(task, dragElProps, i) =>
            !isTaskHidden(task) && (
               <Box>
                  {i > 0 && <Divider />}
                  <ListItem>
                     <ListItemIcon sx={{ minWidth: 30 }} {...dragElProps}>
                        <DragIndicatorOutlined />
                     </ListItemIcon>
                     <SwipeActionWrapper
                        rightAction={{ label: 'Delete', bgColor: 'red', onAction: () => handleDelete(i) }}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                     >
                        <Typography
                           component="span"
                           contentEditable
                           suppressContentEditableWarning
                           onBlur={(event) => handleSaveLabelOnBlur(event, i)}
                           onKeyDown={handleBlurOnEnterClick}
                           sx={{ outline: 'none', width: '60%' }}
                        >
                           {task.label}
                        </Typography>
                     </SwipeActionWrapper>
                  </ListItem>
               </Box>
            )
         }
         style={{ overflow: 'auto', maxHeight: '100%' }}
      />
   );
}
