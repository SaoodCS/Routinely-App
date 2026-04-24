import { Box } from '@mui/material';
import { useState } from 'react';
import DragDropWrapper from '../../../components/DragDropWrapper';

const itemDummyData: { id: number; name: string; description: string }[] = [
   { id: 11, name: 'Item 1', description: 'Description of item 1' },
   { id: 22, name: 'Item 2', description: 'Description of item 2' },
   { id: 33, name: 'Item 3', description: 'Description of item 3' },
];

const subItemDummyData: { [key: number]: typeof itemDummyData } = {
   11: [
      { id: 111, name: 'Sub Item 1', description: 'Description of sub item 1' },
      { id: 112, name: 'Sub Item 2', description: 'Description of sub item 2' },
      { id: 113, name: 'Sub Item 3', description: 'Description of sub item 3' },
   ],
   22: [{ id: 221, name: 'Sub Item', description: 'Description of sub item' }],
   33: [
      { id: 332, name: 'Sub Item', description: 'Description of sub item' },
      { id: 333, name: 'Sub Item', description: 'Description of sub item' },
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
      <DragDropWrapper items={items} onDrop={(newOrderedArr) => handleParentDrop(newOrderedArr)}>
         {items.map((item) => (
            <Box key={item.id}>
               <Box>{item.name}</Box>
               <Box>{item.description}</Box>
               <DragDropWrapper items={subItems[item.id]} onDrop={(newOrderedArr) => handleChildDrop(newOrderedArr, item.id)}>
                  {subItems[item.id].map((subItem) => (
                     <Box key={subItem.id}>
                        <Box>{subItem.name}</Box>
                        <Box>{subItem.description}</Box>
                     </Box>
                  ))}
               </DragDropWrapper>
            </Box>
         ))}
      </DragDropWrapper>
   );
}
