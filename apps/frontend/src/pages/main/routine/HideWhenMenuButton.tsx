import { Check, ExpandCircleDownOutlined } from '@mui/icons-material';
import { Divider, IconButton, ListItemText, Menu, MenuItem } from '@mui/material';
import type { T_Routine_Section, T_Tag, T_Task } from '@repo/types/app.types';
import { useState, type JSX } from 'react';
import useLocalStorage from '../../../hooks/useLocalStorage';

interface T_HideWhenMenuButtonProps {
   section: T_Routine_Section;
   indexes: [number] | [number, number] | [number, number, number];
   task: T_Task;
}

export default function HideWhenMenuButton({ indexes, section, task }: T_HideWhenMenuButtonProps): JSX.Element {
   const [tags] = useLocalStorage<T_Tag[]>('tags', []);
   const [tasks, setTasks] = useLocalStorage<T_Task[]>(`${section}-routine-tasks`, []);
   const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
   //const tagsExcludingShowWhen = tags.filter((tag) => !task.showWhenTags?.includes(tag.id));

   function handleToggle(tagId: T_Tag['id']): void {
      const updatedTask = { ...task };
      if (updatedTask.hideWhenTags?.includes(tagId)) updatedTask.hideWhenTags = updatedTask.hideWhenTags.filter((id) => id !== tagId);
      else updatedTask.hideWhenTags = [...(updatedTask.hideWhenTags ?? []), tagId];
      const updatedTasks = [...tasks];
      if (indexes.length === 1) updatedTasks[indexes[0]] = updatedTask;
      else if (indexes.length === 2) updatedTasks[indexes[0]].children![indexes[1]] = updatedTask;
      else updatedTasks[indexes[0]].children![indexes[1]].children![indexes[2]] = updatedTask;
      setTasks(updatedTasks);
   }

   return (
      <>
         <IconButton onClick={(event) => setAnchorEl(event.currentTarget)} size="small" color="error">
            <ExpandCircleDownOutlined fontSize="small" />
         </IconButton>
         <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            slotProps={{ paper: { sx: { overflowY: 'auto', maxHeight: '30rem', minWidth: '15rem' } } }}
         >
            <MenuItem disabled>Hide Task When</MenuItem>
            {tags.length === 0 ? (
               <MenuItem disabled>No tags</MenuItem>
            ) : (
               tags.map((tag, i) => (
                  <span key={tag.id}>
                     {i > 0 && <Divider />}
                     <MenuItem
                        onClick={() => handleToggle(tag.id)}
                        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        disabled={task.showWhenTags?.includes(tag.id)}
                     >
                        <ListItemText>{tag.label}</ListItemText>
                        {task.hideWhenTags?.includes(tag.id) && <Check color="error" />}
                        {task.showWhenTags?.includes(tag.id) && <Check color="success" />}
                     </MenuItem>
                  </span>
               ))
            )}
         </Menu>
      </>
   );
}
