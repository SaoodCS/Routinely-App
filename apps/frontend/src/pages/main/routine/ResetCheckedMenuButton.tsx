import { IconButton } from '@mui/material';
import { RotateLeftOutlined } from '@mui/icons-material';
import type { T_Routine_Section, T_Task } from '@repo/types/app.types';
import useLocalStorage from '../../../hooks/useLocalStorage';

interface T_ResetCheckedMenuButtonProps {
   section: T_Routine_Section;
}

export default function ResetCheckedMenuButton({ section }: T_ResetCheckedMenuButtonProps): React.JSX.Element {
   const [tasks, setTasks] = useLocalStorage<T_Task[]>(`${section}-routine-tasks`, []);

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
