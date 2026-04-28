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

const FirebaseErrorCodeToMessage: Record<string, string> = {
   'auth/user-not-found': 'User not found',
   'auth/wrong-password': 'Wrong password',
   'auth/email-already-in-use': 'Email already in use',
   'auth/weak-password': 'Weak password',
   'auth/invalid-email': 'Invalid email',
   'permission-denied': 'You do not have permission to perform this action.',
   unauthenticated: 'You must be logged in to perform this action.',
   unavailable: 'Service is unavailable.',
};

export function getErrorMsg(err: unknown): string | void {
   if (typeof err === 'object' && err !== null && 'code' in err) {
      const error = err as { code: string; message: string };
      if (error.code in FirebaseErrorCodeToMessage) return FirebaseErrorCodeToMessage[error.code];
   }
}
