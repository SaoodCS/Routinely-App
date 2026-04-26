import { ExpandCircleDownOutlined } from '@mui/icons-material';
import { Divider, IconButton, ListItemText, Menu, MenuItem, Switch } from '@mui/material';
import type { T_Routine_Section, T_Tag, T_Task } from '@repo/types/app.types';
import { useState, type JSX } from 'react';
import useLocalStorage from '../../../hooks/useLocalStorage';

interface T_ShowHideWhenMenuButtonProps {
   section: T_Routine_Section;
   indexes: [number] | [number, number] | [number, number, number];
   task: T_Task;
}

type T_WhenTagType = 'showWhenTags' | 'hideWhenTags';

export default function ShowHideWhenMenuButton({ indexes, section, task }: T_ShowHideWhenMenuButtonProps): JSX.Element {
   const [tags] = useLocalStorage<T_Tag[]>('tags', []);
   const [tasks, setTasks] = useLocalStorage<T_Task[]>(`${section}-routine-tasks`, []);
   const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

   function handleToggle(tagId: T_Tag['id'], tagType: T_WhenTagType): void {
      const updatedTask = { ...task };
      if (updatedTask[tagType]?.includes(tagId)) updatedTask[tagType] = updatedTask[tagType].filter((id) => id !== tagId);
      else updatedTask[tagType] = [...(updatedTask[tagType] ?? []), tagId];
      const updatedTasks = [...tasks];
      if (indexes.length === 1) updatedTasks[indexes[0]] = updatedTask;
      else if (indexes.length === 2) updatedTasks[indexes[0]].children![indexes[1]] = updatedTask;
      else updatedTasks[indexes[0]].children![indexes[1]].children![indexes[2]] = updatedTask;
      setTasks(updatedTasks);
   }

   return (
      <>
         <IconButton onClick={(event) => setAnchorEl(event.currentTarget)} size="small" color="success">
            <ExpandCircleDownOutlined fontSize="small" />
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

            {...tags.map((tag, i) => (
               <span key={tag.id}>
                  {i > 0 && <Divider />}
                  <MenuItem sx={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 1 }}>
                     <ListItemText>{tag.label}</ListItemText>
                     <Switch
                        color="success"
                        checked={task.showWhenTags?.includes(tag.id) ?? false}
                        disabled={task.hideWhenTags?.includes(tag.id)}
                        onChange={() => handleToggle(tag.id, 'showWhenTags')}
                        size="small"
                     />
                     <Switch
                        color="error"
                        checked={task.hideWhenTags?.includes(tag.id) ?? false}
                        disabled={task.showWhenTags?.includes(tag.id)}
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
