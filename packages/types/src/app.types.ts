import type { AppUtils } from '@repo/utils/index.ts';
import type { ArrayMaxLength } from './array.types.ts';

export interface Task {
   id: string;
   label: string;
   isChecked: boolean;
   showWhenTags: Tag['id'][];
   hideWhenTags: Tag['id'][];
   children?: Task[];
}

export interface Tag {
   id: string;
   label: string;
   isEnabled: boolean;
}

export interface Settings {
   inheritTagsFromSource?: boolean;
}

export type RoutineSection = 'morning' | 'evening';
export type TaskTagFields = NonNullable<{ [K in keyof Task]: K extends `${string}Tags${string}` ? K : never }[keyof Task]>;
export type DepthIndexes = ArrayMaxLength<number, 3>;

export type FirestorePathField = keyof typeof AppUtils.FIRESTORE_PATHS_FIELDS;
export type FirestorePathValue = (typeof AppUtils.FIRESTORE_PATHS_FIELDS)[FirestorePathField];
export type UserRole = 'anonymous' | 'user';
