export type T_Routine_Section = 'morning' | 'evening';
// create a type dynamically for the names showWhenTags and hideWhenTags from T_Task:


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
   inheritTagsFromSource: boolean;
}

export interface T_Firestore_Paths {
   morning_routine: 'routine/{uid}/morning';
   evening_routine: 'routine/{uid}/evening';
   tags: 'users/{uid}/tags';
}
