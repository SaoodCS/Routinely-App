import { Box } from '@mui/material';
import { useState } from 'react';
import DragDropWrapper from '../../../components/DragDropWrapper';
import ScrollRestoreWrapper from '../../../components/ScrollRestoreWrapper';
import SwipeActionWrapper from '../../../components/SwipeActionWrapper';

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

   function handleParentDrop(newOrderedArr: typeof itemDummyData): void {
      // function that also updates the order in the database
      setItems(newOrderedArr);
   }

   function handleChildDrop(newOrderedArr: (typeof subItemDummyData)[number], parentId: number): void {
      // function that also updates the order in the database
      setSubItems({ ...subItems, [parentId]: newOrderedArr });
   }

   return (
      <ScrollRestoreWrapper storeKey="settings lol" sx={{ height: '100%', overflow: 'auto' }}>
         <DragDropWrapper
            items={items}
            getKey={(item) => item.id}
            onDrop={(newOrderedArr) => handleParentDrop(newOrderedArr)}
            renderItem={(item) => (
               <Box>
                  <SwipeActionWrapper>
                     <Box>{item.name}</Box>
                     <Box>{item.description}</Box>
                  </SwipeActionWrapper>
                  {subItems[item.id] && (
                     <DragDropWrapper
                        items={subItems[item.id]}
                        getKey={(subItem) => subItem.id}
                        onDrop={(newOrderedArr) => handleChildDrop(newOrderedArr, item.id)}
                        renderItem={(subItem) => (
                           <Box>
                              <Box>{subItem.name}</Box>
                              <Box>{subItem.description}</Box>
                           </Box>
                        )}
                     />
                  )}
               </Box>
            )}
         />
      </ScrollRestoreWrapper>
   );
}
