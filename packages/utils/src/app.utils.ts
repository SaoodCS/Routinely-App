import type { AppTypes } from '@repo/types/index';

export function createNewTask(taskPresets?: Partial<AppTypes.Task>): AppTypes.Task {
   return {
      id: taskPresets?.id ?? `${Date.now()}-task`,
      label: taskPresets?.label ?? '',
      isChecked: taskPresets?.isChecked ?? false,
      children: taskPresets?.children ?? undefined,
      showWhenTags: taskPresets?.showWhenTags ?? [],
      hideWhenTags: taskPresets?.hideWhenTags ?? [],
   };
}

export function createNewTag(tagPresets?: Partial<AppTypes.Tag>): AppTypes.Tag {
   return { id: tagPresets?.id ?? `${Date.now()}-tag`, label: tagPresets?.label ?? '', isEnabled: tagPresets?.isEnabled ?? true };
}

export function createNewShoppingItem(itemPresets?: Partial<AppTypes.ShoppingItem>): AppTypes.ShoppingItem {
   return { id: itemPresets?.id ?? `${Date.now()}-shopping-item`, label: itemPresets?.label ?? '', isChecked: itemPresets?.isChecked ?? false };
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

export function normalizeSearchQuery(query: string): string {
   return query.toLowerCase();
}

export function normalizeLabelForSearch(label: string): string {
   return label.toLowerCase();
}

export const TASK_LABEL_DELIMITER = {
   shoppingList: '*',
   //tags: '#',
} as const;

export function normalizeTaskLabelForSearch(label: string): string {
   let normalizedLabel = normalizeLabelForSearch(label);
   for (const name in TASK_LABEL_DELIMITER) {
      const delimiter = TASK_LABEL_DELIMITER[name as keyof typeof TASK_LABEL_DELIMITER];
      normalizedLabel = normalizedLabel.replaceAll(delimiter, '');
   }
   return normalizedLabel;
}

export const FIRESTORE_PATHS_FIELDS = {
   routine_morning_tasks: 'users/{uid}/routines/morning[tasks]',
   routine_evening_tasks: 'users/{uid}/routines/evening[tasks]',
   tags_list_tags: 'users/{uid}/tags/list[tags]',
   settings_app_settings: 'users/{uid}/settings/app[settings]',
   shoppingList_list_shopping: 'users/{uid}/shoppingList/list[shopping]',
} as const; // NOTE: firestore documents have an even number of segments, collections have an odd number

export function getFirestorePathAndField(path: AppTypes.FirestorePathField, uid: string): { path: string; field: string } {
   const [pathStr, fieldStr] = FIRESTORE_PATHS_FIELDS[path].split('[');
   return { path: pathStr.replace('{uid}', uid), field: fieldStr.replace(']', '') };
}
