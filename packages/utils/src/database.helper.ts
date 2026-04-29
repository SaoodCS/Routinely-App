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
   INVALID_LOGIN_CREDENTIALS: 'Email or password is incorrect.',
   'auth/user-not-found': 'User not found',
   'auth/wrong-password': 'Wrong password',
   'auth/invalid-credential': 'Email or password is incorrect.',
   'auth/email-already-in-use': 'Email already in use',
   'auth/weak-password': 'Weak password',
   'auth/invalid-email': 'Invalid email',
   'auth/operation-not-allowed': 'This sign-in method is not enabled.',
   'auth/too-many-requests': 'Too many failed attempts. Try again later.',
   'auth/network-request-failed': 'Network error. Check your connection and try again.',
   'auth/unauthorized-domain': 'This domain is not authorized for Firebase Authentication.',
   'auth/invalid-api-key': 'Firebase Authentication is using an invalid API key.',
   'permission-denied': 'You do not have permission to perform this action.',
   unauthenticated: 'You must be logged in to perform this action.',
   unavailable: 'Service is unavailable.',
};

export function getErrorMsg(err: unknown, defaultMsg: string): string {
   if (typeof err === 'object' && err !== null) {
      if ('code' in err && typeof err.code === 'string' && err.code in FirebaseErrorCodeToMessage) return FirebaseErrorCodeToMessage[err.code];
      if ('message' in err && typeof err.message === 'string' && err.message in FirebaseErrorCodeToMessage)
         return FirebaseErrorCodeToMessage[err.message];
   }
   return defaultMsg;
}
