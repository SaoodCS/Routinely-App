import { MoreVertOutlined } from '@mui/icons-material';
import { Divider, IconButton, ListItemText, Menu, MenuItem, Switch } from '@mui/material';
import type { AppTypes } from '@repo/types/index';
import { AppUtils } from '@repo/utils/index';
import { useState, type JSX } from 'react';
import { useFirestoreContext } from '../../../database/useFirestoreContext';

interface T_ToggleTaskRelatedTagsMenuButtonProps {
   section: AppTypes.RoutineSection;
   indexes: AppTypes.DepthIndexes;
   task: AppTypes.Task;
}

export default function ToggleTaskRelatedTagsMenuButton({ indexes, section, task }: T_ToggleTaskRelatedTagsMenuButtonProps): JSX.Element {
   const { morningTasks, eveningTasks, setEveningTasks, setMorningTasks, tags } = useFirestoreContext();
   const tasks = section === 'morning' ? morningTasks : eveningTasks;
   const setTasks = section === 'morning' ? setMorningTasks : setEveningTasks;
   const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

   function handleToggle(tagId: AppTypes.Tag['id'], taskTagField: AppTypes.TaskTagFields): void {
      const taskTagFieldVal = task[taskTagField];
      const tagIndex = taskTagFieldVal.indexOf(tagId);
      const updatedTask = { ...task, [taskTagField]: tagIndex === -1 ? [...taskTagFieldVal, tagId] : taskTagFieldVal.toSpliced(tagIndex, 1) };
      const updatedTasks = [...tasks];
      const taskListToUpdate = AppUtils.getTasksListToUpdate(updatedTasks, indexes);
      const taskIndex = indexes.at(-1)!;
      taskListToUpdate[taskIndex] = updatedTask;
      setTasks(updatedTasks);
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
