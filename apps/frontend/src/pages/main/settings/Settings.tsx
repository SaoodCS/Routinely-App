import { useState } from 'react';
import DragAndDropList from '../../../components/DragAndDropList';
import ScrollRestoreWrapper from '../../../components/ScrollRestoreWrapper';

const itemDummyData: { id: number; name: string; description: string }[] = [
   { id: 11, name: 'Item 1', description: 'Description of item 1' },
   { id: 22, name: 'Item 2', description: 'Description of item 2' },
   { id: 33, name: 'Item 3', description: 'Description of item 3' },
   { id: 111, name: 'Item 1', description: 'Description of item 1' },
   { id: 222, name: 'Item 2', description: 'Description of item 2' },
   { id: 333, name: 'Item 3', description: 'Description of item 3' },
   { id: 1111, name: 'Item 1', description: 'Description of item 1' },
   { id: 2222, name: 'Item 2', description: 'Description of item 2' },
   { id: 3333, name: 'Item 3', description: 'Description of item 3' },
   { id: 11111, name: 'Item 1', description: 'Description of item 1' },
   { id: 22222, name: 'Item 2', description: 'Description of item 2' },
   { id: 33333, name: 'Item 3', description: 'Description of item 3' },
];

const subItemDummyData: { [key: number]: typeof itemDummyData } = {
   11: [
      { id: 1211, name: 'Sub Item 1', description: 'Description of sub item 1' },
      { id: 1212, name: 'Sub Item 2', description: 'Description of sub item 2' },
      { id: 1213, name: 'Sub Item 3', description: 'Description of sub item 3' },
   ],
   22: [{ id: 22321, name: 'Sub Item', description: 'Description of sub item' }],
   33: [
      { id: 33232, name: 'Sub Item', description: 'Description of sub item' },
      { id: 331233, name: 'Sub Item', description: 'Description of sub item' },
   ],
};

export default function Settings(): React.JSX.Element {
   const [items, setItems] = useState<typeof itemDummyData>(itemDummyData);
   const [subItems, setSubItems] = useState<typeof subItemDummyData>(subItemDummyData);

   return (
      <ScrollRestoreWrapper storeKey="settings" sx={{ height: '100%', overflow: 'auto' }}>
         <DragAndDropList
            items={items}
            onDrop={(newOrderedItems) => {
               setItems(newOrderedItems);
               // Can add functionality to update backend here
            }}
            renderItem={(item, dragElProps) => (
               <div>
                  <div {...dragElProps}>::</div>
                  <div>{item.name}</div>
                  <div>{item.description}</div>
                  {subItems[item.id] && (
                     <DragAndDropList
                        items={subItems[item.id]}
                        onDrop={(newOrderedSubItems) => {
                           setSubItems({ ...subItems, [item.id]: newOrderedSubItems });
                           // Can add functionality to update backend here
                        }}
                        renderItem={(subItem, dragElProps) => (
                           <div style={{ paddingLeft: '1rem' }}>
                              <div {...dragElProps}>::</div>
                              <div>{subItem.name}</div>
                              <div>{subItem.description}</div>
                           </div>
                        )}
                     />
                  )}
               </div>
            )}
         />
      </ScrollRestoreWrapper>
   );
}
