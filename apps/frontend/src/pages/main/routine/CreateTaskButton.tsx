import { Add } from '@mui/icons-material';
import { Fab } from '@mui/material';
import type { T_Routine_Section } from '@repo/types/app.types';
import { createNewTask } from '@repo/utils/app.helpers';
import { useLocalStorageContext } from '../../../database/useLocalStorageContext';

interface T_CreateTaskButtonProps {
   section: T_Routine_Section;
}

export default function CreateTaskButton({ section }: T_CreateTaskButtonProps): React.JSX.Element {
   const { morningTasks, eveningTasks, setEveningTasks, setMorningTasks } = useLocalStorageContext();
   const tasks = section === 'morning' ? morningTasks : eveningTasks;
   const setTasks = section === 'morning' ? setMorningTasks : setEveningTasks;
   function handleCreateTaskButton(): void {
      const newTask = createNewTask();
      setTasks([...tasks, newTask]);
   }
   return (
      <Fab color="primary" sx={{ position: 'absolute', bottom: 16, right: 16 }}>
         <Add onClick={handleCreateTaskButton} />
      </Fab>
   );
}
