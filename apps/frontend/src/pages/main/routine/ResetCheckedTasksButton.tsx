import { RotateLeftOutlined } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import type { T_Routine_Section, T_Task } from '@repo/types/app.types';
import { useLocalStorageContext } from '../../../database/useLocalStorageContext';

interface T_ResetCheckedTasksButtonProps {
   section: T_Routine_Section;
}

export default function ResetCheckedTasksButton({ section }: T_ResetCheckedTasksButtonProps): React.JSX.Element {
   const { morningTasks, eveningTasks, setEveningTasks, setMorningTasks } = useLocalStorageContext();
   const tasks = section === 'morning' ? morningTasks : eveningTasks;
   const setTasks = section === 'morning' ? setMorningTasks : setEveningTasks;

   function handleResetTasksCheckedState(): void {
      const resetChecked = (tasks: T_Task[]): T_Task[] =>
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
