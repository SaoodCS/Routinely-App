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
