export interface T_Task {
   id: number;
   label: string;
   isChecked?: boolean;
   showWhenTags?: T_Tag['id'][];
   hideWhenTags?: T_Tag['id'][];
   children?: T_Task[];
}

export interface T_Tag {
   id: number;
   label: string;
   isEnabled: boolean;
   color: string;
}
