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

export function getTasksListToUpdate(tasksShallowCopy: AppTypes.Task[], indexesToUpdate: number[]): AppTypes.Task[] {
   let taskListToUpdate = tasksShallowCopy;
   for (let depth = 0; depth < indexesToUpdate.length - 1; depth++) {
      const parentTaskIndex = indexesToUpdate[depth];
      const parentTask = taskListToUpdate[parentTaskIndex];
      const copiedChildren = [...parentTask.children!];
      taskListToUpdate[parentTaskIndex] = { ...parentTask, children: copiedChildren };
      taskListToUpdate = copiedChildren;
   }
   return taskListToUpdate; // this returns a copy of the task and it's siblings, so the original tasks array isn't mutated
}
