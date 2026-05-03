import type { AppTypes } from '@repo/types/index';

export function createNewTask(taskPresets?: Partial<AppTypes.Task>): AppTypes.Task {
   return {
      id: taskPresets?.id ?? `${Date.now()}-task`,
      label: taskPresets?.label ?? 'New Task',
      isChecked: taskPresets?.isChecked ?? false,
      children: taskPresets?.children ?? undefined,
      showWhenTags: taskPresets?.showWhenTags ?? [],
      hideWhenTags: taskPresets?.hideWhenTags ?? [],
   };
}

export function createNewTag(): AppTypes.Tag {
   return { id: `${Date.now()}-tag`, label: 'New Tag', isEnabled: true };
}


function areAllSiblingsChecked(tasks: AppTypes.Task[], taskIndexes: [number] | [number, number] | [number, number, number]): boolean {
   if (taskIndexes.length === 1) return tasks.every((task) => task.isChecked);
   if (taskIndexes.length === 2) return tasks[taskIndexes[0]].children?.every((task) => task.isChecked) ?? false;
   if (taskIndexes.length === 3) return tasks[taskIndexes[0]].children?.[taskIndexes[1]].children?.every((task) => task.isChecked) ?? false;
   return false;
}

function toggleCheckedAllSiblings(tasks: AppTypes.Task[], taskIndexes: [number] | [number, number] | [number, number, number]): AppTypes.Task[] {
   const updatedTasks = [...tasks];
   if (taskIndexes.length === 1) return tasks.map((task) => ({ ...task, isChecked: true }));
   const updatedSubtasks = [...updatedTasks[taskIndexes[0]].children!];
   if (taskIndexes.length === 2) {
      for (let i = 0; i < updatedSubtasks.length; i++) {
         updatedSubtasks[i] = { ...updatedSubtasks[i], isChecked: true };
      }
      updatedTasks[taskIndexes[0]] = { ...updatedTasks[taskIndexes[0]], children: updatedSubtasks };
      return updatedTasks;
   }
   if (taskIndexes.length === 3) {
      const updatedSubsubtasks = [...updatedSubtasks[taskIndexes[1]].children!];
      for (let i = 0; i < updatedSubsubtasks.length; i++) {
         updatedSubsubtasks[i] = { ...updatedSubsubtasks[i], isChecked: true };
      }
      updatedSubtasks[taskIndexes[1]] = { ...updatedSubtasks[taskIndexes[1]], children: updatedSubsubtasks };
      updatedTasks[taskIndexes[0]] = { ...updatedTasks[taskIndexes[0]], children: updatedSubtasks };
      return updatedTasks;
   }
}
