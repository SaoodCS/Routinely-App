import { Check, ExpandCircleDownOutlined } from '@mui/icons-material';
import { Divider, IconButton, ListItemText, Menu, MenuItem } from '@mui/material';
import type { T_Routine_Section, T_Tag, T_Task } from '@repo/types/app';
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

   function handleToggle(tagId: T_Tag['id']): void {
      const newTask = { ...task };
      if (newTask.hideWhenTags?.includes(tagId)) newTask.hideWhenTags = newTask.hideWhenTags.filter((id) => id !== tagId);
      else newTask.hideWhenTags = [...(newTask.hideWhenTags ?? []), tagId];
      const newTasks = [...tasks];
      if (indexes.length === 1) newTasks[indexes[0]] = newTask;
      else if (indexes.length === 2) newTasks[indexes[0]].children![indexes[1]] = newTask;
      else newTasks[indexes[0]].children![indexes[1]].children![indexes[2]] = newTask;
      setTasks(newTasks);
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
            <MenuItem disabled>Show Task When</MenuItem>
            {tags.length === 0 ? (
               <MenuItem disabled>No tags</MenuItem>
            ) : (
               tags.map((tag, i) => (
                  <span key={tag.id}>
                     {i > 0 && <Divider />}
                     <MenuItem onClick={() => handleToggle(tag.id)} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <ListItemText>{tag.label}</ListItemText>
                        {task.hideWhenTags?.includes(tag.id) && <Check color="error" />}
                     </MenuItem>
                  </span>
               ))
            )}
         </Menu>
      </>
   );
}
