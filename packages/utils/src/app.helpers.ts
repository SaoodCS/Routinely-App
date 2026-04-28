import type { T_Tag, T_Task } from '@repo/types/app.types';

export function createNewTask(): T_Task {
   return { id: `${Date.now()}-task`, label: 'New Task', isChecked: false };
}

export function createNewTag(): T_Tag {
   return { id: `${Date.now()}-tag`, label: 'New Tag', isEnabled: true, color: '#848484' };
}
