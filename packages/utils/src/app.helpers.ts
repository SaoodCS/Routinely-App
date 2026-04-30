import type { T_Tag, T_Task } from '@repo/types/app.types';

export function createNewTask(taskPresets?: Partial<T_Task>): T_Task {
   return {
      id: taskPresets?.id ?? `${Date.now()}-task`,
      label: taskPresets?.label ?? 'New Task',
      isChecked: taskPresets?.isChecked ?? false,
      children: taskPresets?.children ?? undefined,
      showWhenTags: taskPresets?.showWhenTags ?? [],
      hideWhenTags: taskPresets?.hideWhenTags ?? [],
   };
}

export function createNewTag(): T_Tag {
   return { id: `${Date.now()}-tag`, label: 'New Tag', isEnabled: true, color: '#848484' };
}
