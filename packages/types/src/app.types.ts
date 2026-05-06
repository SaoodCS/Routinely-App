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
