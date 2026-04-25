import { AddBoxOutlined } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import type { T_Routine_Section, T_Task } from '@repo/types/app';
import useLocalStorage from '../../../hooks/useLocalStorage';

interface T_CreateTaskProps {
   section: T_Routine_Section;
}

export default function CreateTask({ section }: T_CreateTaskProps): React.JSX.Element {
   const [tasks, setTasks] = useLocalStorage<T_Task[]>(`${section}-routine-tasks`, []);
   function handleCreateTask(): void {
      setTasks([...tasks, { id: `${Date.now()}-task`, label: 'New Task', isChecked: false, showWhenTags: [], hideWhenTags: [] }]);
   }
   return (
      <IconButton color="primary" onClick={handleCreateTask}>
         <AddBoxOutlined />
      </IconButton>
   );
}
