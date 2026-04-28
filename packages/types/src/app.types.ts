export interface T_Task {
   id: string;
   label: string;
   isChecked?: boolean;
   showWhenTags?: T_Tag['id'][];
   hideWhenTags?: T_Tag['id'][];
   children?: T_Task[];
}

export interface T_Tag {
   id: string;
   label: string;
   isEnabled: boolean;
   color: string;
}

export interface T_Settings {
   inheritTagsFromSource?: boolean;
}

export type T_Routine_Section = 'morning' | 'evening';
export type T_Task_TagKeys = NonNullable<{ [K in keyof T_Task]: K extends `${string}Tags${string}` ? K : never }[keyof T_Task]>;
