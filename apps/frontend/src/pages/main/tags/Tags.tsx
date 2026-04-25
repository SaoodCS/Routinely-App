import type { T_Task } from '@repo/types/app';
import useLocalStorage from '../../../hooks/useLocalStorage';
import useScrollSaver from '../../../hooks/useScrollSaver';
import DragAndDropList from '../../../components/DragAndDropList';
export default function Tags(): React.JSX.Element {
   const { ref } = useScrollSaver('tags-scroll');
   const [tags, setTags] = useLocalStorage<T_Task[]>(`tags`, []);
   return (
      <DragAndDropList
         ref={ref}
         items={tags}
         onDrop={(newOrderedItems) => setTags(newOrderedItems)}
         renderItem={(item, dragElProps) => (
            <div {...dragElProps} style={{ padding: '1rem' }}>
               {item.label}
            </div>
         )}
         style={{ overflow: 'auto', maxHeight: '100%', height: '100%' }}
      />
   );
}
