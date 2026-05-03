import type { FirestoreTypes } from '@repo/types/index';

// NOTE: documents have an even number of segments, collections have an odd number
export const PATHS_FIELDS = {
   routine_morning_tasks: 'users/{uid}/routines/morning[tasks]',
   routine_evening_tasks: 'users/{uid}/routines/evening[tasks]',
   tags_list_tags: 'users/{uid}/tags/list[tags]',
   settings_app_settings: 'users/{uid}/settings/app[settings]',
} as const;

export function getPathAndField(path: FirestoreTypes.PathKey, uid: string): { path: string; field: string } {
   const [pathStr, fieldStr] = PATHS_FIELDS[path].split('[');
   return { path: pathStr.replace('{uid}', uid), field: fieldStr.replace(']', '') };
}
