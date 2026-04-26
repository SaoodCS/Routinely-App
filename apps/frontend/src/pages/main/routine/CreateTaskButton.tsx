import { AddBoxOutlined } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import type { T_Routine_Section, T_Task } from '@repo/types/app.types';
import { createNewTask } from '@repo/utils/app.helpers';
import useLocalStorage from '../../../hooks/useLocalStorage';

interface T_CreateTaskButtonProps {
   section: T_Routine_Section;
}

export default function CreateTaskButton({ section }: T_CreateTaskButtonProps): React.JSX.Element {
   const [tasks, setTasks] = useLocalStorage<T_Task[]>(`${section}-routine-tasks`, []);
   function handleCreateTaskButton(): void {
      const newTask = createNewTask();
      setTasks([newTask, ...tasks]);
   }
   return (
      <IconButton color="primary" onClick={handleCreateTaskButton}>
         <AddBoxOutlined />
      </IconButton>
   );
}
