// NOTE: documents have an even number of segments, collections have an odd number
export const FIRESTORE_PATHS = {
   routine_morning_tasks: 'users/{uid}/routines/morning[tasks]',
   routine_evening_tasks: 'users/{uid}/routines/evening[tasks]',
   tags_list_tags: 'users/{uid}/tags/list[tags]',
   settings_app_settings: 'users/{uid}/settings/app[settings]',
} as const;

export function getFirestorePathAndField(path: keyof typeof FIRESTORE_PATHS, uid: string): { path: string; field: string } {
   const [pathStr, fieldStr] = FIRESTORE_PATHS[path].split('[');
   return { path: pathStr.replace('{uid}', uid), field: fieldStr.replace(']', '') };
}
