import { MoreVertOutlined } from '@mui/icons-material';
import { Divider, IconButton, ListItemText, Menu, MenuItem, Switch } from '@mui/material';
import type { T_Routine_Section, T_Tag, T_Task, T_Task_TagKeys } from '@repo/types/app.types';
import { useState, type JSX } from 'react';
import { useFirestoreContext } from '../../../database/useFirestoreContext';

interface T_ToggleTaskShowWhenMenuButtonProps {
   section: T_Routine_Section;
   indexes: [number] | [number, number] | [number, number, number];
   task: T_Task;
}

export default function ToggleTaskShowWhenMenuButton({ indexes, section, task }: T_ToggleTaskShowWhenMenuButtonProps): JSX.Element {
   const { morningTasks, eveningTasks, setEveningTasks, setMorningTasks, tags } = useFirestoreContext();
   const tasks = section === 'morning' ? morningTasks : eveningTasks;
   const setTasks = section === 'morning' ? setMorningTasks : setEveningTasks;
   const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

   function handleToggle(tagId: T_Tag['id'], taskTagKey: T_Task_TagKeys): void {
      const updatedTask = {
         ...task,
         [taskTagKey]: task[taskTagKey].includes(tagId) ? task[taskTagKey].filter((id) => id !== tagId) : [...task[taskTagKey], tagId],
      };
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
      <>
         <IconButton onClick={(event) => setAnchorEl(event.currentTarget)} size="small">
            <MoreVertOutlined fontSize="small" />
         </IconButton>
         <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            slotProps={{ paper: { sx: { overflowY: 'auto', maxHeight: '30rem', minWidth: '15rem' } } }}
         >
            <MenuItem key="header" disabled sx={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 1 }}>
               <ListItemText>When</ListItemText>
               <ListItemText>Show</ListItemText>
               <ListItemText>Hide</ListItemText>
            </MenuItem>

            {tags.map((tag, i) => (
               <span key={tag.id}>
                  {i > 0 && <Divider />}
                  <MenuItem sx={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 1 }}>
                     <ListItemText>{tag.label}</ListItemText>
                     <Switch
                        color="success"
                        checked={task.showWhenTags.includes(tag.id) ?? false}
                        disabled={task.hideWhenTags.includes(tag.id)}
                        onChange={() => handleToggle(tag.id, 'showWhenTags')}
                        size="small"
                     />
                     <Switch
                        color="error"
                        checked={task.hideWhenTags.includes(tag.id) ?? false}
                        disabled={task.showWhenTags.includes(tag.id)}
                        onChange={() => handleToggle(tag.id, 'hideWhenTags')}
                        size="small"
                     />
                  </MenuItem>
               </span>
            ))}
         </Menu>
      </>
   );
}
