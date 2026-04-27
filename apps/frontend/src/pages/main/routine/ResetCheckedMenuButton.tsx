import { IconButton } from '@mui/material';
import { RotateLeftOutlined } from '@mui/icons-material';
import type { T_Routine_Section, T_Task } from '@repo/types/app.types';
import { useDatabase } from '../../../database/useDatabase';

interface T_ResetCheckedMenuButtonProps {
   section: T_Routine_Section;
}

export default function ResetCheckedMenuButton({ section }: T_ResetCheckedMenuButtonProps): React.JSX.Element {
   const { morningTasks, eveningTasks, setEveningTasks, setMorningTasks } = useDatabase();
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
