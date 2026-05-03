import { RotateLeftOutlined } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import type { AppTypes } from '@repo/types/index';
import { useFirestoreContext } from '../../../database/useFirestoreContext';

interface T_ResetAllCheckedTasksButtonProps {
   section: AppTypes.RoutineSection;
}

export default function ResetAllCheckedTasksButton({ section }: T_ResetAllCheckedTasksButtonProps): React.JSX.Element {
   const { morningTasks, eveningTasks, setEveningTasks, setMorningTasks } = useFirestoreContext();
   const tasks = section === 'morning' ? morningTasks : eveningTasks;
   const setTasks = section === 'morning' ? setMorningTasks : setEveningTasks;

   function handleResetTasksCheckedState(): void {
      const resetChecked = (tasks: AppTypes.Task[]): AppTypes.Task[] =>
         tasks.map((task) => ({
            ...task,
            isChecked: false,
            children: task.children ? resetChecked(task.children) : undefined,
         }));
      const updatedTasks = resetChecked(tasks);
      setTasks(updatedTasks);
   }

   return (
      <IconButton color="primary" onClick={handleResetTasksCheckedState}>
         <RotateLeftOutlined />
      </IconButton>
   );
}
