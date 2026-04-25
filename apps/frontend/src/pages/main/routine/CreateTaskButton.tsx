import { AddBoxOutlined } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import type { T_Routine_Section, T_Task } from '@repo/types/app';
import useLocalStorage from '../../../hooks/useLocalStorage';

interface T_CreateTaskButtonProps {
   section: T_Routine_Section;
}

export default function CreateTaskButton({ section }: T_CreateTaskButtonProps): React.JSX.Element {
   const [tasks, setTasks] = useLocalStorage<T_Task[]>(`${section}-routine-tasks`, []);
   function handleCreateTaskButton(): void {
      setTasks([{ id: `${Date.now()}-task`, label: 'New Task', isChecked: false, showWhenTags: [], hideWhenTags: [] }, ...tasks]);
   }
   return (
      <IconButton color="primary" onClick={handleCreateTaskButton}>
         <AddBoxOutlined />
      </IconButton>
   );
}
