import type { AppTypes } from '@repo/types/index';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { CheckCircleOutline, LocalOfferOutlined, MoreHorizRounded, VisibilityOffOutlined, VisibilityOutlined } from '@mui/icons-material';
import { useMemo, useState } from 'react';
import { useFirestoreContext } from '../../../database/useFirestoreContext';
import useLocalStorage from '../../../hooks/useLocalStorage';

interface T_RoutineActionsMenuButtonProps {
   section: AppTypes.RoutineSection;
}

export default function RoutineActionsMenuButton({ section }: T_RoutineActionsMenuButtonProps): React.JSX.Element {
   const { morningTasks, setMorningTasksDb, eveningTasks, setEveningTasksDb, tags, setTagsDb } = useFirestoreContext();
   const tasks = section === 'morning' ? morningTasks : eveningTasks;
   const setTasks = section === 'morning' ? setMorningTasksDb : setEveningTasksDb;
   const [showHidden, setShowHidden] = useLocalStorage<boolean>('show-hidden', false);
   const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
   const areAllTagsEnabled = useMemo(() => tags.every(({ isEnabled }) => isEnabled), [tags]);

   function handleToggleAllTags(): void {
      const shouldEnableAllTags = tags.some(({ isEnabled }) => !isEnabled);
      setTagsDb(tags.map((tag) => ({ ...tag, isEnabled: shouldEnableAllTags })));
   }

   function handleUncheckAllTasks(): void {
      const resetChecked = (tasks: AppTypes.Task[]): AppTypes.Task[] =>
         tasks.map((task) => ({ ...task, isChecked: false, children: task.children ? resetChecked(task.children) : undefined }));
      const updatedTasks = resetChecked(tasks);
      setTasks(updatedTasks);
   }
   return (
      <>
         <IconButton onClick={(event) => setAnchorEl(event.currentTarget)}>
            <MoreHorizRounded />
         </IconButton>

         <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => setShowHidden(!showHidden)}>
               <ListItemIcon>{showHidden ? <VisibilityOffOutlined /> : <VisibilityOutlined />}</ListItemIcon>
               <ListItemText>{`${showHidden ? 'Hide' : 'Show'} Hidden Tasks`}</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleUncheckAllTasks}>
               <ListItemIcon>{<CheckCircleOutline />}</ListItemIcon>
               <ListItemText>{`Uncheck All Tasks`}</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleToggleAllTags}>
               <ListItemIcon>{<LocalOfferOutlined />}</ListItemIcon>
               <ListItemText>{areAllTagsEnabled ? 'Disable All Tags' : 'Enable All Tags'}</ListItemText>
            </MenuItem>
         </Menu>
      </>
   );
}
